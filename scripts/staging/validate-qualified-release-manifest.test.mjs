import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { stringify } from "yaml";
import {
  validateQualifiedManifestShape,
  validateQualifiedManifestFile,
  qualificationEvidenceKindForPath,
} from "./validate-release-manifest.mjs";

const digest = (character) => character.repeat(64);
const frontendCommit = "1".repeat(40);
const backendCommit = "2".repeat(40);
const migrationSeal = digest("a");
const beforeSeal = digest("b");
const sourceSnapshotId = "provider-snapshot-20260822-001";
const sourceSnapshotIdSha256 = createHash("sha256").update(sourceSnapshotId).digest("hex");
const migrationFingerprint = createHash("sha256").update(migrationSeal).digest("hex");
const beforeFingerprint = createHash("sha256").update(beforeSeal).digest("hex");

function run(sequence) {
  return {
    sequence,
    completedAtUtc: `2026-08-${18 + sequence}T00:00:00Z`,
    frontendRunUrl: `https://github.com/viralground/frontend/actions/runs/${sequence}`,
    backendRunUrl: `https://github.com/viralground/backend/actions/runs/${sequence}`,
    integrationRunUrl: `https://github.com/viralground/backend/actions/runs/1${sequence}`,
    frontendCommit,
    backendCommit,
    candidateArtifactSetSha256: digest("c"),
    frontendSuiteResultSha256: digest("d"),
    backendSuiteResultSha256: digest("e"),
    integrationSuiteResultSha256: digest("f"),
    result: "PASSED",
  };
}

function qualifiedManifest() {
  return {
    schemaVersion: 5,
    releaseId: "rc-20260822-001",
    createdAtUtc: "2026-08-22T05:00:00Z",
    status: "QUALIFIED",
    source: { frontendCommit, backendCommit, branch: "launch-p0" },
    artifacts: {
      candidateArtifactSetSha256: digest("c"),
      backendImage: `registry.example/viralground/backend@sha256:${digest("4")}`,
      backendImageArchiveSha256: digest("5"),
      backendLocalImageContentId: `sha256:${digest("6")}`,
      backendSbomSha256: digest("7"),
      dependencyScanSha256: digest("8"),
      runtimeImageScanSha256: digest("9"),
      frontendArtifactSha256: digest("0"),
      flywayMigrationSetSha256: digest("1"),
    },
    ci: {
      consecutiveSuccessfulRuns: 3,
      sameShaRuns: [run(1), run(2), run(3)],
      frontendUnitTestCount: 85,
      frontendPlaywrightTestCount: 22,
      integrationTestCount: 22,
      unitTestCount: 506,
      dependencyHighVulnerabilities: 0,
      dependencyCriticalVulnerabilities: 0,
      imageHighVulnerabilities: 0,
      imageCriticalVulnerabilities: 0,
      frontendChecks: {
        lint: "PASSED",
        typecheck: "PASSED",
        unit: "PASSED",
        productionBuild: "PASSED",
        dependencyAudit: "PASSED",
        playwright: "PASSED",
      },
      backendChecks: {
        unit: "PASSED",
        integration: "PASSED",
        legacyMigration: "PASSED",
        bootJar: "PASSED",
        containerBuild: "PASSED",
        dependencyScan: "PASSED",
        containerScan: "PASSED",
      },
    },
    repositoryControls: {
      frontendMainRulesetEvidenceSha256: digest("2"),
      backendMainRulesetEvidenceSha256: digest("3"),
      requiredApprovalCount: 1,
      directPushBlocked: true,
      administratorBypassDisabled: true,
      vercelProductionAutoDeployDisabledEvidenceSha256: digest("4"),
      railwayProductionAutoDeployDisabledEvidenceSha256: digest("5"),
      verifiedBy: "repository-control-reviewer",
      verifiedAtUtc: "2026-08-22T00:00:00Z",
    },
    databaseEvidence: {
      productionReadonlyAuditSha256: digest("6"),
      productionReadonlyEvidenceRootSealSha256: digest("7"),
      providerExactRestoreReceiptSha256: digest("a"),
      providerSanitizedRestoreReceiptSha256: digest("b"),
      providerRestoreBindingSha256: digest("c"),
      providerRestoreBindingEvidenceRootSealSha256: digest("d"),
      exactPreMaskOriginFingerprintSha256: digest("e"),
      sanitizedPreMaskOriginFingerprintSha256: digest("e"),
      providerRestoreReceiptsMatched: true,
      preMaskOriginFingerprintMatched: true,
      productionReadonlyRolePrivilegesApproved: true,
      productionDemoAccountCandidateCount: 0,
      sourceSnapshotId,
      sourceSnapshotIdSha256,
      productionReadonlySecurityDefinerPathCount: 0,
      productionReadonlyDangerousPredefinedRoleCount: 0,
      productionReadonlyTempPrivilegeCount: 0,
      productionPublicRlsEnabledTableCount: 0,
      productionPublicRlsPolicyCount: 0,
      exactCloneSourceSnapshotMatched: true,
      sanitizedCloneSourceSnapshotMatched: true,
      exactAndSanitizedSourceSnapshotMatched: true,
      sentinelReleaseId: "rc-20260822-001",
      sourceFlywayHistoryAbsentEvidenceSha256: digest("8"),
      strengthenedV3UnappliedPreconditionApproved: true,
      exactCloneEvidenceSha256: digest("9"),
      exactCloneEvidenceRootSealSha256: digest("0"),
      guardedMigrationRunSha256: digest("1"),
      exactNewLegacyCompatibilitySha256: digest("2"),
      exactCompatibilityHttpContractSha256: digest("3"),
      exactCompatibilityReadOnlyRoleApproved: true,
      legacyBackendJarSha256: digest("4"),
      directBootGuardBeforeFlywayEvidenceSha256: digest("5"),
      sanitizedCloneEvidenceSha256: digest("6"),
      sanitizedCloneEvidenceRootSealSha256: migrationSeal,
      sanitizedE2eBeforeEvidenceRootSealSha256: beforeSeal,
      sanitizedE2eAfterEvidenceRootSealSha256: digest("c"),
      sanitizedE2eAfterParentChainSha256: digest("d"),
      sanitizedE2eComparisonSha256: digest("e"),
      sanitizedSyntheticProvenanceSha256: digest("f"),
      sanitizedRelationshipInvariantSha256: digest("0"),
      publicSchemaAllowlistSha256: digest("b"),
      legacyPublicSchemaUnknownEntryCount: 0,
      latestPublicSchemaUnknownEntryCount: 0,
      latestPublicSchemaMissingEntryCount: 0,
      restoreEvidenceSha256: digest("1"),
      baselineVersion: "1",
      baselineOnMigrateDisabledAfterRun: true,
      flywayValidateRuns: 2,
      latestFlywayVersion: "16",
      failedFlywayMigrations: 0,
      hibernateValidateRuns: 2,
      restoreRtoMinutes: 180,
      restoreApproved: true,
      containsPiiOrSecrets: false,
    },
    featureGates: {
      payments: false,
      instagram: false,
      uploads: false,
      scheduling: false,
      emailDeliveryMode: "disabled",
    },
    authenticationCutover: {
      forcedReloginAcknowledged: true,
      legacyJwtRejectedEvidenceSha256: digest("2"),
      passwordResetRevocationEvidenceSha256: digest("3"),
      rollbackSessionInvalidationPlanApproved: true,
    },
    stagingEvidence: {
      sanitizedTargetGuardReleaseId: "rc-20260822-001",
      mutationRuntimeSafetyContractSha256: digest("4"),
      mutationRuntimeSafetyContract: {
        cloneKind: "sanitized",
        sentinelReleaseId: "rc-20260822-001",
        sentinelCompleted: true,
        evidenceSealMatched: true,
        evidenceSealFingerprint: migrationFingerprint,
        e2eBeforeEvidenceSealMatched: true,
        e2eBeforeEvidenceSealFingerprint: beforeFingerprint,
        accountProvisioningEnabled: false,
        e2eMutationEnabled: true,
        emailDeliveryMode: "disabled",
        globalSchedulingEnabled: false,
        outboxDispatchEnabled: false,
        paymentsEnabled: false,
        instagramEnabled: false,
        uploadsEnabled: false,
      },
      roleE2eRunUrl: "https://github.com/viralground/frontend/actions/runs/100",
      roleE2eResultSha256: digest("5"),
      legalVersionContractResultSha256: digest("a"),
      accessibilityResultSha256: digest("6"),
      securityResultSha256: digest("7"),
      loadResultSha256: digest("8"),
      syntheticWindowEvidenceSha256: digest("9"),
      syntheticWindowHours: 24,
      syntheticSuccessPercent: 100,
      unhandledSentryErrors: 0,
      performanceVirtualUsers: 50,
      performanceRequestsPerSecond: 20,
      performanceP95Milliseconds: 1000,
      performanceErrorPercent: 0.49,
      sentryScrubbingEvidenceSha256: digest("0"),
      requestIdCorrelationEvidenceSha256: digest("1"),
    },
    emailEvidence: {
      mode: "disabled",
      senderDomainVerified: true,
      allowlistApproved: true,
      providerMessageIdsEvidenceSha256: digest("2"),
      retryDeadLetterEvidenceSha256: digest("3"),
      bounceSuppressionEvidenceSha256: digest("4"),
    },
    externalGates: {
      objectStorage: {
        status: "DISABLED",
        disabledReason: "No isolated staging bucket has been approved for this candidate",
        provider: "",
        stagingBucket: "",
        isolatedFromProduction: false,
        iamCorsEncryptionVersioningLifecycleEvidenceSha256: "",
        contractEvidenceSha256: "",
      },
      metaInstagram: {
        status: "DISABLED",
        disabledReason: "Advanced Access is not approved for this candidate",
        businessPortfolioReady: false,
        multipleAdminsAnd2fa: false,
        appReviewApproved: false,
        advancedAccessApproved: false,
        nonOwnedProfessionalAccountE2eSha256: "",
      },
      legal: {
        businessInformationFinal: true,
        privacyOfficerFinal: true,
        documentVersionsApproved: true,
        approvalEvidenceSha256: digest("5"),
      },
    },
    stagingAdminAccount: {
      publicAdminSignupExists: false,
      approvedOneShotBootstrap: true,
      bootstrapApprovalEvidenceSha256: digest("6"),
      createdAccountIdFingerprint: "admin-account-non-reversible-fingerprint",
      bootstrapDisabledEvidenceSha256: digest("7"),
      bootstrapSecretRotatedEvidenceSha256: digest("8"),
      normalRuntimeSafetyContractShowsDisabled: true,
    },
    approvals: Object.fromEntries([
      "engineering", "security", "database", "legal", "releaseOwner",
    ].map((role) => [role, {
      approver: `${role}-approver`,
      approvedAtUtc: "2026-08-25T00:00:00Z",
    }])),
    openRisks: [{
      id: "RC-P1-001",
      severity: "P1",
      summary: "A bounded concurrency edge case remains documented",
      owner: "authentication-owner",
      dueAtUtc: "2026-09-30T00:00:00Z",
      acceptance: "Accepted for this feature-disabled release candidate",
      acceptedBy: "release-owner",
      acceptedAtUtc: "2026-08-25T00:00:00Z",
      status: "ACCEPTED",
    }],
    rollback: {
      runbookVersion: "rollback-runbook-v1",
      runbookSha256: digest("9"),
      approvedBy: "release-owner",
      approvedAtUtc: "2026-08-25T00:00:00Z",
    },
  };
}

