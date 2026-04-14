"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { removeTokens } from "@/lib/auth";

export default function LandingHeader() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = () => {
    removeTokens();
    logout();
    router.push("/login");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-primary">
          Viral Ground
        </Link>
        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href={
                  user?.role === "ADMIN"
                    ? "/admin/members"
                    : user?.role === "COMPANY"
                      ? "/company/dashboard"
                      : "/creator/dashboard"
                }
                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                대시보드
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/signup/creator"
                className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
              >
                시작하기
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
