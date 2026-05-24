"use client";

import { BarChart3, PlusCircle, TrendingUp, ArrowRight, ArrowDown } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function RewardTableSection() {
  const ref = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="bg-section-alt py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-5xl px-6">
        {/* 헤더 */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <BarChart3 className="h-4 w-4" strokeWidth={2.5} />
            영상 1편당 조회수별 성과급
          </div>
          <h2 className="mt-5 text-3xl font-bold text-foreground md:text-4xl">
            조회수가 곧 보상입니다
          </h2>
          <p className="mt-4 text-muted">
            조회수가 늘어날수록 한 편당 단가도 함께 올라갑니다
          </p>
        </div>

        {/* 범위 요약 카드 */}
        <div className="relative mt-12 overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* 최소 */}
            <div className="flex flex-col items-center justify-center p-8 text-center md:p-12">
              <p className="text-xs font-bold uppercase tracking-widest text-faint">
                최소
              </p>
              <p className="mt-3 text-5xl font-black tracking-tight text-foreground md:text-6xl">
                2만원
                <span className="text-lg font-bold text-muted"> / 편</span>
              </p>
              <p className="mt-3 text-sm text-muted">
                1천뷰부터 적용
              </p>
            </div>

            {/* 최대 */}
            <div className="relative flex flex-col items-center justify-center border-t border-line bg-primary/5 p-8 text-center md:border-t-0 md:border-l md:p-12">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                최대
              </p>
              <p className="mt-3 text-5xl font-black tracking-tight text-primary md:text-6xl">
                250만원
                <span className="text-lg font-bold text-primary/70"> / 편</span>
              </p>
              <p className="mt-3 text-sm text-muted">
                500만뷰 이상 달성 시
              </p>
            </div>
          </div>

          {/* 중앙 화살표 — 두 칸 경계 위에 띄움 */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-primary shadow-md">
            <ArrowDown className="h-5 w-5 md:hidden" strokeWidth={2.5} />
            <ArrowRight className="hidden h-5 w-5 md:block" strokeWidth={2.5} />
          </div>

          {/* 하단 설명 바 */}
          <div className="flex items-center gap-3 border-t border-line bg-section-alt px-6 py-5 md:px-10">
            <TrendingUp className="h-5 w-5 flex-shrink-0 text-primary" strokeWidth={2.5} />
            <p className="text-sm text-muted leading-relaxed">
              조회수 구간이 올라갈수록 한 편당 성과급도 단계별로 상승합니다.
              구체 금액은 캠페인 매칭 시 안내드립니다.
            </p>
          </div>
        </div>

        {/* 제작지원금 별도 강조 카드 */}
        <div className="mt-6 flex items-start gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-6 md:p-7">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <PlusCircle className="h-6 w-6" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">
              제작지원금 별도 지급
            </p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
              20,000원 <span className="text-base font-bold text-muted">/ 편</span>
            </p>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              영상 1편 업로드(포스팅)만 해도 추가 지원 — 위 성과급과 완전히 별개로 지급됩니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
