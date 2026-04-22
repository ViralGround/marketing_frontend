import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "access_token";

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  return Cookies.get(ACCESS_TOKEN_KEY) || null;
}

export function setTokens(access: string) {
  accessToken = access;
  Cookies.set(ACCESS_TOKEN_KEY, access, { path: "/" });
}

export function removeTokens() {
  accessToken = null;
  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
  Cookies.remove("refresh_token", { path: "/" });
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
