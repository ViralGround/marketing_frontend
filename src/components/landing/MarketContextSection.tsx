"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLang } from "@/lib/i18n";

// TODO: 실제 시장 수치로 교체(임시값).
const MARKET_STATS = [
  { ko: "3,000만+", en: "30M+", labelKo: "국내 숏폼 시청자", labelEn: "Short-form viewers in Korea" },
  { ko: "하루 1시간+", en: "1hr+/day", labelKo: "평균 시청 시간", labelEn: "Avg. daily watch time" },
  { ko: "매년 2배", en: "2x / year", labelKo: "브랜드 UGC 수요 성장", labelEn: "Brand UGC demand growth" },
];

export default function MarketContextSection() {
  const ref = useScrollAnimation<HTMLDivElement>();
  const { t } = useLang();

  return (
    <section className="bg-background py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-bold text-foreground md:text-4xl">
          {t("지금이 가장 좋은 타이밍이에요", "There has never been a better time")}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
          {t(
            "숏폼이 모든 브랜드의 핵심 채널이 됐습니다. 브랜드는 진짜 사용자가 만든 콘텐츠를 원하고, 그 수요는 매년 빠르게 커지고 있어요. 지금 시작하는 크리에이터에게 기회가 열려 있습니다.",
            "Short-form is now every brand's core channel. Brands want content made by real users, and that demand grows fast every year. The opportunity is wide open for creators who start now.",
          )}
        </p>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {MARKET_STATS.map((s) => (
            <div key={s.labelEn}>
              <p className="text-3xl font-black text-primary md:text-4xl">{t(s.ko, s.en)}</p>
              <p className="mt-2 text-sm text-muted">{t(s.labelKo, s.labelEn)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