function collectHashReferences(value, currentPath = "", output = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectHashReferences(item, `${currentPath}[${index}]`, output);
    });
    return output;
  }
  if (!value || typeof value !== "object") return output;
  for (const [key, child] of Object.entries(value)) {
    const path = currentPath ? `${currentPath}.${key}` : key;
    if (key.endsWith("Sha256") && typeof child === "string" && child !== "") {
      if (path !== "databaseEvidence.sourceSnapshotIdSha256") {
        output.push({ container: value, key, path });
      }
    } else {
      collectHashReferences(child, path, output);
    }
  }
  return output;
}

async function materializeQualifiedEvidence(directory) {
  const manifest = qualifiedManifest();
  const evidenceRoot = join(directory, "evidence");
  await mkdir(evidenceRoot);
  const files = [];
  let fileNumber = 0;
  const references = collectHashReferences(manifest);
  const pending = new Map(references.map((reference) => [reference.path, reference]));

  const addFile = async (relativePath, kind, boundReferences, bytes, extra = {}) => {
    const fullPath = join(evidenceRoot, ...relativePath.split("/"));
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, bytes);
    const fileDigest = createHash("sha256").update(bytes).digest("hex");
    for (const reference of boundReferences) {
      reference.container[reference.key] = fileDigest;
      pending.delete(reference.path);
    }
    files.push({
      path: relativePath,
      kind,
      manifestPaths: boundReferences.map((reference) => reference.path),
      ...extra,
    });
    return fileDigest;
  };

  const extensionFor = (kind) => new Map([
    ["spdx-json", ".json"], ["trivy-json", ".json"], ["junit-xml", ".xml"],
    ["k6-summary-json", ".json"], ["http-contract-tsv", ".tsv"],
    ["zero-violation-tsv", ".tsv"], ["tsv-report", ".tsv"],
    ["sanitized-e2e-comparison", ".tsv"],
    ["checksum-manifest", ".sha256"], ["schema-allowlist-tsv", ".tsv"],
    ["jar", ".jar"], ["docker-image-archive", ".tar"],
    ["frontend-artifact", ".zip"], ["runbook", ".md"],
    ["attestation-json", ".json"],
  ]).get(kind) ?? ".json";

  const typedBytes = (kind, paths) => {
    if (kind === "spdx-json") return Buffer.from(JSON.stringify({
      spdxVersion: "SPDX-2.3",
      dataLicense: "CC0-1.0",
      SPDXID: "SPDXRef-DOCUMENT",
      name: "viralground-fixture-sbom",
      documentNamespace: "https://viralground.example/spdx/fixture",
      creationInfo: {
        created: "2026-08-22T04:00:00Z",
        creators: ["Tool: fixture-sbom-generator-1.0"],
      },
      packages: [{ name: "fixture", SPDXID: "SPDXRef-Package-fixture" }],
    }));
    if (kind === "trivy-json") return Buffer.from(JSON.stringify({
      SchemaVersion: 2,
      ArtifactName: "viralground-fixture",
      ArtifactType: "container_image",
      Results: [{ Target: "fixture", Class: "lang-pkgs", Type: "jar", Vulnerabilities: [] }],
    }));
    if (kind === "junit-xml") {
      const testCount = Math.max(...paths.map((path) => {
        if (/frontendSuiteResultSha256$/.test(path)) return manifest.ci.frontendUnitTestCount;
        if (/backendSuiteResultSha256$/.test(path)) return manifest.ci.unitTestCount;
        if (/integrationSuiteResultSha256$/.test(path)) return manifest.ci.integrationTestCount;
        return 1;
      }));
      const cases = Array.from({ length: testCount }, (_, index) =>
        `<testcase name="pass-${index + 1}"/>`).join("");
      return Buffer.from(
        `<?xml version="1.0"?><testsuites><testsuite name="fixture" tests="${testCount}" failures="0" errors="0" skipped="0">${cases}</testsuite></testsuites>`);
    }
    if (kind === "k6-summary-json") return Buffer.from(JSON.stringify({ metrics: {
      http_req_duration: { values: { "p(95)": 500 } },
      http_req_failed: { values: { rate: 0 } },
      http_reqs: { values: { count: 1200, rate: 20 } },
      vus_max: { values: { max: 50 } },
      checks: { values: { rate: 1, passes: 1200, fails: 0 } },
      dropped_iterations: { values: { count: 0, rate: 0 } },
    } }));
    if (kind === "http-contract-tsv") return Buffer.from(
      `endpoint\trcStatus\trcShapeSha256\tlegacyStatus\tlegacyShapeSha256\tresult\nlanding\t200\t${digest("a")}\t200\t${digest("a")}\tMATCHED\nloginInvalid\t401\t${digest("b")}\t401\t${digest("b")}\tMATCHED\nloginSuccess\t200\t${digest("c")}\t200\t${digest("c")}\tMATCHED\nrefreshSuccess\t204\t${digest("d")}\t204\t${digest("d")}\tMATCHED\n`);
    if (kind === "zero-violation-tsv") return Buffer.from("fixture_check\t0\n");
    if (kind === "tsv-report") return Buffer.from("members\t10\tdeadbeef\n");
    if (kind === "checksum-manifest") return Buffer.from(`${digest("a")} *V1__baseline.sql\n`);
    if (kind === "schema-allowlist-tsv") return Buffer.from("members\tid\nmembers\temail\n");
    if (kind === "jar") return Buffer.from([0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0]);
    if (kind === "docker-image-archive") {
      const value = Buffer.alloc(1024);
      value.write("ustar", 257, "ascii");
      return value;
    }
    if (kind === "frontend-artifact") return Buffer.from([0x50, 0x4b, 0x03, 0x04, 1, 2, 3, 4]);
    if (kind === "runbook") return Buffer.from(
      `# Rollback runbook\n\nRollback when readiness, authentication, authorization, or invariants fail. ${"Verified rollback instruction. ".repeat(5)}\n`);
    return Buffer.from(JSON.stringify({
      schemaVersion: 1,
      releaseId: manifest.releaseId,
      result: "PASSED",
      generatedAtUtc: "2026-08-22T04:00:00Z",
      evidenceTypes: paths,
    }));
  };

  const specialKinds = new Set([
    "evidence-seal", "parent-chain", "provider-receipt", "origin-fingerprint",
    "provider-binding", "runtime-contract-json", "artifact-set-json",
    "sanitized-e2e-comparison",
  ]);
  const candidateReferences = references.filter((reference) =>
    qualificationEvidenceKindForPath(reference.path) === "artifact-set-json");

  for (const reference of references) {
    const kind = qualificationEvidenceKindForPath(reference.path);
    if (specialKinds.has(kind) || kind === "artifact-set-json") continue;
    fileNumber += 1;
    const relativePath = `files/${String(fileNumber).padStart(3, "0")}${extensionFor(kind)}`;
    await addFile(relativePath, kind, [reference], typedBytes(kind, [reference.path]));
  }

  const exactReceipt = pending.get("databaseEvidence.providerExactRestoreReceiptSha256");
  const sanitizedReceipt = pending.get("databaseEvidence.providerSanitizedRestoreReceiptSha256");
  const receiptBytes = (kind, operation, database) => Buffer.from(JSON.stringify({
    schemaVersion: 1,
    provider: "railway",
    providerOperationId: operation,
    cloneKind: kind,
    sourceSnapshotId: manifest.databaseEvidence.sourceSnapshotId,
    targetHost: "clone.example.test",
    targetDatabase: database,
    status: "SUCCEEDED",
    restoreStartedAtUtc: "2026-08-22T00:30:00Z",
    restoreCompletedAtUtc: "2026-08-22T01:00:00Z",
    releaseId: manifest.releaseId,
  }));
  await addFile("provider/exact-restore.json", "provider-receipt", [exactReceipt],
    receiptBytes("exact", "restore-exact", "viralground_release_exact"));
  await addFile("provider/sanitized-restore.json", "provider-receipt", [sanitizedReceipt],
    receiptBytes("sanitized", "restore-sanitized", "viralground_release_staging"));

  const originBytes = Buffer.from(
    "financial|campaigns\t1:100:100\nfinancial|escrow_transactions\t2:200:50\nrow-count|public.members\t3\nrow-count|public.password_reset_codes\t1\nrow-count|public.refresh_tokens\t2\nschema-structural-md5\t0123456789abcdef0123456789abcdef\n");
  await addFile("database/exact/migration/source-origin-fingerprint.tsv", "origin-fingerprint",
    [pending.get("databaseEvidence.exactPreMaskOriginFingerprintSha256")], originBytes);
  await addFile("database/sanitized/migration/source-origin-fingerprint.tsv", "origin-fingerprint",
    [pending.get("databaseEvidence.sanitizedPreMaskOriginFingerprintSha256")], originBytes);

  await addFile("database/provider-binding/provider-restore-binding.tsv", "provider-binding",
    [pending.get("databaseEvidence.providerRestoreBindingSha256")], Buffer.from([
      "provider\trailway",
      `sourceSnapshotIdSha256\t${manifest.databaseEvidence.sourceSnapshotIdSha256}`,
      `exactReceiptSha256\t${manifest.databaseEvidence.providerExactRestoreReceiptSha256}`,
      `sanitizedReceiptSha256\t${manifest.databaseEvidence.providerSanitizedRestoreReceiptSha256}`,
      `exactOriginFingerprintSha256\t${manifest.databaseEvidence.exactPreMaskOriginFingerprintSha256}`,
      `sanitizedOriginFingerprintSha256\t${manifest.databaseEvidence.sanitizedPreMaskOriginFingerprintSha256}`,
      "exactRestoreCompletedAtUtc\t2026-08-22T01:00:00Z",
      "sanitizedRestoreCompletedAtUtc\t2026-08-22T01:00:00Z",
      "providerRestoreReceiptsMatched\ttrue",
      "preMaskOriginFingerprintMatched\ttrue",
      "",
    ].join("\n")));

  await addFile("artifacts/candidate-artifact-set.json", "artifact-set-json", candidateReferences,
    Buffer.from(JSON.stringify({
      releaseId: manifest.releaseId,
      frontendCommit: manifest.source.frontendCommit,
      backendCommit: manifest.source.backendCommit,
      backendImageArchiveSha256: manifest.artifacts.backendImageArchiveSha256,
      frontendArtifactSha256: manifest.artifacts.frontendArtifactSha256,
      flywayMigrationSetSha256: manifest.artifacts.flywayMigrationSetSha256,
    })));

  const addSeal = async (fieldPath, relativePath, stage, includedPaths = []) => {
    const directoryPath = dirname(relativePath).replaceAll("\\", "/");
    const payloadPath = `${directoryPath}/seal-payload.txt`;
    await addFile(payloadPath, "support-file", [], Buffer.from(`sealed payload for ${stage}\n`));
    const allIncluded = [...includedPaths, payloadPath];
    const manifestLines = [];
    for (const includedPath of allIncluded) {
      const includedBytes = await readFile(join(evidenceRoot, ...includedPath.split("/")));
      const includedHash = createHash("sha256").update(includedBytes).digest("hex");
      manifestLines.push(`${includedHash}  ./${basename(includedPath)}`);
    }
    const evidenceManifestPath = `${directoryPath}/EVIDENCE-MANIFEST.sha256`;
    const evidenceManifestBytes = Buffer.from(`${manifestLines.join("\n")}\n`);
    await addFile(evidenceManifestPath, "evidence-manifest", [], evidenceManifestBytes);
    const manifestHash = createHash("sha256").update(evidenceManifestBytes).digest("hex");
    const cloneSource = stage.startsWith("exact-") || stage.startsWith("sanitized-")
      ? `sourceSnapshotIdSha256=${manifest.databaseEvidence.sourceSnapshotIdSha256}\n`
      : "";
    const sealBytes = Buffer.from(
      `format=viralground-evidence-seal-v1\nreleaseId=${manifest.releaseId}\nstage=${stage}\nartifactCount=${allIncluded.length}\nmanifestSha256=${manifestHash}\n${cloneSource}sealedAtUtc=2026-08-22T03:00:00Z\n`);
    await addFile(relativePath, "evidence-seal", [pending.get(fieldPath)], sealBytes,
      { evidenceManifestPath });
  };

  await addSeal("databaseEvidence.productionReadonlyEvidenceRootSealSha256",
    "database/production/EVIDENCE-SEAL", "production-readonly-audit");
  await addSeal("databaseEvidence.exactCloneEvidenceRootSealSha256",
    "database/exact/migration/EVIDENCE-SEAL", "exact-migration",
    ["database/exact/migration/source-origin-fingerprint.tsv"]);
  await addSeal("databaseEvidence.sanitizedCloneEvidenceRootSealSha256",
    "database/sanitized/migration/EVIDENCE-SEAL", "sanitized-migration",
    ["database/sanitized/migration/source-origin-fingerprint.tsv"]);
  const sanitizedBusinessFingerprint = Buffer.from(
    "campaigns\t10\t0123456789abcdef0123456789abcdef\nmembers\t3\tfedcba9876543210fedcba9876543210\n");
  const beforeFingerprintPath = "database/sanitized/e2e-before/sanitized-e2e-before.tsv";
  await addFile(beforeFingerprintPath, "support-file", [], sanitizedBusinessFingerprint);
  await addSeal("databaseEvidence.sanitizedE2eBeforeEvidenceRootSealSha256",
    "database/sanitized/e2e-before/EVIDENCE-SEAL", "sanitized-e2e-before",
    [beforeFingerprintPath]);
  await addSeal("databaseEvidence.providerRestoreBindingEvidenceRootSealSha256",
    "database/provider-binding/EVIDENCE-SEAL", "provider-restore-binding",
    ["database/provider-binding/provider-restore-binding.tsv"]);

  const beforeManifestBytes = await readFile(join(
    evidenceRoot, "database", "sanitized", "e2e-before", "EVIDENCE-MANIFEST.sha256"));
  const beforeManifestSha256 = createHash("sha256").update(beforeManifestBytes).digest("hex");
  const parentChainPath = "database/sanitized/e2e-after/evidence-parent-chain.tsv";
  await addFile(parentChainPath, "parent-chain",
    [pending.get("databaseEvidence.sanitizedE2eAfterParentChainSha256")], Buffer.from([
      "format\tviralground-sanitized-e2e-chain-v1",
      `releaseId\t${manifest.releaseId}`,
      "sentinelId\tfixture-sentinel",
      `sourceSnapshotIdSha256\t${manifest.databaseEvidence.sourceSnapshotIdSha256}`,
      `beforeEvidenceSealSha256\t${manifest.databaseEvidence.sanitizedE2eBeforeEvidenceRootSealSha256}`,
      `beforeManifestSha256\t${beforeManifestSha256}`,
      "",
    ].join("\n")));
  const afterFingerprintPath = "database/sanitized/e2e-after/sanitized-e2e-after.tsv";
  const beforeFingerprintSha256 = createHash("sha256")
    .update(sanitizedBusinessFingerprint).digest("hex");
  await addFile(afterFingerprintPath, "support-file", [], sanitizedBusinessFingerprint);
  const comparisonPath = "database/sanitized/e2e-after/sanitized-e2e-comparison.tsv";
  await addFile(comparisonPath, "sanitized-e2e-comparison",
    [pending.get("databaseEvidence.sanitizedE2eComparisonSha256")], Buffer.from([
      "format\tviralground-sanitized-e2e-comparison-v1",
      `releaseId\t${manifest.releaseId}`,
      `sourceSnapshotIdSha256\t${manifest.databaseEvidence.sourceSnapshotIdSha256}`,
      `beforeEvidenceSealSha256\t${manifest.databaseEvidence.sanitizedE2eBeforeEvidenceRootSealSha256}`,
      `beforeFingerprintSha256\t${beforeFingerprintSha256}`,
      `afterFingerprintSha256\t${beforeFingerprintSha256}`,
      "result\tMATCHED",
      "",
    ].join("\n")));
  await addSeal("databaseEvidence.sanitizedE2eAfterEvidenceRootSealSha256",
    "database/sanitized/e2e-after/EVIDENCE-SEAL", "sanitized-e2e-after",
    [parentChainPath, afterFingerprintPath, comparisonPath]);

  const runtimeContract = manifest.stagingEvidence.mutationRuntimeSafetyContract;
  runtimeContract.evidenceSealFingerprint = createHash("sha256")
    .update(manifest.databaseEvidence.sanitizedCloneEvidenceRootSealSha256).digest("hex");
  runtimeContract.e2eBeforeEvidenceSealFingerprint = createHash("sha256")
    .update(manifest.databaseEvidence.sanitizedE2eBeforeEvidenceRootSealSha256).digest("hex");
  await addFile("staging/runtime-contract.json", "runtime-contract-json",
    [pending.get("stagingEvidence.mutationRuntimeSafetyContractSha256")],
    Buffer.from(JSON.stringify(runtimeContract)));

  assert.equal(pending.size, 0, `Unmaterialized evidence fields: ${[...pending.keys()].join(", ")}`);

  const manifestPath = join(directory, "release.yaml");
  const manifestBytes = Buffer.from(stringify(manifest), "utf8");
  await writeFile(manifestPath, manifestBytes);
  const manifestHash = createHash("sha256").update(manifestBytes).digest("hex");

  const evidenceIndex = {
    schemaVersion: 2,
    releaseManifestSha256: manifestHash,
    files,
  };
  const evidenceIndexPath = join(evidenceRoot, "qualification-evidence-index.json");
  const indexBytes = Buffer.from(`${JSON.stringify(evidenceIndex, null, 2)}\n`, "utf8");
  await writeFile(evidenceIndexPath, indexBytes);
  const indexHash = createHash("sha256").update(indexBytes).digest("hex");
  const environment = {
    QUALIFICATION_APPROVAL_CONTEXT: "RELEASE_QUALIFICATION_APPROVED",
    QUALIFICATION_APPROVED_RELEASE_MANIFEST_SHA256: manifestHash,
    QUALIFICATION_APPROVED_EVIDENCE_INDEX_SHA256: indexHash,
    QUALIFICATION_EXPECTED_RELEASE_ID: manifest.releaseId,
    QUALIFICATION_EXPECTED_FRONTEND_SHA: manifest.source.frontendCommit,
    QUALIFICATION_EXPECTED_BACKEND_SHA: manifest.source.backendCommit,
  };
  return {
    manifest,
    manifestPath,
    evidenceIndex,
    evidenceIndexPath,
    evidenceRoot,
    environment,
  };
}

