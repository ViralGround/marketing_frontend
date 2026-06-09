"use client";

import Badge from "@/components/ui/Badge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLang } from "@/lib/i18n";

export default function BusinessPerformanceSection() {
  const ref = useScrollAnimation<HTMLDivElement>();
  const { t } = useLang();

  return (
    <section className="bg-section-alt py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <Badge>{t("직전 마케팅 성과", "Latest campaign results")}</Badge>
          <h2 className="mt-4 text-3xl font-bold text-foreground md:text-4xl">
            {t("결과는 숫자로 증명합니다", "Results proven in numbers")}
          </h2>
          <p className="mt-3 text-muted">
            {t("한 캠페인 기준 실제 운영 데이터", "Real operating data from a single campaign")}
          </p>
        </div>

        {/* 핵심 메트릭 3개 — 사용자 강조 항목 */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-line bg-surface p-7 shadow-sm">
            <p className="text-sm text-muted">{t("최대 ROAS", "Max ROAS")}</p>
            <p className="mt-3 text-6xl font-black tracking-tight text-primary md:text-7xl">
              924<span className="text-3xl font-bold text-muted">%</span>
            </p>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              {t(
                "광고비 대비 매출. 마케팅의 최종 목적지를",
                "Revenue against ad spend — the most direct proof",
              )}
              <br />
              {t("가장 직접적으로 증명하는 지표입니다.", "of where marketing ultimately leads.")}
            </p>
          </div>

          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary to-primary-dark p-7 text-white shadow-lg lg:-translate-y-4">
            <p className="text-sm text-white/80">{t("CPV · 조회당 비용", "CPV · cost per view")}</p>
            <p className="mt-3 text-6xl font-black tracking-tight md:text-7xl">
              {t("4.16", "₩4.16")}<span className="text-3xl font-bold text-white/80">{t("원", "")}</span>
            </p>
            <p className="mt-3 text-sm text-white/80 leading-relaxed">
              {t("일반 영상 캠페인 ", "Up to ")}<s className="text-white/60">{t("10~30원", "₩10–30")}</s>{t(" 대비", " — ")}
              <br />
              {t("최대 ", "")}<b>{t("7배 이상 효율적", "7× more efficient")}</b>{t("인 단가입니다.", " than a typical video campaign.")}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-7 shadow-sm">
            <p className="text-sm text-muted">{t("캠페인 조회수", "Campaign views")}</p>
            <p className="mt-3 text-6xl font-black tracking-tight text-foreground md:text-7xl">
              {t("120", "1.2")}<span className="text-3xl font-bold text-muted">{t("만", "M")}</span>
            </p>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              {t("시장 평균 CPM 기준으로는", "At the market-average CPM, that reach")}
              <br />
              <b>{t("약 3배 예산이 필요한 노출량", "would normally cost about 3× the budget")}</b>{t("입니다.", ".")}
            </p>
          </div>
        </div>

        {/* 한 줄 요약 보고용 멘트 */}
        <div className="mt-12 rounded-2xl border border-line bg-surface p-8 md:p-10">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            {t("한 줄 요약 · 보고용", "One-line summary · for reporting")}
          </p>
          <p className="mt-3 text-lg text-foreground leading-relaxed md:text-xl">
            {t("“단일 캠페인에서 120만 뷰를 달성, 시장 평균 대비", "“A single campaign hit 1.2M views with an ultra-efficient")}
            <span className="font-semibold text-primary">
              {t(" 50% 이상 저렴한 CPM 4,160원선 (CPV 4.16원)", " CPM of about ₩4,160 (CPV ₩4.16) — over 50% below the market average")}</span>
            {t("의 초고효율 성과를 기록하며 브랜드 인지도를 폭발적으로 확장했습니다.”", ", explosively expanding brand awareness.”")}
          </p>
        </div>
      </div>
    </section>
  );
}
