"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { removeTokens } from "@/lib/auth";
import ThemeToggle from "@/components/ui/ThemeToggle";

function RoleToggle() {
  const pathname = usePathname();
  const isBusiness = pathname?.startsWith("/business") ?? false;

  const baseTab =
    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors";
  const activeTab = "bg-surface text-foreground shadow-sm";
  const inactiveTab = "text-muted hover:text-foreground";

  return (
    <div className="flex items-center rounded-full bg-surface-chip p-1">
      <Link href="/business" className={`${baseTab} ${isBusiness ? activeTab : inactiveTab}`}>
        기업
      </Link>
      <Link href="/" className={`${baseTab} ${!isBusiness ? activeTab : inactiveTab}`}>
        크리에이터
      </Link>
    </div>
  );
}

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
          ? "bg-surface/90 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-primary">
            Viral Ground
          </Link>
          <RoleToggle />
        </div>
        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href={user?.role === "ADMIN" ? "/admin/members" : "/creator/home"}
                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {user?.role === "ADMIN" ? "관리자" : "홈"}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
              >
                로그아웃
              </button>
              <ThemeToggle />
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
              <ThemeToggle />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
