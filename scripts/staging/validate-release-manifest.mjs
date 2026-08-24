import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import { basename, dirname, extname, isAbsolute, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { parse } from "yaml";

const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const COMMIT_PATTERN = /^[0-9a-f]{40}$/;
const RELEASE_ID_PATTERN = /^rc-\d{8}-[0-9A-Za-z][0-9A-Za-z._-]*$/;
const PLACEHOLDER_PATTERN = /(?:<[^>]*>|\b(?:todo|tbd|pending|placeholder|unknown|replace[-_ ]?me|yyyy|nnn)\b)/i;
const QUALIFICATION_APPROVAL_CONTEXT = "RELEASE_QUALIFICATION_APPROVED";
const EVIDENCE_INDEX_SCHEMA_VERSION = 2;
// This is a value digest, not the digest of a standalone evidence file. It is
// protected by the approved manifest bytes and repeated inside both clone seals.
const NON_EVIDENCE_SHA256_PATHS = new Set([
  "databaseEvidence.sourceSnapshotIdSha256",
]);

function requiredEnvironment(name, environment = process.env) {
  const value = environment[name]?.trim();
  if (!value) throw new Error(`Missing required manifest binding: ${name}`);
  return value;
}

function at(value, path) {
  return path.split(".").reduce((current, key) => current?.[key], value);
}

function exact(manifest, path, expected) {
  if (String(at(manifest, path) ?? "") !== expected) {
    throw new Error(`Approved release manifest mismatch at ${path}`);
  }
}

function completeText(value) {
  return typeof value === "string"
    && value.trim().length > 0
    && !value.includes("<")
    && !value.includes(">");
}

function qualificationError(path, detail) {
  throw new Error(`Release qualification failed at ${path}: ${detail}`);
}

function mapping(value, path) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    qualificationError(path, "must be a mapping");
  }
  return value;
}

function array(value, path) {
  if (!Array.isArray(value)) qualificationError(path, "must be an array");
  return value;
}

function textValue(value, path) {
  if (typeof value !== "string" || !value.trim() || PLACEHOLDER_PATTERN.test(value)) {
    qualificationError(path, "must be non-empty and must not be a placeholder");
  }
  return value.trim();
}

function exactValue(value, expected, path) {
  if (value !== expected) qualificationError(path, `must equal ${JSON.stringify(expected)}`);
}

function sha256(value, path) {
  const normalized = textValue(value, path);
  if (!SHA256_PATTERN.test(normalized)) {
    qualificationError(path, "must be a lowercase 64-character SHA-256");
  }
  return normalized;
}

function optionalSha256(value, path) {
  if (value === "") return;
  sha256(value, path);
}

function explicitBoolean(value, path) {
  if (typeof value !== "boolean") qualificationError(path, "must be an explicit boolean");
  return value;
}

function commit(value, path) {
  const normalized = textValue(value, path);
  if (!COMMIT_PATTERN.test(normalized)) {
    qualificationError(path, "must be a lowercase 40-character commit SHA");
  }
  return normalized;
}

function timestamp(value, path) {
  const normalized = textValue(value, path);
  const epoch = Date.parse(normalized);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(normalized)
      || !Number.isFinite(epoch)) {
    qualificationError(path, "must be a valid ISO-8601 UTC timestamp");
  }
  return epoch;
}

function httpsUrl(value, path) {
  const normalized = textValue(value, path);
  let parsed;
  try {
    parsed = new URL(normalized);
  } catch {
    qualificationError(path, "must be a valid HTTPS URL");
  }
  if (parsed.protocol !== "https:" || !parsed.hostname) {
    qualificationError(path, "must be a valid HTTPS URL");
  }
  return normalized;
}

function integerAtLeast(value, minimum, path) {
  if (!Number.isInteger(value) || value < minimum) {
    qualificationError(path, `must be an integer greater than or equal to ${minimum}`);
  }
  return value;
}

function finiteNumber(value, path) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    qualificationError(path, "must be a finite number");
  }
  return value;
}

function requireHashFields(value, basePath, fields) {
  for (const field of fields) sha256(value[field], `${basePath}.${field}`);
}

function evidenceKindForManifestPath(path) {
  if (/EvidenceRootSealSha256$/.test(path)) return "evidence-seal";
  if (path === "databaseEvidence.sanitizedE2eAfterParentChainSha256") return "parent-chain";
  if (/provider(?:Exact|Sanitized)RestoreReceiptSha256$/.test(path)) return "provider-receipt";
  if (/(?:exact|sanitized)PreMaskOriginFingerprintSha256$/.test(path)) return "origin-fingerprint";
  if (path === "databaseEvidence.providerRestoreBindingSha256") return "provider-binding";
  if (path === "artifacts.backendSbomSha256") return "spdx-json";
  if (path === "artifacts.dependencyScanSha256"
      || path === "artifacts.runtimeImageScanSha256") return "trivy-json";
  if (/SuiteResultSha256$/.test(path)
      || new Set([
        "stagingEvidence.roleE2eResultSha256",
        "stagingEvidence.legalVersionContractResultSha256",
        "stagingEvidence.accessibilityResultSha256",
        "stagingEvidence.securityResultSha256",
      ]).has(path)) return "junit-xml";
  if (path === "stagingEvidence.loadResultSha256") return "k6-summary-json";
  if (path === "databaseEvidence.exactCompatibilityHttpContractSha256") return "http-contract-tsv";
  if (path === "databaseEvidence.sanitizedE2eComparisonSha256") return "sanitized-e2e-comparison";
  if (new Set([
    "databaseEvidence.sanitizedSyntheticProvenanceSha256",
    "databaseEvidence.sanitizedRelationshipInvariantSha256",
  ]).has(path)) return "zero-violation-tsv";
  if (path === "stagingEvidence.mutationRuntimeSafetyContractSha256") return "runtime-contract-json";
  if (/candidateArtifactSetSha256$/.test(path)) return "artifact-set-json";
  if (path === "artifacts.flywayMigrationSetSha256") return "checksum-manifest";
  if (path === "databaseEvidence.publicSchemaAllowlistSha256") return "schema-allowlist-tsv";
  if (path === "databaseEvidence.legacyBackendJarSha256") return "jar";
  if (path === "rollback.runbookSha256") return "runbook";
  if (path === "artifacts.backendImageArchiveSha256") return "docker-image-archive";
  if (path === "artifacts.frontendArtifactSha256") return "frontend-artifact";
  return "attestation-json";
}

export const qualificationEvidenceKindForPath = evidenceKindForManifestPath;

function validateSourceAndArtifacts(manifest) {
  exactValue(manifest.schemaVersion, 5, "schemaVersion");
  const releaseId = textValue(manifest.releaseId, "releaseId");
  if (!RELEASE_ID_PATTERN.test(releaseId)) {
    qualificationError("releaseId", "must match rc-YYYYMMDD-<candidate>");
  }
  timestamp(manifest.createdAtUtc, "createdAtUtc");
  exactValue(manifest.status, "QUALIFIED", "status");

  const source = mapping(manifest.source, "source");
  const frontendCommit = commit(source.frontendCommit, "source.frontendCommit");
  const backendCommit = commit(source.backendCommit, "source.backendCommit");
  exactValue(source.branch, "launch-p0", "source.branch");

  const artifacts = mapping(manifest.artifacts, "artifacts");
  const backendImage = textValue(artifacts.backendImage, "artifacts.backendImage");
  if (!/^[^\s<>]+@sha256:[0-9a-f]{64}$/.test(backendImage)) {
    qualificationError("artifacts.backendImage", "must be an immutable registry image digest");
  }
  const localImageId = textValue(
    artifacts.backendLocalImageContentId,
    "artifacts.backendLocalImageContentId",
  );
  if (!/^sha256:[0-9a-f]{64}$/.test(localImageId)) {
    qualificationError("artifacts.backendLocalImageContentId", "must be a sha256 image ID");
  }
  requireHashFields(artifacts, "artifacts", [
    "candidateArtifactSetSha256",
    "backendImageArchiveSha256",
    "backendSbomSha256",
    "dependencyScanSha256",
    "runtimeImageScanSha256",
    "frontendArtifactSha256",
    "flywayMigrationSetSha256",
  ]);
  return { releaseId, frontendCommit, backendCommit, artifacts };
}

