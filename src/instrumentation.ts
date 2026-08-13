import * as Sentry from "@sentry/nextjs";
import type { Instrumentation } from "next";

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

function pathWithoutQueryOrHash(path: string): string {
  const boundary = path.search(/[?#]/);
  return boundary >= 0 ? path.slice(0, boundary) : path;
}

export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context,
) => {
  Sentry.captureRequestError(
    error,
    {
      method: request.method,
      path: pathWithoutQueryOrHash(request.path),
      // captureRequestError normally stores these in SDK processing metadata.
      // Pass an empty object so secrets never enter the Sentry pipeline.
      headers: {},
    },
    context,
  );
};
