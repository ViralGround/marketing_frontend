"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { removeTokens } from "@/lib/auth";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { isLandingPath } from "@/lib/landingPaths";
import type { UserRole } from "@/types";

/**
 * 사이트 전역 단일 헤더 (SSOT).
 * - 모든 페이지에서 동일한 시각·여백·로고 톤. 디자인 변경은 이 파일 한 곳에서만.
 * - 좌측: 로고 + (랜딩 경로에서만) 기업/크리에이터 토글
 * - 우측: 인증 상태·역할 기반 nav
 * - sticky 로 자연스러운 docflow 유지 — fixed 가 콘텐츠 가리던 문제 해결.
 */

const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: "/admin/members",
  COMPANY: "/company/dashboard",
  CREATOR: "/creator/home",
};

const ROLE_MYPAGE: Record<UserRole, { href: string; label: string }> = {
  ADMIN: { href: "/admin/dashboard", label: "대시보드" },
  COMPANY: { href: "/company/dashboard", label: "마이페이지" },
  CREATOR: { href: "/creator/mypage", label: "마이페이지" },
};

function RoleToggle({ isBusiness }: { isBusiness: boolean }) {
  const baseTab = "rounded-full px-4 py-1.5 text-sm font-medium transition-colors";
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

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const onLanding = isLandingPath(pathname);
  const isBusiness = pathname?.startsWith("/business") ?? false;
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

  const logoHref = isAuthenticated && user ? ROLE_HOME[user.role] : "/";
  const signupHref = isBusiness ? "/signup/company" : "/signup/creator";
  const signupLabel = isBusiness ? "기업 가입" : "시작하기";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled || !onLanding
          ? "bg-surface/90 backdrop-blur-md shadow-sm border-b border-line"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-4 md:px-10">
        {/* 좌측: 로고 + (랜딩만) 토글 */}
        <div className="flex items-center gap-4">
          <Link
            href={logoHref}
            className="text-2xl font-extrabold tracking-tight text-primary md:text-3xl"
          >
            Viral Ground
          </Link>
          {onLanding && <RoleToggle isBusiness={isBusiness} />}
        </div>

        {/* 우측: 인증·역할별 nav */}
        <nav className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <Link
                href={ROLE_MYPAGE[user.role].href}
                className="hidden sm:inline-block rounded-lg px-3 py-2 text-sm text-muted hover:text-primary transition-colors"
              >
                {ROLE_MYPAGE[user.role].label}
              </Link>
              <span className="hidden md:inline text-sm text-muted">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
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
              {onLanding && (
                <Link
                  href={signupHref}
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
                >
                  {signupLabel}
                </Link>
              )}
              <ThemeToggle />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
