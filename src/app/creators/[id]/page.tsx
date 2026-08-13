"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import api from "@/lib/api";
import ReviewList, { type ReviewItem } from "@/components/review/ReviewList";
import GroundTopbar from "@/components/landing/onevideo/GroundTopbar";
import GroundFooter from "@/components/landing/onevideo/GroundFooter";
import { useLang } from "@/lib/i18n";

interface PortfolioItem {
  campaignTitle: string;
  brandName: string;
  settledAt: string | null;
}

interface Portfolio {
  creator: { id: number; name: string; joinedAt: string };
  summary: {
    totalCompleted: number;
    reviewCount: number;
    averageRating: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    metricSampleSize: number;
    averageViews: number;
  };
  items: PortfolioItem[];
}

export default function CreatorPortfolioPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { t, lang } = useLang();
  const locale = lang === "en" ? "en-US" : "ko-KR";
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadPortfolio = useCallback(() => {
    if (!id) return;
    Promise.all([
      api.get<Portfolio>(`/creators/${id}/portfolio`),
      api.get<{ reviews: ReviewItem[] }>(`/creators/${id}/reviews`),
    ])
      .then(([portfolioResponse, reviewsResponse]) => {
        setPortfolio(portfolioResponse.data);
        setReviews(reviewsResponse.data.reviews);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  const content = (() => {
    if (loading) {
      return (
        <div className="border-y-2 border-ink py-12" aria-live="polite">
          <p className="text-[15px] font-semibold text-ink/60">{t("포트폴리오를 불러오는 중입니다…", "Loading the portfolio…")}</p>
        </div>
      );
    }

    if (error || !portfolio) {
      return (
        <div role="alert" className="border-y-2 border-ink bg-white px-6 py-10">
          <h1 className="text-[clamp(26px,4vw,42px)] font-black tracking-[-0.035em]">
            {t("포트폴리오를 불러오지 못했습니다", "The portfolio couldn't be loaded")}
          </h1>
          <p className="mt-3 text-[15px] text-ink/65">
            {t("연결 상태를 확인한 뒤 다시 시도해 주세요.", "Check your connection and try again.")}
          </p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setError(false);
              loadPortfolio();
            }}
            className="mt-6 min-h-12 rounded-full bg-violet px-6 text-[15px] font-bold text-white"
          >
            {t("다시 불러오기", "Try again")}
          </button>
        </div>
      );
    }

    const summary = portfolio.summary;
    const metrics: { label: string; value: ReactNode }[] = [
      { label: t("완료 캠페인", "Completed"), value: t(`${summary.totalCompleted}건`, `${summary.totalCompleted}`) },
      { label: t("리뷰", "Reviews"), value: t(`${summary.reviewCount}건`, `${summary.reviewCount}`) },
      {
        label: t("평점", "Rating"),
        value: summary.reviewCount ? (
          <span className="inline-flex items-center gap-2">
            <Star className="h-6 w-6" fill="currentColor" aria-hidden="true" />
            {summary.averageRating.toFixed(1)}
          </span>
        ) : (
          "-"
        ),
      },
      { label: t("평균 조회수", "Average views"), value: summary.metricSampleSize ? summary.averageViews.toLocaleString(locale) : "-" },
      { label: t("누적 조회수", "Total views"), value: summary.totalViews.toLocaleString(locale) },
      { label: t("누적 좋아요", "Total likes"), value: summary.totalLikes.toLocaleString(locale) },
    ];

    return (
      <>
        {/* kicker("Creator on the ground") 삭제 — 이름이 스스로 말하게. 한글 이름 행간 확보 */}
        <header className="pb-12 pt-4 md:pb-16 md:pt-8">
          <h1 className="text-[clamp(38px,7vw,84px)] font-black leading-[1.1] tracking-[-0.035em]">
            {portfolio.creator.name}
          </h1>
          <p className="mt-4 text-[15px] font-medium text-ink/65">
            {t("활동 시작", "Joined")} {new Date(portfolio.creator.joinedAt).toLocaleDateString(locale)}
          </p>
        </header>

        <dl className="grid border-y-2 border-ink sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric, index) => (
            <div key={index} className="border-b border-ink/25 py-5 sm:px-5 sm:odd:border-r lg:border-b-0 lg:border-r lg:odd:border-r [&:nth-child(3n)]:lg:border-r-0">
              <dt className="text-xs font-bold text-ink/60">{metric.label}</dt>
              {/* 지표 숫자는 tabular-nums 로 자릿수 정렬 */}
              <dd className="mt-2 font-display text-[clamp(25px,3vw,38px)] tracking-[-0.04em] text-violet tabular-nums">{metric.value}</dd>
            </div>
          ))}
        </dl>

        <section className="py-16" aria-labelledby="work-history-title">
          <h2 id="work-history-title" className="text-[clamp(26px,4vw,42px)] font-black tracking-[-0.035em]">
            {t("완료한 작업", "Completed work")}
          </h2>
          {portfolio.items.length === 0 ? (
            <p className="mt-7 border-y-2 border-ink py-8 text-[15px] text-ink/65">
              {t("아직 공개된 완료 작업이 없습니다.", "No completed work is public yet.")}
            </p>
          ) : (
            <ol className="mt-7 border-t-2 border-ink">
              {portfolio.items.map((item, index) => (
                <li key={`${item.brandName}-${item.campaignTitle}-${item.settledAt ?? index}`} className="grid gap-3 border-b-2 border-ink py-6 md:grid-cols-[48px_1fr] md:items-center">
                  <span className="font-display text-xs text-violet">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="text-xs font-bold text-ink/60">{item.brandName}</p>
                    <h3 className="mt-1 text-[18px] font-extrabold tracking-[-0.02em]">{item.campaignTitle}</h3>
                    <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/65">
                      {item.settledAt && <span>{t("완료", "Completed")} {new Date(item.settledAt).toLocaleDateString(locale)}</span>}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="pb-20" aria-labelledby="reviews-title">
          <h2 id="reviews-title" className="text-[clamp(26px,4vw,42px)] font-black tracking-[-0.035em]">
            {t("브랜드 리뷰", "Brand reviews")}
          </h2>
          <div className="mt-7"><ReviewList reviews={reviews} /></div>
        </section>
      </>
    );
  })();

  return (
    <div className="min-h-screen bg-paper text-ink">
      <GroundTopbar />
      <div className="mx-auto min-h-[70svh] max-w-6xl px-6 pb-12 pt-28 md:pt-32">
        <Link href="/creators" className="inline-flex min-h-11 items-center gap-2 text-[15px] font-bold text-ink/65 transition-colors hover:text-violet">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("크리에이터 목록", "Creator list")}
        </Link>
        {content}
      </div>
      <GroundFooter />
    </div>
  );
}
