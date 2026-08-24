import {
  assertMutationRuntimeSafety,
  evidenceSealFingerprint,
} from "./runtime-safety-contract.mjs";
import { chromium } from "@playwright/test";

const FRONTEND_ORIGIN = "https://staging.viralground.kr";
const API_ORIGIN = "https://api.staging.viralground.kr";
const ENABLE_VALUE = "RUN_STAGING_SYNTHETIC";

if (process.env.SYNTHETIC_CHECK_ENABLED !== ENABLE_VALUE) {
  throw new Error(`Refusing synthetic check: SYNTHETIC_CHECK_ENABLED must equal ${ENABLE_VALUE}`);
}

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Required synthetic environment variable is missing: ${name}`);
  return value;
}

function validateSha(value, label) {
  const normalized = value.toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(normalized)) {
    throw new Error(`${label} must contain exactly 40 hexadecimal characters`);
  }
  return normalized;
}

function safeRequestId(response) {
  const candidate = response.headers.get("x-request-id") || "unavailable";
  return /^[A-Za-z0-9._:-]{8,64}$/.test(candidate) ? candidate : "unavailable";
}

async function assertStatus(response, expected, label) {
  const allowed = Array.isArray(expected) ? expected : [expected];
  if (!allowed.includes(response.status)) {
    throw new Error(`${label} failed: status=${response.status} requestId=${safeRequestId(response)}`);
  }
}

async function objectJson(response, label) {
  try {
    const body = await response.json();
    if (body && typeof body === "object" && !Array.isArray(body)) return body;
  } catch {
    // The error below deliberately excludes response contents.
  }
  throw new Error(`${label} returned invalid JSON: status=${response.status}`);
}

const expected = {
  releaseId: required("STAGING_EXPECTED_RELEASE_ID"),
  frontendSha: validateSha(required("STAGING_EXPECTED_FRONTEND_SHA"), "frontend SHA"),
  backendSha: validateSha(required("STAGING_EXPECTED_BACKEND_SHA"), "backend SHA"),
  schemaVersion: required("STAGING_EXPECTED_SCHEMA_VERSION"),
  evidenceSealSha256: required("CLONE_EVIDENCE_SEAL_SHA256"),
  e2eBeforeEvidenceSealSha256: required("CLONE_E2E_BEFORE_EVIDENCE_SEAL_SHA256"),
};
if (!/^[A-Za-z0-9._:-]{3,120}$/.test(expected.releaseId)) {
  throw new Error("Release ID contains unsupported characters");
}
if (!/^[0-9]+(?:\.[0-9]+)*$/.test(expected.schemaVersion)) {
  throw new Error("Schema version must be numeric");
}
evidenceSealFingerprint(expected.evidenceSealSha256);
evidenceSealFingerprint(expected.e2eBeforeEvidenceSealSha256);

const accounts = [
  {
    role: "COMPANY",
    email: required("SYNTHETIC_COMPANY_EMAIL"),
    password: required("SYNTHETIC_COMPANY_PASSWORD"),
    apiPath: "/company/dashboard",
    dashboardPath: "/company/dashboard",
  },
  {
    role: "CREATOR",
    email: required("SYNTHETIC_CREATOR_EMAIL"),
    password: required("SYNTHETIC_CREATOR_PASSWORD"),
    apiPath: "/me/stats",
    dashboardPath: "/creator/dashboard",
  },
];

const runStamp = Date.now().toString(36);

async function apiFetch(path, { requestId, ...options } = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Origin", FRONTEND_ORIGIN);
  headers.set("X-Request-Id", requestId);
  const response = await fetch(`${API_ORIGIN}${path}`, {
    ...options,
    headers,
    redirect: "manual",
  });
  return response;
}

async function frontendFetch(path) {
  const headers = new Headers({ "Cache-Control": "no-cache" });
  return fetch(`${FRONTEND_ORIGIN}${path}`, { headers, redirect: "manual" });
}

async function verifyReleaseAndHome() {
  const versionResponse = await frontendFetch("/version");
  await assertStatus(versionResponse, 200, "frontend version");
  const version = await objectJson(versionResponse, "frontend version");
  if (
    version.releaseId !== expected.releaseId ||
    String(version.commitSha).toLowerCase() !== expected.frontendSha
  ) {
    throw new Error("Frontend release identity does not match the synthetic target");
  }

  const infoResponse = await apiFetch("/actuator/info", {
    requestId: `synthetic-${runStamp}-release-info`,
    headers: { "Cache-Control": "no-cache" },
  });
  await assertStatus(infoResponse, 200, "backend release info");
  const info = await objectJson(infoResponse, "backend release info");
  const release = info.release;
  if (
    !release ||
    typeof release !== "object" ||
    release.releaseId !== expected.releaseId ||
    String(release.commitSha).toLowerCase() !== expected.backendSha ||
    String(release.schemaVersion) !== expected.schemaVersion
  ) {
    throw new Error("Backend release or schema identity does not match the synthetic target");
  }
  assertMutationRuntimeSafety(
    info,
    expected.evidenceSealSha256,
    expected.e2eBeforeEvidenceSealSha256,
  );

  const readinessResponse = await apiFetch("/actuator/health/readiness", {
    requestId: `synthetic-${runStamp}-readiness`,
    headers: { "Cache-Control": "no-cache" },
  });
  await assertStatus(readinessResponse, 200, "backend readiness");
  const readiness = await objectJson(readinessResponse, "backend readiness");
  if (readiness.status !== "UP") throw new Error("Backend readiness is not UP");

  const homeResponse = await frontendFetch("/");
  await assertStatus(homeResponse, 200, "frontend home");
}

async function verifyLiveRuntimeSafety(label) {
  const response = await apiFetch("/actuator/info", {
    requestId: `synthetic-${runStamp}-${label}-safety`,
    headers: { "Cache-Control": "no-cache" },
  });
  await assertStatus(response, 200, `${label} runtime safety`);
  const info = await objectJson(response, `${label} runtime safety`);
  const release = info.release;
  if (
    !release ||
    typeof release !== "object" ||
    release.releaseId !== expected.releaseId ||
    String(release.commitSha).toLowerCase() !== expected.backendSha ||
    String(release.schemaVersion) !== expected.schemaVersion
  ) {
    throw new Error(`${label} backend release identity changed during the synthetic journey`);
  }
  assertMutationRuntimeSafety(
    info,
    expected.evidenceSealSha256,
    expected.e2eBeforeEvidenceSealSha256,
  );
}

async function runRoleJourney(browser, account) {
  const prefix = `synthetic-${runStamp}-${account.role.toLowerCase()}`;
  const context = await browser.newContext({ baseURL: FRONTEND_ORIGIN });
  const page = await context.newPage();
  const loginPath = account.role === "COMPANY" ? "/login/company" : "/login/creator";
  await verifyLiveRuntimeSafety(`${account.role.toLowerCase()}-pre-login`);
  try {
    const loginPage = await page.goto(loginPath, { waitUntil: "domcontentloaded" });
    if (!loginPage?.ok()) throw new Error(`${account.role} login page is unavailable`);
    await page.locator("#email").fill(account.email);
    await page.locator("#password").fill(account.password);
    await page.getByRole("button", { name: /^(로그인|Log in)$/ }).click();
    await page.waitForURL(`${FRONTEND_ORIGIN}${account.dashboardPath}`, { timeout: 30_000 });
    await page.locator("aside nav").waitFor({ state: "visible", timeout: 30_000 });

    const cookieByName = new Map(
      (await context.cookies([FRONTEND_ORIGIN, API_ORIGIN])).map((cookie) => [cookie.name, cookie]),
    );
    for (const name of ["access_token", "refresh_token"]) {
      const cookie = cookieByName.get(name);
      if (
        !cookie ||
        cookie.domain.replace(/^\./, "") !== "staging.viralground.kr" ||
        cookie.path !== "/" ||
        !cookie.secure ||
        !cookie.httpOnly ||
        !["Lax", "Strict", "None"].includes(cookie.sameSite)
      ) {
        throw new Error(`${account.role} ${name} cookie does not meet the staging security contract`);
      }
    }
    const csrfCookie = cookieByName.get("XSRF-TOKEN");
    if (
      !csrfCookie ||
      csrfCookie.domain.replace(/^\./, "") !== "staging.viralground.kr" ||
      csrfCookie.path !== "/" ||
      !csrfCookie.secure ||
      csrfCookie.httpOnly
    ) {
      throw new Error(`${account.role} CSRF cookie does not meet the staging security contract`);
    }

    const roleApi = await page.evaluate(async ({ apiOrigin, apiPath }) => {
      const response = await fetch(`${apiOrigin}${apiPath}`, { credentials: "include" });
      return { status: response.status };
    }, { apiOrigin: API_ORIGIN, apiPath: account.apiPath });
    if (roleApi.status !== 200) {
      throw new Error(`${account.role} authenticated role API or credentialed CORS failed`);
    }

    await verifyLiveRuntimeSafety(`${account.role.toLowerCase()}-pre-logout`);
    await page.getByRole("button", { name: /계정 메뉴 열기|Open account menu/ }).click();
    await page.getByRole("button", { name: /^(로그아웃|Log out)$/ }).click();
    await page.waitForURL(/\/login(?:[/?#]|$)/, { timeout: 30_000 });
    const remaining = await context.cookies([FRONTEND_ORIGIN, API_ORIGIN]);
    if (remaining.some((cookie) => ["access_token", "refresh_token"].includes(cookie.name))) {
      throw new Error(`${account.role} logout did not clear authentication cookies`);
    }

    return { role: account.role, browserJourney: "PASS", requestPrefix: prefix };
  } finally {
    await context.close();
  }
}

async function verifyBrowserHome(browser) {
  const context = await browser.newContext({ baseURL: FRONTEND_ORIGIN });
  try {
    const page = await context.newPage();
    const response = await page.goto("/", { waitUntil: "domcontentloaded" });
    if (!response?.ok()) throw new Error("Browser home journey is unavailable");
    await page.locator("main").waitFor({ state: "visible", timeout: 30_000 });
    if (!response.headers()["x-robots-tag"]?.toLowerCase().includes("noindex")) {
      throw new Error("Browser home journey is missing the staging noindex contract");
    }
  } finally {
    await context.close();
  }
}

await verifyReleaseAndHome();
const journeys = [];
const browser = await chromium.launch({
  channel: process.env.SYNTHETIC_BROWSER_CHANNEL || "chrome",
  headless: true,
});
try {
  await verifyBrowserHome(browser);
  for (const account of accounts) journeys.push(await runRoleJourney(browser, account));
} finally {
  await browser.close();
}

console.log(
  JSON.stringify({
    event: "staging_synthetic_pass",
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
    journeys,
  }),
);
