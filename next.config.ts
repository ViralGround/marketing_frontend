import type { NextConfig } from "next";
import {
  deploymentBuildViolation,
  isPreproductionSite,
  preproductionSentryViolation,
} from "./src/lib/deploymentEnvironment";

const isProductionBuild = process.env.NODE_ENV === "production";
const noindexAllRoutes = isPreproductionSite(process.env.NEXT_PUBLIC_SITE_URL);
const PLACEHOLDER_MARKERS = [
  "draft", "placeholder", "todo", "tbd", "sample", "replace", "yourdomain", "your-", "xxxxxxxx",
];

function requireProductionValue(name: string): string {
  const value = process.env[name]?.trim() ?? "";
  if (!value) throw new Error(`[production-config] Missing ${name}`);
  const normalized = value.toLowerCase();
  if (PLACEHOLDER_MARKERS.some((part) => normalized.includes(part))) {
    throw new Error(`[production-config] ${name} is not a final value`);
  }
  return value;
}

function parseProductionUrl(name: string, value: string): URL {
  const normalized = value.toLowerCase();
  if (!value || PLACEHOLDER_MARKERS.some((part) => normalized.includes(part))) {
    throw new Error(`[production-config] ${name} is not a final value`);
  }
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`[production-config] ${name} must be a valid URL`);
  }
  const hostname = parsed.hostname.toLowerCase();
  if (
    parsed.protocol !== "https:"
    || !hostname.includes(".")
    || hostname === "localhost"
    || hostname.endsWith(".localhost")
    || hostname.endsWith(".example")
  ) {
    throw new Error(`[production-config] ${name} must be a public HTTPS URL`);
  }
  return parsed;
}

function requireProductionUrl(name: string): string {
  const value = requireProductionValue(name);
  parseProductionUrl(name, value);
  return value;
}

function validateProductionOrigin(name: string, value: string): string {
  const parsed = parseProductionUrl(name, value);
  if (value.replace(/\/$/, "") !== parsed.origin || parsed.username || parsed.password) {
    throw new Error(`[production-config] ${name} must be an exact origin without credentials or a path`);
  }
  return parsed.origin;
}

function requireProductionOrigin(name: string): string {
  const value = requireProductionUrl(name);
  return validateProductionOrigin(name, value);
}

function requireProductionBoolean(name: string): boolean {
  const value = requireProductionValue(name);
  if (value !== "true" && value !== "false") {
    throw new Error(`[production-config] ${name} must be either true or false`);
  }
  return value === "true";
}

function productionOriginList(name: string, rawValue: string | undefined): string[] {
  const value = rawValue?.trim() ?? "";
  if (!value) return [];
  const origins = value.split(",").map((origin, index) =>
    validateProductionOrigin(`${name}[${index}]`, origin.trim()));
  if (new Set(origins).size !== origins.length) {
    throw new Error(`[production-config] ${name} must not contain duplicate origins`);
  }
  return origins;
}

