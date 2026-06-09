"use client";

import { useLang } from "@/lib/i18n";

/**
 * 랜딩 전용 한국어/영어 토글. 선택은 쿠키로 유지된다.
 * 데스크탑 헤더 우측·모바일 메뉴에서 사용.
 */
export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();

  const base = "rounded-full px-3 py-1 text-xs font-semibold transition-colors";
  const active = "bg-surface text-foreground shadow-sm";
  const inactive = "text-muted hover:text-foreground";

  return (
    <div className={`inline-flex items-center rounded-full bg-surface-chip p-0.5 ${className}`}>
      <button
        type="button"
        onClick={() => setLang("ko")}
        aria-pressed={lang === "ko"}
        className={`${base} ${lang === "ko" ? active : inactive}`}
      >
        한국어
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`${base} ${lang === "en" ? active : inactive}`}
      >
        EN
      </button>
    </div>
  );
}