function setManifestPath(target, path, value) {
  const parts = path.replaceAll(/\[(\d+)\]/g, ".$1").split(".");
  const key = parts.pop();
  const container = parts.reduce((current, part) => current[part], target);
  container[key] = value;
}

async function reapproveFixture(fixture) {
  const manifestBytes = Buffer.from(stringify(fixture.manifest), "utf8");
  await writeFile(fixture.manifestPath, manifestBytes);
  const manifestHash = createHash("sha256").update(manifestBytes).digest("hex");
  fixture.environment.QUALIFICATION_APPROVED_RELEASE_MANIFEST_SHA256 = manifestHash;
  fixture.evidenceIndex.releaseManifestSha256 = manifestHash;
  const indexBytes = Buffer.from(`${JSON.stringify(fixture.evidenceIndex, null, 2)}\n`, "utf8");
  await writeFile(fixture.evidenceIndexPath, indexBytes);
  fixture.environment.QUALIFICATION_APPROVED_EVIDENCE_INDEX_SHA256 = createHash("sha256")
    .update(indexBytes).digest("hex");
}

async function replaceBoundEvidence(fixture, entry, bytes) {
  const fullPath = join(fixture.evidenceRoot, ...entry.path.split("/"));
  await writeFile(fullPath, bytes);
  const hash = createHash("sha256").update(bytes).digest("hex");
  for (const manifestPath of entry.manifestPaths) {
    setManifestPath(fixture.manifest, manifestPath, hash);
  }
  await reapproveFixture(fixture);
}

