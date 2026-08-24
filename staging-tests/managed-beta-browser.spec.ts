import {
  expect,
  request as playwrightRequest,
  test,
  type APIRequestContext,
  type Browser,
  type BrowserContext,
  type Page,
  type Response,
} from "@playwright/test";

import {
  API_ORIGIN,
  FRONTEND_ORIGIN,
  assertLiveMutationSafety,
  requiredEnv,
  requireMutationGate,
  verifyStagingRelease,
} from "./support";

test.describe.configure({ mode: "serial" });

const companyCredentials = {
  email: requiredEnv("STAGING_COMPANY_EMAIL"),
  password: requiredEnv("STAGING_COMPANY_PASSWORD"),
};
const creatorCredentials = {
  email: requiredEnv("STAGING_CREATOR_EMAIL"),
  password: requiredEnv("STAGING_CREATOR_PASSWORD"),
};
const adminCredentials = {
  email: requiredEnv("STAGING_ADMIN_EMAIL"),
  password: requiredEnv("STAGING_ADMIN_PASSWORD"),
};

const runId = (process.env.STAGING_RUN_ID || Date.now().toString(36))
  .replace(/[^A-Za-z0-9_-]/g, "-")
  .slice(-36);
const marker = `BROWSER-RC-${runId}`;
const campaignTitle = `${marker} UI campaign`.slice(0, 80);
const editedDescription = `${marker} edited through the company workspace`;
const profileHandle = marker.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 48);

let safetyApi: APIRequestContext;

test.beforeAll(async () => {
  requireMutationGate();
  await verifyStagingRelease();
  safetyApi = await playwrightRequest.newContext({
    baseURL: API_ORIGIN,
    extraHTTPHeaders: { Origin: FRONTEND_ORIGIN },
  });
});

test.afterAll(async () => {
  await safetyApi?.dispose();
});

function matchesApiResponse(
  response: Response,
  method: string,
  path: string,
): boolean {
  const url = new URL(response.url());
  return (
    url.origin === API_ORIGIN &&
    url.pathname === path &&
    response.request().method() === method
  );
}

function assertSafeResponseStatus(
  response: Response,
  expected: number,
  label: string,
): void {
  if (response.status() !== expected) {
    throw new Error(`${label} failed with status=${response.status()}`);
  }
}

async function runUiMutation(
  page: Page,
  options: {
    label: string;
    method: "POST" | "PUT" | "PATCH" | "DELETE";
    path: string;
    expectedStatus: number;
    action: () => Promise<unknown>;
  },
): Promise<Response> {
  await assertLiveMutationSafety(safetyApi, options.label);
  const responsePromise = page.waitForResponse(
    (response) => matchesApiResponse(response, options.method, options.path),
    { timeout: 30_000 },
  );
  await options.action();
  const response = await responsePromise;
  assertSafeResponseStatus(response, options.expectedStatus, options.label);
  return response;
}

async function numericId(response: Response, label: string): Promise<number> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error(`${label} returned invalid JSON`);
  }
  const id =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as { id?: unknown }).id
      : undefined;
  if (typeof id !== "number" || !Number.isInteger(id) || id < 1) {
    throw new Error(`${label} did not return a numeric identifier`);
  }
  return id;
}

async function newEnglishPage(
  browser: Browser,
): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({ baseURL: FRONTEND_ORIGIN });
  await context.addCookies([
    {
      name: "lang",
      value: "en",
      domain: "staging.viralground.kr",
      path: "/",
      secure: true,
      sameSite: "Lax",
    },
  ]);
  return { context, page: await context.newPage() };
}

async function loginThroughUi(
  page: Page,
  options: {
    label: string;
    loginPath: "/login/company" | "/login/creator";
    expectedPath: string;
    credentials: { email: string; password: string };
  },
): Promise<void> {
  const loginPage = await page.goto(options.loginPath, { waitUntil: "domcontentloaded" });
  if (!loginPage?.ok()) throw new Error(`${options.label} login page is unavailable`);
  await page.getByLabel("Email").fill(options.credentials.email);
  await page.getByLabel("Password", { exact: true }).fill(options.credentials.password);
  await runUiMutation(page, {
    label: `${options.label}-pre-login`,
    method: "POST",
    path: "/auth/login",
    expectedStatus: 200,
    action: () => page.getByRole("button", { name: "Log in", exact: true }).click(),
  });
  await page.waitForURL(`${FRONTEND_ORIGIN}${options.expectedPath}`, { timeout: 30_000 });
  await expect(page.locator("aside nav")).toBeVisible();
}

