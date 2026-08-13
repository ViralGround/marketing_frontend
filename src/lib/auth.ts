/**
 * Session tokens are server-issued HttpOnly cookies. JavaScript intentionally cannot read or
 * persist them. These compatibility functions remain while screens migrate to `/auth/me`.
 */
export function getAccessToken(): null {
  return null;
}

export function setTokens(access?: string) {
  void access;
  // No-op by design: the backend owns the HttpOnly session cookie.
}

export async function removeTokens() {
  try {
    const { default: api } = await import("./api");
    await api.post("/auth/logout");
  } catch {
    // Navigation still proceeds; server-side expiry remains authoritative.
  }
}

export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    const normalized = base64.replace(/-/g, "+").replace(/_/g, "/");
    const pad = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
    const binary =
      typeof atob === "function"
        ? atob(normalized + pad)
        : Buffer.from(normalized + pad, "base64").toString("binary");
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder("utf-8").decode(bytes);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