function validateCi(manifest, candidate) {
  const ci = mapping(manifest.ci, "ci");
  exactValue(ci.consecutiveSuccessfulRuns, 3, "ci.consecutiveSuccessfulRuns");
  const runs = array(ci.sameShaRuns, "ci.sameShaRuns");
  if (runs.length !== 3) qualificationError("ci.sameShaRuns", "must contain exactly three runs");

  let previousCompletion = Number.NEGATIVE_INFINITY;
  for (const [index, entry] of runs.entries()) {
    const path = `ci.sameShaRuns[${index}]`;
    const run = mapping(entry, path);
    exactValue(run.sequence, index + 1, `${path}.sequence`);
    exactValue(run.result, "PASSED", `${path}.result`);
    exactValue(commit(run.frontendCommit, `${path}.frontendCommit`), candidate.frontendCommit,
      `${path}.frontendCommit`);
    exactValue(commit(run.backendCommit, `${path}.backendCommit`), candidate.backendCommit,
      `${path}.backendCommit`);
    exactValue(sha256(run.candidateArtifactSetSha256, `${path}.candidateArtifactSetSha256`),
      candidate.artifacts.candidateArtifactSetSha256, `${path}.candidateArtifactSetSha256`);
    httpsUrl(run.frontendRunUrl, `${path}.frontendRunUrl`);
    httpsUrl(run.backendRunUrl, `${path}.backendRunUrl`);
    httpsUrl(run.integrationRunUrl, `${path}.integrationRunUrl`);
    requireHashFields(run, path, [
      "frontendSuiteResultSha256",
      "backendSuiteResultSha256",
      "integrationSuiteResultSha256",
    ]);
    const completed = timestamp(run.completedAtUtc, `${path}.completedAtUtc`);
    if (completed <= previousCompletion) {
      qualificationError(`${path}.completedAtUtc`, "must be later than the preceding run");
    }
    previousCompletion = completed;
  }

  integerAtLeast(ci.frontendUnitTestCount, 1, "ci.frontendUnitTestCount");
  integerAtLeast(ci.frontendPlaywrightTestCount, 1, "ci.frontendPlaywrightTestCount");
  integerAtLeast(ci.integrationTestCount, 22, "ci.integrationTestCount");
  integerAtLeast(ci.unitTestCount, 1, "ci.unitTestCount");
  for (const field of [
    "dependencyHighVulnerabilities",
    "dependencyCriticalVulnerabilities",
    "imageHighVulnerabilities",
    "imageCriticalVulnerabilities",
  ]) exactValue(ci[field], 0, `ci.${field}`);

  const frontendChecks = mapping(ci.frontendChecks, "ci.frontendChecks");
  for (const field of [
    "lint", "typecheck", "unit", "productionBuild", "dependencyAudit", "playwright",
  ]) exactValue(frontendChecks[field], "PASSED", `ci.frontendChecks.${field}`);
  const backendChecks = mapping(ci.backendChecks, "ci.backendChecks");
  for (const field of [
    "unit", "integration", "legacyMigration", "bootJar", "containerBuild",
    "dependencyScan", "containerScan",
  ]) exactValue(backendChecks[field], "PASSED", `ci.backendChecks.${field}`);
}

function validateRepositoryControls(manifest) {
  const controls = mapping(manifest.repositoryControls, "repositoryControls");
  requireHashFields(controls, "repositoryControls", [
    "frontendMainRulesetEvidenceSha256",
    "backendMainRulesetEvidenceSha256",
    "vercelProductionAutoDeployDisabledEvidenceSha256",
    "railwayProductionAutoDeployDisabledEvidenceSha256",
  ]);
  integerAtLeast(controls.requiredApprovalCount, 1, "repositoryControls.requiredApprovalCount");
  exactValue(controls.directPushBlocked, true, "repositoryControls.directPushBlocked");
  exactValue(controls.administratorBypassDisabled, true,
    "repositoryControls.administratorBypassDisabled");
  textValue(controls.verifiedBy, "repositoryControls.verifiedBy");
  timestamp(controls.verifiedAtUtc, "repositoryControls.verifiedAtUtc");
}

function validateDatabaseEvidence(manifest, releaseId) {
  const database = mapping(manifest.databaseEvidence, "databaseEvidence");
  requireHashFields(database, "databaseEvidence", [
    "productionReadonlyAuditSha256",
    "productionReadonlyEvidenceRootSealSha256",
    "providerExactRestoreReceiptSha256",
    "providerSanitizedRestoreReceiptSha256",
    "providerRestoreBindingSha256",
    "providerRestoreBindingEvidenceRootSealSha256",
    "exactPreMaskOriginFingerprintSha256",
    "sanitizedPreMaskOriginFingerprintSha256",
    "sourceSnapshotIdSha256",
    "sourceFlywayHistoryAbsentEvidenceSha256",
    "exactCloneEvidenceSha256",
    "exactCloneEvidenceRootSealSha256",
    "guardedMigrationRunSha256",
    "exactNewLegacyCompatibilitySha256",
    "exactCompatibilityHttpContractSha256",
    "legacyBackendJarSha256",
    "directBootGuardBeforeFlywayEvidenceSha256",
    "sanitizedCloneEvidenceSha256",
    "sanitizedCloneEvidenceRootSealSha256",
    "sanitizedE2eBeforeEvidenceRootSealSha256",
    "sanitizedE2eAfterEvidenceRootSealSha256",
    "sanitizedE2eAfterParentChainSha256",
    "sanitizedE2eComparisonSha256",
    "sanitizedSyntheticProvenanceSha256",
    "sanitizedRelationshipInvariantSha256",
    "publicSchemaAllowlistSha256",
    "restoreEvidenceSha256",
  ]);
  exactValue(database.productionReadonlyRolePrivilegesApproved, true,
    "databaseEvidence.productionReadonlyRolePrivilegesApproved");
  exactValue(database.productionDemoAccountCandidateCount, 0,
    "databaseEvidence.productionDemoAccountCandidateCount");
  const sourceSnapshotId = textValue(
    database.sourceSnapshotId, "databaseEvidence.sourceSnapshotId");
  exactValue(
    database.sourceSnapshotIdSha256,
    createHash("sha256").update(sourceSnapshotId).digest("hex"),
    "databaseEvidence.sourceSnapshotIdSha256",
  );
  for (const field of [
    "productionReadonlySecurityDefinerPathCount",
    "productionReadonlyDangerousPredefinedRoleCount",
    "productionReadonlyTempPrivilegeCount",
    "productionPublicRlsEnabledTableCount",
    "productionPublicRlsPolicyCount",
    "legacyPublicSchemaUnknownEntryCount",
    "latestPublicSchemaUnknownEntryCount",
    "latestPublicSchemaMissingEntryCount",
  ]) exactValue(database[field], 0, `databaseEvidence.${field}`);
  for (const field of [
    "exactCloneSourceSnapshotMatched",
    "sanitizedCloneSourceSnapshotMatched",
    "exactAndSanitizedSourceSnapshotMatched",
    "providerRestoreReceiptsMatched",
    "preMaskOriginFingerprintMatched",
  ]) exactValue(database[field], true, `databaseEvidence.${field}`);
  exactValue(database.exactPreMaskOriginFingerprintSha256,
    database.sanitizedPreMaskOriginFingerprintSha256,
    "databaseEvidence.sanitizedPreMaskOriginFingerprintSha256");
  exactValue(database.sentinelReleaseId, releaseId, "databaseEvidence.sentinelReleaseId");
  exactValue(database.strengthenedV3UnappliedPreconditionApproved, true,
    "databaseEvidence.strengthenedV3UnappliedPreconditionApproved");
  exactValue(database.exactCompatibilityReadOnlyRoleApproved, true,
    "databaseEvidence.exactCompatibilityReadOnlyRoleApproved");
  exactValue(database.baselineVersion, "1", "databaseEvidence.baselineVersion");
  exactValue(database.baselineOnMigrateDisabledAfterRun, true,
    "databaseEvidence.baselineOnMigrateDisabledAfterRun");
  integerAtLeast(database.flywayValidateRuns, 2, "databaseEvidence.flywayValidateRuns");
  const flywayVersion = textValue(database.latestFlywayVersion,
    "databaseEvidence.latestFlywayVersion");
  if (!/^\d+(?:\.\d+)*$/.test(flywayVersion)) {
    qualificationError("databaseEvidence.latestFlywayVersion", "must be a numeric Flyway version");
  }
  exactValue(database.failedFlywayMigrations, 0, "databaseEvidence.failedFlywayMigrations");
  integerAtLeast(database.hibernateValidateRuns, 2, "databaseEvidence.hibernateValidateRuns");
  const restoreRto = finiteNumber(database.restoreRtoMinutes, "databaseEvidence.restoreRtoMinutes");
  if (restoreRto <= 0 || restoreRto > 240) {
    qualificationError("databaseEvidence.restoreRtoMinutes", "must be greater than 0 and at most 240");
  }
  exactValue(database.restoreApproved, true, "databaseEvidence.restoreApproved");
  exactValue(database.containsPiiOrSecrets, false, "databaseEvidence.containsPiiOrSecrets");
  return database;
}

function validateFeatureGates(manifest) {
  const gates = mapping(manifest.featureGates, "featureGates");
  for (const field of ["payments", "instagram", "uploads", "scheduling"]) {
    exactValue(gates[field], false, `featureGates.${field}`);
  }
  exactValue(gates.emailDeliveryMode, "disabled", "featureGates.emailDeliveryMode");
  return gates;
}

function validateAuthenticationCutover(manifest) {
  const cutover = mapping(manifest.authenticationCutover, "authenticationCutover");
  exactValue(cutover.forcedReloginAcknowledged, true,
    "authenticationCutover.forcedReloginAcknowledged");
  requireHashFields(cutover, "authenticationCutover", [
    "legacyJwtRejectedEvidenceSha256",
    "passwordResetRevocationEvidenceSha256",
  ]);
  exactValue(cutover.rollbackSessionInvalidationPlanApproved, true,
    "authenticationCutover.rollbackSessionInvalidationPlanApproved");
}

