import * as Sentry from "@sentry/nextjs";
import type {
  Breadcrumb,
  Event,
  SpanJSON,
} from "@sentry/core";

const dsn =
  process.env.SENTRY_DSN?.trim() ||
  process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();

function sampleRate(value: string | undefined): number {
  if (!value?.trim()) return 0.05;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : 0;
}

function optionalValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

const sensitiveSegments = new Set([
  "authorization",
  "auth",
  "cookie",
  "cookies",
  "header",
  "headers",
  "body",
  "query",
  "search",
  "password",
  "passwd",
  "secret",
  "token",
  "session",
  "user",
  "username",
  "email",
  "ip",
]);

function isSensitiveKey(key: string): boolean {
  const normalized = key
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase();
  return normalized
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .some((segment) => sensitiveSegments.has(segment));
}

function stripExactUrl(value: string): string {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return value;
    parsed.username = "";
    parsed.password = "";
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return value
      .replace(/[?#].*$/, "")
      .replace(/^(https?:\/\/)[^/@\s]+@/i, "$1");
  }
}

function sanitizeText(value: string): string {
  return value
    .replace(/https?:\/\/[^\s"'<>]+/gi, (candidate) => {
      const trailing = candidate.match(/[),.;!?]+$/)?.[0] ?? "";
      const core = trailing ? candidate.slice(0, -trailing.length) : candidate;
      return stripExactUrl(core) + trailing;
    })
    .replace(
      /(\/[A-Za-z0-9._~!$&'()*+,;=:@%/-]*)(?:\?[^\s"'<>#]*|#[^\s"'<>]*)/g,
      "$1",
    )
    .replace(/\bBearer\s+[^\s,;]+/gi, "Bearer <redacted>")
    .replace(
      /\b[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
      "<redacted-token>",
    )
    .replace(
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
      "<redacted-email>",
    );
}

function sanitizeUnknown(value: unknown, depth = 0): unknown {
  if (typeof value === "string") return sanitizeText(value);
  if (value === null || typeof value !== "object") return value;
  if (depth >= 6) return "<filtered>";
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeUnknown(item, depth + 1));
  }
  const output: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    if (isSensitiveKey(key)) continue;
    output[key] = sanitizeUnknown(nested, depth + 1);
  }
  return output;
}

function sanitizeBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb {
  return {
    ...breadcrumb,
    message: breadcrumb.message ? sanitizeText(breadcrumb.message) : undefined,
    data: breadcrumb.data
      ? (sanitizeUnknown(breadcrumb.data) as Record<string, unknown>)
      : undefined,
  };
}

function sanitizeSpan(span: SpanJSON): SpanJSON {
  return {
    ...span,
    description: span.description ? sanitizeText(span.description) : undefined,
    data: sanitizeUnknown(span.data) as SpanJSON["data"],
  };
}

function sanitizeEvent<T extends Event>(event: T): T {
  delete event.user;
  if (event.request) {
    const method = event.request.method;
    const url = event.request.url ? sanitizeText(event.request.url) : undefined;
    event.request = {
      ...(method ? { method } : {}),
      ...(url ? { url } : {}),
    };
  }
  if (event.message) event.message = sanitizeText(event.message);
  if (event.transaction) event.transaction = sanitizeText(event.transaction);
  if (event.logentry?.message) {
    event.logentry.message = sanitizeText(event.logentry.message);
  }
  if (event.logentry?.params) {
    event.logentry.params = sanitizeUnknown(event.logentry.params) as unknown[];
  }
  event.breadcrumbs = event.breadcrumbs?.map(sanitizeBreadcrumb);
  event.spans = event.spans?.map(sanitizeSpan);
  event.extra = event.extra
    ? (sanitizeUnknown(event.extra) as typeof event.extra)
    : undefined;
  event.contexts = event.contexts
    ? (sanitizeUnknown(event.contexts) as typeof event.contexts)
    : undefined;
  event.tags = event.tags
    ? (sanitizeUnknown(event.tags) as typeof event.tags)
    : undefined;
  event.sdkProcessingMetadata = event.sdkProcessingMetadata
    ? (sanitizeUnknown(
        event.sdkProcessingMetadata,
      ) as typeof event.sdkProcessingMetadata)
    : undefined;
  for (const exception of event.exception?.values ?? []) {
    if (exception.value) exception.value = sanitizeText(exception.value);
  }
  return event;
}

if (dsn) {
  Sentry.init({
    dsn,
    enabled: true,
    sendDefaultPii: false,
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: { request: false, response: false },
      httpBodies: [],
      urlQueryParams: false,
      graphQL: { document: false, variables: false },
      genAI: { inputs: false, outputs: false },
      databaseQueryData: false,
      stackFrameVariables: false,
      frameContextLines: 0,
    },
    tracesSampleRate: sampleRate(
      process.env.SENTRY_TRACES_SAMPLE_RATE?.trim() ||
        process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
    ),
    tracePropagationTargets: [],
    environment:
      optionalValue(process.env.SENTRY_ENV) ??
      optionalValue(process.env.VERCEL_ENV) ??
      process.env.NODE_ENV ??
      "development",
    release:
      optionalValue(process.env.SENTRY_RELEASE) ??
      optionalValue(process.env.VERCEL_GIT_COMMIT_SHA),
    beforeSend: (event) => sanitizeEvent(event),
    beforeSendTransaction: (event) => sanitizeEvent(event),
    beforeSendSpan: sanitizeSpan,
    beforeBreadcrumb: sanitizeBreadcrumb,
  });
}
