"use client";

import { useState, useMemo } from "react";
import { Calculator, Sigma } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLang, type Lang } from "@/lib/i18n";

const BASE_PAY_PER_VIDEO = 20_000;

/**
 * 영상 1편 조회수 → 성과급(원).
 * PDF 12구간 기준이며, 표 노출은 하지 않고 결과 계산용으로만 사용.
 */
function performanceRewardPerVideo(views: number): number {
  if (views >= 5_000_000) return 2_500_000;
  if (views >= 4_000_000) return 2_300_000;
  if (views >= 3_000_000) return 2_000_000;
  if (views >= 2_000_000) return 1_600_000;
  if (views >= 1_000_000) return 1_200_000;
  if (views >= 500_000) return 500_000;
  if (views >= 300_000) return 300_000;
  if (views >= 100_000) return 150_000;
  if (views >= 50_000) return 100_000;
  if (views >= 30_000) return 70_000;
  if (views >= 10_000) return 40_000;
  if (views >= 1_000) return 20_000;
  return 0;
}

function formatKRW(n: number): string {
  return n.toLocaleString("en-US");
}

function formatViews(v: number, lang: Lang): string {
  if (lang === "en") {
    if (v >= 1_000_000)
      return `${(v / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 1 })}M views`;
    if (v >= 1_000) return `${Math.round(v / 1_000)}K views`;
    return `${v} views`;
  }
  if (v >= 10_000)
    return `${(v / 10_000).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}만뷰`;
  return `${v.toLocaleString("ko-KR")}뷰`;
}

export default function EarningsSimulator() {
  const ref = useScrollAnimation<HTMLDivElement>();
  const { lang, t } = useLang();
  const [videosPerMonth, setVideosPerMonth] = useState(8);
  const [averageViews, setAverageViews] = useState(50_000);

  const total = useMemo(() => {
    const base = videosPerMonth * BASE_PAY_PER_VIDEO;
    const perf = videosPerMonth * performanceRewardPerVideo(averageViews);
    return base + perf;
  }, [videosPerMonth, averageViews]);

  return (
    <section className="bg-section-alt py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Calculator className="h-4 w-4" strokeWidth={2.5} />
            {t("수익 시뮬레이터", "Earnings simulator")}
          </div>
          <h2 className="mt-5 text-3xl font-bold text-foreground md:text-4xl">
            {t("한 달에 얼마나 벌 수 있을까?", "How much could you make a month?")}
          </h2>
          <p className="mt-4 text-muted">
            {t(
              "업로드 편수와 평균 조회수를 조절해 예상 월 수익을 확인해보세요",
              "Adjust your uploads and average views to see your estimated monthly income.",
            )}
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
          {/* 입력부 */}
          <div className="grid gap-8 p-8 md:grid-cols-2 md:p-10">
            <div>
              <div className="flex items-baseline justify-between">
                <label className="text-sm font-semibold text-foreground">
                  {t("월 업로드 편수", "Uploads per month")}
                </label>
                <span className="text-xl font-extrabold tracking-tight text-primary">
                  {videosPerMonth}
                  {lang === "ko" && <span className="ml-1 text-sm font-bold text-muted">편</span>}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={12}
                step={1}
                value={videosPerMonth}
                onChange={(e) => setVideosPerMonth(Number(e.target.value))}
                className="mt-4 w-full accent-primary"
              />
              <div className="mt-2 flex justify-between text-xs text-faint">
                <span>{t("1편", "1")}</span>
                <span>{t("12편", "12")}</span>
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <label className="text-sm font-semibold text-foreground">
                  {t("영상당 평균 조회수", "Avg. views per video")}
                </label>
                <span className="text-xl font-extrabold tracking-tight text-primary">
                  {formatViews(averageViews, lang)}
                </span>
              </div>
              <input
                type="range"
                min={1_000}
                max={1_000_000}
                step={1_000}
                value={averageViews}
                onChange={(e) => setAverageViews(Number(e.target.value))}
                className="mt-4 w-full accent-primary"
              />
              <div className="mt-2 flex justify-between text-xs text-faint">
                <span>{t("1천뷰", "1K")}</span>
                <span>{t("100만뷰", "1M")}</span>
              </div>
            </div>
          </div>

          {/* 결과부 */}
          <div className="border-t border-line bg-primary/5 px-8 py-12 text-center md:px-10">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              {t("예상 월 수익 (제작지원금 + 성과급 합산)", "Estimated monthly income (base + bonus)")}
            </p>
            <p className="mt-3 text-5xl font-black tracking-tight text-primary md:text-6xl">
              {lang === "en" ? (
                <>~₩{formatKRW(total)}</>
              ) : (
                <>
                  약 {formatKRW(total)}
                  <span className="text-2xl font-bold text-primary/70">원</span>
                </>
              )}
            </p>
          </div>

          {/* 디스클레이머 */}
          <div className="flex items-start gap-3 border-t border-line bg-section-alt px-6 py-5 md:px-10">
            <Sigma className="mt-0.5 h-4 w-4 flex-shrink-0 text-faint" strokeWidth={2.5} />
            <p className="text-xs leading-relaxed text-muted">
              {t(
                "본 시뮬레이션은 예상 수익이며, 실제 단가는 캠페인별 기준에 따라 변동될 수 있습니다. 정산은 마지막 업로드 후 14일 기준으로 일괄 지급됩니다.",
                "This is an estimate; actual rates may vary by campaign. Payouts are settled in a lump sum 14 days after your last upload.",
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
