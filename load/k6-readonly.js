import http from "k6/http";
import { check } from "k6";
import crypto from "k6/crypto";

const FRONTEND_ORIGIN = "https://staging.viralground.kr";
const API_ORIGIN = "https://api.staging.viralground.kr";
const duration = __ENV.K6_DURATION || "10m";

if (__ENV.K6_STAGING_CONFIRMATION !== "RUN_READONLY_STAGING_LOAD") {
  throw new Error("Refusing load test: K6_STAGING_CONFIRMATION is invalid");
}
const durationMatch = /^(\d{1,4})([smh])$/.exec(duration);
if (!durationMatch) throw new Error("K6_DURATION must use s, m, or h units");
const durationSeconds =
  Number(durationMatch[1]) * ({ s: 1, m: 60, h: 3600 }[durationMatch[2]] || 0);
if (durationSeconds < 300 || durationSeconds > 1200) {
  throw new Error("K6_DURATION must be between 5 and 20 minutes");
}

const expected = {
  releaseId: required("K6_EXPECTED_RELEASE_ID"),
  frontendSha: sha(required("K6_EXPECTED_FRONTEND_SHA"), "frontend"),
  backendSha: sha(required("K6_EXPECTED_BACKEND_SHA"), "backend"),
  schemaVersion: required("K6_EXPECTED_SCHEMA_VERSION"),
  evidenceSealSha256: required("K6_EXPECTED_EVIDENCE_SEAL_SHA256"),
  e2eBeforeEvidenceSealSha256: required("K6_EXPECTED_E2E_BEFORE_SEAL_SHA256"),
};
if (!/^[0-9a-f]{64}$/.test(expected.evidenceSealSha256)) {
  throw new Error("Expected evidence root seal must be 64 lowercase hexadecimal characters");
}
if (!/^[0-9a-f]{64}$/.test(expected.e2eBeforeEvidenceSealSha256)) {
  throw new Error("Expected E2E-before root seal must be 64 lowercase hexadecimal characters");
}

export const options = {
  discardResponseBodies: true,
  scenarios: {
    readonly_staging: {
      executor: "constant-arrival-rate",
      rate: 20,
      timeUnit: "1s",
      duration,
      preAllocatedVUs: 50,
      maxVUs: 50,
      gracefulStop: "15s",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<1000"],
    http_req_failed: ["rate<0.005"],
    checks: ["rate>0.995"],
    dropped_iterations: ["count==0"],
  },
};

const endpoints = [
  { url: `${FRONTEND_ORIGIN}/`, name: "frontend_home" },
  { url: `${API_ORIGIN}/landing/featured-campaigns`, name: "featured_campaigns" },
  { url: `${API_ORIGIN}/landing/creators`, name: "public_creators" },
  { url: `${API_ORIGIN}/actuator/health/readiness`, name: "readiness" },
];

function required(name) {
  const value = __ENV[name];
  if (!value) throw new Error(`Required k6 environment variable is missing: ${name}`);
  return value.trim();
}

function sha(value, label) {
  const normalized = value.toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(normalized)) {
    throw new Error(`Expected ${label} SHA must contain exactly 40 hexadecimal characters`);
  }
  return normalized;
}

function responseJson(response, label) {
  try {
    const body = response.json();
    if (body && typeof body === "object") return body;
  } catch {
    // Do not include response contents in errors or summaries.
  }
  throw new Error(`${label} returned invalid JSON with status ${response.status}`);
}

export function setup() {
  const versionResponse = http.get(`${FRONTEND_ORIGIN}/version`, {
    responseType: "text",
    tags: { name: "release_frontend" },
    headers: { "Cache-Control": "no-cache" },
  });
  const version = responseJson(versionResponse, "frontend version");
  if (
    versionResponse.status !== 200 ||
    version.releaseId !== expected.releaseId ||
    String(version.commitSha).toLowerCase() !== expected.frontendSha
  ) {
    throw new Error("Frontend release identity does not match the load-test target");
  }

  const infoResponse = http.get(`${API_ORIGIN}/actuator/info`, {
    responseType: "text",
    tags: { name: "release_backend" },
    headers: { Origin: FRONTEND_ORIGIN, "Cache-Control": "no-cache" },
  });
  const info = responseJson(infoResponse, "backend info");
  if (
    infoResponse.status !== 200 ||
    !info.release ||
    info.release.releaseId !== expected.releaseId ||
    String(info.release.commitSha).toLowerCase() !== expected.backendSha ||
    String(info.release.schemaVersion) !== expected.schemaVersion
  ) {
    throw new Error("Backend release or schema identity does not match the load-test target");
  }
  const sentinel = info.runtimeSafety && info.runtimeSafety.sentinel;
  if (
    !sentinel ||
    info.runtimeSafety.cloneKind !== "sanitized" ||
    sentinel.releaseIdMatched !== true ||
    sentinel.migrationEvidenceComplete !== true ||
    sentinel.evidenceSealMatched !== true ||
    sentinel.evidenceSealFingerprint !== crypto.sha256(expected.evidenceSealSha256, "hex") ||
    sentinel.e2eBeforeEvidenceSealMatched !== true ||
    sentinel.e2eBeforeEvidenceSealFingerprint !==
      crypto.sha256(expected.e2eBeforeEvidenceSealSha256, "hex") ||
    !info.runtimeSafety.mutationMode ||
    info.runtimeSafety.mutationMode.accountProvisioningEnabled !== false ||
    info.runtimeSafety.mutationMode.e2eEnabled !== true
  ) {
    throw new Error("Backend sanitized-clone evidence binding does not match the load-test target");
  }

  const readinessResponse = http.get(`${API_ORIGIN}/actuator/health/readiness`, {
    responseType: "text",
    tags: { name: "release_readiness" },
    headers: { Origin: FRONTEND_ORIGIN, "Cache-Control": "no-cache" },
  });
  const readiness = responseJson(readinessResponse, "backend readiness");
  if (readinessResponse.status !== 200 || readiness.status !== "UP") {
    throw new Error("Backend readiness is not UP");
  }

  return { releaseId: expected.releaseId };
}

export default function readonlyRequest() {
  const endpoint = endpoints[(__VU + __ITER) % endpoints.length];
  const response = http.get(endpoint.url, {
    tags: { name: endpoint.name },
    headers: endpoint.url.startsWith(API_ORIGIN) ? { Origin: FRONTEND_ORIGIN } : {},
  });
  check(response, { [`${endpoint.name} status 200`]: (result) => result.status === 200 });
}