async function verifyBrowserUploadFailClosed(page: Page): Promise<void> {
  await assertLiveMutationSafety(safetyApi, "creator-browser-pre-upload-fail-closed");
  const result = await page.evaluate(async ({ apiOrigin }) => {
    const encodedToken = document.cookie
      .split(";")
      .map((entry) => entry.trim())
      .find((entry) => entry.startsWith("XSRF-TOKEN="))
      ?.slice("XSRF-TOKEN=".length);
    if (!encodedToken) return { status: 0, code: "MISSING_CSRF" };
    const response = await fetch(`${apiOrigin}/files/presign-upload`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": decodeURIComponent(encodedToken),
      },
      body: JSON.stringify({ contentType: "video/mp4", sizeBytes: 1024 }),
    });
    let code = "UNAVAILABLE";
    try {
      const body: unknown = await response.json();
      const candidate =
        body && typeof body === "object" && !Array.isArray(body)
          ? (body as { code?: unknown }).code
          : undefined;
      if (typeof candidate === "string" && /^[A-Z0-9_:-]{2,80}$/.test(candidate)) {
        code = candidate;
      }
    } catch {
      // Only the safe status and allowlisted error code leave the browser context.
    }
    return { status: response.status, code };
  }, { apiOrigin: API_ORIGIN });
  expect(result).toEqual({ status: 503, code: "UPLOAD_FEATURE_DISABLED" });
}

