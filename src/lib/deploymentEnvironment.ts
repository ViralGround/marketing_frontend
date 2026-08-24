/** A staging hostname must never be indexable, even if route metadata is missed. */
export const PREPRODUCTION_FRONTEND_ORIGIN = "https://staging.viralground.kr";
export const PREPRODUCTION_API_ORIGIN = "https://api.staging.viralground.kr";
export const NEW_PRODUCTION_DEPLOY_CONFIRMATION =
  "I_ACKNOWLEDGE_THIS_IS_THE_APPROVED_NEW_PRODUCTION_PAIR";

const PREPRODUCTION_SENTRY_ENVIRONMENT = "preproduction";
const COMMIT_SHA_PATTERN = /^[0-9a-f]{40}$/;
const SENTRY_PROJECT_ID_PATTERN = /^[1-9][0-9]*$/;

/**
 * The old production deployment stays live while the release candidate is
 * qualified. A new bundle must not be pointed at any of these origins, even if
 * somebody copies production-looking environment values into a preview build.
 * Moving the new release onto one of these origins requires a separately
 * reviewed code change after the old deployment has been retired.
 */
export const CURRENT_PRODUCTION_ORIGINS = Object.freeze([
  "https://viralground.kr",
  "https://www.viralground.kr",
  "https://api.viralground.kr",
  "https://storage.viralground.kr",
]);

type DeploymentBuildInput = {
  siteOrigin: string;
  apiOrigin: string;
  storageOrigins: readonly string[];
  paymentsEnabled: boolean;
  instagramEnabled: boolean;
  uploadsEnabled: boolean;
  appEnvironment?: string;
  productionConfirmation?: string;
  approvedProductionSiteOrigin?: string;
  approvedProductionApiOrigin?: string;
  approvedProductionStorageOrigins?: readonly string[];
  vercelEnvironment?: string;
};

type PreproductionSentryInput = {
  clientDsn?: string;
  serverDsn?: string;
  clientEnvironment?: string;
  serverEnvironment?: string;
  clientRelease?: string;
  serverRelease?: string;
  commitSha?: string;
  approvedFrontendIdentity?: string;
  approvedBackendIdentity?: string;
};

const currentProductionOrigins = new Set(CURRENT_PRODUCTION_ORIGINS);

function normalizedExactOrigin(value: string | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    const parsed = new URL(value.trim());
    if (parsed.username || parsed.password || parsed.origin !== value.trim().replace(/\/$/, "")) {
      return null;
    }
    return parsed.origin.toLowerCase();
  } catch {
    return null;
  }
}

function isPreproductionOrigin(origin: string): boolean {
  try {
    const hostname = new URL(origin).hostname.toLowerCase();
    return hostname === "staging.viralground.kr" || hostname.endsWith(".staging.viralground.kr");
  } catch {
    return false;
  }
}

function sameOriginSet(left: readonly string[], right: readonly string[]): boolean {
  if (new Set(left).size !== left.length || new Set(right).size !== right.length) return false;
  return [...left].sort().join("\n") === [...right].sort().join("\n");
}

function approvedSentryIdentity(
  value: string | undefined,
  label: string,
): { identity?: string; violation?: string } {
  const raw = value?.trim() ?? "";
  const separator = raw.indexOf("/");
  if (!raw || separator <= 0 || separator !== raw.lastIndexOf("/")) {
    return { violation: `${label} must be one canonical host/projectId identity` };
  }
  const host = raw.slice(0, separator);
  const projectId = raw.slice(separator + 1);
  if (
    !/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(host)
    || !host.includes(".")
    || host.includes("*")
    || !SENTRY_PROJECT_ID_PATTERN.test(projectId)
  ) {
    return { violation: `${label} must be one canonical host/projectId identity` };
  }
  return { identity: `${host}/${projectId}` };
}