test("accepts the structure of a complete QUALIFIED manifest", () => {
  assert.equal(validateQualifiedManifestShape(qualifiedManifest()), true);
});

test("qualification is separate from the staging DRAFT binding mode", () => {
  const value = qualifiedManifest();
  value.status = "DRAFT";
  assert.throws(() => validateQualifiedManifestShape(value), /status.*QUALIFIED/);
});

test("rejects placeholder identity and mutable or malformed artifacts", () => {
  const placeholder = qualifiedManifest();
  placeholder.releaseId = "rc-YYYYMMDD-NNN";
  assert.throws(() => validateQualifiedManifestShape(placeholder), /releaseId/);

  const mutableImage = qualifiedManifest();
  mutableImage.artifacts.backendImage = "registry.example/backend:latest";
  assert.throws(() => validateQualifiedManifestShape(mutableImage), /backendImage/);

  const emptyHash = qualifiedManifest();
  emptyHash.artifacts.backendSbomSha256 = "";
  assert.throws(() => validateQualifiedManifestShape(emptyHash), /backendSbomSha256/);
});

test("requires exactly three ordered successes for the same SHA and artifact set", () => {
  const failedRun = qualifiedManifest();
  failedRun.ci.sameShaRuns[2].result = "FAILED";
  assert.throws(() => validateQualifiedManifestShape(failedRun), /sameShaRuns\[2\].result/);

  const changedSha = qualifiedManifest();
  changedSha.ci.sameShaRuns[1].backendCommit = "3".repeat(40);
  assert.throws(() => validateQualifiedManifestShape(changedSha), /sameShaRuns\[1\].backendCommit/);

  const changedArtifact = qualifiedManifest();
  changedArtifact.ci.sameShaRuns[1].candidateArtifactSetSha256 = digest("4");
  assert.throws(() => validateQualifiedManifestShape(changedArtifact), /candidateArtifactSetSha256/);

  const unordered = qualifiedManifest();
  unordered.ci.sameShaRuns[2].completedAtUtc = "2026-08-20T00:00:00Z";
  assert.throws(() => validateQualifiedManifestShape(unordered), /must be later/);
});

