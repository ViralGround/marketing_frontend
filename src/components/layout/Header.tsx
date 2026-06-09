"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { removeTokens } from "@/lib/auth";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageToggle from "@/components/landing/LanguageToggle";
import BookACallButton from "@/components/landing/BookACallButton";
import { isLandingPath } from "@/lib/landingPaths";
import { useLang } from "@/lib/i18n";
import { clearGaUser, trackEvent } from "@/lib/gtag";
import type { UserRole } from "@/types";

/**
 * 사이트 전역 단일 헤더 (SSOT).
 * - 데스크탑(lg+): 좌측 로고+토글, 우측 인라인 nav.
 * - 모바일(<lg): 로고 + 테마 + 햄버거. 햄버거 메뉴에 토글·섹션 바로가기·인증 메뉴.
 * - 한국어/영어 토글은 모든 페이지에 노출(기본 한국어, 선택은 쿠키로 유지).
 * - Book a Call(Calendly)은 크리에이터 랜딩 한정.
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

function RoleToggle({
  isBusiness,
  onNavigate,
}: {
  isBusiness: boolean;
  onNavigate?: () => void;
}) {
  // 라벨은 영어 모드에서만 For Brands/For Creators 로 표기(기본 한국어).
  const { t } = useLang();
  const baseTab = "rounded-full px-4 py-1.5 text-sm font-medium transition-colors";
  const activeTab = "bg-surface text-foreground shadow-sm";
  const inactiveTab = "text-muted hover:text-foreground";

  return (
    <div className="flex items-center rounded-full bg-surface-chip p-1">
      <Link
        href="/business"
        onClick={onNavigate}
        className={`${baseTab} ${isBusiness ? activeTab : inactiveTab}`}
      >
        {t("기업", "For Brands")}
      </Link>
      <Link
        href="/"
        onClick={onNavigate}
        className={`${baseTab} ${!isBusiness ? activeTab : inactiveTab}`}
      >
        {t("크리에이터", "For Creators")}
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
  const isCreatorLanding = onLanding && !isBusiness;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { t } = useLang();

  const handleLogout = () => {
    trackEvent("logout", { role: user?.role ?? null });
    clearGaUser();
    removeTokens();
    logout();
    setMenuOpen(false);
    router.push("/login");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const logoHref = isAuthenticated && user ? ROLE_HOME[user.role] : "/";
  const signupHref = isBusiness ? "/signup/company" : "/signup/creator";

  // 랜딩 섹션 바로가기 — 클릭 시 해당 섹션으로 부드럽게 스크롤. (각 섹션 id 는 page.tsx 에서 부여)
  const sectionLinks = isBusiness
    ? [
        { href: "#performance", label: t("성과", "Performance") },
        { href: "#features", label: t("기능", "Features") },
        { href: "#cases", label: t("사례", "Cases") },
      ]
    : [
        { href: "#results", label: t("성과", "Results") },
        { href: "#earnings", label: t("수익 계산", "Earnings") },
        { href: "#faq", label: t("FAQ", "FAQ") },
      ];

  const scrollToSection = (href: string) => {
    // 모바일: 메뉴를 먼저 닫고, 리렌더로 패널이 사라져 레이아웃이 정리된 다음 스크롤해야
    // 스크롤이 중간에 끊기지 않는다. (메뉴가 없는 데스크탑에도 무해)
    setMenuOpen(false);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      }),
    );
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled || !onLanding || menuOpen
          ? "border-b border-line bg-surface/90 shadow-sm backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-4 md:px-10">
        {/* 좌측: 로고 + (랜딩·데스크탑) 토글 */}
        <div className="flex items-center gap-4">
          <Link
            href={logoHref}
            className="text-2xl font-extrabold tracking-tight text-primary md:text-3xl"
          >
            Viral Ground
          </Link>
          {onLanding && (
            <div className="hidden lg:block">
              <RoleToggle isBusiness={isBusiness} />
            </div>
          )}
        </div>

        {/* 데스크탑 우측 nav */}
        <nav className="hidden items-center gap-3 lg:flex">
          {onLanding && !isAuthenticated && (
            <div className="mr-1 flex items-center gap-0.5">
              {sectionLinks.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(s.href);
                  }}
                  className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-primary"
                >
                  {s.label}
                </a>
              ))}
            </div>
          )}
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
              <LanguageToggle />
              <ThemeToggle />
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => trackEvent("cta_click", { location: "header", target: "login" })}
                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                {t("로그인", "Log in")}
              </Link>
              {isCreatorLanding && (
                <BookACallButton
                  location="header"
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                >
                  {t("무료 상담 예약", "Book a Call")}
                </BookACallButton>
              )}
              {onLanding && isBusiness && (
                <Link
                  href={signupHref}
                  onClick={() =>
                    trackEvent("cta_click", { location: "header", target: "signup_company" })
                  }
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                >
                  {t("기업 가입", "Sign up")}
                </Link>
              )}
              <LanguageToggle />
              <ThemeToggle />
            </>
          )}
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
          <div className="mb-4 flex items-center justify-between gap-2">
            {onLanding && (
              <RoleToggle isBusiness={isBusiness} onNavigate={() => setMenuOpen(false)} />
            )}
            <LanguageToggle className="ml-auto" />
          </div>

          {onLanding && !isAuthenticated && (
            <div className="flex flex-col">
              {sectionLinks.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(s.href);
                  }}
                  className="rounded-lg px-2 py-2.5 text-sm font-medium text-content-soft transition-colors hover:bg-surface-muted hover:text-primary"
                >
                  {s.label}
                </a>
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-col gap-2 border-t border-line pt-4">
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
              <>
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
                {isCreatorLanding && (
                  <BookACallButton
                    location="header_mobile"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-dark"
                  >
                    {t("무료 상담 예약", "Book a Call")}
                  </BookACallButton>
                )}
                {onLanding && isBusiness && (
                  <Link
                    href={signupHref}
                    onClick={() => {
                      trackEvent("cta_click", {
                        location: "header_mobile",
                        target: "signup_company",
                      });
                      setMenuOpen(false);
                    }}
                    className="rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-dark"
                  >
                    {t("기업 가입", "Sign up")}
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