function sentryDsnIdentity(
  value: string | undefined,
  label: string,
): { host?: string; projectId?: string; violation?: string } {
  const raw = value?.trim() ?? "";
  if (!raw) return { violation: `${label} is required for protected preproduction` };
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { violation: `${label} must be a canonical HTTPS Sentry DSN` };
  }
  const segments = parsed.pathname.split("/").filter(Boolean);
  if (
    parsed.protocol !== "https:"
    || !parsed.hostname
    || parsed.port
    || !parsed.username
    || parsed.password
    || parsed.search
    || parsed.hash
    || segments.length !== 1
    || !SENTRY_PROJECT_ID_PATTERN.test(segments[0])
  ) {
    return { violation: `${label} must be a canonical HTTPS Sentry DSN` };
  }
  return {
    host: parsed.hostname.toLowerCase(),
    projectId: segments[0],
  };
}

/**
 * Protected staging must never send events to an accidental environment,
 * release, host, or Sentry project. Messages deliberately name only the
 * variable/contract and never include a DSN or public key.
 */
export function preproductionSentryViolation(
  input: PreproductionSentryInput,
): string | null {
  if (
    input.clientEnvironment !== PREPRODUCTION_SENTRY_ENVIRONMENT
    || input.serverEnvironment !== PREPRODUCTION_SENTRY_ENVIRONMENT
  ) {
    return "NEXT_PUBLIC_SENTRY_ENV and SENTRY_ENV must exactly equal preproduction";
  }

  const commitSha = input.commitSha?.trim() ?? "";
  if (!COMMIT_SHA_PATTERN.test(commitSha)) {
    return "protected preproduction Sentry binding requires the full frontend commit SHA";
  }
  if (input.clientRelease?.trim() !== commitSha || input.serverRelease?.trim() !== commitSha) {
    return "NEXT_PUBLIC_SENTRY_RELEASE and SENTRY_RELEASE must exactly match the frontend commit SHA";
  }

  const frontendIdentity = approvedSentryIdentity(
    input.approvedFrontendIdentity,
    "APPROVED_STAGING_FRONTEND_SENTRY_DSN_IDENTITY",
  );
  if (frontendIdentity.violation) return frontendIdentity.violation;
  const backendIdentity = approvedSentryIdentity(
    input.approvedBackendIdentity,
    "APPROVED_STAGING_BACKEND_SENTRY_DSN_IDENTITY",
  );
  if (backendIdentity.violation) return backendIdentity.violation;
  if (frontendIdentity.identity === backendIdentity.identity) {
    return "approved frontend and backend Sentry identities must be distinct";
  }

  for (const [label, dsn, approvedIdentity, approvedLabel] of [
    [
      "NEXT_PUBLIC_SENTRY_DSN",
      input.clientDsn,
      frontendIdentity.identity,
      "APPROVED_STAGING_FRONTEND_SENTRY_DSN_IDENTITY",
    ],
    [
      "SENTRY_DSN",
      input.serverDsn,
      backendIdentity.identity,
      "APPROVED_STAGING_BACKEND_SENTRY_DSN_IDENTITY",
    ],
  ] as const) {
    const identity = sentryDsnIdentity(dsn, label);
    if (identity.violation) return identity.violation;
    if (`${identity.host}/${identity.projectId}` !== approvedIdentity) {
      return `${label} does not match ${approvedLabel}`;
    }
  }
  return null;
}

export function isPreproductionSite(siteUrl: string | undefined): boolean {
  if (!siteUrl?.trim()) return false;
  try {
    const hostname = new URL(siteUrl).hostname.toLowerCase();
    return hostname === "staging.viralground.kr" || hostname.endsWith(".staging.viralground.kr");
  } catch {
    return false;
  }
}

export function preproductionBuildViolation(input: {
  siteOrigin: string;
  apiOrigin: string;
  paymentsEnabled: boolean;
  instagramEnabled: boolean;
  uploadsEnabled: boolean;
}): string | null {
  if (!isPreproductionSite(input.siteOrigin)) return null;
  if (input.siteOrigin !== PREPRODUCTION_FRONTEND_ORIGIN) {
    return `staging frontend origin must equal ${PREPRODUCTION_FRONTEND_ORIGIN}`;
  }
  if (input.apiOrigin !== PREPRODUCTION_API_ORIGIN) {
    return `staging API origin must equal ${PREPRODUCTION_API_ORIGIN}`;
  }
  if (input.paymentsEnabled || input.instagramEnabled || input.uploadsEnabled) {
    return "staging role-E2E build requires payments, Instagram, and uploads to remain disabled";
  }
  return null;
}