function validateRuntimeContract(contract, database, releaseId, gates) {
  exactValue(contract.cloneKind, "sanitized", "stagingEvidence.mutationRuntimeSafetyContract.cloneKind");
  exactValue(contract.sentinelReleaseId, releaseId,
    "stagingEvidence.mutationRuntimeSafetyContract.sentinelReleaseId");
  for (const field of ["sentinelCompleted", "evidenceSealMatched", "e2eBeforeEvidenceSealMatched"]) {
    exactValue(contract[field], true, `stagingEvidence.mutationRuntimeSafetyContract.${field}`);
  }
  const migrationFingerprint = createHash("sha256")
    .update(database.sanitizedCloneEvidenceRootSealSha256)
    .digest("hex");
  exactValue(contract.evidenceSealFingerprint, migrationFingerprint,
    "stagingEvidence.mutationRuntimeSafetyContract.evidenceSealFingerprint");
  const beforeFingerprint = createHash("sha256")
    .update(database.sanitizedE2eBeforeEvidenceRootSealSha256)
    .digest("hex");
  exactValue(contract.e2eBeforeEvidenceSealFingerprint, beforeFingerprint,
    "stagingEvidence.mutationRuntimeSafetyContract.e2eBeforeEvidenceSealFingerprint");
  exactValue(contract.accountProvisioningEnabled, false,
    "stagingEvidence.mutationRuntimeSafetyContract.accountProvisioningEnabled");
  exactValue(contract.e2eMutationEnabled, true,
    "stagingEvidence.mutationRuntimeSafetyContract.e2eMutationEnabled");
  exactValue(contract.emailDeliveryMode, "disabled",
    "stagingEvidence.mutationRuntimeSafetyContract.emailDeliveryMode");
  for (const field of ["globalSchedulingEnabled", "outboxDispatchEnabled"]) {
    exactValue(contract[field], false, `stagingEvidence.mutationRuntimeSafetyContract.${field}`);
  }
  exactValue(contract.paymentsEnabled, gates.payments,
    "stagingEvidence.mutationRuntimeSafetyContract.paymentsEnabled");
  exactValue(contract.instagramEnabled, gates.instagram,
    "stagingEvidence.mutationRuntimeSafetyContract.instagramEnabled");
  exactValue(contract.uploadsEnabled, gates.uploads,
    "stagingEvidence.mutationRuntimeSafetyContract.uploadsEnabled");
}

function validateStagingEvidence(manifest, database, releaseId, gates) {
  const staging = mapping(manifest.stagingEvidence, "stagingEvidence");
  exactValue(staging.sanitizedTargetGuardReleaseId, releaseId,
    "stagingEvidence.sanitizedTargetGuardReleaseId");
  requireHashFields(staging, "stagingEvidence", [
    "mutationRuntimeSafetyContractSha256",
    "roleE2eResultSha256",
    "legalVersionContractResultSha256",
    "accessibilityResultSha256",
    "securityResultSha256",
    "loadResultSha256",
    "syntheticWindowEvidenceSha256",
    "sentryScrubbingEvidenceSha256",
    "requestIdCorrelationEvidenceSha256",
  ]);
  validateRuntimeContract(
    mapping(staging.mutationRuntimeSafetyContract,
      "stagingEvidence.mutationRuntimeSafetyContract"),
    database,
    releaseId,
    gates,
  );
  httpsUrl(staging.roleE2eRunUrl, "stagingEvidence.roleE2eRunUrl");
  const hours = finiteNumber(staging.syntheticWindowHours, "stagingEvidence.syntheticWindowHours");
  if (hours < 24) qualificationError("stagingEvidence.syntheticWindowHours", "must be at least 24");
  exactValue(staging.syntheticSuccessPercent, 100, "stagingEvidence.syntheticSuccessPercent");
  exactValue(staging.unhandledSentryErrors, 0, "stagingEvidence.unhandledSentryErrors");
  integerAtLeast(staging.performanceVirtualUsers, 50,
    "stagingEvidence.performanceVirtualUsers");
  const rps = finiteNumber(staging.performanceRequestsPerSecond,
    "stagingEvidence.performanceRequestsPerSecond");
  if (rps < 20) qualificationError("stagingEvidence.performanceRequestsPerSecond", "must be at least 20");
  const p95 = finiteNumber(staging.performanceP95Milliseconds,
    "stagingEvidence.performanceP95Milliseconds");
  if (p95 < 0 || p95 > 1000) {
    qualificationError("stagingEvidence.performanceP95Milliseconds", "must be between 0 and 1000");
  }
  const errorPercent = finiteNumber(staging.performanceErrorPercent,
    "stagingEvidence.performanceErrorPercent");
  if (errorPercent < 0 || errorPercent >= 0.5) {
    qualificationError("stagingEvidence.performanceErrorPercent", "must be at least 0 and below 0.5");
  }
}

function validateEmailEvidence(manifest) {
  const email = mapping(manifest.emailEvidence, "emailEvidence");
  exactValue(email.mode, "disabled", "emailEvidence.mode");
  exactValue(email.senderDomainVerified, true, "emailEvidence.senderDomainVerified");
  exactValue(email.allowlistApproved, true, "emailEvidence.allowlistApproved");
  requireHashFields(email, "emailEvidence", [
    "providerMessageIdsEvidenceSha256",
    "retryDeadLetterEvidenceSha256",
    "bounceSuppressionEvidenceSha256",
  ]);
}

function validateObjectStorageGate(gate, uploadsEnabled) {
  const path = "externalGates.objectStorage";
  if (gate.status === "DISABLED") {
    exactValue(uploadsEnabled, false, "featureGates.uploads");
    textValue(gate.disabledReason, `${path}.disabledReason`);
    if (gate.provider !== "" && !new Set(["aws-s3", "cloudflare-r2"]).has(gate.provider)) {
      qualificationError(`${path}.provider`, "must be blank, aws-s3, or cloudflare-r2");
    }
    if (gate.provider === "") {
      exactValue(gate.stagingBucket, "", `${path}.stagingBucket`);
    } else {
      const bucket = textValue(gate.stagingBucket, `${path}.stagingBucket`).toLowerCase();
      if (!bucket.includes("staging") || bucket.includes("production")) {
        qualificationError(`${path}.stagingBucket`, "must identify a staging-only bucket");
      }
    }
    explicitBoolean(gate.isolatedFromProduction, `${path}.isolatedFromProduction`);
    optionalSha256(gate.iamCorsEncryptionVersioningLifecycleEvidenceSha256,
      `${path}.iamCorsEncryptionVersioningLifecycleEvidenceSha256`);
    optionalSha256(gate.contractEvidenceSha256, `${path}.contractEvidenceSha256`);
    return;
  }
  exactValue(gate.status, "APPROVED", `${path}.status`);
  if (!new Set(["aws-s3", "cloudflare-r2"]).has(gate.provider)) {
    qualificationError(`${path}.provider`, "must be aws-s3 or cloudflare-r2");
  }
  const bucket = textValue(gate.stagingBucket, `${path}.stagingBucket`).toLowerCase();
  if (!bucket.includes("staging") || bucket.includes("production")) {
    qualificationError(`${path}.stagingBucket`, "must identify a staging-only bucket");
  }
  exactValue(gate.isolatedFromProduction, true, `${path}.isolatedFromProduction`);
  requireHashFields(gate, path, [
    "iamCorsEncryptionVersioningLifecycleEvidenceSha256",
    "contractEvidenceSha256",
  ]);
}

function validateMetaGate(gate, instagramEnabled) {
  const path = "externalGates.metaInstagram";
  if (gate.status === "DISABLED") {
    exactValue(instagramEnabled, false, "featureGates.instagram");
    textValue(gate.disabledReason, `${path}.disabledReason`);
    for (const field of [
      "businessPortfolioReady", "multipleAdminsAnd2fa", "appReviewApproved",
      "advancedAccessApproved",
    ]) explicitBoolean(gate[field], `${path}.${field}`);
    optionalSha256(gate.nonOwnedProfessionalAccountE2eSha256,
      `${path}.nonOwnedProfessionalAccountE2eSha256`);
    return;
  }
  exactValue(gate.status, "APPROVED", `${path}.status`);
  for (const field of [
    "businessPortfolioReady", "multipleAdminsAnd2fa", "appReviewApproved",
    "advancedAccessApproved",
  ]) exactValue(gate[field], true, `${path}.${field}`);
  sha256(gate.nonOwnedProfessionalAccountE2eSha256,
    `${path}.nonOwnedProfessionalAccountE2eSha256`);
}

function validateExternalGates(manifest, gates) {
  const external = mapping(manifest.externalGates, "externalGates");
  validateObjectStorageGate(mapping(external.objectStorage, "externalGates.objectStorage"),
    gates.uploads);
  validateMetaGate(mapping(external.metaInstagram, "externalGates.metaInstagram"),
    gates.instagram);
  const legal = mapping(external.legal, "externalGates.legal");
  for (const field of ["businessInformationFinal", "privacyOfficerFinal", "documentVersionsApproved"]) {
    exactValue(legal[field], true, `externalGates.legal.${field}`);
  }
  sha256(legal.approvalEvidenceSha256, "externalGates.legal.approvalEvidenceSha256");
}

function validateAdminAccount(manifest) {
  const admin = mapping(manifest.stagingAdminAccount, "stagingAdminAccount");
  exactValue(admin.publicAdminSignupExists, false, "stagingAdminAccount.publicAdminSignupExists");
  exactValue(admin.approvedOneShotBootstrap, true,
    "stagingAdminAccount.approvedOneShotBootstrap");
  requireHashFields(admin, "stagingAdminAccount", [
    "bootstrapApprovalEvidenceSha256",
    "bootstrapDisabledEvidenceSha256",
    "bootstrapSecretRotatedEvidenceSha256",
  ]);
  textValue(admin.createdAccountIdFingerprint,
    "stagingAdminAccount.createdAccountIdFingerprint");
  exactValue(admin.normalRuntimeSafetyContractShowsDisabled, true,
    "stagingAdminAccount.normalRuntimeSafetyContractShowsDisabled");
}

function validateApprovals(manifest) {
  const approvals = mapping(manifest.approvals, "approvals");
  for (const role of ["engineering", "security", "database", "legal", "releaseOwner"]) {
    const approval = mapping(approvals[role], `approvals.${role}`);
    textValue(approval.approver, `approvals.${role}.approver`);
    timestamp(approval.approvedAtUtc, `approvals.${role}.approvedAtUtc`);
  }
}

