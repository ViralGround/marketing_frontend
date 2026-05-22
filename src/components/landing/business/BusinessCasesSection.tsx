"use client";

import Badge from "@/components/ui/Badge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function BusinessCasesSection() {
  const ref = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="bg-surface py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <Badge>함께한 고객</Badge>
          <h2 className="mt-4 text-3xl font-bold text-foreground md:text-4xl">
            저희와 일하고 있는 브랜드
          </h2>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-5">
          <div className="md:col-span-3 rounded-2xl border border-line bg-section-alt p-8 md:p-10">
            <div className="mb-4 flex items-center gap-2">
              <Badge>AI 서비스</Badge>
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
                <p className="mt-1 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                  4.16<span className="text-base font-bold text-muted">원</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">최대 ROAS</p>
                <p className="mt-1 text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
                  924<span className="text-base font-bold text-muted">%</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">단일 캠페인 뷰</p>
                <p className="mt-1 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                  120<span className="text-base font-bold text-muted">만+</span>
                </p>
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
                — 시장 평균 CPM 기준 환산 시 3배 이상의 노출 효과.
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