/**
 * Fail-closed production-build boundary.
 *
 * - The sanitized staging candidate has one exact site/API topology and no
 *   browser storage origin while uploads are disabled.
 * - Every other production build is rejected unless it is an explicitly
 *   approved future production pair.
 * - The currently running production origins are an unconditional denylist;
 *   the confirmation mechanism cannot override it.
 */
export function deploymentBuildViolation(input: DeploymentBuildInput): string | null {
  const actualOrigins = [input.siteOrigin, input.apiOrigin, ...input.storageOrigins]
    .map((origin) => normalizedExactOrigin(origin))
    .filter((origin): origin is string => origin !== null);
  const currentProductionOrigin = actualOrigins.find((origin) => currentProductionOrigins.has(origin));
  if (currentProductionOrigin) {
    return `current production origin is forbidden for the new release candidate: ${currentProductionOrigin}`;
  }

  if (isPreproductionSite(input.siteOrigin)) {
    const violation = preproductionBuildViolation(input);
    if (violation) return violation;
    if (input.vercelEnvironment && input.appEnvironment !== "preproduction") {
      return "a Vercel staging build requires APP_ENV=preproduction";
    }
    if (input.vercelEnvironment && input.vercelEnvironment !== "production") {
      return "the isolated Vercel staging project requires VERCEL_ENV=production";
    }
    if (input.storageOrigins.length !== 0) {
      return "staging role-E2E build must not configure browser storage origins while uploads are disabled";
    }
    return null;
  }

  if ([input.apiOrigin, ...input.storageOrigins].some(isPreproductionOrigin)) {
    return "staging API/storage origins may only be used with the exact staging frontend origin";
  }

  if (input.appEnvironment !== "production") {
    return "non-staging production build requires APP_ENV=production";
  }
  if (input.vercelEnvironment && input.vercelEnvironment !== "production") {
    return "a Vercel preview/development build cannot use an approved production pair";
  }
  if (input.productionConfirmation !== NEW_PRODUCTION_DEPLOY_CONFIRMATION) {
    return "future production build confirmation is missing or invalid";
  }

  const approvedSite = normalizedExactOrigin(input.approvedProductionSiteOrigin);
  const approvedApi = normalizedExactOrigin(input.approvedProductionApiOrigin);
  if (!approvedSite || !approvedApi) {
    return "future production build requires exact approved site and API origins";
  }
  if (currentProductionOrigins.has(approvedSite) || currentProductionOrigins.has(approvedApi)) {
    return "the approved future production pair cannot reuse a current production origin";
  }
  if (isPreproductionOrigin(approvedSite) || isPreproductionOrigin(approvedApi)) {
    return "the approved future production pair cannot reuse staging origins";
  }
  if (input.siteOrigin !== approvedSite || input.apiOrigin !== approvedApi) {
    return "configured site/API origins do not match the approved future production pair";
  }

  const approvedStorage = (input.approvedProductionStorageOrigins ?? [])
    .map((origin) => normalizedExactOrigin(origin))
    .filter((origin): origin is string => origin !== null);
  if (approvedStorage.length !== (input.approvedProductionStorageOrigins ?? []).length) {
    return "approved future production storage origins must be exact origins";
  }
  if (approvedStorage.some((origin) =>
    currentProductionOrigins.has(origin) || isPreproductionOrigin(origin))) {
    return "approved future production storage cannot reuse current production or staging origins";
  }
  if (!input.uploadsEnabled && (input.storageOrigins.length !== 0 || approvedStorage.length !== 0)) {
    return "storage origins must remain blank while uploads are disabled";
  }
  if (input.uploadsEnabled && input.storageOrigins.length === 0) {
    return "uploads require an approved future production storage origin";
  }
  if (!sameOriginSet(input.storageOrigins, approvedStorage)) {
    return "configured storage origins do not match the approved future production allowlist";
  }
  return null;
}