function validateRisks(manifest) {
  const risks = array(manifest.openRisks, "openRisks");
  for (const [index, value] of risks.entries()) {
    const path = `openRisks[${index}]`;
    const risk = mapping(value, path);
    textValue(risk.id, `${path}.id`);
    textValue(risk.summary, `${path}.summary`);
    if (risk.severity === "P0") {
      qualificationError(`${path}.severity`, "P0 count must be zero for qualification");
    }
    exactValue(risk.severity, "P1", `${path}.severity`);
    if (!new Set(["ACCEPTED", "CLOSED"]).has(risk.status)) {
      qualificationError(`${path}.status`, "P1 must be explicitly ACCEPTED or CLOSED");
    }
    for (const field of ["owner", "acceptance", "acceptedBy"]) {
      textValue(risk[field], `${path}.${field}`);
    }
    timestamp(risk.dueAtUtc, `${path}.dueAtUtc`);
    timestamp(risk.acceptedAtUtc, `${path}.acceptedAtUtc`);
  }
}

function validateRollback(manifest) {
  const rollback = mapping(manifest.rollback, "rollback");
  textValue(rollback.runbookVersion, "rollback.runbookVersion");
  sha256(rollback.runbookSha256, "rollback.runbookSha256");
  textValue(rollback.approvedBy, "rollback.approvedBy");
  timestamp(rollback.approvedAtUtc, "rollback.approvedAtUtc");
}

export function validateApprovedManifest(manifest, environment = process.env) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new Error("Approved release manifest must be a YAML mapping");
  }

  const releaseId = requiredEnvironment("STAGING_EXPECTED_RELEASE_ID", environment);
  exact(manifest, "releaseId", releaseId);
  exact(manifest, "source.frontendCommit",
    requiredEnvironment("STAGING_EXPECTED_FRONTEND_SHA", environment));
  exact(manifest, "source.backendCommit",
    requiredEnvironment("STAGING_EXPECTED_BACKEND_SHA", environment));
  exact(manifest, "databaseEvidence.latestFlywayVersion",
    requiredEnvironment("STAGING_EXPECTED_SCHEMA_VERSION", environment));
  exact(manifest, "databaseEvidence.sentinelReleaseId", releaseId);
  exact(manifest, "databaseEvidence.sanitizedCloneEvidenceRootSealSha256",
    requiredEnvironment("CLONE_EVIDENCE_SEAL_SHA256", environment));
  exact(manifest, "databaseEvidence.sanitizedE2eBeforeEvidenceRootSealSha256",
    requiredEnvironment("CLONE_E2E_BEFORE_EVIDENCE_SEAL_SHA256", environment));

  if (!["DRAFT", "QUALIFIED"].includes(manifest.status)) {
    throw new Error("Release manifest status must be DRAFT or QUALIFIED for staging validation");
  }
  for (const [name, expected] of Object.entries({
    payments: false,
    instagram: false,
    uploads: false,
    scheduling: false,
    emailDeliveryMode: "disabled",
  })) {
    if (manifest.featureGates?.[name] !== expected) {
      throw new Error(`Release manifest feature gate ${name} is not fail-closed`);
    }
  }

  const risks = manifest.openRisks;
  if (!Array.isArray(risks)) throw new Error("Release manifest openRisks must be an array");
  for (const risk of risks) {
    if (risk?.severity === "P0" && risk?.status !== "CLOSED") {
      throw new Error("An unresolved P0 risk forbids staging mutation");
    }
    if (risk?.severity !== "P1" || risk?.status === "CLOSED") continue;
    for (const field of ["owner", "dueAtUtc", "acceptance", "acceptedBy", "acceptedAtUtc"]) {
      if (!completeText(risk[field])) {
        throw new Error(`Unresolved P1 ${risk.id ?? "<unknown>"} lacks ${field}`);
      }
    }
    if (risk.status !== "ACCEPTED") {
      throw new Error(`Unresolved P1 ${risk.id ?? "<unknown>"} must be explicitly ACCEPTED`);
    }
  }
  return true;
}

// Structural validation is intentionally not the release gate. Only
// validateQualifiedManifestFile binds approved bytes and real evidence files.
export function validateQualifiedManifestShape(manifest) {
  mapping(manifest, "manifest");
  const candidate = validateSourceAndArtifacts(manifest);
  validateCi(manifest, candidate);
  validateRepositoryControls(manifest);
  const database = validateDatabaseEvidence(manifest, candidate.releaseId);
  const gates = validateFeatureGates(manifest);
  validateAuthenticationCutover(manifest);
  validateStagingEvidence(manifest, database, candidate.releaseId, gates);
  validateEmailEvidence(manifest);
  validateExternalGates(manifest, gates);
  validateAdminAccount(manifest);
  validateApprovals(manifest);
  validateRisks(manifest);
  validateRollback(manifest);
  return true;
}

async function parseManifestFile(path) {
  if (!path) throw new Error("A release manifest path is required");
  const bytes = await readFile(path);
  return { bytes, manifest: parse(bytes.toString("utf8"), { uniqueKeys: true }) };
}

function collectManifestEvidenceHashes(value, currentPath = "", output = new Map()) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectManifestEvidenceHashes(item, `${currentPath}[${index}]`, output);
    });
    return output;
  }
  if (!value || typeof value !== "object") return output;

  for (const [key, child] of Object.entries(value)) {
    const path = currentPath ? `${currentPath}.${key}` : key;
    if (key.endsWith("Sha256") && typeof child === "string" && child !== "") {
      if (!NON_EVIDENCE_SHA256_PATHS.has(path)) {
        output.set(path, sha256(child, path));
      }
    } else {
      collectManifestEvidenceHashes(child, path, output);
    }
  }
  return output;
}

async function sha256File(path) {
  const hash = createHash("sha256");
  await new Promise((resolvePromise, rejectPromise) => {
    const stream = createReadStream(path);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", rejectPromise);
    stream.on("end", resolvePromise);
  });
  return hash.digest("hex");
}

