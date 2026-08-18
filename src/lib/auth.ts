/** Session tokens are server-issued HttpOnly cookies, so the browser only requests logout. */

import { clearSessionHint } from "./sessionHint";

export async function removeTokens() {
  clearSessionHint();
  try {
    const { default: api } = await import("./api");
    await api.post("/auth/logout");
  } catch {
    // Navigation still proceeds; server-side expiry remains authoritative.
  }
}
