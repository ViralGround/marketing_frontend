"use client";

import { Receipt, Wallet, TrendingUp, CalendarCheck } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function SettlementExampleSection() {
  const ref = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="bg-surface py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-4xl px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Receipt className="h-4 w-4" strokeWidth={2.5} />
            정산 안내
          </div>
          <h2 className="mt-5 text-3xl font-bold text-foreground md:text-4xl">
            정산은 이렇게 이뤄집니다
          </h2>
          <p className="mt-4 text-muted">
            기본급, 성과급, 제작지원금이 합산되어 한 번에 지급됩니다
          </p>
        </div>

        {/* 명세서 카드 */}
        <div className="mt-12 overflow-hidden rounded-3xl border border-line bg-section-alt shadow-sm">
          {/* 명세서 헤더 */}
          <div className="flex items-center justify-between border-b border-dashed border-line bg-surface px-6 py-5 md:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-faint">
                Settlement
              </p>
              <p className="mt-1 text-lg font-bold text-foreground">
                정산 명세 구조
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              예시
            </span>
          </div>

          {/* 항목 행 */}
          <ul className="divide-y divide-line bg-surface">
            <li className="flex items-start gap-4 px-6 py-5 md:px-8">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Wallet className="h-5 w-5" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  제작지원금 (기본급)
                </p>
                <p className="mt-1 text-sm text-muted">
                  업로드한 영상 편수 × <span className="font-bold text-foreground">20,000원</span>
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4 px-6 py-5 md:px-8">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendingUp className="h-5 w-5" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  성과급
                </p>
                <p className="mt-1 text-sm text-muted">
                  각 영상의 조회수 구간에 따라 산정 후 합산
                  <span className="ml-1 text-xs text-faint">(캠페인별 단가 매칭 시 안내)</span>
                </p>
              </div>
            </li>
          </ul>

          {/* 합계 행 */}
          <div className="flex items-center justify-between border-t-2 border-double border-line bg-primary/5 px-6 py-5 md:px-8">
            <p className="text-sm font-semibold text-primary">정산 합계</p>
            <p className="text-base font-extrabold tracking-tight text-primary md:text-lg">
              제작지원금 + 성과급
            </p>
          </div>

          {/* 정산일 */}
          <div className="flex items-center gap-3 border-t border-line bg-surface px-6 py-5 md:px-8">
            <CalendarCheck className="h-5 w-5 flex-shrink-0 text-primary" strokeWidth={2.5} />
            <p className="text-sm text-muted leading-relaxed">
              <span className="font-bold text-foreground">정산 기준일:</span> 마지막 영상 업로드 후 14일을 기준으로 등록한 계좌로 입금됩니다.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-faint">
          실제 정산 금액은 캠페인 단가, 영상별 조회수, 업로드 편수에 따라 산정됩니다.
        </p>
      </div>
    </section>
  );
}
