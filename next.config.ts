import type { NextConfig } from "next";

const isProductionBuild = process.env.NODE_ENV === "production";
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

if (isProductionBuild) {
  requireProductionOrigin("NEXT_PUBLIC_SITE_URL");
  requireProductionOrigin("NEXT_PUBLIC_API_URL");
  requireProductionUrl("NEXT_PUBLIC_SENTRY_DSN");
  for (const name of [
    "NEXT_PUBLIC_LEGAL_TERMS_VERSION",
    "NEXT_PUBLIC_LEGAL_PRIVACY_VERSION",
    "NEXT_PUBLIC_LEGAL_AGE14_VERSION",
    "NEXT_PUBLIC_LEGAL_CREATOR_THIRD_PARTY_VERSION",
    "NEXT_PUBLIC_LEGAL_MARKETING_VERSION",
    "NEXT_PUBLIC_PRIVACY_OFFICER_NAME",
    "NEXT_PUBLIC_PRIVACY_OFFICER_CONTACT",
  ]) requireProductionValue(name);

  const storageOrigins = requireProductionValue("NEXT_PUBLIC_STORAGE_ORIGINS").split(",");
  storageOrigins.forEach((origin, index) => {
    validateProductionOrigin(`NEXT_PUBLIC_STORAGE_ORIGINS[${index}]`, origin.trim());
  });
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
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
