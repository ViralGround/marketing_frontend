import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { decodeJwtPayload, getAccessToken, removeTokens } from "@/lib/auth";
import type { UserRole } from "@/types";

interface JwtPayload {
  sub: string;
  email: string;
  name?: string;
  role: UserRole;
  exp?: number;
}

export function useAuthInit() {
  const { isAuthenticated, setUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) return;

    const token = getAccessToken();
    if (!token) return;

    const payload = decodeJwtPayload<JwtPayload>(token);
    if (!payload || !payload.sub || !payload.role) {
      removeTokens();
      return;
    }
    if (!payload.exp || Date.now() / 1000 > payload.exp) {
      removeTokens();
      return;
    }

    setUser({
      id: Number(payload.sub),
      email: payload.email,
      name: payload.name ?? payload.email,
      role: payload.role,
    });
  }, [isAuthenticated, setUser]);
}
