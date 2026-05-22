"use client";

import Badge from "@/components/ui/Badge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function BusinessPerformanceSection() {
  const ref = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="bg-section-alt py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <Badge>직전 마케팅 성과</Badge>
          <h2 className="mt-4 text-3xl font-bold text-foreground md:text-4xl">
            예산 500만 원, 결과는 숫자로 말합니다
          </h2>
          <p className="mt-3 text-muted">
            한 캠페인 기준 실제 운영 데이터
          </p>
        </div>

        {/* 핵심 메트릭 3개 — 사용자 강조 항목 */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-line bg-surface p-7 shadow-sm">
            <p className="text-sm text-muted">최대 ROAS</p>
            <p className="mt-3 text-6xl font-black tracking-tight text-primary md:text-7xl">
              924<span className="text-3xl font-bold text-muted">%</span>
            </p>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              광고비 대비 매출. 마케팅의 최종 목적지를
              <br />
              가장 직접적으로 증명하는 지표입니다.
            </p>
          </div>

          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary to-primary-dark p-7 text-white shadow-lg lg:-translate-y-4">
            <p className="text-sm text-white/80">CPV · 조회당 비용</p>
            <p className="mt-3 text-6xl font-black tracking-tight md:text-7xl">
              4.16<span className="text-3xl font-bold text-white/80">원</span>
            </p>
            <p className="mt-3 text-sm text-white/80 leading-relaxed">
              일반 영상 캠페인 <s className="text-white/60">10~30원</s> 대비
              <br />
              최대 <b>7배 이상 효율적</b>인 단가입니다.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-7 shadow-sm">
            <p className="text-sm text-muted">캠페인 조회수</p>
            <p className="mt-3 text-6xl font-black tracking-tight text-foreground md:text-7xl">
              120<span className="text-3xl font-bold text-muted">만</span>
            </p>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              500만 원 예산으로 달성. 평균 CPM 기준으로는
              <br />
              1,440만 원 예산이 필요한 노출입니다.
            </p>
          </div>
        </div>

        {/* 한 줄 요약 보고용 멘트 */}
        <div className="mt-12 rounded-2xl border border-line bg-surface p-8 md:p-10">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            한 줄 요약 · 보고용
          </p>
          <p className="mt-3 text-lg text-foreground leading-relaxed md:text-xl">
            “예산 500만 원으로 120만 뷰를 달성, 시장 평균 대비
            <span className="font-semibold text-primary"> 50% 이상 저렴한 CPM 4,160원선
              (CPV 4.16원)</span>
            의 초고효율 성과를 기록하며 브랜드 인지도를 폭발적으로 확장했습니다.”
          </p>
        </div>
      </div>
    </section>
  );
}
