import { describe, expect, it } from "vitest";
import {
  deploymentBuildViolation,
  isPreproductionSite,
  NEW_PRODUCTION_DEPLOY_CONFIRMATION,
  preproductionBuildViolation,
  preproductionSentryViolation,
} from "./deploymentEnvironment";

describe("isPreproductionSite", () => {
  it("recognizes only the private staging host family", () => {
    expect(isPreproductionSite("https://staging.viralground.kr")).toBe(true);
    expect(isPreproductionSite("https://preview.staging.viralground.kr")).toBe(true);
  });

  it("preserves indexing behavior for the public production hosts", () => {
    expect(isPreproductionSite("https://viralground.kr")).toBe(false);
    expect(isPreproductionSite("https://www.viralground.kr")).toBe(false);
    expect(isPreproductionSite(undefined)).toBe(false);
    expect(isPreproductionSite("not-a-url")).toBe(false);
  });
});

describe("preproductionBuildViolation", () => {
  const safe = {
    siteOrigin: "https://staging.viralground.kr",
    apiOrigin: "https://api.staging.viralground.kr",
    paymentsEnabled: false,
    instagramEnabled: false,
    uploadsEnabled: false,
  };

  it("accepts only the exact disabled-feature staging bundle topology", () => {
    expect(preproductionBuildViolation(safe)).toBeNull();
  });

  it("rejects a staging bundle pointed at a production API", () => {
    expect(
      preproductionBuildViolation({ ...safe, apiOrigin: "https://api.viralground.kr" }),
    ).toContain("staging API origin");
  });

  it("rejects preview aliases and prematurely enabled public integrations", () => {
    expect(
      preproductionBuildViolation({
        ...safe,
        siteOrigin: "https://preview.staging.viralground.kr",
      }),
    ).toContain("staging frontend origin");
    expect(preproductionBuildViolation({ ...safe, uploadsEnabled: true })).toContain(
      "remain disabled",
    );
  });
});

describe("preproductionSentryViolation", () => {
  const commitSha = "a".repeat(40);
  const safe = {
    clientDsn: "https://frontend-public-key@o123.ingest.sentry.io/1001",
    serverDsn: "https://server-public-key@o123.ingest.sentry.io/1002",
    clientEnvironment: "preproduction",
    serverEnvironment: "preproduction",
    clientRelease: commitSha,
    serverRelease: commitSha,
    commitSha,
    approvedFrontendIdentity: "o123.ingest.sentry.io/1001",
    approvedBackendIdentity: "o123.ingest.sentry.io/1002",
  };

  it("accepts two canonical staging DSNs bound to the exact commit", () => {
    expect(preproductionSentryViolation(safe)).toBeNull();
  });

  it("rejects environment and release drift", () => {
    expect(preproductionSentryViolation({
      ...safe,
      serverEnvironment: "production",
    })).toContain("exactly equal preproduction");
    expect(preproductionSentryViolation({
      ...safe,
      clientRelease: "b".repeat(40),
    })).toContain("exactly match the frontend commit SHA");
  });

  it("rejects an unapproved Sentry host or project", () => {
    expect(preproductionSentryViolation({
      ...safe,
      approvedFrontendIdentity: "approved.ingest.sentry.io/1001",
    })).toContain("does not match APPROVED_STAGING_FRONTEND");
    expect(preproductionSentryViolation({
      ...safe,
      approvedBackendIdentity: "o123.ingest.sentry.io/9999",
    })).toContain("does not match APPROVED_STAGING_BACKEND");
  });

  it("rejects missing, non-canonical, wildcard, and identical role bindings", () => {
    expect(preproductionSentryViolation({ ...safe, serverDsn: "" })).toContain(
      "SENTRY_DSN is required",
    );
    expect(preproductionSentryViolation({
      ...safe,
      serverDsn: "https://key:password@o123.ingest.sentry.io/1002?unsafe=true",
    })).toContain("canonical HTTPS Sentry DSN");
    expect(preproductionSentryViolation({
      ...safe,
      approvedFrontendIdentity: "*.ingest.sentry.io/1001",
    })).toContain("canonical host/projectId identity");
    expect(preproductionSentryViolation({
      ...safe,
      approvedBackendIdentity: "o123.ingest.sentry.io/1001",
    })).toContain("must be distinct");
  });

  it("rejects swapped or shared projects even when both are otherwise approved", () => {
    expect(preproductionSentryViolation({
      ...safe,
      clientDsn: safe.serverDsn,
      serverDsn: safe.clientDsn,
    })).toContain("does not match APPROVED_STAGING_FRONTEND");
    expect(preproductionSentryViolation({
      ...safe,
      serverDsn: safe.clientDsn,
    })).toContain("does not match APPROVED_STAGING_BACKEND");
  });

  it("never echoes a DSN or its public key in a validation error", () => {
    const unsafeDsn = "https://never-log-this-key@evil.invalid/9999";
    const violation = preproductionSentryViolation({
      ...safe,
      clientDsn: unsafeDsn,
    });
    expect(violation).not.toContain(unsafeDsn);
    expect(violation).not.toContain("never-log-this-key");
  });
});