test("sanitized staging completes the managed-beta role journey through the browser UI", async ({
  browser,
}) => {
  test.setTimeout(300_000);
  expect(FRONTEND_ORIGIN).toBe("https://staging.viralground.kr");
  expect(API_ORIGIN).toBe("https://api.staging.viralground.kr");

  const openedContexts: BrowserContext[] = [];
  try {
    const company = await newEnglishPage(browser);
    openedContexts.push(company.context);
    await loginThroughUi(company.page, {
      label: "company-browser",
      loginPath: "/login/company",
      expectedPath: "/company/dashboard",
      credentials: companyCredentials,
    });

    await company.page.goto("/company/campaigns/new");
    await expect(company.page.getByRole("heading", { name: "NEW BRIEF" })).toBeVisible();
    await expect(company.page.getByText("Image uploads are being prepared")).toBeVisible();
    await company.page.getByLabel("Campaign title").fill(campaignTitle);
    await company.page.getByLabel("Brand name").fill(`${marker} brand`);
    await company.page.getByRole("button", { name: /Brand awareness/ }).click();
    await company.page
      .getByLabel("Campaign description")
      .fill(`${marker} created through the browser workspace`);
    await company.page.getByRole("button", { name: "Next", exact: true }).click();
    await company.page.getByRole("checkbox", { name: "Instagram Reels" }).check();
    await company.page
      .getByLabel("Additional requirements")
      .fill(`${marker} synthetic accounts only`);
    await company.page.getByRole("button", { name: "Next", exact: true }).click();
    await company.page.getByRole("button", { name: /Professional/ }).click();
    await company.page.getByRole("button", { name: "Next", exact: true }).click();
    await company.page.getByLabel("Reward per creator (KRW)").fill("1");
    await company.page.getByLabel("Number of creators").fill("1");

    const createResponse = await runUiMutation(company.page, {
      label: "company-browser-pre-campaign-create",
      method: "POST",
      path: "/company/campaigns",
      expectedStatus: 201,
      action: () =>
        company.page.getByRole("button", { name: "Create campaign", exact: true }).click(),
    });
    const campaignId = await numericId(createResponse, "campaign create");
    await company.page.waitForURL(`${FRONTEND_ORIGIN}/company/campaigns/${campaignId}`);
    await expect(company.page.getByRole("heading", { name: campaignTitle })).toBeVisible();

    await company.page.getByRole("link", { name: "Edit", exact: true }).click();
    await expect(company.page.getByRole("heading", { name: "EDIT BRIEF" })).toBeVisible();
    await company.page.getByRole("button", { name: "Next", exact: true }).click();
    await company.page.getByLabel("Campaign description").fill(editedDescription);
    await company.page.getByRole("button", { name: "Next", exact: true }).click();
    await runUiMutation(company.page, {
      label: "company-browser-pre-campaign-edit",
      method: "PATCH",
      path: `/company/campaigns/${campaignId}`,
      expectedStatus: 200,
      action: () =>
        company.page.getByRole("button", { name: "Save changes", exact: true }).click(),
    });
    await company.page.waitForURL(`${FRONTEND_ORIGIN}/company/campaigns/${campaignId}`);
    await expect(company.page.getByText(editedDescription, { exact: true })).toBeVisible();

    await runUiMutation(company.page, {
      label: "company-browser-pre-campaign-publish",
      method: "POST",
      path: `/company/campaigns/${campaignId}/publish`,
      expectedStatus: 200,
      action: async () => {
        company.page.once("dialog", (dialog) => dialog.accept());
        await company.page
          .getByRole("button", { name: "Publish campaign", exact: true })
          .click();
      },
    });
    await expect(company.page.getByText("Recruiting", { exact: true })).toBeVisible();
    await expect(
      company.page.getByRole("button", { name: "Publish campaign", exact: true }),
    ).toHaveCount(0);

    const creator = await newEnglishPage(browser);
    openedContexts.push(creator.context);
    await loginThroughUi(creator.page, {
      label: "creator-browser",
      loginPath: "/login/creator",
      expectedPath: "/creator/dashboard",
      credentials: creatorCredentials,
    });

    await creator.page.goto("/creator/profile");
    await expect(creator.page.getByRole("heading", { name: "CREATOR PROFILE" })).toBeVisible();
    const editCapability = creator.page.locator("fieldset").filter({
      hasText: "Can you edit videos?",
    });
    await editCapability.getByRole("button", { name: "Yes", exact: true }).click();
    const editingSkill = creator.page.locator("fieldset").filter({
      hasText: "How would you rate your editing skill?",
    });
    await editingSkill.getByRole("button", { name: "Medium", exact: true }).click();
    const faceExposure = creator.page.locator("fieldset").filter({
      hasText: "Are you able to show your face?",
    });
    await faceExposure.getByRole("button", { name: "No", exact: true }).click();
    await creator.page.getByLabel("Instagram handle").fill(profileHandle);
    await creator.page
      .getByRole("checkbox", { name: /Show my profile in the public creator pool/ })
      .uncheck();
    await runUiMutation(creator.page, {
      label: "creator-browser-pre-profile-save",
      method: "POST",
      path: "/profile",
      expectedStatus: 200,
      action: () =>
        creator.page.getByRole("button", { name: "Save profile", exact: true }).click(),
    });
    await creator.page.waitForURL(`${FRONTEND_ORIGIN}/creator/dashboard`);

    await creator.page.goto("/creator/home");
    await expect(creator.page.getByRole("heading", { name: "DISCOVER" })).toBeVisible();
    const discoverSearch = creator.page.locator("form").filter({
      has: creator.page.getByRole("button", { name: "Search", exact: true }),
    });
    await discoverSearch.getByLabel("Search campaigns").fill(marker);
    await discoverSearch.getByRole("button", { name: "Search", exact: true }).click();
    await expect(creator.page.getByText(campaignTitle, { exact: true })).toBeVisible();
    await creator.page.getByText(campaignTitle, { exact: true }).click();
    await expect(creator.page.getByRole("heading", { name: campaignTitle })).toBeVisible();
    await creator.page
      .getByRole("button", { name: "Apply to campaign", exact: true })
      .click();
    await creator.page
      .getByLabel("Application message")
      .fill(`${marker} synthetic browser application`);
    const applyResponse = await runUiMutation(creator.page, {
      label: "creator-browser-pre-campaign-apply",
      method: "POST",
      path: `/campaigns/${campaignId}/apply`,
      expectedStatus: 201,
      action: () =>
        creator.page.getByRole("button", { name: "Submit application", exact: true }).click(),
    });
    const applicationId = await numericId(applyResponse, "campaign application");
    await creator.page.waitForURL(/\/creator\/mypage(?:[/?#]|$)/, { timeout: 30_000 });
    await expect(creator.page.getByText(campaignTitle, { exact: true })).toBeVisible();

    await company.page.reload({ waitUntil: "domcontentloaded" });
    await expect(company.page.getByRole("heading", { name: campaignTitle })).toBeVisible();
    const pendingApplicant = company.page.locator("button").filter({
      has: company.page.getByText("Application received", { exact: true }),
    });
    await pendingApplicant.first().click();
    await expect(
      company.page.getByText(`${marker} synthetic browser application`, { exact: true }),
    ).toBeVisible();
    await runUiMutation(company.page, {
      label: "company-browser-pre-applicant-select",
      method: "PATCH",
      path: `/company/applications/${applicationId}`,
      expectedStatus: 200,
      action: () => company.page.getByRole("button", { name: "Select", exact: true }).click(),
    });
    await expect(
      company.page.getByText("Selected / awaiting content", { exact: true }),
    ).toBeVisible();

    await creator.page.reload({ waitUntil: "domcontentloaded" });
    const creatorCampaignCell = creator.page
      .locator('[data-label="Campaign"]')
      .filter({ hasText: campaignTitle });
    const creatorApplicationRow = creatorCampaignCell.locator("..");
    await expect(creatorApplicationRow.getByText("Uploads unavailable", { exact: true })).toBeVisible();
    await expect(
      creatorApplicationRow.getByRole("button", { name: /Upload video|Upload & submit/ }),
    ).toHaveCount(0);
    await verifyBrowserUploadFailClosed(creator.page);

    const admin = await newEnglishPage(browser);
    openedContexts.push(admin.context);
    await loginThroughUi(admin.page, {
      label: "admin-browser",
      loginPath: "/login/company",
      expectedPath: "/admin/members",
      credentials: adminCredentials,
    });
    await expect(admin.page.getByRole("heading", { name: "Creator management" })).toBeVisible();
    const memberSearch = admin.page.locator("form").filter({
      has: admin.page.getByRole("button", { name: "Search", exact: true }),
    });
    await memberSearch.getByPlaceholder("Search by name or email").fill(creatorCredentials.email);
    await memberSearch.getByRole("button", { name: "Search", exact: true }).click();
    await expect(admin.page.locator("tbody tr")).toHaveCount(1);
    await admin.page
      .locator("tbody tr")
      .first()
      .getByRole("link", { name: "Details", exact: true })
      .click();
    await expect(admin.page.getByRole("heading", { name: "Basic info" })).toBeVisible();

    await admin.page.locator('aside a[href="/admin/campaigns"]').click();
    await expect(admin.page.getByRole("heading", { name: "Campaign management" })).toBeVisible();
    await admin.page.getByRole("link", { name: campaignTitle, exact: true }).click();
    await expect(admin.page.getByRole("heading", { name: campaignTitle })).toBeVisible();

    await runUiMutation(admin.page, {
      label: "admin-browser-pre-campaign-hide",
      method: "PATCH",
      path: `/admin/campaigns/${campaignId}/visibility`,
      expectedStatus: 200,
      action: async () => {
        admin.page.once("dialog", (dialog) => dialog.accept());
        await admin.page.getByRole("button", { name: "Hide", exact: true }).click();
      },
    });
    await expect(admin.page.getByRole("button", { name: "Show again", exact: true })).toBeVisible();
    await expect(admin.page.getByText("Hidden (not shown to users)", { exact: true })).toBeVisible();

    await runUiMutation(admin.page, {
      label: "admin-browser-pre-campaign-show",
      method: "PATCH",
      path: `/admin/campaigns/${campaignId}/visibility`,
      expectedStatus: 200,
      action: async () => {
        admin.page.once("dialog", (dialog) => dialog.accept());
        await admin.page.getByRole("button", { name: "Show again", exact: true }).click();
      },
    });
    await expect(admin.page.getByRole("button", { name: "Hide", exact: true })).toBeVisible();
    await expect(admin.page.getByText("Hidden (not shown to users)", { exact: true })).toHaveCount(0);

    await admin.page.locator('aside a[href="/admin/audit-logs"]').click();
    await expect(admin.page.getByRole("heading", { name: "Audit logs" })).toBeVisible();
    await admin.page.getByLabel("Resource type").fill("campaign");
    await admin.page.getByLabel("Resource ID").fill(String(campaignId));
    await admin.page.getByRole("button", { name: "Apply filters", exact: true }).click();
    await expect(admin.page.locator("tbody tr").filter({ hasText: `#${campaignId}` }).first()).toBeVisible();
    await expect(admin.page.locator('aside a[href="/admin/escrow"]')).toHaveCount(0);
    await expect(admin.page.locator('aside a[href="/admin/analytics"]')).toHaveCount(0);

    const escrowResponsePromise = admin.page.waitForResponse(
      (response) => matchesApiResponse(response, "GET", "/admin/escrow/pending"),
      { timeout: 30_000 },
    );
    await admin.page.goto("/admin/escrow");
    const escrowResponse = await escrowResponsePromise;
    assertSafeResponseStatus(escrowResponse, 503, "admin escrow fail-closed");
    await expect(admin.page.getByRole("heading", { name: "Escrow status" })).toBeVisible();
    await expect(admin.page.getByText("Managed beta · payments disabled", { exact: true })).toBeVisible();
    await expect(admin.page.getByRole("alert")).toContainText("Failed to load escrow status");
  } finally {
    await Promise.allSettled(openedContexts.map((context) => context.close()));
  }
});
