import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { decodeJwtPayload, getAccessToken } from "@/lib/auth";
import type { UserRole } from "@/types";

interface JwtPayload {
  sub: string;
  email: string;
  name?: string;
  role: UserRole;
}

export function useAuthInit() {
  const { isAuthenticated, setUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) return;

    const token = getAccessToken();
    if (!token) return;

    const payload = decodeJwtPayload<JwtPayload>(token);
    if (!payload) return;

    setUser({
      id: Number(payload.sub),
      email: payload.email,
      name: payload.name ?? payload.email,
      role: payload.role,
    });
  }, [isAuthenticated, setUser]);
}
