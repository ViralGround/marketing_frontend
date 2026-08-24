import { createHash } from "node:crypto";

import expectedRuntimeSafety from "./runtime-safety-contract.json" with { type: "json" };

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function assertExactContract(actual, expected, path) {
  if (isObject(expected)) {
    if (!isObject(actual)) throw new Error(`${path} is missing or is not an object`);
    const actualKeys = Object.keys(actual).sort();
    const expectedKeys = Object.keys(expected).sort();
    if (
      actualKeys.length !== expectedKeys.length ||
      actualKeys.some((key, index) => key !== expectedKeys[index])
    ) {
      throw new Error(`${path} has an unexpected contract shape`);
    }
    for (const key of expectedKeys) {
      assertExactContract(actual[key], expected[key], `${path}.${key}`);
    }
    return;
  }
  if (actual !== expected) {
    throw new Error(`${path} does not match the mutation-safe value`);
  }
}

export function evidenceSealFingerprint(evidenceSealSha256) {
  if (!/^[0-9a-f]{64}$/.test(evidenceSealSha256)) {
    throw new Error("The approved evidence root seal must be 64 lowercase hexadecimal characters");
  }
  return createHash("sha256").update(evidenceSealSha256, "utf8").digest("hex");
}

export function assertMutationRuntimeSafety(
  info,
  evidenceSealSha256,
  e2eBeforeEvidenceSealSha256,
) {
  if (!isObject(info)) throw new Error("Backend info response is not an object");
  if (!isObject(info.runtimeSafety) || !isObject(info.runtimeSafety.sentinel)) {
    throw new Error("Backend runtime safety sentinel is missing");
  }
  const normalized = structuredClone(info.runtimeSafety);
  const actualFingerprint = normalized.sentinel.evidenceSealFingerprint;
  const actualE2eBeforeFingerprint =
    normalized.sentinel.e2eBeforeEvidenceSealFingerprint;
  if (
    typeof actualFingerprint !== "string" ||
    actualFingerprint !== evidenceSealFingerprint(evidenceSealSha256)
  ) {
    throw new Error("Backend runtime evidence fingerprint does not match the approved root seal");
  }
  if (
    typeof actualE2eBeforeFingerprint !== "string" ||
    actualE2eBeforeFingerprint !== evidenceSealFingerprint(e2eBeforeEvidenceSealSha256)
  ) {
    throw new Error("Backend E2E-before fingerprint does not match the approved root seal");
  }
  delete normalized.sentinel.evidenceSealFingerprint;
  delete normalized.sentinel.e2eBeforeEvidenceSealFingerprint;
  assertExactContract(
    normalized,
    expectedRuntimeSafety,
    "Backend runtime safety contract",
  );
}

export { expectedRuntimeSafety };