describe("deploymentBuildViolation", () => {
  const staging = {
    siteOrigin: "https://staging.viralground.kr",
    apiOrigin: "https://api.staging.viralground.kr",
    storageOrigins: [],
    paymentsEnabled: false,
    instagramEnabled: false,
    uploadsEnabled: false,
  };
  const approvedProduction = {
    siteOrigin: "https://new.viralground.kr",
    apiOrigin: "https://api-v2.viralground.kr",
    storageOrigins: [] as string[],
    paymentsEnabled: false,
    instagramEnabled: false,
    uploadsEnabled: false,
    appEnvironment: "production",
    productionConfirmation: NEW_PRODUCTION_DEPLOY_CONFIRMATION,
    approvedProductionSiteOrigin: "https://new.viralground.kr",
    approvedProductionApiOrigin: "https://api-v2.viralground.kr",
    approvedProductionStorageOrigins: [] as string[],
  };

  it("accepts only the exact staging pair without storage", () => {
    expect(deploymentBuildViolation(staging)).toBeNull();
    expect(deploymentBuildViolation({
      ...staging,
      siteOrigin: "https://preview.example.com",
      apiOrigin: "https://api.staging.viralground.kr",
    })).toContain("exact staging frontend");
    expect(deploymentBuildViolation({
      ...staging,
      storageOrigins: ["https://storage.staging.viralground.kr"],
    })).toContain("must not configure browser storage");
  });

  it("keeps generic CI staging validation possible but binds a Vercel staging build to APP_ENV", () => {
    expect(deploymentBuildViolation(staging)).toBeNull();
    expect(deploymentBuildViolation({
      ...staging,
      vercelEnvironment: "production",
    })).toContain("APP_ENV=preproduction");
    expect(deploymentBuildViolation({
      ...staging,
      appEnvironment: "preproduction",
      vercelEnvironment: "production",
    })).toBeNull();
    expect(deploymentBuildViolation({
      ...staging,
      appEnvironment: "preproduction",
      vercelEnvironment: "preview",
    })).toContain("VERCEL_ENV=production");
    expect(deploymentBuildViolation({
      ...staging,
      appEnvironment: "preproduction",
      vercelEnvironment: "development",
    })).toContain("VERCEL_ENV=production");
  });

  it("defaults every unknown or preview production build to denied", () => {
    expect(deploymentBuildViolation({
      ...staging,
      siteOrigin: "https://viralground-preview.vercel.app",
      apiOrigin: "https://api-v2.viralground.kr",
    })).toContain("APP_ENV=production");
    expect(deploymentBuildViolation({
      ...approvedProduction,
      vercelEnvironment: "preview",
    })).toContain("Vercel preview");
  });

  it("unconditionally rejects every current production origin", () => {
    for (const forbidden of [
      "https://viralground.kr",
      "https://www.viralground.kr",
      "https://api.viralground.kr",
      "https://storage.viralground.kr",
    ]) {
      expect(deploymentBuildViolation({
        ...approvedProduction,
        siteOrigin: forbidden.includes("api.") || forbidden.includes("storage.")
          ? approvedProduction.siteOrigin
          : forbidden,
        apiOrigin: forbidden.includes("api.") ? forbidden : approvedProduction.apiOrigin,
        storageOrigins: forbidden.includes("storage.") ? [forbidden] : [],
      })).toContain("current production origin is forbidden");
    }
  });

  it("requires confirmation and an exact future production pair", () => {
    expect(deploymentBuildViolation(approvedProduction)).toBeNull();
    expect(deploymentBuildViolation({
      ...approvedProduction,
      productionConfirmation: "yes",
    })).toContain("confirmation");
    expect(deploymentBuildViolation({
      ...approvedProduction,
      apiOrigin: "https://unexpected-api.viralground.kr",
    })).toContain("do not match");
  });

  it("binds future upload storage to the separately approved allowlist", () => {
    const withStorage = {
      ...approvedProduction,
      uploadsEnabled: true,
      storageOrigins: ["https://objects.new-storage.example.net"],
      approvedProductionStorageOrigins: ["https://objects.new-storage.example.net"],
    };
    expect(deploymentBuildViolation(withStorage)).toBeNull();
    expect(deploymentBuildViolation({
      ...withStorage,
      approvedProductionStorageOrigins: ["https://other-storage.example.net"],
    })).toContain("do not match");
  });
});
