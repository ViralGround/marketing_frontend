import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  return Cookies.get(ACCESS_TOKEN_KEY) || null;
}

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  Cookies.set(ACCESS_TOKEN_KEY, access, { path: "/" });
  Cookies.set(REFRESH_TOKEN_KEY, refresh, { path: "/" });
}

export function removeTokens() {
  accessToken = null;
  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
}

export function getRefreshToken(): string | null {
  return Cookies.get(REFRESH_TOKEN_KEY) || null;
}
