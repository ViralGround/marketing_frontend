import {
  request as playwrightRequest,
  type APIRequestContext,
  type APIResponse,
} from "@playwright/test";
import { createHash } from "node:crypto";

import expectedRuntimeSafety from "../scripts/staging/runtime-safety-contract.json";

export const FRONTEND_ORIGIN = "https://staging.viralground.kr";
export const API_ORIGIN = "https://api.staging.viralground.kr";
export const EVIL_ORIGIN = "https://evil.example.invalid";

const REQUIRED_CONFIRMATION = "RUN_SANITIZED_STAGING_RC";

export type Credentials = Readonly<{
  email: string;
  password: string;
}>;

type ReleaseContract = Readonly<{
  releaseId: string;
  frontendSha: string;
  backendSha: string;
  schemaVersion: string;
  evidenceSealSha256: string;
  e2eBeforeEvidenceSealSha256: string;
}>;

export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Required staging environment variable is missing: ${name}`);
  return value;
}

export function requireMutationGate(): void {
  if (process.env.STAGING_RC_CONFIRMATION !== REQUIRED_CONFIRMATION) {
    throw new Error(`Refusing mutations: STAGING_RC_CONFIRMATION must equal ${REQUIRED_CONFIRMATION}`);
  }
  requiredEvidenceSealSha256();
  requiredE2eBeforeEvidenceSealSha256();
  if (
    process.env.STAGING_EMAIL_SAFETY_ATTESTATION !==
    "ROLE_E2E_DISABLED_RESEND_SEPARATE_ALLOWLIST"
  ) {
    throw new Error("Refusing mutations: role E2E must run with email delivery disabled");
  }
}

function requiredE2eBeforeEvidenceSealSha256(): string {
  const value = requiredEnv("CLONE_E2E_BEFORE_EVIDENCE_SEAL_SHA256");
  if (!/^[0-9a-f]{64}$/.test(value)) {
    throw new Error(
      "Refusing mutations: approved E2E-before evidence root seal must be 64 lowercase hexadecimal characters",
    );
  }
  return value;
}

function requiredEvidenceSealSha256(): string {
  const value = requiredEnv("CLONE_EVIDENCE_SEAL_SHA256");
  if (!/^[0-9a-f]{64}$/.test(value)) {
    throw new Error(
      "Refusing mutations: approved sanitized evidence root seal must be 64 lowercase hexadecimal characters",
    );
  }
  return value;
}

function evidenceSealFingerprint(evidenceSealSha256: string): string {
  return createHash("sha256").update(evidenceSealSha256, "utf8").digest("hex");
}

function releaseContract(): ReleaseContract {
  const contract = {
    releaseId: requiredEnv("STAGING_EXPECTED_RELEASE_ID"),
    frontendSha: requiredEnv("STAGING_EXPECTED_FRONTEND_SHA").toLowerCase(),
    backendSha: requiredEnv("STAGING_EXPECTED_BACKEND_SHA").toLowerCase(),
    schemaVersion: requiredEnv("STAGING_EXPECTED_SCHEMA_VERSION"),
    evidenceSealSha256: requiredEvidenceSealSha256(),
    e2eBeforeEvidenceSealSha256: requiredE2eBeforeEvidenceSealSha256(),
  };
  for (const [label, sha] of [
    ["frontend", contract.frontendSha],
    ["backend", contract.backendSha],
  ] as const) {
    if (!/^[0-9a-f]{40}$/.test(sha)) {
      throw new Error(`Expected ${label} SHA must contain exactly 40 hexadecimal characters`);
    }
  }
  if (!/^[A-Za-z0-9._:-]{3,120}$/.test(contract.releaseId)) {
    throw new Error("Expected release ID contains unsupported characters");
  }
  if (!/^[0-9]+(?:\.[0-9]+)*$/.test(contract.schemaVersion)) {
    throw new Error("Expected schema version must be numeric (for example 16 or 16.1)");
  }
  return contract;
}

async function objectJson(response: APIResponse, label: string): Promise<Record<string, unknown>> {
  try {
    const parsed: unknown = await response.json();
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // The error below deliberately excludes the response body.
  }
  throw new Error(`${label} returned a non-object JSON response (status=${response.status()})`);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function assertExactContract(actual: unknown, expected: unknown, path: string): void {
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

export function assertMutationRuntimeSafety(
  info: Record<string, unknown>,
  evidenceSealSha256: string,
  e2eBeforeEvidenceSealSha256: string,
): void {
  if (!isObject(info.runtimeSafety) || !isObject(info.runtimeSafety.sentinel)) {
    throw new Error("Backend runtime safety sentinel is missing");
  }
  const normalized: Record<string, unknown> = structuredClone(info.runtimeSafety);
  const normalizedSentinel = normalized.sentinel;
  if (!isObject(normalizedSentinel)) {
    throw new Error("Backend runtime safety sentinel is missing");
  }
  const actualFingerprint = normalizedSentinel.evidenceSealFingerprint;
  const actualE2eBeforeFingerprint = normalizedSentinel.e2eBeforeEvidenceSealFingerprint;
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
  delete normalizedSentinel.evidenceSealFingerprint;
  delete normalizedSentinel.e2eBeforeEvidenceSealFingerprint;
  assertExactContract(
    normalized,
    expectedRuntimeSafety,
    "Backend runtime safety contract",
  );
}

function assertBackendRelease(
  info: Record<string, unknown>,
  expected: ReleaseContract,
): void {
  const release = info.release;
  if (!isObject(release)) {
    throw new Error("Backend release information is missing");
  }
  if (
    release.releaseId !== expected.releaseId ||
    String(release.commitSha).toLowerCase() !== expected.backendSha ||
    String(release.schemaVersion) !== expected.schemaVersion
  ) {
    throw new Error("Backend release or schema identity does not match the approved candidate");
  }
}

export async function assertLiveMutationSafety(
  context: APIRequestContext,
  label: string,
): Promise<void> {
  requireMutationGate();
  const response = await context.get("/actuator/info", {
    headers: { "Cache-Control": "no-cache" },
  });
  await assertStatus(response, 200, `${label} runtime safety`);
  const info = await objectJson(response, `${label} runtime safety`);
  const expected = releaseContract();
  assertBackendRelease(info, expected);
  assertMutationRuntimeSafety(
    info,
    expected.evidenceSealSha256,
    expected.e2eBeforeEvidenceSealSha256,
  );
}

async function safeFailureMetadata(response: APIResponse): Promise<string> {
  let code = "unavailable";
  let bodyRequestId = "unavailable";
  try {
    const body = await objectJson(response, "error response");
    if (typeof body.code === "string" && /^[A-Z0-9_:-]{2,80}$/.test(body.code)) {
      code = body.code;
    }
    if (
      typeof body.requestId === "string" &&
      /^[A-Za-z0-9._:-]{8,64}$/.test(body.requestId)
    ) {
      bodyRequestId = body.requestId;
    }
  } catch {
    // Keep only the status/header metadata below.
  }
  const headerRequestId = response.headers()["x-request-id"];
  const requestId =
    headerRequestId && /^[A-Za-z0-9._:-]{8,64}$/.test(headerRequestId)
      ? headerRequestId
      : bodyRequestId;
  return `status=${response.status()} code=${code} requestId=${requestId}`;
}

export async function assertStatus(
  response: APIResponse,
  expected: number | readonly number[],
  label: string,
): Promise<void> {
  const allowed = Array.isArray(expected) ? expected : [expected];
  if (!allowed.includes(response.status())) {
    throw new Error(`${label} failed: ${await safeFailureMetadata(response)}`);
  }
}

export async function assertError(
  response: APIResponse,
  status: number,
  code: string,
  label: string,
): Promise<void> {
  await assertStatus(response, status, label);
  const body = await objectJson(response, label);
  if (body.code !== code) {
    throw new Error(`${label} returned an unexpected safe error code`);
  }
}

export async function csrfToken(context: APIRequestContext): Promise<string> {
  const response = await context.get("/auth/csrf");
  await assertStatus(response, 200, "CSRF bootstrap");
  const body = await objectJson(response, "CSRF bootstrap");
  if (typeof body.token !== "string" || body.token.length < 16) {
    throw new Error("CSRF bootstrap did not return a valid token");
  }
  return body.token;
}

export async function login(
  context: APIRequestContext,
  credentials: Credentials,
): Promise<string> {
  const csrf = await csrfToken(context);
  await assertLiveMutationSafety(context, "pre-login");
  const response = await context.post("/auth/login", {
    headers: { "X-XSRF-TOKEN": csrf },
    data: credentials,
  });
  await assertStatus(response, 200, "login");
  return csrf;
}

export async function mutate(
  context: APIRequestContext,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  csrf: string,
  data?: unknown,
): Promise<APIResponse> {
  await assertLiveMutationSafety(context, `pre-${method.toLowerCase()}`);
  return context.fetch(path, {
    method,
    headers: { "X-XSRF-TOKEN": csrf },
    ...(data === undefined ? {} : { data }),
  });
}

export async function mutateWithoutCsrf(
  context: APIRequestContext,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  data?: unknown,
): Promise<APIResponse> {
  await assertLiveMutationSafety(context, `pre-${method.toLowerCase()}-without-csrf`);
  return context.fetch(path, {
    method,
    ...(data === undefined ? {} : { data }),
  });
}

export async function createAuthenticatedContext(
  credentials: Credentials,
): Promise<{ context: APIRequestContext; csrf: string }> {
  const context = await playwrightRequest.newContext({
    baseURL: API_ORIGIN,
    extraHTTPHeaders: { Origin: FRONTEND_ORIGIN },
  });
  try {
    const csrf = await login(context, credentials);
    return { context, csrf };
  } catch (error) {
    await context.dispose();
    throw error;
  }
}

export async function verifyStagingRelease(): Promise<ReleaseContract> {
  if (new URL(FRONTEND_ORIGIN).origin !== FRONTEND_ORIGIN) {
    throw new Error("Frontend staging target guard failed");
  }
  if (new URL(API_ORIGIN).origin !== API_ORIGIN) {
    throw new Error("API staging target guard failed");
  }

  const expected = releaseContract();
  const frontend = await playwrightRequest.newContext({ baseURL: FRONTEND_ORIGIN });
  const api = await playwrightRequest.newContext({
    baseURL: API_ORIGIN,
    extraHTTPHeaders: { Origin: FRONTEND_ORIGIN },
  });
  try {
    const versionResponse = await frontend.get("/version", {
      headers: { "Cache-Control": "no-cache" },
    });
    await assertStatus(versionResponse, 200, "frontend /version");
    const version = await objectJson(versionResponse, "frontend /version");
    if (
      version.releaseId !== expected.releaseId ||
      String(version.commitSha).toLowerCase() !== expected.frontendSha
    ) {
      throw new Error("Frontend release identity does not match the approved candidate");
    }

    const homeResponse = await frontend.get("/", {
      headers: { "Cache-Control": "no-cache" },
    });
    await assertStatus(homeResponse, 200, "staging frontend home contract");
    const homeHeaders = homeResponse.headers();
    if (!homeHeaders["x-robots-tag"]?.toLowerCase().includes("noindex")) {
      throw new Error("Staging frontend is missing the global noindex response contract");
    }
    const csp = homeHeaders["content-security-policy"] ?? "";
    if (!csp.includes(`connect-src 'self' ${API_ORIGIN}`)) {
      throw new Error("Staging frontend CSP is not bound to the exact staging API origin");
    }
    const homeHtml = await homeResponse.text();
    if (
      !homeHtml.includes('rel="canonical"') ||
      !homeHtml.includes(`href="${FRONTEND_ORIGIN}`)
    ) {
      throw new Error("Staging frontend canonical does not use the staging origin");
    }

    const robotsResponse = await frontend.get("/robots.txt", {
      headers: { "Cache-Control": "no-cache" },
    });
    await assertStatus(robotsResponse, 200, "staging robots.txt");
    const robots = await robotsResponse.text();
    if (!/(?:^|\n)Disallow:\s*\/(?:\r?\n|$)/i.test(robots)) {
      throw new Error("Staging robots.txt does not disallow the complete site");
    }

    const infoResponse = await api.get("/actuator/info", {
      headers: { "Cache-Control": "no-cache" },
    });
    await assertStatus(infoResponse, 200, "backend /actuator/info");
    const info = await objectJson(infoResponse, "backend /actuator/info");
    assertBackendRelease(info, expected);
    assertMutationRuntimeSafety(
      info,
      expected.evidenceSealSha256,
      expected.e2eBeforeEvidenceSealSha256,
    );

    const readinessResponse = await api.get("/actuator/health/readiness", {
      headers: { "Cache-Control": "no-cache" },
    });
    await assertStatus(readinessResponse, 200, "backend readiness");
    const readiness = await objectJson(readinessResponse, "backend readiness");
    if (readiness.status !== "UP") throw new Error("Backend readiness is not UP");

    const allowedPreflight = await api.fetch("/auth/login", {
      method: "OPTIONS",
      headers: {
        Origin: FRONTEND_ORIGIN,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type,x-xsrf-token",
      },
    });
    await assertStatus(allowedPreflight, [200, 204], "allowed CORS preflight");
    if (
      allowedPreflight.headers()["access-control-allow-origin"] !== FRONTEND_ORIGIN ||
      allowedPreflight.headers()["access-control-allow-credentials"] !== "true"
    ) {
      throw new Error("Allowed staging CORS response is missing its exact origin contract");
    }

    const evilApi = await playwrightRequest.newContext({
      baseURL: API_ORIGIN,
      extraHTTPHeaders: { Origin: EVIL_ORIGIN },
    });
    try {
      const evilPreflight = await evilApi.fetch("/auth/login", {
        method: "OPTIONS",
        headers: {
          Origin: EVIL_ORIGIN,
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "content-type,x-xsrf-token",
        },
      });
      if (evilPreflight.status() >= 500) {
        throw new Error("Disallowed CORS preflight caused a server error");
      }
      if (evilPreflight.headers()["access-control-allow-origin"] === EVIL_ORIGIN) {
        throw new Error("Disallowed origin was granted CORS access");
      }
    } finally {
      await evilApi.dispose();
    }

    console.log(
      JSON.stringify({
        event: "staging_release_verified",
        releaseId: expected.releaseId,
        frontendSha: expected.frontendSha,
        backendSha: expected.backendSha,
        schemaVersion: expected.schemaVersion,
        evidenceSealFingerprint: evidenceSealFingerprint(expected.evidenceSealSha256),
        e2eBeforeEvidenceSealFingerprint: evidenceSealFingerprint(
          expected.e2eBeforeEvidenceSealSha256,
        ),
        runtimeSafety: "SANITIZED_MUTATION_SAFE",
        readiness: "UP",
      }),
    );
    return expected;
  } finally {
    await frontend.dispose();
    await api.dispose();
  }
}
