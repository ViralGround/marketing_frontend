"use client";

/**
 * 시안4 공용 푸터 — 잉크 블록 + lowercase 디스플레이 워드마크 + 법적 링크.
 * 공개 페이지 전용(앱 내부는 layout/Footer 유지).
 */

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { trackEvent } from "@/lib/gtag";

export default function GroundFooter() {
  const { t } = useLang();

  const links = [
    { href: "/login", ko: "로그인", en: "log in" },
    { href: "/signup/creator", ko: "크리에이터 지원", en: "creator application" },
    { href: "/business", ko: "브랜드 문의", en: "for brands" },
    { href: "/terms", ko: "이용약관", en: "terms" },
    { href: "/privacy", ko: "개인정보처리방침", en: "privacy" },
  ];

  return (
    <footer className="bg-ink py-14 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-display text-[clamp(30px,4.5vw,56px)] lowercase leading-[0.85] tracking-[-0.04em]">
          viral<span className="text-violet-bright">ground</span>
        </p>
        <p className="mt-3 text-[15px] font-medium text-white/70">
          {t("한 편의 영상이 브랜드와 크리에이터의 성장이 되는 곳", "Where one video becomes growth for brands and creators.")}
        </p>

        {/* 법적 링크는 터치 타깃 44px 확보 (craft-floor states/targets) */}
        <nav className="mt-8 flex flex-wrap gap-x-6 border-t border-white/15 pt-4 text-[15px] font-semibold text-white/70">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => trackEvent("cta_click", { location: "ground_footer", target: link.href })}
              className="inline-flex min-h-11 items-center transition-colors hover:text-violet-bright"
            >
              {t(link.ko, link.en)}
            </Link>
          ))}
        </nav>

        {/* 대비 3.8→7.3:1, 12px 하한 (low-contrast · tiny-text) */}
        <div className="mt-6 flex flex-wrap justify-between gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-white/60">
          <span>ViralGround © {new Date().getFullYear()}</span>
          <span>AI SaaS / Managed beta / Creator film</span>
          <span>Seoul, Korea</span>
        </div>
      </div>
    </footer>
  );
}
