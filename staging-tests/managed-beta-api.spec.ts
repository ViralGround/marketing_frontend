import { expect, test, type APIRequestContext } from "@playwright/test";

import {
  API_ORIGIN,
  FRONTEND_ORIGIN,
  assertError,
  assertStatus,
  createAuthenticatedContext,
  mutate,
  mutateWithoutCsrf,
  requiredEnv,
  requireMutationGate,
  verifyStagingRelease,
} from "./support";

test.describe.configure({ mode: "serial" });

let companyApi: APIRequestContext;
let creatorApi: APIRequestContext;
let adminApi: APIRequestContext;
let companyCsrf: string;
let creatorCsrf: string;
let adminCsrf: string;

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

test.beforeAll(async () => {
  requireMutationGate();
  await verifyStagingRelease();

  ({ context: companyApi, csrf: companyCsrf } =
    await createAuthenticatedContext(companyCredentials));
  ({ context: creatorApi, csrf: creatorCsrf } =
    await createAuthenticatedContext(creatorCredentials));
  ({ context: adminApi, csrf: adminCsrf } = await createAuthenticatedContext(adminCredentials));
});

test.afterAll(async () => {
  await Promise.allSettled([companyApi?.dispose(), creatorApi?.dispose(), adminApi?.dispose()]);
});

async function responseObject(
  response: Awaited<ReturnType<APIRequestContext["get"]>>,
  label: string,
): Promise<Record<string, unknown>> {
  await assertStatus(response, 200, label);
  const body: unknown = await response.json();
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error(`${label} returned an invalid JSON object`);
  }
  return body as Record<string, unknown>;
}

