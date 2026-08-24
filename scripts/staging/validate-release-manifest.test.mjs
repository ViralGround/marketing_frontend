import test from "node:test";
import assert from "node:assert/strict";
import { validateApprovedManifest } from "./validate-release-manifest.mjs";

const seal = "a".repeat(64);
const beforeSeal = "b".repeat(64);
const environment = {
  STAGING_EXPECTED_RELEASE_ID: "rc-20260822-001",
  STAGING_EXPECTED_FRONTEND_SHA: "1".repeat(40),
  STAGING_EXPECTED_BACKEND_SHA: "2".repeat(40),
  STAGING_EXPECTED_SCHEMA_VERSION: "16",
  CLONE_EVIDENCE_SEAL_SHA256: seal,
  CLONE_E2E_BEFORE_EVIDENCE_SEAL_SHA256: beforeSeal,
};

function manifest() {
  return {
    releaseId: environment.STAGING_EXPECTED_RELEASE_ID,
    status: "DRAFT",
    source: {
      frontendCommit: environment.STAGING_EXPECTED_FRONTEND_SHA,
      backendCommit: environment.STAGING_EXPECTED_BACKEND_SHA,
    },
    databaseEvidence: {
      latestFlywayVersion: "16",
      sentinelReleaseId: environment.STAGING_EXPECTED_RELEASE_ID,
      sanitizedCloneEvidenceRootSealSha256: seal,
      sanitizedE2eBeforeEvidenceRootSealSha256: beforeSeal,
    },
    featureGates: {
      payments: false,
      instagram: false,
      uploads: false,
      scheduling: false,
      emailDeliveryMode: "disabled",
    },
    openRisks: [],
  };
}

test("accepts a manifest bound to the exact disabled-feature staging candidate", () => {
  assert.equal(validateApprovedManifest(manifest(), environment), true);
});

test("rejects a different backend or evidence root", () => {
  const wrongBackend = manifest();
  wrongBackend.source.backendCommit = "3".repeat(40);
  assert.throws(() => validateApprovedManifest(wrongBackend, environment), /source.backendCommit/);
  const wrongSeal = manifest();
  wrongSeal.databaseEvidence.sanitizedCloneEvidenceRootSealSha256 = "c".repeat(64);
  assert.throws(() => validateApprovedManifest(wrongSeal, environment), /sanitizedClone/);
});

test("rejects enabled features and unresolved or unapproved risks", () => {
  const enabled = manifest();
  enabled.featureGates.uploads = true;
  assert.throws(() => validateApprovedManifest(enabled, environment), /uploads/);

  const p0 = manifest();
  p0.openRisks = [{ id: "P0-1", severity: "P0", status: "OPEN" }];
  assert.throws(() => validateApprovedManifest(p0, environment), /P0/);

  const p1 = manifest();
  p1.openRisks = [{ id: "P1-1", severity: "P1", status: "OPEN" }];
  assert.throws(() => validateApprovedManifest(p1, environment), /lacks owner/);
});

test("accepts only explicitly approved, fully recorded P1 risks", () => {
  const value = manifest();
  value.openRisks = [{
    id: "P1-1",
    severity: "P1",
    status: "ACCEPTED",
    owner: "security-owner",
    dueAtUtc: "2026-08-30T00:00:00Z",
    acceptance: "Approved for the bounded staging-only candidate",
    acceptedBy: "release-owner",
    acceptedAtUtc: "2026-08-22T00:00:00Z",
  }];
  assert.equal(validateApprovedManifest(value, environment), true);
});
