import { expect, request as playwrightRequest, test } from "@playwright/test";

import {
  API_ORIGIN,
  FRONTEND_ORIGIN,
  assertError,
  assertLiveMutationSafety,
  requireMutationGate,
  verifyStagingRelease,
} from "./support";

const INVALID_VERIFIED_TOKEN = "invalid-staging-legal-contract-token";
const LEGAL_VERSION_FIELDS = [
  "termsVersion",
  "privacyVersion",
  "age14Version",
  "creatorThirdPartyVersion",
  "marketingVersion",
] as const;

function corsJson(body: Record<string, unknown>) {
  return {
    contentType: "application/json",
    headers: {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": FRONTEND_ORIGIN,
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

test("deployed creator signup legal versions exactly match backend configuration", async ({ page }) => {
  requireMutationGate();
  await verifyStagingRelease();

  for (const [path, body] of [
    [
      "/auth/email/request-code",
      {
        expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
        message: "Synthetic contract response",
      },
    ],
    [
      "/auth/email/verify-code",
      {
        verifiedToken: INVALID_VERIFIED_TOKEN,
        message: "Synthetic contract response",
      },
    ],
  ] as const) {
    await page.route(`${API_ORIGIN}${path}`, async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      await route.fulfill({ status: 200, ...corsJson(body) });
    });
  }

  await page.route(`${API_ORIGIN}/auth/signup`, async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 400,
      ...corsJson({
        code: "INVALID_VERIFIED_TOKEN",
        message: "Synthetic contract response",
      }),
    });
  });

  const runMarker = (process.env.STAGING_RUN_ID ?? Date.now().toString())
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(-32);
  const syntheticEmail = `legal-contract-${runMarker}@preprod.viralground.kr`;

  await page.goto("/signup/creator", { waitUntil: "domcontentloaded" });
  await page.locator("#name").fill("Legal contract synthetic");
  await page.locator("#email").fill(syntheticEmail);
  await page.locator("#password").fill("Synthetic-only-password-42");
  await page.getByRole("button", { name: /인증하기|Verify/ }).click();
  await page.locator("#verification-code").fill("123456");
  await page.getByRole("button", { name: /인증 확인|Confirm code/ }).click();
  await expect(page.getByRole("button", { name: /인증 완료|Verified/ })).toBeVisible();
  await page.getByRole("button", { name: /제작 경험 입력하기|Continue to experience/ }).click();

  await page.locator('input[name="gender"][value="FEMALE"]').check({ force: true });
  await page.locator("#birthYear").selectOption(String(new Date().getFullYear() - 20));
  await page.locator('input[name="faceExposure"][value="NO"]').check({ force: true });
  await page.locator("#editingTool").selectOption("CAPCUT");
  await page.getByRole("button", { name: /동의 단계로|Continue to consent/ }).click();
  await page.getByRole("checkbox").first().check();

  const frontendRequest = page.waitForRequest(
    (request) => request.method() === "POST" && request.url() === `${API_ORIGIN}/auth/signup`,
  );
  await page.getByRole("button", { name: /가입 신청$|Submit application/ }).click();
  const capturedRequest = await frontendRequest;
  const payload = capturedRequest.postDataJSON() as Record<string, unknown>;

  expect(payload.marketingOptIn).toBe(true);
  for (const field of LEGAL_VERSION_FIELDS) {
    if (typeof payload[field] !== "string" || !payload[field].trim()) {
      throw new Error("Deployed signup payload is missing an approved legal document version");
    }
  }

  const backend = await playwrightRequest.newContext({
    baseURL: API_ORIGIN,
    extraHTTPHeaders: { Origin: FRONTEND_ORIGIN },
  });
  try {
    await assertLiveMutationSafety(backend, "pre-legal-version-contract replay");
    const response = await backend.post("/auth/signup", {
      data: { ...payload, verifiedToken: INVALID_VERIFIED_TOKEN },
    });
    await assertError(
      response,
      400,
      "INVALID_VERIFIED_TOKEN",
      "deployed frontend/backend legal version exact match",
    );
  } finally {
    await backend.dispose();
  }
});