if (isProductionBuild) {
  const siteOrigin = requireProductionOrigin("NEXT_PUBLIC_SITE_URL");
  const apiOrigin = requireProductionOrigin("NEXT_PUBLIC_API_URL");
  requireProductionUrl("NEXT_PUBLIC_SENTRY_DSN");
  for (const name of [
    "NEXT_PUBLIC_LEGAL_TERMS_VERSION",
    "NEXT_PUBLIC_LEGAL_PRIVACY_VERSION",
    "NEXT_PUBLIC_LEGAL_AGE14_VERSION",
    "NEXT_PUBLIC_LEGAL_CREATOR_THIRD_PARTY_VERSION",
    "NEXT_PUBLIC_LEGAL_MARKETING_VERSION",
    "NEXT_PUBLIC_PRIVACY_OFFICER_NAME",
    "NEXT_PUBLIC_PRIVACY_OFFICER_CONTACT",
    "NEXT_PUBLIC_RELEASE_ID",
    // 사업자 정보 표기(전자상거래법 필수 고지) — 푸터 렌더에 사용
    "NEXT_PUBLIC_BUSINESS_NAME",
    "NEXT_PUBLIC_BUSINESS_CEO",
    "NEXT_PUBLIC_BUSINESS_REG_NO",
    "NEXT_PUBLIC_BUSINESS_ADDRESS",
    "NEXT_PUBLIC_BUSINESS_CONTACT",
  ]) requireProductionValue(name);

  const commitSha =
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() || process.env.GITHUB_SHA?.trim() || "";
  if (!/^[0-9a-f]{7,40}$/i.test(commitSha)) {
    throw new Error(
      "[production-config] VERCEL_GIT_COMMIT_SHA or GITHUB_SHA must identify the release commit",
    );
  }

  const paymentsEnabled = requireProductionBoolean("NEXT_PUBLIC_FEATURE_PAYMENTS");
  const instagramEnabled = requireProductionBoolean("NEXT_PUBLIC_FEATURE_INSTAGRAM");
  const uploadsEnabled = requireProductionBoolean("NEXT_PUBLIC_FEATURE_UPLOADS");
  if (paymentsEnabled) {
    throw new Error(
      "[production-config] NEXT_PUBLIC_FEATURE_PAYMENTS must remain false until a commercial payment gateway is implemented",
    );
  }

  const storageOrigins = productionOriginList(
    "NEXT_PUBLIC_STORAGE_ORIGINS",
    process.env.NEXT_PUBLIC_STORAGE_ORIGINS,
  );
  const approvedProductionStorageOrigins = productionOriginList(
    "APPROVED_NEW_PRODUCTION_STORAGE_ORIGINS",
    process.env.APPROVED_NEW_PRODUCTION_STORAGE_ORIGINS,
  );
  const deploymentViolation = deploymentBuildViolation({
    siteOrigin,
    apiOrigin,
    storageOrigins,
    paymentsEnabled,
    instagramEnabled,
    uploadsEnabled,
    appEnvironment: process.env.APP_ENV,
    productionConfirmation: process.env.NEW_PRODUCTION_DEPLOY_CONFIRMATION,
    approvedProductionSiteOrigin: process.env.APPROVED_NEW_PRODUCTION_SITE_ORIGIN,
    approvedProductionApiOrigin: process.env.APPROVED_NEW_PRODUCTION_API_ORIGIN,
    approvedProductionStorageOrigins,
    vercelEnvironment: process.env.VERCEL_ENV,
  });
  if (deploymentViolation) {
    throw new Error(`[production-config] ${deploymentViolation}`);
  }

  if (isPreproductionSite(siteOrigin) && process.env.APP_ENV === "preproduction") {
    const sentryViolation = preproductionSentryViolation({
      clientDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      serverDsn: process.env.SENTRY_DSN,
      clientEnvironment: process.env.NEXT_PUBLIC_SENTRY_ENV,
      serverEnvironment: process.env.SENTRY_ENV,
      clientRelease: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
      serverRelease: process.env.SENTRY_RELEASE,
      commitSha,
      approvedFrontendIdentity:
        process.env.APPROVED_STAGING_FRONTEND_SENTRY_DSN_IDENTITY,
      approvedBackendIdentity:
        process.env.APPROVED_STAGING_BACKEND_SENTRY_DSN_IDENTITY,
    });
    if (sentryViolation) {
      throw new Error(`[production-config] ${sentryViolation}`);
    }
  }

  if (noindexAllRoutes && process.env.NEXT_PUBLIC_GA_ID?.trim()) {
    throw new Error("[production-config] NEXT_PUBLIC_GA_ID must be empty for preproduction builds");
  }

  // 결정: GA 는 빌드 차단 사유가 아니다 — 비어 있으면 경고만 남기고 수집 없이 배포한다.
  if (!process.env.NEXT_PUBLIC_GA_ID?.trim()) {
    console.warn("[production-config] NEXT_PUBLIC_GA_ID is empty — analytics are disabled for this build.");
  }
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    const apiOrigin = new URL(
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
    ).origin;
    const storageOrigins = (process.env.NEXT_PUBLIC_STORAGE_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
      .map((origin) => new URL(origin).origin)
      .join(" ");
    const isProduction = isProductionBuild;
    const contentSecurityPolicy = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob: https:",
      `connect-src 'self' ${apiOrigin} ${storageOrigins} https://*.google-analytics.com https://*.analytics.google.com https://*.sentry.io`,
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"} https://www.googletagmanager.com`,
      "frame-src 'none'",
      isProduction ? "upgrade-insecure-requests" : "",
    ].filter(Boolean).join("; ");

    const securityHeaders = [
      { key: "Content-Security-Policy", value: contentSecurityPolicy },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      ...(isProduction
        ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
        : []),
    ];
    // 보호 영역은 HTTP 헤더로 색인 차단 — 해당 레이아웃들이 클라이언트 컴포넌트라
    // metadata.robots 를 내보낼 수 없어 헤더가 단일 소스다 (robots.txt disallow 와 정합).
    // /creator 공개 랜딩은 제외되도록 하위 경로에만 건다.
    const noindexHeader = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [
      { source: "/(.*)", headers: [...securityHeaders, ...(noindexAllRoutes ? noindexHeader : [])] },
      ...(!noindexAllRoutes ? [
        { source: "/admin", headers: noindexHeader },
        { source: "/admin/:path*", headers: noindexHeader },
        { source: "/company", headers: noindexHeader },
        { source: "/company/:path*", headers: noindexHeader },
        { source: "/creator/:path*", headers: noindexHeader },
        { source: "/profile", headers: noindexHeader },
        { source: "/profile/:path*", headers: noindexHeader },
      ] : []),
    ];
  },
};

export default nextConfig;
