/** Session tokens are server-issued HttpOnly cookies, so the browser only requests logout. */

import { clearSessionHint } from "./sessionHint";

export async function removeTokens() {
  try {
    const { default: api } = await import("./api");
    await api.post("/auth/logout");
    clearSessionHint();
  } catch (cause) {
    throw new Error("The server did not confirm logout.", { cause });
  }
}
