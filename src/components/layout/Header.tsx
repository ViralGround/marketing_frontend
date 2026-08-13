"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { removeTokens } from "@/lib/auth";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageToggle from "@/components/landing/LanguageToggle";
import { isLandingPath } from "@/lib/landingPaths";
import { useLang } from "@/lib/i18n";
import { clearGaUser, trackEvent } from "@/lib/gtag";
import type { UserRole } from "@/types";

/**
 * 앱 내부(로그인 영역·인증·법적 고지) 전용 헤더.
 * 공개 페이지(/,/business,/creator,/creators,/campaigns)는 시안4 공용
 * GroundTopbar 를 스스로 그리므로 여기서는 렌더하지 않는다.
 */

const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: "/admin/members",
  COMPANY: "/company/dashboard",
  CREATOR: "/creator/home",
};

const ROLE_MYPAGE: Record<UserRole, { href: string; ko: string; en: string }> = {
  ADMIN: { href: "/admin/dashboard", ko: "대시보드", en: "Dashboard" },
  COMPANY: { href: "/company/dashboard", ko: "마이페이지", en: "My Page" },
  CREATOR: { href: "/creator/mypage", ko: "마이페이지", en: "My Page" },
};

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const { t } = useLang();

  const handleLogout = async () => {
    trackEvent("logout", { role: user?.role ?? null });
    clearGaUser();
    await removeTokens();
    logout();
    setMenuOpen(false);
    router.push("/login");
  };

  const logoHref = isAuthenticated && user ? ROLE_HOME[user.role] : "/";

  // 공개 페이지는 시안4 GroundTopbar 가 chrome 을 담당한다.
  if (isLandingPath(pathname)) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/90 shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-4 md:px-10">
        {/* 좌측: 로고 */}
        <Link href={logoHref} aria-label="Viral Ground" className="inline-flex items-center gap-2.5">
          {/* 다크모드: 다크 마크를 흰색 실루엣으로 반전(brightness-0→invert). 이름은 텍스트로 병기. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/viral-ground-mark.png"
            alt=""
            aria-hidden="true"
            className="h-7 w-auto md:h-8 dark:brightness-0 dark:invert"
          />
          <span className="text-xl font-extrabold tracking-tight text-foreground md:text-2xl">
            Viral Ground
          </span>
        </Link>

        {/* 데스크탑 우측 nav */}
        <nav className="hidden items-center gap-3 lg:flex">
          {isAuthenticated && user ? (
            <>
              <Link
                href={ROLE_MYPAGE[user.role].href}
                className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-primary"
              >
                {t(ROLE_MYPAGE[user.role].ko, ROLE_MYPAGE[user.role].en)}
              </Link>
              <span className="text-sm text-muted">{user.name}</span>
              <button
                onClick={handleLogout}
                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                {t("로그아웃", "Log out")}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => trackEvent("cta_click", { location: "header", target: "login" })}
              className="rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              {t("로그인", "Log in")}
            </Link>
          )}
          <LanguageToggle />
          <ThemeToggle />
        </nav>

        {/* 모바일: 테마 + 햄버거 */}
        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={menuOpen}
            className="rounded-lg p-2 text-foreground transition-colors hover:text-primary"
          >
            {menuOpen ? (
              <X className="h-6 w-6" strokeWidth={2} />
            ) : (
              <Menu className="h-6 w-6" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 패널 */}
      {menuOpen && (
        <div className="border-t border-line bg-surface px-6 py-4 lg:hidden">
          <div className="mb-4 flex items-center justify-end">
            <LanguageToggle />
          </div>

          <div className="flex flex-col gap-2 border-t border-line pt-4">
            {isAuthenticated && user ? (
              <>
                <Link
                  href={ROLE_MYPAGE[user.role].href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-2 py-2.5 text-sm font-medium text-content-soft hover:bg-surface-muted hover:text-primary"
                >
                  {t(ROLE_MYPAGE[user.role].ko, ROLE_MYPAGE[user.role].en)}
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-lg px-2 py-2.5 text-left text-sm font-medium text-content-soft hover:bg-surface-muted hover:text-primary"
                >
                  {t("로그아웃", "Log out")}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => {
                  trackEvent("cta_click", { location: "header_mobile", target: "login" });
                  setMenuOpen(false);
                }}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-content-soft hover:bg-surface-muted hover:text-primary"
              >
                {t("로그인", "Log in")}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