test("requires executed CI tests, every check pass, and zero high or critical findings", () => {
  const skippedIntegration = qualifiedManifest();
  skippedIntegration.ci.integrationTestCount = 16;
  assert.throws(() => validateQualifiedManifestShape(skippedIntegration), /integrationTestCount/);

  const missingVulnerabilityCount = qualifiedManifest();
  missingVulnerabilityCount.ci.imageCriticalVulnerabilities = null;
  assert.throws(() => validateQualifiedManifestShape(missingVulnerabilityCount), /imageCritical/);

  const pendingCheck = qualifiedManifest();
  pendingCheck.ci.frontendChecks.playwright = "PENDING";
  assert.throws(() => validateQualifiedManifestShape(pendingCheck), /frontendChecks.playwright/);
});

test("requires completed migrations, exact and sanitized evidence, and an approved four-hour restore", () => {
  const missingExact = qualifiedManifest();
  missingExact.databaseEvidence.exactCloneEvidenceRootSealSha256 = "<sha256>";
  assert.throws(() => validateQualifiedManifestShape(missingExact), /exactCloneEvidenceRoot/);

  const incompleteValidate = qualifiedManifest();
  incompleteValidate.databaseEvidence.flywayValidateRuns = 1;
  assert.throws(() => validateQualifiedManifestShape(incompleteValidate), /flywayValidateRuns/);

  const failedMigration = qualifiedManifest();
  failedMigration.databaseEvidence.failedFlywayMigrations = 1;
  assert.throws(() => validateQualifiedManifestShape(failedMigration), /failedFlywayMigrations/);

  const slowRestore = qualifiedManifest();
  slowRestore.databaseEvidence.restoreRtoMinutes = 241;
  assert.throws(() => validateQualifiedManifestShape(slowRestore), /restoreRtoMinutes/);

  const pii = qualifiedManifest();
  pii.databaseEvidence.containsPiiOrSecrets = true;
  assert.throws(() => validateQualifiedManifestShape(pii), /containsPiiOrSecrets/);
});

