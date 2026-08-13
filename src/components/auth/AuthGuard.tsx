"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const setUser = useAuthStore((s) => s.setUser);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      setChecking(true);
      try {
        await api.get("/auth/csrf");
        const { data } = await api.get<{ id: number; email: string; name: string; role: "CREATOR" | "COMPANY" | "ADMIN" }>("/auth/me");
        setUser(data);
      } catch {
        logout();
        router.replace("/login");
      } finally {
        setChecking(false);
      }
    };
    check();
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) check();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [router, logout, setUser]);

  if (checking) return <div className="min-h-screen bg-background" aria-busy="true" aria-label="세션 확인 중" />;
  return <>{children}</>;
}
