"use client";

import { useLang } from "@/lib/i18n";

// 모두 우리 실제 수치. 영어는 동일 값의 영문 표기.
const STATS = [
  { ko: "2만원", en: "₩20K", labelKo: "편당 기본급", labelEn: "Base per upload" },
  { ko: "250만원", en: "₩2.5M", labelKo: "최대 성과급 / 편", labelEn: "Max per video" },
  { ko: "0원", en: "₩0", labelKo: "가입비 · 수수료", labelEn: "No fees" },
];

export default function StatsSection() {
  const { lang, t } = useLang();

  return (
    <section className="border-y border-line bg-surface py-16">
      <div className="mx-auto grid max-w-3xl grid-cols-3 gap-6 px-6 sm:gap-8">
        {STATS.map((s) => (
          <div key={s.labelEn} className="text-center">
            <p className="text-3xl font-black tracking-tight text-primary sm:text-4xl md:text-5xl">
              {lang === "en" ? s.en : s.ko}
            </p>
            <p className="mt-2 text-xs text-muted sm:text-sm">{t(s.labelKo, s.labelEn)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
