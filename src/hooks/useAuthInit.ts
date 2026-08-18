import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";
import { setGaUser } from "@/lib/gtag";
import { clearSessionHint, hasSessionHint, setSessionHint } from "@/lib/sessionHint";
import type { UserRole } from "@/types";

export function useAuthInit() {
  const { isAuthenticated, setUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) return;
    // 세션 힌트가 없으면 익명 방문 — 공개 페이지마다 나가던 csrf→me→refresh
    // 3연타를 건너뛴다. 보호 경로 인증은 AuthGuard가 따로 수행한다.
    if (!hasSessionHint()) return;

    let active = true;
    api.get("/auth/csrf")
      .then(() => api.get<{ id: number; email: string; name: string; role: UserRole }>("/auth/me"))
      .then(({ data }) => {
        if (!active) return;
        setUser(data);
        setGaUser(data.id, data.role);
        setSessionHint();
      })
      .catch(() => {
        // 세션이 죽었으면 힌트도 지워 다음 방문부터 조용히 익명으로 돈다.
        if (active) clearSessionHint();
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated, setUser]);
}
