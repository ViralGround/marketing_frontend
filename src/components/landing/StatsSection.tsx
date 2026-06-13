"use client";

import { useLang } from "@/lib/i18n";

// 모두 우리 실제 수치. 영어는 동일 값의 영문 표기.
const STATS = [
  { ko: "2만원", en: "₩20K", labelKo: "편당 기본급", labelEn: "Base per upload" },
  { ko: "250만원", en: "₩2.5M", labelKo: "최대 성과급 / 편", labelEn: "Max per video" },
  { ko: "0원", en: "₩0", labelKo: "가입비 · 수수료", labelEn: "No fees" },
];

/**
 * 히어로 하단에 살짝 겹치는 스탯 스트립(creator-hero 스타일). 라이트/다크 모두 대응(테마 토큰).
 */
export default function StatsSection() {
  const { lang, t } = useLang();

  return (
    <section className="relative z-20 -mt-10 px-6 md:-mt-14">
      <div className="mx-auto grid max-w-4xl grid-cols-3 divide-x divide-line overflow-hidden rounded-3xl border border-line bg-surface px-2 py-7 shadow-xl shadow-violet-950/5 dark:shadow-black/40 sm:py-8">
        {STATS.map((s) => (
          <div key={s.labelEn} className="px-3 text-center sm:px-6">
            <p className="text-3xl font-black tracking-tight text-violet-600 dark:text-violet-400 sm:text-4xl md:text-5xl">
              {lang === "en" ? s.en : s.ko}
            </p>
            <p className="mt-2 text-xs text-muted sm:text-sm">{t(s.labelKo, s.labelEn)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
