"use client";

/**
 * 시안4 공용 상단바 — 모든 공개 페이지가 공유하는 내비게이션.
 * 라벨은 한국어(무엇인지 바로 읽히게), 시각 언어(고정·중앙 마크·언더라인·보라 칩)는
 * 시안4 관문의 topbar 문법을 그대로 확장한 것.
 * 관문(/)에서는 .vg4 스크롤 루프의 on-dark 가 색을 뒤집는다(mix-blend).
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { trackEvent } from "@/lib/gtag";
import "./groundchrome.css";

export default function GroundTopbar({ tone = "paper" }: { tone?: "paper" | "dark" }) {
  const pathname = usePathname();
  const { t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

  // 소프트 오픈 공개 범위: 결제 체인이 잠긴 동안 /creators·/campaigns는 내비에서 제외.
  const leftLinks = [
    { href: "/creator", label: t("크리에이터", "Creators") },
    { href: "/business", label: t("브랜드", "For Brands") },
  ];

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const mobileMenu = mobileMenuRef.current;
    const menuButton = menuButtonRef.current;
    document.body.style.overflow = "hidden";
    firstMobileLinkRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !mobileMenu) return;

      const focusable = Array.from(
        mobileMenu.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])",
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (mobileMenu?.contains(document.activeElement)) {
        menuButton?.focus();
      }
    };
  }, [menuOpen]);

  return (
    <>
      <header className={`vg-topbar${tone === "dark" ? " tone-dark" : ""}${menuOpen ? " menu-open" : ""}`}>
      <nav className="nav-left" aria-label="바로가기">
        {leftLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? "is-active" : undefined}
            onClick={() => trackEvent("cta_click", { location: "topbar", target: link.href })}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <Link className="brand" href="/" aria-label="ViralGround 홈으로">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/viral-ground-mark.png" alt="" aria-hidden="true" />
      </Link>

      <nav className="nav-right" aria-label="계정">
        <Link
          href="/login"
          onClick={() => trackEvent("cta_click", { location: "topbar", target: "login" })}
        >
          {t("로그인", "Log in")}
        </Link>
        <Link
          className="accent"
          href="/creator"
          onClick={() => trackEvent("cta_click", { location: "topbar", target: "join" })}
        >
          {t("시작하기", "Get started")}
        </Link>
      </nav>

      <button
        ref={menuButtonRef}
        type="button"
        className="mobile-menu-trigger"
        aria-expanded={menuOpen}
        aria-controls="ground-mobile-menu"
        aria-label={menuOpen ? t("메뉴 닫기", "Close menu") : t("메뉴 열기", "Open menu")}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>

      </header>

      {menuOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={mobileMenuRef}
            id="ground-mobile-menu"
            className="ground-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t("전체 메뉴", "Full menu")}
          >
            <nav aria-label={t("모바일 메뉴", "Mobile menu")}>
              {leftLinks.map((link, index) => (
                <Link
                  ref={index === 0 ? firstMobileLinkRef : undefined}
                  key={link.href}
                  href={link.href}
                  className={pathname === link.href ? "is-active" : undefined}
                  onClick={() => {
                    setMenuOpen(false);
                    trackEvent("cta_click", { location: "mobile_menu", target: link.href });
                  }}
                >
                  <span>{link.label}</span>
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              ))}
              <Link href="/login" onClick={() => {
                setMenuOpen(false);
                trackEvent("cta_click", { location: "mobile_menu", target: "login" });
              }}>
                <span>{t("로그인", "Log in")}</span>
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </nav>
            <div className="mobile-role-actions">
              <Link href="/business" onClick={() => setMenuOpen(false)}>{t("브랜드 베타 문의", "Brand beta")}</Link>
              <Link href="/creator" onClick={() => setMenuOpen(false)}>{t("크리에이터 지원", "Creator application")}</Link>
            </div>
            <p>ViralGround / Seoul / Managed beta</p>
          </div>,
          document.body,
        )}
    </>
  );
}
