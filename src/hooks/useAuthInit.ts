import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getAccessToken } from "@/lib/auth";

export function useAuthInit() {
  const { isAuthenticated, setUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) return;

    const token = getAccessToken();
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({
        id: Number(payload.sub),
        email: payload.email,
        name: payload.email,
        role: payload.role,
      });
    } catch {
      // 토큰이 손상된 경우 무시 — middleware와 API 인터셉터가 처리
    }
  }, [isAuthenticated, setUser]);
}
