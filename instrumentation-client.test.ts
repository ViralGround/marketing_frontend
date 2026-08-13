import type { Breadcrumb, Event } from "@sentry/core";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const sentryMock = vi.hoisted(() => ({
  init: vi.fn((options: unknown) => options),
  captureRequestError: vi.fn(),
  captureRouterTransitionStart: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => sentryMock);

const managedEnvironment = [
  "NEXT_PUBLIC_SENTRY_DSN",
  "NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE",
  "NEXT_PUBLIC_SENTRY_ENV",
  "NEXT_PUBLIC_SENTRY_RELEASE",
  "SENTRY_DSN",
  "SENTRY_TRACES_SAMPLE_RATE",
  "SENTRY_ENV",
  "SENTRY_RELEASE",
] as const;

const originalEnvironment = new Map(
  managedEnvironment.map((name) => [name, process.env[name]]),
);

type TestedOptions = {
  sendDefaultPii: boolean;
  dataCollection: {
    userInfo: boolean;
    cookies: boolean;
    httpHeaders: { request: boolean; response: boolean };
    httpBodies: string[];
    urlQueryParams: boolean;
  };
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
  profilesSampleRate: number;
  tracePropagationTargets: unknown[];
  environment?: string;
  release?: string;
  beforeSend: (event: Event) => Event | null;
  beforeBreadcrumb: (breadcrumb: Breadcrumb) => Breadcrumb | null;
};

function initializedOptions(): TestedOptions {
  const options = sentryMock.init.mock.calls[0]?.[0];
  expect(options).toBeDefined();
  return options as TestedOptions;
}

describe("client Sentry privacy configuration", () => {
  beforeEach(() => {
    vi.resetModules();
    sentryMock.init.mockClear();
    sentryMock.captureRequestError.mockClear();
    sentryMock.captureRouterTransitionStart.mockClear();
    for (const name of managedEnvironment) delete process.env[name];
  });

  afterAll(() => {
    for (const [name, value] of originalEnvironment) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  it("does not initialize when the DSN is absent", async () => {
    await import("./instrumentation-client");

    expect(sentryMock.init).not.toHaveBeenCalled();
  });

  it("drops headers and query data from server request errors", async () => {
    const { onRequestError } = await import("./src/instrumentation");
    const error = new Error("upload failed");
    const context = {
      routerKind: "App Router" as const,
      routePath: "/api/uploads/complete",
      routeType: "route" as const,
      revalidateReason: undefined,
    };

    await onRequestError(
      error,
      {
        method: "POST",
        path: "/api/uploads/complete?X-Amz-Signature=secret#fragment",
        headers: {
          authorization: "Bearer super-secret-token",
          cookie: "session=private-session",
        },
      },
      context,
    );

    expect(sentryMock.captureRequestError).toHaveBeenCalledWith(
      error,
      {
        method: "POST",
        path: "/api/uploads/complete",
        headers: {},
      },
      context,
    );
  });

  it("bounds sampling and disables PII, replay, profiles, and propagation", async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = "https://public@example.test/1";
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE = "9";
    process.env.NEXT_PUBLIC_SENTRY_ENV = "production";
    process.env.NEXT_PUBLIC_SENTRY_RELEASE = "release-2026-08-13";

    await import("./instrumentation-client");
    const options = initializedOptions();

    expect(options).toMatchObject({
      sendDefaultPii: false,
      dataCollection: {
        userInfo: false,
        cookies: false,
        httpHeaders: { request: false, response: false },
        httpBodies: [],
        urlQueryParams: false,
      },
      tracesSampleRate: 0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      profilesSampleRate: 0,
      tracePropagationTargets: [],
      environment: "production",
      release: "release-2026-08-13",
    });
  });

  it.each(["server", "edge"] as const)(
    "uses the public DSN fallback and bounded sampling in the %s runtime",
    async (runtime) => {
      process.env.SENTRY_DSN = "   ";
      process.env.NEXT_PUBLIC_SENTRY_DSN = "https://public@example.test/1";
      process.env.SENTRY_TRACES_SAMPLE_RATE = "   ";
      process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE = "0.1";

      if (runtime === "server") await import("./sentry.server.config");
      else await import("./sentry.edge.config");

      expect(initializedOptions()).toMatchObject({
        sendDefaultPii: false,
        tracesSampleRate: 0.1,
        tracePropagationTargets: [],
      });
    },
  );

  it("removes request data, identity, and presigned URL secrets before sending", async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = "https://public@example.test/1";
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE = "0.25";

    await import("./instrumentation-client");
    const options = initializedOptions();
    const signedUrl =
      "https://objects.example.test/uploads/video.mp4?X-Amz-Credential=credential&X-Amz-Signature=top-secret-signature#fragment";

    const event = {
      type: undefined,
      user: { id: "member-1", email: "creator@example.test" },
      request: {
        method: "PUT",
        url: signedUrl,
        headers: { authorization: "Bearer super-secret-token" },
        cookies: { session: "private-session" },
        data: "private request body",
        query_string: "X-Amz-Signature=top-secret-signature",
      },
      message: `upload failed for creator@example.test at ${signedUrl}`,
      breadcrumbs: [
        {
          category: "fetch",
          message: `PUT ${signedUrl}`,
          data: {
            url: signedUrl,
            headers: { authorization: "Bearer super-secret-token" },
            requestBody: "private request body",
          },
        },
      ],
      extra: {
        email: "creator@example.test",
        token: "super-secret-token",
        uploadUrl: signedUrl,
      },
      contexts: {
        request: {
          headers: { cookie: "session=private-session" },
          url: signedUrl,
        },
      },
      sdkProcessingMetadata: {
        normalizedRequest: {
          headers: { cookie: "session=private-session" },
          url: signedUrl,
        },
      },
    } satisfies Event;

    const scrubbed = options.beforeSend(event);
    const serialized = JSON.stringify(scrubbed);

    expect(options.tracesSampleRate).toBe(0.25);
    expect(scrubbed?.user).toBeUndefined();
    expect(scrubbed?.request).toEqual({
      method: "PUT",
      url: "https://objects.example.test/uploads/video.mp4",
    });
    expect(scrubbed?.breadcrumbs?.[0]?.message).toBe(
      "PUT https://objects.example.test/uploads/video.mp4",
    );
    expect(serialized).not.toContain("X-Amz-");
    expect(serialized).not.toContain("top-secret-signature");
    expect(serialized).not.toContain("super-secret-token");
    expect(serialized).not.toContain("private-session");
    expect(serialized).not.toContain("private request body");
    expect(serialized).not.toContain("creator@example.test");

    const breadcrumb = options.beforeBreadcrumb({
      category: "http",
      data: { url: signedUrl, authorization: "Bearer super-secret-token" },
    });
    expect(breadcrumb?.data).toEqual({
      url: "https://objects.example.test/uploads/video.mp4",
    });
  });
});
