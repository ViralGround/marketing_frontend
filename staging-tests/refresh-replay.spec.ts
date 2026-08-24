import { expect, request as playwrightRequest, test, type APIRequestContext } from "@playwright/test";

import {
  API_ORIGIN,
  FRONTEND_ORIGIN,
  assertError,
  createAuthenticatedContext,
  mutate,
  requiredEnv,
  requireMutationGate,
  verifyStagingRelease,
} from "./support";

test("concurrent refresh replay revokes the rotated token family", async () => {
  requireMutationGate();
  await verifyStagingRelease();

  const credentials = {
    email: requiredEnv("STAGING_REFRESH_EMAIL"),
    password: requiredEnv("STAGING_REFRESH_PASSWORD"),
  };
  const loginSession = await createAuthenticatedContext(credentials);
  let left: APIRequestContext | undefined;
  let right: APIRequestContext | undefined;
  try {
    const initialState = await loginSession.context.storageState();
    left = await playwrightRequest.newContext({
      baseURL: API_ORIGIN,
      extraHTTPHeaders: { Origin: FRONTEND_ORIGIN },
      storageState: initialState,
    });
    right = await playwrightRequest.newContext({
      baseURL: API_ORIGIN,
      extraHTTPHeaders: { Origin: FRONTEND_ORIGIN },
      storageState: initialState,
    });

    const responses = await Promise.all([
      mutate(left, "POST", "/auth/refresh", loginSession.csrf),
      mutate(right, "POST", "/auth/refresh", loginSession.csrf),
    ]);
    expect(responses.map((response) => response.status()).sort((a, b) => a - b)).toEqual([
      204, 400,
    ]);

    const rejectedIndex = responses.findIndex((response) => response.status() === 400);
    await assertError(
      responses[rejectedIndex],
      400,
      "INVALID_TOKEN",
      "concurrent refresh replay",
    );

    const winner = responses[0].status() === 204 ? left : right;
    await assertError(
      await mutate(winner, "POST", "/auth/refresh", loginSession.csrf),
      400,
      "INVALID_TOKEN",
      "rotated child after family revocation",
    );
  } finally {
    await Promise.allSettled([
      left?.dispose(),
      right?.dispose(),
      loginSession.context.dispose(),
    ]);
  }
});