test("managed-beta lifecycle is role-safe and every unreleased feature fails closed", async () => {
  expect(API_ORIGIN).toBe("https://api.staging.viralground.kr");
  expect(FRONTEND_ORIGIN).toBe("https://staging.viralground.kr");

  const companyMe = await responseObject(await companyApi.get("/auth/me"), "company identity");
  const creatorMe = await responseObject(await creatorApi.get("/auth/me"), "creator identity");
  const adminMe = await responseObject(await adminApi.get("/auth/me"), "admin identity");
  expect(companyMe.role).toBe("COMPANY");
  expect(creatorMe.role).toBe("CREATOR");
  expect(adminMe.role).toBe("ADMIN");
  const companyMemberId = companyMe.id;
  const creatorMemberId = creatorMe.id;
  if (
    typeof companyMemberId !== "number" ||
    !Number.isInteger(companyMemberId) ||
    typeof creatorMemberId !== "number" ||
    !Number.isInteger(creatorMemberId)
  ) {
    throw new Error("Synthetic member identities must expose numeric IDs");
  }
  const runId = (process.env.STAGING_RUN_ID || Date.now().toString()).replace(/[^A-Za-z0-9_-]/g, "-");
  const marker = `RC-${runId}`.slice(0, 80);

  await assertError(
    await companyApi.get("/profile"),
    403,
    "FORBIDDEN",
    "company-to-creator role crossing",
  );
  await assertError(
    await creatorApi.get("/company/dashboard"),
    403,
    "FORBIDDEN",
    "creator-to-company role crossing",
  );
  await assertError(
    await adminApi.get("/company/dashboard"),
    403,
    "FORBIDDEN",
    "admin-to-company role crossing",
  );
  await assertError(
    await creatorApi.get("/creator/instagram/connection"),
    503,
    "INSTAGRAM_FEATURE_DISABLED",
    "Instagram fail-closed",
  );
  await assertError(
    await mutate(creatorApi, "POST", "/files/presign-upload", creatorCsrf, {
      contentType: "video/mp4",
      sizeBytes: 1024,
    }),
    503,
    "UPLOAD_FEATURE_DISABLED",
    "upload fail-closed",
  );
  await assertStatus(await adminApi.get("/admin/dashboard/kpi"), 200, "admin KPI read");
  await assertStatus(
    await adminApi.get(`/admin/members/${companyMemberId}`),
    200,
    "admin synthetic member detail read",
  );
  await assertError(
    await adminApi.get("/admin/escrow/pending"),
    503,
    "PAYMENT_GATEWAY_UNAVAILABLE",
    "admin escrow fail-closed",
  );
  await assertError(
    await adminApi.get("/admin/reel-analytics"),
    503,
    "INSTAGRAM_FEATURE_DISABLED",
    "admin Instagram analytics fail-closed",
  );

  await assertStatus(
    await mutate(companyApi, "PATCH", "/company/profile", companyCsrf, {
      introduction: `${marker} synthetic company profile`,
      industry: "Technology",
      homepage: `https://www.viralground.kr/brands/${marker}`,
    }),
    200,
    "company profile update",
  );
  const updatedCompanyProfile = await responseObject(
    await companyApi.get("/company/profile"),
    "company profile read",
  );
  expect(updatedCompanyProfile.introduction).toBe(`${marker} synthetic company profile`);

  const creatorProfileInput = {
    canEdit: true,
    editingSkill: "MEDIUM",
    faceExposure: false,
    profileImage: null,
    instagramId: null,
  };
  await assertStatus(
    await mutate(creatorApi, "POST", "/profile", creatorCsrf, {
      ...creatorProfileInput,
      publicProfileOptIn: true,
    }),
    200,
    "creator public profile consent",
  );
  const consentedCreatorProfile = await responseObject(
    await creatorApi.get("/profile"),
    "creator profile read after consent",
  );
  const consentedProfile = consentedCreatorProfile.profile;
  expect(
    consentedProfile && typeof consentedProfile === "object"
      ? (consentedProfile as { publicProfileOptIn?: boolean }).publicProfileOptIn
      : undefined,
  ).toBe(true);
  await assertStatus(
    await mutate(creatorApi, "POST", "/profile", creatorCsrf, {
      ...creatorProfileInput,
      publicProfileOptIn: false,
    }),
    200,
    "creator public profile consent withdrawal",
  );
  const withdrawnCreatorProfile = await responseObject(
    await creatorApi.get("/profile"),
    "creator profile read after consent withdrawal",
  );
  const withdrawnProfile = withdrawnCreatorProfile.profile;
  expect(
    withdrawnProfile && typeof withdrawnProfile === "object"
      ? (withdrawnProfile as { publicProfileOptIn?: boolean }).publicProfileOptIn
      : undefined,
  ).toBe(false);

  const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19);
  const campaignInput = {
    title: `${marker} managed beta`,
    description: `${marker} sanitized staging role validation`,
    brandName: `${marker} brand`,
    rewardAmount: 1,
    maxParticipants: 1,
    requirements: `${marker} synthetic accounts only`,
    deadline,
  };

  const missingCsrf = await mutateWithoutCsrf(
    companyApi,
    "POST",
    "/company/campaigns",
    campaignInput,
  );
  await assertStatus(missingCsrf, 403, "missing CSRF rejection");

  const createResponse = await mutate(
    companyApi,
    "POST",
    "/company/campaigns",
    companyCsrf,
    campaignInput,
  );
  await assertStatus(createResponse, 201, "campaign create");
  const created = (await createResponse.json()) as { id?: number; status?: string };
  if (!Number.isInteger(created.id)) throw new Error("campaign create returned no numeric ID");
  const campaignId = created.id as number;

  const editedDescription = `${marker} edited before publish`;
  const editResponse = await mutate(
    companyApi,
    "PATCH",
    `/company/campaigns/${campaignId}`,
    companyCsrf,
    { description: editedDescription },
  );
  await assertStatus(editResponse, 200, "company campaign edit");
  const editedCampaign = (await editResponse.json()) as { description?: string };
  expect(editedCampaign.description).toBe(editedDescription);

  await assertError(
    await mutate(
      companyApi,
      "POST",
      `/company/campaigns/${campaignId}/deposit-request`,
      companyCsrf,
    ),
    503,
    "PAYMENT_GATEWAY_UNAVAILABLE",
    "payment fail-closed",
  );

  await assertStatus(
    await mutate(
      companyApi,
      "POST",
      `/company/campaigns/${campaignId}/publish`,
      companyCsrf,
    ),
    200,
    "managed-beta publish",
  );
  const published = await responseObject(
    await companyApi.get(`/company/campaigns/${campaignId}`),
    "published campaign",
  );
  expect(published.status).toBe("OPEN");

  const openCampaigns = await responseObject(
    await creatorApi.get(`/campaigns?search=${encodeURIComponent(marker)}`),
    "creator campaign search",
  );
  const campaigns = Array.isArray(openCampaigns.campaigns) ? openCampaigns.campaigns : [];
  expect(campaigns.some((item) => (item as { id?: number }).id === campaignId)).toBe(true);

  const applyResponse = await mutate(
    creatorApi,
    "POST",
    `/campaigns/${campaignId}/apply`,
    creatorCsrf,
    { message: `${marker} synthetic application` },
  );
  await assertStatus(applyResponse, 201, "creator apply");
  const applied = (await applyResponse.json()) as { id?: number; status?: string };
  if (!Number.isInteger(applied.id)) throw new Error("creator apply returned no numeric ID");
  const applicationId = applied.id as number;
  expect(applied.status).toBe("PENDING");

  await assertStatus(
    await mutate(companyApi, "PATCH", `/company/applications/${applicationId}`, companyCsrf, {
      action: "APPROVE",
    }),
    200,
    "company application approval",
  );

  await assertError(
    await mutate(creatorApi, "POST", `/me/applications/${applicationId}/submit`, creatorCsrf, {
      submissionUrl: "javascript:alert(1)",
    }),
    400,
    "INVALID_CAMPAIGN_INPUT",
    "unsafe submission URL rejection",
  );

  const firstSubmissionUrl = `https://www.instagram.com/reel/${encodeURIComponent(marker)}-v1/`;
  await assertStatus(
    await mutate(creatorApi, "POST", `/me/applications/${applicationId}/submit`, creatorCsrf, {
      submissionUrl: firstSubmissionUrl,
    }),
    200,
    "creator external-URL submission",
  );

  await assertStatus(
    await mutate(companyApi, "PATCH", `/company/applications/${applicationId}`, companyCsrf, {
      action: "REQUEST_CHANGES",
      reviewComment: `${marker} synthetic revision request`,
    }),
    200,
    "company change request",
  );

  const afterChanges = await responseObject(
    await creatorApi.get("/me/applications?status=ALL"),
    "creator applications after change request",
  );
  const changedApplication = (Array.isArray(afterChanges.applications)
    ? afterChanges.applications
    : []
  ).find((item) => (item as { id?: number }).id === applicationId) as
    | { status?: string }
    | undefined;
  expect(changedApplication?.status).toBe("CHANGES_REQUESTED");

  const secondSubmissionUrl = `https://www.instagram.com/reel/${encodeURIComponent(marker)}-v2/`;
  await assertStatus(
    await mutate(creatorApi, "POST", `/me/applications/${applicationId}/submit`, creatorCsrf, {
      submissionUrl: secondSubmissionUrl,
    }),
    200,
    "creator external-URL resubmission",
  );

  await assertError(
    await mutate(adminApi, "PATCH", `/admin/applications/${applicationId}`, adminCsrf, {
      status: "SETTLED",
      rewardPaidAmount: 1,
      operationReason: `${marker} must remain nonfinancial`,
      idempotencyKey: `${marker}-settlement-blocked`,
    }),
    503,
    "PAYMENT_GATEWAY_UNAVAILABLE",
    "admin payment status change fail-closed",
  );

  await assertError(
    await mutate(companyApi, "PATCH", `/company/applications/${applicationId}`, companyCsrf, {
      action: "APPROVE_VIDEO",
      rewardPaidAmount: 1,
    }),
    503,
    "PAYMENT_GATEWAY_UNAVAILABLE",
    "settlement action fail-closed",
  );
  await assertStatus(
    await mutate(companyApi, "PATCH", `/company/applications/${applicationId}`, companyCsrf, {
      action: "APPROVE_CONTENT",
    }),
    200,
    "nonfinancial content approval",
  );

  const completedApplications = await responseObject(
    await creatorApi.get("/me/applications?status=ALL"),
    "creator completed applications",
  );
  const completed = (Array.isArray(completedApplications.applications)
    ? completedApplications.applications
    : []
  ).find((item) => (item as { id?: number }).id === applicationId) as
    | { status?: string; rewardPaidAmount?: number | null }
    | undefined;
  expect(completed?.status).toBe("COMPLETED");
  expect(completed?.rewardPaidAmount ?? null).toBeNull();

  await assertStatus(
    await mutate(creatorApi, "PUT", `/me/applications/${applicationId}/metrics`, creatorCsrf, {
      views: 100,
      likes: 10,
      comments: 1,
      externalUrl: secondSubmissionUrl,
    }),
    200,
    "creator metric upsert",
  );
  await assertStatus(await creatorApi.get("/me/performance"), 200, "creator performance");
  await assertStatus(
    await companyApi.get(`/company/campaigns/${campaignId}/performance`),
    200,
    "company performance",
  );

  await assertStatus(
    await mutate(companyApi, "POST", `/applications/${applicationId}/reviews`, companyCsrf, {
      rating: 5,
      comment: `${marker} company synthetic review`,
    }),
    201,
    "company review",
  );
  await assertStatus(
    await mutate(creatorApi, "POST", `/applications/${applicationId}/reviews`, creatorCsrf, {
      rating: 5,
      comment: `${marker} creator synthetic review`,
    }),
    201,
    "creator review",
  );
  const reviews = await responseObject(
    await creatorApi.get(`/applications/${applicationId}/reviews`),
    "application reviews",
  );
  expect(Array.isArray(reviews.reviews) ? reviews.reviews.length : 0).toBe(2);

  await assertStatus(
    await adminApi.get(`/admin/campaigns/${campaignId}`),
    200,
    "admin synthetic campaign detail read",
  );
  await assertStatus(
    await mutate(adminApi, "PATCH", `/admin/campaigns/${campaignId}/visibility`, adminCsrf, {
      hidden: true,
    }),
    200,
    "admin synthetic campaign hide",
  );
  await assertStatus(
    await mutate(adminApi, "PATCH", `/admin/campaigns/${campaignId}/visibility`, adminCsrf, {
      hidden: false,
    }),
    200,
    "admin synthetic campaign restore visibility",
  );
  const auditPage = await responseObject(
    await adminApi.get(
      `/admin/audit-logs?resourceType=campaign&resourceId=${campaignId}&size=50`,
    ),
    "admin audit log read",
  );
  const auditItems = Array.isArray(auditPage.items) ? auditPage.items : [];
  expect(
    auditItems.some(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        (item as { resourceId?: string }).resourceId === String(campaignId),
    ),
  ).toBe(true);

  await assertStatus(
    await mutate(companyApi, "POST", "/auth/logout", companyCsrf),
    204,
    "company logout",
  );
  await assertStatus(
    await mutate(creatorApi, "POST", "/auth/logout", creatorCsrf),
    204,
    "creator logout",
  );
  await assertStatus(
    await mutate(adminApi, "POST", "/auth/logout", adminCsrf),
    204,
    "admin logout",
  );
});