test("requires snapshot, public-schema, production-role, and RLS safety evidence", () => {
  const snapshotHashMismatch = qualifiedManifest();
  snapshotHashMismatch.databaseEvidence.sourceSnapshotIdSha256 = digest("9");
  assert.throws(() => validateQualifiedManifestShape(snapshotHashMismatch),
    /sourceSnapshotIdSha256/);

  const snapshotMismatch = qualifiedManifest();
  snapshotMismatch.databaseEvidence.exactAndSanitizedSourceSnapshotMatched = false;
  assert.throws(() => validateQualifiedManifestShape(snapshotMismatch),
    /exactAndSanitizedSourceSnapshotMatched/);

  const unknownSchema = qualifiedManifest();
  unknownSchema.databaseEvidence.latestPublicSchemaUnknownEntryCount = 1;
  assert.throws(() => validateQualifiedManifestShape(unknownSchema),
    /latestPublicSchemaUnknownEntryCount/);

  const securityDefinerPath = qualifiedManifest();
  securityDefinerPath.databaseEvidence.productionReadonlySecurityDefinerPathCount = 1;
  assert.throws(() => validateQualifiedManifestShape(securityDefinerPath),
    /productionReadonlySecurityDefinerPathCount/);

  const rlsPolicy = qualifiedManifest();
  rlsPolicy.databaseEvidence.productionPublicRlsPolicyCount = 1;
  assert.throws(() => validateQualifiedManifestShape(rlsPolicy),
    /productionPublicRlsPolicyCount/);
});

test("requires the live runtime contract to match both sealed evidence roots", () => {
  const wrongFingerprint = qualifiedManifest();
  wrongFingerprint.stagingEvidence.mutationRuntimeSafetyContract.evidenceSealFingerprint = digest("f");
  assert.throws(() => validateQualifiedManifestShape(wrongFingerprint), /evidenceSealFingerprint/);

  const provisioningEnabled = qualifiedManifest();
  provisioningEnabled.stagingEvidence.mutationRuntimeSafetyContract.accountProvisioningEnabled = true;
  assert.throws(() => validateQualifiedManifestShape(provisioningEnabled), /accountProvisioningEnabled/);
});

test("requires a 24-hour perfect synthetic window and the performance thresholds", () => {
  const shortWindow = qualifiedManifest();
  shortWindow.stagingEvidence.syntheticWindowHours = 23.99;
  assert.throws(() => validateQualifiedManifestShape(shortWindow), /syntheticWindowHours/);

  const imperfect = qualifiedManifest();
  imperfect.stagingEvidence.syntheticSuccessPercent = 99.99;
  assert.throws(() => validateQualifiedManifestShape(imperfect), /syntheticSuccessPercent/);

  const sentryError = qualifiedManifest();
  sentryError.stagingEvidence.unhandledSentryErrors = 1;
  assert.throws(() => validateQualifiedManifestShape(sentryError), /unhandledSentryErrors/);

  const slow = qualifiedManifest();
  slow.stagingEvidence.performanceP95Milliseconds = 1000.01;
  assert.throws(() => validateQualifiedManifestShape(slow), /performanceP95Milliseconds/);

  const errors = qualifiedManifest();
  errors.stagingEvidence.performanceErrorPercent = 0.5;
  assert.throws(() => validateQualifiedManifestShape(errors), /performanceErrorPercent/);
});

test("requires deployed frontend-to-backend legal version contract evidence", () => {
  const missing = qualifiedManifest();
  missing.stagingEvidence.legalVersionContractResultSha256 = "";
  assert.throws(
    () => validateQualifiedManifestShape(missing),
    /legalVersionContractResultSha256/,
  );

  assert.equal(
    qualificationEvidenceKindForPath(
      "stagingEvidence.legalVersionContractResultSha256",
    ),
    "junit-xml",
  );
});

test("requires explicit disabled reasons or complete isolated provider approvals", () => {
  const noReason = qualifiedManifest();
  noReason.externalGates.objectStorage.disabledReason = "";
  assert.throws(() => validateQualifiedManifestShape(noReason), /objectStorage.disabledReason/);

  const partialMeta = qualifiedManifest();
  partialMeta.externalGates.metaInstagram.status = "APPROVED";
  partialMeta.externalGates.metaInstagram.appReviewApproved = true;
  assert.throws(() => validateQualifiedManifestShape(partialMeta), /businessPortfolioReady/);

  const approved = qualifiedManifest();
  approved.externalGates.objectStorage = {
    status: "APPROVED",
    disabledReason: "",
    provider: "aws-s3",
    stagingBucket: "viralground-staging",
    isolatedFromProduction: true,
    iamCorsEncryptionVersioningLifecycleEvidenceSha256: digest("a"),
    contractEvidenceSha256: digest("b"),
  };
  approved.externalGates.metaInstagram = {
    status: "APPROVED",
    disabledReason: "",
    businessPortfolioReady: true,
    multipleAdminsAnd2fa: true,
    appReviewApproved: true,
    advancedAccessApproved: true,
    nonOwnedProfessionalAccountE2eSha256: digest("c"),
  };
  assert.equal(validateQualifiedManifestShape(approved), true);
});

