import assert from "node:assert/strict";
import test from "node:test";

import {
  assertMutationRuntimeSafety,
  evidenceSealFingerprint,
  expectedRuntimeSafety,
} from "./runtime-safety-contract.mjs";

const TEST_EVIDENCE_SEAL = "a".repeat(64);
const TEST_E2E_BEFORE_SEAL = "c".repeat(64);

function safeInfo() {
  const runtimeSafety = structuredClone(expectedRuntimeSafety);
  runtimeSafety.sentinel.evidenceSealFingerprint = evidenceSealFingerprint(TEST_EVIDENCE_SEAL);
  runtimeSafety.sentinel.e2eBeforeEvidenceSealFingerprint =
    evidenceSealFingerprint(TEST_E2E_BEFORE_SEAL);
  return { runtimeSafety };
}

test("accepts only the complete sanitized mutation-safe runtime contract", () => {
  assert.doesNotThrow(() =>
    assertMutationRuntimeSafety(safeInfo(), TEST_EVIDENCE_SEAL, TEST_E2E_BEFORE_SEAL));
});

for (const [label, mutate] of [
  ["unsealed sentinel", (value) => { value.runtimeSafety.sentinel.migrationEvidenceComplete = false; }],
  ["mismatched evidence seal", (value) => { value.runtimeSafety.sentinel.evidenceSealMatched = false; }],
  ["mismatched E2E-before seal", (value) => {
    value.runtimeSafety.sentinel.e2eBeforeEvidenceSealMatched = false;
  }],
  ["email enabled", (value) => { value.runtimeSafety.emailDeliveryMode = "allowlist"; }],
  ["scheduler enabled", (value) => { value.runtimeSafety.scheduling.globalEnabled = true; }],
  ["outbox dispatch enabled", (value) => { value.runtimeSafety.outbox.dispatchEnabled = true; }],
  ["payment enabled", (value) => { value.runtimeSafety.features.payments = true; }],
  ["account provisioning window enabled", (value) => {
    value.runtimeSafety.mutationMode.accountProvisioningEnabled = true;
  }],
  ["E2E mutation window disabled", (value) => {
    value.runtimeSafety.mutationMode.e2eEnabled = false;
  }],
  ["admin bootstrap configured", (value) => {
    value.runtimeSafety.adminBootstrap.credentialsConfigured = true;
  }],
]) {
  test(`rejects ${label} before synthetic login`, () => {
    const info = safeInfo();
    mutate(info);
    assert.throws(
      () => assertMutationRuntimeSafety(info, TEST_EVIDENCE_SEAL, TEST_E2E_BEFORE_SEAL),
      /mutation-safe value/,
    );
  });
}

test("rejects a runtime bound to a different sealed evidence root", () => {
  assert.throws(
    () => assertMutationRuntimeSafety(safeInfo(), "b".repeat(64), TEST_E2E_BEFORE_SEAL),
    /fingerprint does not match/,
  );
});

test("rejects malformed evidence root seals without echoing them", () => {
  assert.throws(
    () => assertMutationRuntimeSafety(safeInfo(), "NOT-A-SEAL", TEST_E2E_BEFORE_SEAL),
    /64 lowercase hexadecimal/,
  );
});

test("rejects a runtime bound to a different E2E-before evidence root", () => {
  assert.throws(
    () => assertMutationRuntimeSafety(safeInfo(), TEST_EVIDENCE_SEAL, "d".repeat(64)),
    /E2E-before fingerprint does not match/,
  );
});

test("rejects a partial contract", () => {
  const info = safeInfo();
  delete info.runtimeSafety.features.uploads;
  assert.throws(
    () => assertMutationRuntimeSafety(info, TEST_EVIDENCE_SEAL, TEST_E2E_BEFORE_SEAL),
    /unexpected contract shape/,
  );
});
