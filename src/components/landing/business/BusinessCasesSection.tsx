"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function BusinessCasesSection() {
  const ref = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="bg-surface py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            함께한 고객
          </span>
          <h2 className="mt-4 text-3xl font-bold text-foreground md:text-4xl">
            저희와 일하고 있는 브랜드
          </h2>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-5">
          <div className="md:col-span-3 rounded-2xl border border-line bg-section-alt p-8 md:p-10">
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                AI 서비스
              </span>
              <span className="text-xs text-muted">2개월 전 계약 · 현재 진행중</span>
            </div>
            <h3 className="text-2xl font-semibold text-foreground">
              인스타그램 마케팅 대행
            </h3>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              크리에이터 풀과 자체 소재 기획력을 결합해 첫 달부터 측정 가능한 KPI를 만들었습니다.
              CPM 효율, 인게이지먼트 레이트, 그리고 ROAS 까지 한 보고서에 담아 매주 공유합니다.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-6">
              <div>
                <p className="text-xs text-muted">평균 CPV</p>
                <p className="mt-1 text-xl font-bold text-foreground">4.16원</p>
              </div>
              <div>
                <p className="text-xs text-muted">최대 ROAS</p>
                <p className="mt-1 text-xl font-bold text-primary">924%</p>
              </div>
              <div>
                <p className="text-xs text-muted">단일 캠페인 뷰</p>
                <p className="mt-1 text-xl font-bold text-foreground">120만+</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 rounded-2xl border border-line bg-section-alt p-8">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              지표 해석
            </p>
            <ul className="mt-4 space-y-4 text-sm text-muted leading-relaxed">
              <li>
                <span className="font-semibold text-foreground">CPV 4.16원</span>{" "}
                — 1회 노출에 4원. 일반 캠페인(10~30원) 대비 압도적으로 낮은 단가.
              </li>
              <li>
                <span className="font-semibold text-foreground">EMV ≥ 3배</span>{" "}
                — 시장 평균 CPM 기준 1,440만 원 효과를 500만 원으로 달성.
              </li>
              <li>
                <span className="font-semibold text-foreground">높은 인게이지먼트</span>{" "}
                — 낮은 CPM 은 알고리즘 점수가 높았다는 신호. 좋아요·댓글·저장이 함께 따라왔다는 뜻.
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-faint">
          * 동종 업계 / 비공개 NDA 사유로 브랜드명은 상담 시 공유드립니다.
        </p>
      </div>
    </section>
  );
}
