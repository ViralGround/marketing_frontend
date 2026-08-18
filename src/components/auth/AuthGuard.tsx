"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

type Role = "CREATOR" | "COMPANY" | "ADMIN";

const HOME_BY_ROLE: Record<Role, string> = {
  CREATOR: "/creator/dashboard",
  COMPANY: "/company/dashboard",
  ADMIN: "/admin/members",
};

/**
 * 보호 화면 공용 가드.
 * - 세션 검증 실패 시 원래 경로를 redirect 파라미터로 보존해 로그인으로 보낸다.
 * - requiredRole 이 주어지면 역할까지 검증한다 — 미들웨어는 만료 토큰 + refresh
 *   쿠키 조합에서 역할을 판정할 수 없으므로(프록시 주석 참조) 여기서 확정한다.
 */
export function AuthGuard({ children, requiredRole }: { children: ReactNode; requiredRole?: Role }) {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const setUser = useAuthStore((s) => s.setUser);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      setChecking(true);
      try {
        await api.get("/auth/csrf");
        const { data } = await api.get<{ id: number; email: string; name: string; role: Role }>("/auth/me");
        if (cancelled) return;
        if (requiredRole && data.role !== requiredRole) {
          router.replace(HOME_BY_ROLE[data.role] ?? "/");
          return;
        }
        setUser(data);
        setChecking(false);
      } catch {
        if (cancelled) return;
        logout();
        router.replace(`/login?redirect=${encodeURIComponent(pathname ?? "/")}`);
      }
    };
    check();
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) check();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => {
      cancelled = true;
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [router, pathname, logout, setUser, requiredRole]);

  if (checking) return <div className="min-h-screen bg-background" aria-busy="true" aria-label="세션 확인 중" />;
  return <>{children}</>;
}
