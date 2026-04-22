"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { decodeJwtPayload, getAccessToken, removeTokens } from "@/lib/auth";
import { useAuthStore } from "@/store/useAuthStore";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    const check = () => {
      const token = getAccessToken();
      const payload = token ? decodeJwtPayload<{ exp?: number }>(token) : null;
      const valid = !!payload?.exp && Date.now() / 1000 <= payload.exp;
      if (!valid) {
        removeTokens();
        logout();
        router.replace("/login");
      }
    };
    check();
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) check();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [router, logout]);

  return <>{children}</>;
}
