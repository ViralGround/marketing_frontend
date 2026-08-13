import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";
import { setGaUser } from "@/lib/gtag";
import type { UserRole } from "@/types";

export function useAuthInit() {
  const { isAuthenticated, setUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) return;

    let active = true;
    api.get("/auth/csrf")
      .then(() => api.get<{ id: number; email: string; name: string; role: UserRole }>("/auth/me"))
      .then(({ data }) => {
        if (!active) return;
        setUser(data);
        setGaUser(data.id, data.role);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [isAuthenticated, setUser]);
}