test("requires repository, legal, owner, and rollback approval evidence", () => {
  const directPush = qualifiedManifest();
  directPush.repositoryControls.directPushBlocked = null;
  assert.throws(() => validateQualifiedManifestShape(directPush), /directPushBlocked/);

  const legal = qualifiedManifest();
  legal.externalGates.legal.privacyOfficerFinal = null;
  assert.throws(() => validateQualifiedManifestShape(legal), /privacyOfficerFinal/);

  const approval = qualifiedManifest();
  approval.approvals.security.approver = "TBD";
  assert.throws(() => validateQualifiedManifestShape(approval), /approvals.security.approver/);

  const rollback = qualifiedManifest();
  rollback.rollback.runbookSha256 = "<sha256>";
  assert.throws(() => validateQualifiedManifestShape(rollback), /rollback.runbookSha256/);
});

test("requires zero P0 and owner, due date, and explicit acceptance for every P1", () => {
  const p0 = qualifiedManifest();
  p0.openRisks[0].severity = "P0";
  p0.openRisks[0].status = "CLOSED";
  assert.throws(() => validateQualifiedManifestShape(p0), /P0 count must be zero/);

  const openP1 = qualifiedManifest();
  openP1.openRisks[0].status = "OPEN";
  assert.throws(() => validateQualifiedManifestShape(openP1), /explicitly ACCEPTED or CLOSED/);

  for (const field of ["owner", "dueAtUtc", "acceptance", "acceptedBy", "acceptedAtUtc"]) {
    const incomplete = qualifiedManifest();
    incomplete.openRisks[0][field] = "";
    assert.throws(() => validateQualifiedManifestShape(incomplete), new RegExp(field));
  }
});