function parseJsonEvidence(bytes, label) {
  const text = bytes.toString("utf8");
  let value;
  try {
    value = JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} must be valid JSON`, { cause: error });
  }
  try {
    // JSON.parse is intentionally retained as the syntax authority. YAML's JSON
    // subset parser is a second pass solely to reject duplicate mapping keys,
    // which JSON.parse would otherwise silently resolve with last-value-wins.
    parse(text, { uniqueKeys: true });
  } catch (error) {
    throw new Error(`${label} must not contain duplicate JSON keys`, { cause: error });
  }
  return value;
}

function parseKeyValueEvidence(text, separator, label) {
  const result = new Map();
  for (const [index, rawLine] of text.split(/\r?\n/).entries()) {
    if (!rawLine) continue;
    const offset = rawLine.indexOf(separator);
    if (offset <= 0 || result.has(rawLine.slice(0, offset))) {
      throw new Error(`${label} contains a malformed or duplicate row ${index + 1}`);
    }
    result.set(rawLine.slice(0, offset), rawLine.slice(offset + separator.length));
  }
  return result;
}

function expectedSealStage(manifestPath) {
  return new Map([
    ["databaseEvidence.productionReadonlyEvidenceRootSealSha256", "production-readonly-audit"],
    ["databaseEvidence.exactCloneEvidenceRootSealSha256", "exact-migration"],
    ["databaseEvidence.sanitizedCloneEvidenceRootSealSha256", "sanitized-migration"],
    ["databaseEvidence.sanitizedE2eBeforeEvidenceRootSealSha256", "sanitized-e2e-before"],
    ["databaseEvidence.sanitizedE2eAfterEvidenceRootSealSha256", "sanitized-e2e-after"],
    ["databaseEvidence.providerRestoreBindingEvidenceRootSealSha256", "provider-restore-binding"],
  ]).get(manifestPath);
}

function assertEvidenceExtension(relativePath, extensions, kind) {
  if (!extensions.includes(extname(relativePath).toLowerCase())) {
    throw new Error(`Qualification ${kind} evidence has an invalid path: ${relativePath}`);
  }
}

async function validateTypedEvidence({
  kind, manifestPaths, relativePath, bytes,
  entry, rootRealPath, manifest, semanticState,
}) {
  const releaseId = manifest.releaseId;
  if (kind === "evidence-manifest") {
    if (manifestPaths.length !== 0 || basename(relativePath) !== "EVIDENCE-MANIFEST.sha256") {
      throw new Error("Evidence-manifest support entries must have no manifest path and the canonical filename");
    }
    const lines = bytes.toString("utf8").trim().split(/\r?\n/).filter(Boolean);
    if (!lines.length || lines.some((line) => !/^[0-9a-f]{64} [ *][.][/][A-Za-z0-9._/-]+$/.test(line))) {
      throw new Error(`Malformed evidence checksum manifest: ${relativePath}`);
    }
    return;
  }

  if (kind === "support-file") {
    if (manifestPaths.length !== 0) throw new Error("Support files cannot bind manifest hash fields");
    return;
  }

  if (kind === "evidence-seal") {
    if (manifestPaths.length !== 1 || basename(relativePath) !== "EVIDENCE-SEAL") {
      throw new Error("Evidence-seal entries must bind exactly one root-seal field and use EVIDENCE-SEAL");
    }
    const seal = parseKeyValueEvidence(bytes.toString("utf8"), "=", "EVIDENCE-SEAL");
    const stage = expectedSealStage(manifestPaths[0]);
    if (!stage || seal.get("format") !== "viralground-evidence-seal-v1"
        || seal.get("releaseId") !== releaseId || seal.get("stage") !== stage) {
      throw new Error(`Clone evidence seal release/stage mismatch: ${relativePath}`);
    }
    const artifactCount = Number(seal.get("artifactCount"));
    if (!Number.isSafeInteger(artifactCount) || artifactCount < 1
        || !SHA256_PATTERN.test(seal.get("manifestSha256") ?? "")) {
      throw new Error(`Clone evidence seal manifest metadata is invalid: ${relativePath}`);
    }
    if (stage.startsWith("exact-") || stage.startsWith("sanitized-")) {
      if (seal.get("sourceSnapshotIdSha256") !== manifest.databaseEvidence.sourceSnapshotIdSha256) {
        throw new Error(`Clone evidence seal source snapshot mismatch: ${relativePath}`);
      }
    } else if (seal.has("sourceSnapshotIdSha256")) {
      throw new Error(`Non-clone evidence seal unexpectedly contains a source snapshot: ${relativePath}`);
    }
    timestamp(seal.get("sealedAtUtc"), `${manifestPaths[0]}.sealedAtUtc`);
    const relatedManifestPath = textValue(entry.evidenceManifestPath,
      `evidenceIndex entry for ${relativePath}.evidenceManifestPath`);
    const manifestCandidate = safeEvidencePath(rootRealPath, relatedManifestPath);
    const manifestRealPath = await realpath(manifestCandidate);
    const manifestStatus = await lstat(manifestCandidate);
    if (!manifestStatus.isFile() || manifestStatus.isSymbolicLink()
        || basename(relatedManifestPath) !== "EVIDENCE-MANIFEST.sha256"
        || dirname(relatedManifestPath) !== dirname(relativePath)) {
      throw new Error(`Clone seal evidence manifest path is unsafe: ${relativePath}`);
    }
    const manifestBytes = await readFile(manifestRealPath);
    const manifestDigest = createHash("sha256").update(manifestBytes).digest("hex");
    if (manifestDigest !== seal.get("manifestSha256")) {
      throw new Error(`Clone seal does not bind its evidence manifest: ${relativePath}`);
    }
    const checksumLines = manifestBytes.toString("utf8").trim().split(/\r?\n/).filter(Boolean);
    if (checksumLines.length !== artifactCount) {
      throw new Error(`Clone seal artifact count does not match its evidence manifest: ${relativePath}`);
    }
    for (const line of checksumLines) {
      const match = /^([0-9a-f]{64}) [ *][.]\/([A-Za-z0-9._/-]+)$/.exec(line);
      if (!match) throw new Error(`Malformed sealed artifact row: ${relativePath}`);
      const artifactRelative = `${dirname(relativePath)}/${match[2]}`.replace(/^\.\//, "");
      const artifactPath = safeEvidencePath(rootRealPath, artifactRelative);
      const artifactRealPath = await realpath(artifactPath);
      const status = await lstat(artifactPath);
      if (!status.isFile() || status.isSymbolicLink()
          || await sha256File(artifactRealPath) !== match[1]) {
        throw new Error(`Sealed artifact checksum mismatch: ${artifactRelative}`);
      }
      semanticState.requiredSupportPaths.add(artifactRelative);
    }
    semanticState.requiredSupportPaths.add(relatedManifestPath);
    semanticState.sealTimes.push({ stage, time: Number(Date.parse(seal.get("sealedAtUtc"))) });
    return;
  }

  if (kind === "parent-chain") {
    assertEvidenceExtension(relativePath, [".tsv"], kind);
    const chain = parseKeyValueEvidence(bytes.toString("utf8"), "\t", "parent chain");
    if (chain.get("format") !== "viralground-sanitized-e2e-chain-v1"
        || chain.get("releaseId") !== releaseId
        || chain.get("sourceSnapshotIdSha256") !== manifest.databaseEvidence.sourceSnapshotIdSha256
        || chain.get("beforeEvidenceSealSha256")
          !== manifest.databaseEvidence.sanitizedE2eBeforeEvidenceRootSealSha256
        || !SHA256_PATTERN.test(chain.get("beforeManifestSha256") ?? "")) {
      throw new Error("Sanitized E2E parent chain is not bound to the approved before root/source/release");
    }
    if (chain.size !== 6 || !textValue(chain.get("sentinelId"), "parentChain.sentinelId")) {
      throw new Error("Sanitized E2E parent chain contains missing or unsupported fields");
    }
    semanticState.parentChain = Object.fromEntries(chain);
    return;
  }

  if (kind === "provider-receipt") {
    assertEvidenceExtension(relativePath, [".json"], kind);
    const receipt = mapping(parseJsonEvidence(bytes, "Provider receipt"), "providerReceipt");
    const expectedKind = manifestPaths[0].includes("Exact") ? "exact" : "sanitized";
    const requiredFields = new Set([
      "schemaVersion", "provider", "providerOperationId", "cloneKind",
      "sourceSnapshotId", "targetHost", "targetDatabase", "status",
      "restoreStartedAtUtc", "restoreCompletedAtUtc", "releaseId",
    ]);
    if (Object.keys(receipt).length !== requiredFields.size
        || Object.keys(receipt).some((key) => !requiredFields.has(key))) {
      throw new Error("Provider receipt has an unexpected or missing field set");
    }
    exactValue(receipt.schemaVersion, 1, `${manifestPaths[0]}.schemaVersion`);
    exactValue(receipt.cloneKind, expectedKind, `${manifestPaths[0]}.cloneKind`);
    exactValue(receipt.sourceSnapshotId, manifest.databaseEvidence.sourceSnapshotId,
      `${manifestPaths[0]}.sourceSnapshotId`);
    exactValue(receipt.releaseId, releaseId, `${manifestPaths[0]}.releaseId`);
    exactValue(receipt.status, "SUCCEEDED", `${manifestPaths[0]}.status`);
    textValue(receipt.provider, `${manifestPaths[0]}.provider`);
    textValue(receipt.providerOperationId, `${manifestPaths[0]}.providerOperationId`);
    textValue(receipt.targetHost, `${manifestPaths[0]}.targetHost`);
    textValue(receipt.targetDatabase, `${manifestPaths[0]}.targetDatabase`);
    const started = timestamp(receipt.restoreStartedAtUtc,
      `${manifestPaths[0]}.restoreStartedAtUtc`);
    const completed = timestamp(receipt.restoreCompletedAtUtc,
      `${manifestPaths[0]}.restoreCompletedAtUtc`);
    const qualificationCreated = timestamp(manifest.createdAtUtc, "createdAtUtc");
    if (completed < started || completed - started > 86_400_000
        || completed > Date.now() + 300_000 || completed > qualificationCreated
        || qualificationCreated - completed > 14 * 86_400_000) {
      throw new Error("Provider restore receipt timing is not plausibly bound to this qualification");
    }
    semanticState.providerReceipts.push(receipt);
    return;
  }

  if (kind === "origin-fingerprint") {
    assertEvidenceExtension(relativePath, [".tsv"], kind);
    const lines = bytes.toString("utf8").trim().split(/\r?\n/);
    if (!lines.length || new Set(lines).size !== lines.length
        || [...lines].sort((left, right) => Buffer.compare(Buffer.from(left), Buffer.from(right)))
          .some((line, index) => line !== lines[index])) {
      throw new Error("Pre-mask source-origin fingerprint must be bytewise sorted and unique");
    }
    let structuralCount = 0;
    const rowCounts = new Set();
    const financial = new Set();
    for (const line of lines) {
      const fields = line.split("\t");
      if (fields.length !== 2) {
        throw new Error("Pre-mask source-origin fingerprint contains a malformed row");
      }
      const [key, value] = fields;
      if (key === "schema-structural-md5") {
        if (!/^[0-9a-f]{32}$/.test(value) || ++structuralCount !== 1) {
          throw new Error("Pre-mask source-origin structural digest is malformed or duplicated");
        }
      } else if (key.startsWith("row-count|")) {
        const relation = key.slice("row-count|".length);
        if (!/^[a-z_][a-z0-9_]*[.][a-z_][a-z0-9_]*$/.test(relation)
            || !/^(?:0|[1-9][0-9]*)$/.test(value) || rowCounts.has(relation)) {
          throw new Error("Pre-mask source-origin row-count entry is malformed or duplicated");
        }
        rowCounts.add(relation);
      } else if (key === "financial|campaigns" || key === "financial|escrow_transactions") {
        if (!/^(?:0|[1-9][0-9]*):-?(?:0|[1-9][0-9]*):-?(?:0|[1-9][0-9]*)$/.test(value)
            || financial.has(key)) {
          throw new Error("Pre-mask source-origin financial aggregate is malformed or duplicated");
        }
        financial.add(key);
      } else {
        throw new Error(`Pre-mask source-origin fingerprint contains an unsupported key: ${key}`);
      }
    }
    if (structuralCount !== 1 || !rowCounts.has("public.members")
        || financial.size !== 2) {
      throw new Error("Pre-mask source-origin fingerprint is missing required aggregate rows");
    }
    return;
  }

  if (kind === "provider-binding") {
    assertEvidenceExtension(relativePath, [".tsv"], kind);
    const binding = parseKeyValueEvidence(bytes.toString("utf8"), "\t", "provider binding");
    const requiredKeys = new Set([
      "provider", "sourceSnapshotIdSha256", "exactReceiptSha256",
      "sanitizedReceiptSha256", "exactOriginFingerprintSha256",
      "sanitizedOriginFingerprintSha256", "exactRestoreCompletedAtUtc",
      "sanitizedRestoreCompletedAtUtc", "providerRestoreReceiptsMatched",
      "preMaskOriginFingerprintMatched",
    ]);
    if (binding.size !== requiredKeys.size || [...binding.keys()].some((key) => !requiredKeys.has(key))
        || binding.get("sourceSnapshotIdSha256") !== manifest.databaseEvidence.sourceSnapshotIdSha256
        || binding.get("exactReceiptSha256") !== manifest.databaseEvidence.providerExactRestoreReceiptSha256
        || binding.get("sanitizedReceiptSha256") !== manifest.databaseEvidence.providerSanitizedRestoreReceiptSha256
        || binding.get("exactOriginFingerprintSha256")
          !== manifest.databaseEvidence.exactPreMaskOriginFingerprintSha256
        || binding.get("sanitizedOriginFingerprintSha256")
          !== manifest.databaseEvidence.sanitizedPreMaskOriginFingerprintSha256
        || binding.get("providerRestoreReceiptsMatched") !== "true"
        || binding.get("preMaskOriginFingerprintMatched") !== "true") {
      throw new Error("Provider restore binding report is inconsistent with the approved manifest");
    }
    timestamp(binding.get("exactRestoreCompletedAtUtc"),
      "providerBinding.exactRestoreCompletedAtUtc");
    timestamp(binding.get("sanitizedRestoreCompletedAtUtc"),
      "providerBinding.sanitizedRestoreCompletedAtUtc");
    semanticState.providerBinding = Object.fromEntries(binding);
    return;
  }

  if (kind === "junit-xml") {
    assertEvidenceExtension(relativePath, [".xml"], kind);
    const text = bytes.toString("utf8");
    const suites = [...text.matchAll(/<testsuite\b([^>]*)>/g)];
    if (!suites.length) throw new Error(`JUnit evidence contains no test suite: ${relativePath}`);
    let tests = 0;
    for (const suite of suites) {
      const attributeMatches = [...suite[1].matchAll(/(tests|failures|errors|skipped)="(\d+)"/g)];
      const attrs = Object.fromEntries(attributeMatches
        .map((match) => [match[1], Number(match[2])]));
      if (attributeMatches.length !== 4 || Object.keys(attrs).length !== 4) {
        throw new Error(`JUnit suite omits or duplicates required result counts: ${relativePath}`);
      }
      tests += attrs.tests;
      if (attrs.failures !== 0 || attrs.errors !== 0 || attrs.skipped !== 0) {
        throw new Error(`JUnit evidence is not a fully executed pass: ${relativePath}`);
      }
    }
    const testcaseCount = [...text.matchAll(/<testcase\b/g)].length;
    if (tests < 1 || testcaseCount !== tests) {
      throw new Error(`JUnit declared/executed testcase count mismatch: ${relativePath}`);
    }
    const requiredTests = Math.max(...manifestPaths.map((path) => {
      if (/frontendSuiteResultSha256$/.test(path)) return manifest.ci.frontendUnitTestCount;
      if (/backendSuiteResultSha256$/.test(path)) return manifest.ci.unitTestCount;
      if (/integrationSuiteResultSha256$/.test(path)) return manifest.ci.integrationTestCount;
      return 1;
    }));
    if (tests < requiredTests) {
      throw new Error(`JUnit evidence does not prove the manifest test count: ${relativePath}`);
    }
    return;
  }

  if (kind === "k6-summary-json") {
    assertEvidenceExtension(relativePath, [".json"], kind);
    const summary = mapping(parseJsonEvidence(bytes, "k6 summary"), "k6Summary");
    const metrics = mapping(summary.metrics, "k6Summary.metrics");
    const p95 = Number(metrics.http_req_duration?.values?.["p(95)"]);
    const errorRate = Number(metrics.http_req_failed?.values?.rate) * 100;
    const requestRate = Number(metrics.http_reqs?.values?.rate);
    const requestCount = Number(metrics.http_reqs?.values?.count);
    const vus = Number(metrics.vus_max?.values?.max ?? metrics.vus_max?.values?.value);
    const checksRate = Number(metrics.checks?.values?.rate);
    const checkPasses = Number(metrics.checks?.values?.passes);
    const checkFails = Number(metrics.checks?.values?.fails);
    const droppedIterations = Number(metrics.dropped_iterations?.values?.count);
    const droppedRate = Number(metrics.dropped_iterations?.values?.rate);
    if (![p95, errorRate, requestRate, requestCount, vus, checksRate,
      checkPasses, checkFails, droppedIterations, droppedRate]
      .every((value) => Number.isFinite(value) && value >= 0)
        || errorRate > 100 || checksRate > 1 || requestCount < 1
        || ![requestCount, vus, checkPasses, checkFails, droppedIterations]
          .every(Number.isSafeInteger)
        || checkPasses + checkFails < 1
        || Math.abs(checksRate - checkPasses / (checkPasses + checkFails)) > 1e-9
        || p95 > 1000 || errorRate >= 0.5 || requestRate < 20 || vus < 50
        || checksRate <= 0.995 || droppedIterations !== 0 || droppedRate !== 0) {
      throw new Error("k6 summary does not prove the approved performance thresholds");
    }
    return;
  }

  if (kind === "trivy-json") {
    assertEvidenceExtension(relativePath, [".json"], kind);
    const trivy = mapping(parseJsonEvidence(bytes, "Trivy report"), "trivyReport");
    if (!Number.isInteger(trivy.SchemaVersion) || trivy.SchemaVersion < 2
        || !textValue(trivy.ArtifactName, "trivyReport.ArtifactName")
        || !new Set(["container_image", "filesystem", "repository", "rootfs"])
          .has(trivy.ArtifactType)) {
      throw new Error("Trivy evidence lacks typed report identity metadata");
    }
    const results = array(trivy.Results, "trivyReport.Results");
    if (!results.length) throw new Error("Trivy evidence has no scan result");
    for (const [index, resultValue] of results.entries()) {
      const result = mapping(resultValue, `trivyReport.Results[${index}]`);
      textValue(result.Target, `trivyReport.Results[${index}].Target`);
      textValue(result.Class, `trivyReport.Results[${index}].Class`);
      textValue(result.Type, `trivyReport.Results[${index}].Type`);
      if (result.Vulnerabilities != null && !Array.isArray(result.Vulnerabilities)) {
        throw new Error("Trivy result Vulnerabilities must be an array or null");
      }
    }
    const high = results.flatMap((result) => result.Vulnerabilities ?? [])
      .filter((finding) => ["HIGH", "CRITICAL"].includes(finding?.Severity));
    if (high.length) throw new Error("Trivy evidence contains HIGH/CRITICAL vulnerabilities");
    return;
  }

  if (kind === "spdx-json") {
    assertEvidenceExtension(relativePath, [".json"], kind);
    const spdx = mapping(parseJsonEvidence(bytes, "SPDX SBOM"), "spdx");
    const creationInfo = mapping(spdx.creationInfo, "spdx.creationInfo");
    const creators = array(creationInfo.creators, "spdx.creationInfo.creators");
    const packages = array(spdx.packages, "spdx.packages");
    const packageIds = new Set();
    timestamp(creationInfo.created, "spdx.creationInfo.created");
    if (!/^SPDX-2[.]/.test(spdx.spdxVersion ?? "")
        || spdx.dataLicense !== "CC0-1.0" || spdx.SPDXID !== "SPDXRef-DOCUMENT"
        || !textValue(spdx.name, "spdx.name")
        || !textValue(spdx.documentNamespace, "spdx.documentNamespace")
        || !creators.length
        || creators.some((creator) => typeof creator !== "string"
          || !/^(?:Tool|Organization|Person):\s*\S/.test(creator))
        || packages.length < 1) {
      throw new Error("SPDX evidence is not a non-empty SPDX 2.x document");
    }
    for (const [index, packageValue] of packages.entries()) {
      const packageEntry = mapping(packageValue, `spdx.packages[${index}]`);
      textValue(packageEntry.name, `spdx.packages[${index}].name`);
      if (typeof packageEntry.SPDXID !== "string"
          || !/^SPDXRef-[A-Za-z0-9.-]+$/.test(packageEntry.SPDXID)
          || packageEntry.SPDXID === "SPDXRef-DOCUMENT"
          || packageIds.has(packageEntry.SPDXID)) {
        throw new Error("SPDX package entries require unique concrete SPDX identifiers");
      }
      packageIds.add(packageEntry.SPDXID);
    }
    return;
  }

  if (kind === "http-contract-tsv") {
    assertEvidenceExtension(relativePath, [".tsv"], kind);
    const lines = bytes.toString("utf8").trim().split(/\r?\n/);
    const expected = new Map([
      ["landing", "200"],
      ["loginInvalid", "401"],
      ["loginSuccess", "200"],
      ["refreshSuccess", "204"],
    ]);
    if (lines[0] !== "endpoint\trcStatus\trcShapeSha256\tlegacyStatus\tlegacyShapeSha256\tresult"
        || lines.length !== 5) {
      throw new Error("RC/legacy HTTP compatibility evidence must contain all four approved endpoints");
    }
    const observed = new Set();
    for (const line of lines.slice(1)) {
      const [endpoint, rcStatus, rcShape, legacyStatus, legacyShape, result, ...extra] = line.split("\t");
      if (extra.length || !expected.has(endpoint) || observed.has(endpoint)
          || rcStatus !== expected.get(endpoint) || legacyStatus !== expected.get(endpoint)
          || !SHA256_PATTERN.test(rcShape) || legacyShape !== rcShape || result !== "MATCHED") {
        throw new Error("RC/legacy HTTP compatibility evidence has a malformed or mismatched endpoint");
      }
      observed.add(endpoint);
    }
    if (observed.size !== expected.size) {
      throw new Error("RC/legacy HTTP compatibility evidence is incomplete");
    }
    return;
  }

  if (kind === "sanitized-e2e-comparison") {
    assertEvidenceExtension(relativePath, [".tsv"], kind);
    const comparison = parseKeyValueEvidence(
      bytes.toString("utf8"), "\t", "sanitized E2E comparison");
    const expectedKeys = [
      "format", "releaseId", "sourceSnapshotIdSha256", "beforeEvidenceSealSha256",
      "beforeFingerprintSha256", "afterFingerprintSha256", "result",
    ];
    if (comparison.size !== expectedKeys.length
        || expectedKeys.some((key) => !comparison.has(key))
        || comparison.get("format") !== "viralground-sanitized-e2e-comparison-v1"
        || comparison.get("releaseId") !== releaseId
        || comparison.get("sourceSnapshotIdSha256")
          !== manifest.databaseEvidence.sourceSnapshotIdSha256
        || comparison.get("beforeEvidenceSealSha256")
          !== manifest.databaseEvidence.sanitizedE2eBeforeEvidenceRootSealSha256
        || !SHA256_PATTERN.test(comparison.get("beforeFingerprintSha256") ?? "")
        || comparison.get("afterFingerprintSha256")
          !== comparison.get("beforeFingerprintSha256")
        || comparison.get("result") !== "MATCHED") {
      throw new Error("Sanitized E2E comparison is not a release/source/seal-bound exact match");
    }
    semanticState.sanitizedComparison = Object.fromEntries(comparison);
    return;
  }

  if (kind === "zero-violation-tsv") {
    assertEvidenceExtension(relativePath, [".tsv"], kind);
    const rows = bytes.toString("utf8").trim().split(/\r?\n/).filter(Boolean);
    if (!rows.length || rows.some((line) => !/^[-a-z0-9_]+\t0$/.test(line))) {
      throw new Error(`Zero-violation TSV contains a violation or malformed row: ${relativePath}`);
    }
    return;
  }

  if (kind === "tsv-report") {
    assertEvidenceExtension(relativePath, [".tsv"], kind);
    if (!bytes.toString("utf8").trim().includes("\t")) {
      throw new Error(`TSV evidence is empty or malformed: ${relativePath}`);
    }
    return;
  }

  if (kind === "runtime-contract-json") {
    assertEvidenceExtension(relativePath, [".json"], kind);
    const contract = mapping(parseJsonEvidence(bytes, "runtime contract"), "runtimeContract");
    for (const [key, value] of Object.entries(manifest.stagingEvidence.mutationRuntimeSafetyContract)) {
      if (contract[key] !== value) throw new Error(`Runtime safety evidence mismatch at ${key}`);
    }
    return;
  }

  if (kind === "artifact-set-json") {
    assertEvidenceExtension(relativePath, [".json"], kind);
    const set = mapping(parseJsonEvidence(bytes, "candidate artifact set"), "artifactSet");
    if (set.releaseId !== releaseId || set.frontendCommit !== manifest.source.frontendCommit
        || set.backendCommit !== manifest.source.backendCommit
        || set.backendImageArchiveSha256 !== manifest.artifacts.backendImageArchiveSha256
        || set.frontendArtifactSha256 !== manifest.artifacts.frontendArtifactSha256
        || set.flywayMigrationSetSha256 !== manifest.artifacts.flywayMigrationSetSha256) {
      throw new Error("Candidate artifact set is not bound to the approved source/artifacts");
    }
    return;
  }

  if (kind === "checksum-manifest") {
    const text = bytes.toString("utf8").trim();
    if (!text || text.split(/\r?\n/).some((line) => !/^[0-9a-f]{64} [ *][A-Za-z0-9._/-]+$/.test(line))) {
      throw new Error("Checksum-manifest evidence is malformed");
    }
    return;
  }

  if (kind === "schema-allowlist-tsv") {
    assertEvidenceExtension(relativePath, [".tsv"], kind);
    const lines = bytes.toString("utf8").trim().split(/\r?\n/);
    if (!lines.length || lines.some((line) => !/^[a-z][a-z0-9_]*\t[a-z][a-z0-9_]*$/.test(line))) {
      throw new Error("Public-schema allowlist evidence is malformed");
    }
    return;
  }

  if (kind === "jar") {
    assertEvidenceExtension(relativePath, [".jar"], kind);
    if (bytes.length < 4 || bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
      throw new Error("Legacy backend artifact is not a JAR/ZIP file");
    }
    return;
  }

  if (kind === "docker-image-archive") {
    assertEvidenceExtension(relativePath, [".tar"], kind);
    if (bytes.length < 512 || bytes.subarray(257, 262).toString("ascii") !== "ustar") {
      throw new Error("Backend image evidence is not a Docker-compatible TAR archive");
    }
    return;
  }

  if (kind === "frontend-artifact") {
    if (bytes.length < 4 || !([0x50, 0x4b].every((value, index) => bytes[index] === value)
      || bytes.subarray(257, 262).toString("ascii") === "ustar")) {
      throw new Error("Frontend artifact evidence is not a ZIP/TAR archive");
    }
    return;
  }

  if (kind === "runbook") {
    assertEvidenceExtension(relativePath, [".md", ".txt"], kind);
    const text = bytes.toString("utf8");
    if (text.length < 100 || !/(rollback|롤백)/i.test(text) || PLACEHOLDER_PATTERN.test(text)) {
      throw new Error("Rollback runbook evidence is incomplete");
    }
    return;
  }

  if (kind === "attestation-json") {
    assertEvidenceExtension(relativePath, [".json"], kind);
    const attestation = mapping(parseJsonEvidence(bytes, "attestation"), "attestation");
    exactValue(attestation.schemaVersion, 1, "attestation.schemaVersion");
    exactValue(attestation.releaseId, releaseId, "attestation.releaseId");
    exactValue(attestation.result, "PASSED", "attestation.result");
    timestamp(attestation.generatedAtUtc, "attestation.generatedAtUtc");
    const evidenceTypes = array(attestation.evidenceTypes, "attestation.evidenceTypes");
    if (JSON.stringify([...evidenceTypes].sort()) !== JSON.stringify([...manifestPaths].sort())) {
      throw new Error("Attestation evidenceTypes do not exactly match the bound manifest fields");
    }
    return;
  }

  throw new Error(`Unknown qualification evidence kind: ${kind}`);
}

async function enumerateEvidenceFiles(rootRealPath, directory = rootRealPath, output = []) {
  for (const name of await readdir(directory)) {
    const path = resolve(directory, name);
    const status = await lstat(path);
    if (status.isSymbolicLink()) throw new Error(`Qualification evidence contains a symlink: ${path}`);
    if (status.isDirectory()) await enumerateEvidenceFiles(rootRealPath, path, output);
    else if (status.isFile()) output.push(relative(rootRealPath, path).split(sep).join("/"));
    else throw new Error(`Qualification evidence contains a non-regular filesystem object: ${path}`);
  }
  return output;
}

function ensureProtectedQualificationBinding(manifest, manifestBytes, environment) {
  const context = requiredEnvironment("QUALIFICATION_APPROVAL_CONTEXT", environment);
  if (context !== QUALIFICATION_APPROVAL_CONTEXT) {
    throw new Error("Final qualification requires the protected release-qualification approval context");
  }

  const expectedManifestHash = requiredEnvironment(
    "QUALIFICATION_APPROVED_RELEASE_MANIFEST_SHA256", environment);
  sha256(expectedManifestHash, "QUALIFICATION_APPROVED_RELEASE_MANIFEST_SHA256");
  const actualManifestHash = createHash("sha256").update(manifestBytes).digest("hex");
  if (actualManifestHash !== expectedManifestHash) {
    throw new Error("Protected approved QUALIFIED release manifest SHA-256 mismatch");
  }

  exact(manifest, "releaseId",
    requiredEnvironment("QUALIFICATION_EXPECTED_RELEASE_ID", environment));
  exact(manifest, "source.frontendCommit",
    requiredEnvironment("QUALIFICATION_EXPECTED_FRONTEND_SHA", environment));
  exact(manifest, "source.backendCommit",
    requiredEnvironment("QUALIFICATION_EXPECTED_BACKEND_SHA", environment));
  return actualManifestHash;
}

function safeEvidencePath(root, relativePath) {
  if (typeof relativePath !== "string" || !relativePath.trim()
      || relativePath !== relativePath.trim() || isAbsolute(relativePath)
      || relativePath.includes("\\")) {
    throw new Error("Qualification evidence index contains an invalid relative path");
  }
  const segments = relativePath.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) {
    throw new Error("Qualification evidence index path traversal is forbidden");
  }
  return resolve(root, ...segments);
}

async function validateQualificationEvidence(
  manifest,
  approvedManifestHash,
  evidenceIndexPath,
  evidenceRootPath,
  environment,
) {
  if (!evidenceIndexPath) throw new Error("A qualification evidence-index path is required");
  if (!evidenceRootPath) throw new Error("A qualification evidence root is required");

  const indexBytes = await readFile(evidenceIndexPath);
  const expectedIndexHash = requiredEnvironment(
    "QUALIFICATION_APPROVED_EVIDENCE_INDEX_SHA256", environment);
  sha256(expectedIndexHash, "QUALIFICATION_APPROVED_EVIDENCE_INDEX_SHA256");
  const actualIndexHash = createHash("sha256").update(indexBytes).digest("hex");
  if (actualIndexHash !== expectedIndexHash) {
    throw new Error("Protected approved qualification evidence-index SHA-256 mismatch");
  }

  const index = parseJsonEvidence(indexBytes, "Qualification evidence index");
  mapping(index, "evidenceIndex");
  exactValue(index.schemaVersion, EVIDENCE_INDEX_SCHEMA_VERSION,
    "evidenceIndex.schemaVersion");
  exactValue(sha256(index.releaseManifestSha256, "evidenceIndex.releaseManifestSha256"),
    approvedManifestHash, "evidenceIndex.releaseManifestSha256");
  const files = array(index.files, "evidenceIndex.files");
  if (files.length === 0) qualificationError("evidenceIndex.files", "must not be empty");

  const expectedFields = collectManifestEvidenceHashes(manifest);
  const coveredFields = new Set();
  const usedPaths = new Set();
  const rootStatus = await lstat(evidenceRootPath);
  if (!rootStatus.isDirectory() || rootStatus.isSymbolicLink()) {
    throw new Error("Qualification evidence root must be a real non-symlink directory");
  }
  const rootRealPath = await realpath(evidenceRootPath);
  const indexRealPath = await realpath(evidenceIndexPath);
  if (dirname(indexRealPath) !== rootRealPath
      || basename(indexRealPath) !== "qualification-evidence-index.json") {
    throw new Error("Qualification evidence index must be the canonical file at the evidence root");
  }
  const semanticState = {
    providerReceipts: [],
    requiredSupportPaths: new Set(),
    sealTimes: [],
    indexedFileHashes: new Map(),
    parentChain: null,
    sanitizedComparison: null,
    providerBinding: null,
  };

  for (const [entryIndex, rawEntry] of files.entries()) {
    const entryPath = `evidenceIndex.files[${entryIndex}]`;
    const entry = mapping(rawEntry, entryPath);
    const relativePath = textValue(entry.path, `${entryPath}.path`);
    if (usedPaths.has(relativePath)) {
      qualificationError(`${entryPath}.path`, "must be unique");
    }
    usedPaths.add(relativePath);

    const candidatePath = safeEvidencePath(rootRealPath, relativePath);
    const candidateRealPath = await realpath(candidatePath);
    const outsideRoot = relative(rootRealPath, candidateRealPath);
    if (outsideRoot === ".." || outsideRoot.startsWith(`..${sep}`) || isAbsolute(outsideRoot)) {
      throw new Error(`Qualification evidence escapes its root: ${relativePath}`);
    }
    const fileStatus = await lstat(candidatePath);
    if (!fileStatus.isFile() || fileStatus.isSymbolicLink()) {
      throw new Error(`Qualification evidence must be a regular non-symlink file: ${relativePath}`);
    }

    const manifestPaths = array(entry.manifestPaths, `${entryPath}.manifestPaths`);
    const kind = textValue(entry.kind, `${entryPath}.kind`);
    if (manifestPaths.length === 0 && !new Set(["evidence-manifest", "support-file"]).has(kind)) {
      qualificationError(`${entryPath}.manifestPaths`, "may be empty only for typed support files");
    }
    const actualFileHash = await sha256File(candidateRealPath);
    semanticState.indexedFileHashes.set(relativePath, actualFileHash);
    for (const [pathIndex, rawManifestPath] of manifestPaths.entries()) {
      const manifestPath = textValue(
        rawManifestPath, `${entryPath}.manifestPaths[${pathIndex}]`);
      if (coveredFields.has(manifestPath)) {
        qualificationError(`${entryPath}.manifestPaths[${pathIndex}]`,
          "must not duplicate another evidence binding");
      }
      const expectedFileHash = expectedFields.get(manifestPath);
      if (!expectedFileHash) {
        qualificationError(`${entryPath}.manifestPaths[${pathIndex}]`,
          "does not name a non-empty manifest SHA-256 evidence field");
      }
      if (actualFileHash !== expectedFileHash) {
        throw new Error(
          `Qualification evidence SHA-256 mismatch for ${manifestPath} (${relativePath})`);
      }
      coveredFields.add(manifestPath);
    }
    if (manifestPaths.length > 0) {
      const expectedKinds = new Set(manifestPaths.map(evidenceKindForManifestPath));
      if (expectedKinds.size !== 1 || !expectedKinds.has(kind)) {
        qualificationError(`${entryPath}.kind`,
          `must equal the manifest field evidence kind (${[...expectedKinds].join(", ")})`);
      }
    }
    await validateTypedEvidence({
      kind,
      manifestPaths,
      relativePath,
      candidateRealPath,
      bytes: await readFile(candidateRealPath),
      entry,
      rootRealPath,
      manifest,
      semanticState,
    });
  }

  const missingFields = [...expectedFields.keys()].filter((path) => !coveredFields.has(path));
  if (missingFields.length > 0) {
    throw new Error(`Qualification evidence index does not bind manifest fields: ${missingFields.join(", ")}`);
  }

  for (const requiredPath of semanticState.requiredSupportPaths) {
    if (!usedPaths.has(requiredPath)) {
      throw new Error(`Sealed evidence artifact is not explicitly indexed: ${requiredPath}`);
    }
  }
  if (semanticState.providerReceipts.length !== 2) {
    throw new Error("Qualification requires exact and sanitized provider-native restore receipts");
  }
  const [exactReceipt, sanitizedReceipt] = semanticState.providerReceipts
    .sort((left, right) => left.cloneKind.localeCompare(right.cloneKind));
  if (exactReceipt.cloneKind !== "exact" || sanitizedReceipt.cloneKind !== "sanitized"
      || exactReceipt.provider !== sanitizedReceipt.provider
      || exactReceipt.providerOperationId === sanitizedReceipt.providerOperationId) {
    throw new Error("Provider restore receipts do not prove two distinct same-provider clone restores");
  }
  if (!semanticState.providerBinding
      || semanticState.providerBinding.provider !== exactReceipt.provider
      || semanticState.providerBinding.exactRestoreCompletedAtUtc
        !== exactReceipt.restoreCompletedAtUtc
      || semanticState.providerBinding.sanitizedRestoreCompletedAtUtc
        !== sanitizedReceipt.restoreCompletedAtUtc) {
    throw new Error("Provider binding does not bind the actual receipt provider/completion times");
  }
  for (const receipt of semanticState.providerReceipts) {
    const stage = receipt.cloneKind === "exact" ? "exact-migration" : "sanitized-migration";
    const seal = semanticState.sealTimes.find((value) => value.stage === stage);
    if (!seal || Date.parse(receipt.restoreCompletedAtUtc) > seal.time) {
      throw new Error(`${receipt.cloneKind} provider restore completion is not before its clone evidence seal`);
    }
  }

  const uniqueHashForSuffix = (suffix, label) => {
    const matches = [...semanticState.indexedFileHashes]
      .filter(([path]) => path.endsWith(suffix));
    if (matches.length !== 1) {
      throw new Error(`Qualification requires exactly one indexed ${label}`);
    }
    return matches[0][1];
  };
  if (!semanticState.parentChain
      || semanticState.parentChain.beforeManifestSha256 !== uniqueHashForSuffix(
        "/sanitized/e2e-before/EVIDENCE-MANIFEST.sha256", "sanitized before manifest")) {
    throw new Error("Sanitized E2E parent chain does not bind the actual before evidence manifest");
  }
  if (!semanticState.sanitizedComparison
      || semanticState.sanitizedComparison.beforeFingerprintSha256 !== uniqueHashForSuffix(
        "/sanitized-e2e-before.tsv", "sanitized before fingerprint")
      || semanticState.sanitizedComparison.afterFingerprintSha256 !== uniqueHashForSuffix(
        "/sanitized-e2e-after.tsv", "sanitized after fingerprint")) {
    throw new Error("Sanitized E2E comparison does not bind the actual before/after fingerprints");
  }

  const actualFiles = (await enumerateEvidenceFiles(rootRealPath)).sort();
  const expectedFiles = [...usedPaths, "qualification-evidence-index.json"].sort();
  if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
    throw new Error("Qualification evidence root contains an unindexed, missing, or extra file");
  }
}

export async function validateApprovedManifestFile(path, environment = process.env) {
  const { bytes, manifest } = await parseManifestFile(path);
  const expectedHash = requiredEnvironment(
    "STAGING_APPROVED_RELEASE_MANIFEST_SHA256", environment);
  const actualHash = createHash("sha256").update(bytes).digest("hex");
  if (actualHash !== expectedHash) {
    throw new Error("Approved release manifest file SHA-256 mismatch");
  }
  validateApprovedManifest(manifest, environment);
}

export async function validateQualifiedManifestFile(
  path,
  evidenceIndexPath,
  evidenceRootPath,
  environment = process.env,
) {
  const { bytes, manifest } = await parseManifestFile(path);
  validateQualifiedManifestShape(manifest);
  const approvedManifestHash = ensureProtectedQualificationBinding(
    manifest, bytes, environment);
  await validateQualificationEvidence(
    manifest,
    approvedManifestHash,
    evidenceIndexPath,
    evidenceRootPath,
    environment,
  );
}

if (process.argv[1]
    && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [modeOrPath, qualifiedPath, evidenceIndexPath, evidenceRootPath] = process.argv.slice(2);
  if (modeOrPath === "--qualified") {
    await validateQualifiedManifestFile(qualifiedPath, evidenceIndexPath, evidenceRootPath);
    console.log("Protected approved release manifest and every actual QUALIFIED evidence file validated.");
  } else {
    await validateApprovedManifestFile(modeOrPath);
    console.log("Approved release manifest file and staging binding validated.");
  }
}
