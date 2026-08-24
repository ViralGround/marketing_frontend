import { test } from "@playwright/test";

import { requireMutationGate, verifyStagingRelease } from "./support";

test("approved release exposes the exact sanitized mutation safety contract", async () => {
  requireMutationGate();
  await verifyStagingRelease();
});