test("final file qualification refuses unapproved manifest bytes and missing evidence bindings", async () => {
  const directory = await mkdtemp(join(tmpdir(), "viralground-qualified-manifest-"));
  try {
    const path = join(directory, "release.yaml");
    await writeFile(path, stringify(qualifiedManifest()), "utf8");
    await assert.rejects(validateQualifiedManifestFile(path), /QUALIFICATION_APPROVAL_CONTEXT/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("final file qualification binds protected manifest bytes to every actual evidence file", async () => {
  const directory = await mkdtemp(join(tmpdir(), "viralground-qualified-evidence-"));
  try {
    const fixture = await materializeQualifiedEvidence(directory);
    await assert.doesNotReject(validateQualifiedManifestFile(
      fixture.manifestPath,
      fixture.evidenceIndexPath,
      fixture.evidenceRoot,
      fixture.environment,
    ));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("final file qualification rejects changed manifest bytes after approval", async () => {
  const directory = await mkdtemp(join(tmpdir(), "viralground-qualified-manifest-tamper-"));
  try {
    const fixture = await materializeQualifiedEvidence(directory);
    const original = await readFile(fixture.manifestPath, "utf8");
    await writeFile(fixture.manifestPath, `${original}\n`, "utf8");
    await assert.rejects(validateQualifiedManifestFile(
      fixture.manifestPath,
      fixture.evidenceIndexPath,
      fixture.evidenceRoot,
      fixture.environment,
    ), /manifest SHA-256 mismatch/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("final file qualification rejects a checksum-valid manifest whose evidence file changed", async () => {
  const directory = await mkdtemp(join(tmpdir(), "viralground-qualified-evidence-tamper-"));
  try {
    const fixture = await materializeQualifiedEvidence(directory);
    const firstEvidencePath = join(
      fixture.evidenceRoot,
      ...fixture.evidenceIndex.files[0].path.split("/"),
    );
    await writeFile(firstEvidencePath, "tampered evidence\n", "utf8");
    await assert.rejects(validateQualifiedManifestFile(
      fixture.manifestPath,
      fixture.evidenceIndexPath,
      fixture.evidenceRoot,
      fixture.environment,
    ), /evidence SHA-256 mismatch/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("final file qualification rejects an approved index that omits a manifest evidence field", async () => {
  const directory = await mkdtemp(join(tmpdir(), "viralground-qualified-index-gap-"));
  try {
    const fixture = await materializeQualifiedEvidence(directory);
    fixture.evidenceIndex.files.pop();
    const indexBytes = Buffer.from(`${JSON.stringify(fixture.evidenceIndex, null, 2)}\n`, "utf8");
    await writeFile(fixture.evidenceIndexPath, indexBytes);
    fixture.environment.QUALIFICATION_APPROVED_EVIDENCE_INDEX_SHA256 = createHash("sha256")
      .update(indexBytes)
      .digest("hex");
    await assert.rejects(validateQualifiedManifestFile(
      fixture.manifestPath,
      fixture.evidenceIndexPath,
      fixture.evidenceRoot,
      fixture.environment,
    ), /does not bind manifest fields/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("final qualification rejects checksum-matching generic dummy evidence", async () => {
  const directory = await mkdtemp(join(tmpdir(), "viralground-qualified-generic-dummy-"));
  try {
    const fixture = await materializeQualifiedEvidence(directory);
    const entry = fixture.evidenceIndex.files.find((value) => value.kind === "attestation-json");
    const bytes = Buffer.from("immutable qualification evidence for a claimed pass\n");
    await writeFile(join(fixture.evidenceRoot, ...entry.path.split("/")), bytes);
    const hash = createHash("sha256").update(bytes).digest("hex");
    entry.manifestPaths.forEach((path) => setManifestPath(fixture.manifest, path, hash));
    await reapproveFixture(fixture);
    await assert.rejects(validateQualifiedManifestFile(
      fixture.manifestPath, fixture.evidenceIndexPath, fixture.evidenceRoot,
      fixture.environment,
    ), /must be valid JSON/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("final qualification rejects any unindexed extra evidence-root file", async () => {
  const directory = await mkdtemp(join(tmpdir(), "viralground-qualified-extra-file-"));
  try {
    const fixture = await materializeQualifiedEvidence(directory);
    await writeFile(join(fixture.evidenceRoot, "unindexed-secret.txt"), "must never be ignored\n");
    await assert.rejects(validateQualifiedManifestFile(
      fixture.manifestPath, fixture.evidenceIndexPath, fixture.evidenceRoot,
      fixture.environment,
    ), /unindexed, missing, or extra file/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("final qualification parses clone seal stage instead of trusting its checksum", async () => {
  const directory = await mkdtemp(join(tmpdir(), "viralground-qualified-seal-semantics-"));
  try {
    const fixture = await materializeQualifiedEvidence(directory);
    const entry = fixture.evidenceIndex.files.find((value) =>
      value.manifestPaths.includes("databaseEvidence.productionReadonlyEvidenceRootSealSha256"));
    const path = join(fixture.evidenceRoot, ...entry.path.split("/"));
    const original = await readFile(path, "utf8");
    const bytes = Buffer.from(original.replace(
      "stage=production-readonly-audit", "stage=forged-stage"));
    await writeFile(path, bytes);
    const hash = createHash("sha256").update(bytes).digest("hex");
    setManifestPath(fixture.manifest,
      "databaseEvidence.productionReadonlyEvidenceRootSealSha256", hash);
    await reapproveFixture(fixture);
    await assert.rejects(validateQualifiedManifestFile(
      fixture.manifestPath, fixture.evidenceIndexPath, fixture.evidenceRoot,
      fixture.environment,
    ), /release\/stage mismatch/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("final qualification binds the sanitized comparison to both actual fingerprints", async () => {
  const directory = await mkdtemp(join(tmpdir(), "viralground-qualified-e2e-comparison-"));
  try {
    const fixture = await materializeQualifiedEvidence(directory);
    const entry = fixture.evidenceIndex.files.find((value) =>
      value.kind === "sanitized-e2e-comparison");
    const path = join(fixture.evidenceRoot, ...entry.path.split("/"));
    const original = await readFile(path, "utf8");
    const bytes = Buffer.from(original.replace(
      /afterFingerprintSha256\t[0-9a-f]{64}/,
      `afterFingerprintSha256\t${digest("9")}`));
    await replaceBoundEvidence(fixture, entry, bytes);
    await assert.rejects(validateQualifiedManifestFile(
      fixture.manifestPath, fixture.evidenceIndexPath, fixture.evidenceRoot,
      fixture.environment,
    ), /comparison is not a release\/source\/seal-bound exact match/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("final qualification rejects weak JUnit, Trivy, SPDX, or k6 evidence", async () => {
  const cases = [
    {
      prefix: "junit",
      select: (entry) => entry.kind === "junit-xml"
        && entry.manifestPaths.some((path) => /integrationSuiteResultSha256$/.test(path)),
      bytes: Buffer.from('<?xml version="1.0"?><testsuites><testsuite name="dummy" tests="1" failures="0" errors="0" skipped="0"><testcase name="dummy"/></testsuite></testsuites>'),
      error: /does not prove the manifest test count/,
    },
    {
      prefix: "trivy",
      select: (entry) => entry.kind === "trivy-json",
      bytes: Buffer.from(JSON.stringify({ Results: [{ Target: "dummy", Vulnerabilities: [] }] })),
      error: /lacks typed report identity metadata/,
    },
    {
      prefix: "spdx",
      select: (entry) => entry.kind === "spdx-json",
      bytes: Buffer.from(JSON.stringify({
        spdxVersion: "SPDX-2.3",
        documentNamespace: "https://viralground.example/dummy",
        packages: [{ name: "dummy", SPDXID: "SPDXRef-dummy" }],
      })),
      error: /spdx.creationInfo/,
    },
    {
      prefix: "k6-check-boundary",
      select: (entry) => entry.kind === "k6-summary-json",
      bytes: Buffer.from(JSON.stringify({ metrics: {
        http_req_duration: { values: { "p(95)": 500 } },
        http_req_failed: { values: { rate: 0 } },
        http_reqs: { values: { count: 200, rate: 20 } },
        vus_max: { values: { value: 50 } },
        checks: { values: { rate: 0.995, passes: 199, fails: 1 } },
        dropped_iterations: { values: { count: 0, rate: 0 } },
      } })),
      error: /approved performance thresholds/,
    },
    {
      prefix: "k6-dropped-iteration",
      select: (entry) => entry.kind === "k6-summary-json",
      bytes: Buffer.from(JSON.stringify({ metrics: {
        http_req_duration: { values: { "p(95)": 500 } },
        http_req_failed: { values: { rate: 0 } },
        http_reqs: { values: { count: 200, rate: 20 } },
        vus_max: { values: { max: 50 } },
        checks: { values: { rate: 1, passes: 200, fails: 0 } },
        dropped_iterations: { values: { count: 1, rate: 0.1 } },
      } })),
      error: /approved performance thresholds/,
    },
  ];
  for (const value of cases) {
    const directory = await mkdtemp(join(tmpdir(), `viralground-qualified-${value.prefix}-`));
    try {
      const fixture = await materializeQualifiedEvidence(directory);
      const entry = fixture.evidenceIndex.files.find(value.select);
      await replaceBoundEvidence(fixture, entry, value.bytes);
      await assert.rejects(validateQualifiedManifestFile(
        fixture.manifestPath, fixture.evidenceIndexPath, fixture.evidenceRoot,
        fixture.environment,
      ), value.error);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }
});

test("final qualification rejects duplicate keys in index, provider receipt, and attestation JSON", async () => {
  for (const kind of ["index", "provider-receipt", "attestation-json"]) {
    const directory = await mkdtemp(join(tmpdir(), `viralground-qualified-duplicate-${kind}-`));
    try {
      const fixture = await materializeQualifiedEvidence(directory);
      if (kind === "index") {
        const original = await readFile(fixture.evidenceIndexPath, "utf8");
        const bytes = Buffer.from(original.replace(
          '"schemaVersion": 2,', '"schemaVersion": 2,\n  "schemaVersion": 2,'));
        await writeFile(fixture.evidenceIndexPath, bytes);
        fixture.environment.QUALIFICATION_APPROVED_EVIDENCE_INDEX_SHA256 = createHash("sha256")
          .update(bytes).digest("hex");
      } else {
        const entry = fixture.evidenceIndex.files.find((value) => value.kind === kind);
        const path = join(fixture.evidenceRoot, ...entry.path.split("/"));
        const original = await readFile(path, "utf8");
        const bytes = kind === "provider-receipt"
          ? Buffer.from(original.replace(
            '"provider":"railway"', '"provider":"railway","provider":"railway"'))
          : Buffer.from(original.replace(
            '"result":"PASSED"', '"result":"PASSED","result":"PASSED"'));
        await replaceBoundEvidence(fixture, entry, bytes);
      }
      await assert.rejects(validateQualifiedManifestFile(
        fixture.manifestPath, fixture.evidenceIndexPath, fixture.evidenceRoot,
        fixture.environment,
      ), /must not contain duplicate JSON keys/);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }
});
