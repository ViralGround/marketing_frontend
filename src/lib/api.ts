import axios from "axios";
import Cookies from "js-cookie";
import { isProtectedAppPath } from "@/lib/protectedPaths";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const csrf = Cookies.get("XSRF-TOKEN");
  if (csrf) {
    config.headers["X-XSRF-TOKEN"] = csrf;
  }
  return config;
});

let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as typeof error.config & { _retried?: boolean };
    const isRefreshEndpoint = original?.url === "/auth/refresh";
    const isLoginEndpoint = original?.url === "/auth/login";
    if (error.response?.status === 401 && !original?._retried && !isRefreshEndpoint && !isLoginEndpoint) {
      original._retried = true;
      try {
        refreshPromise ??= api.post("/auth/refresh").then(() => undefined).finally(() => {
          refreshPromise = null;
        });
        await refreshPromise;
        return api.request(original);
      } catch {
        // Refresh cookie is invalid or expired. Fall through to the login redirect.
      }
      if (
        typeof window !== "undefined" &&
        isProtectedAppPath(window.location.pathname)
      ) {
        const returnPath = `${window.location.pathname}${window.location.search}`;
        // Public landing/auth pages also probe /auth/me. Never reload those pages when a
        // stale local refresh cookie is rejected; only protected app routes need redirecting.
        window.location.replace(`/login?redirect=${encodeURIComponent(returnPath)}`);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
