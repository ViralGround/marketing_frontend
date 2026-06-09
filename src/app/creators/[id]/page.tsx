"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import ReviewList, { type ReviewItem } from "@/components/review/ReviewList";
import { useLang } from "@/lib/i18n";

interface PortfolioItem {
  applicationId: number;
  campaignId: number;
  campaignTitle: string;
  brandName: string;
  rewardPaidAmount: number | null;
  videoFileKey: string | null;
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
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.get<Portfolio>(`/creators/${id}/portfolio`),
      api.get<{ reviews: ReviewItem[] }>(`/creators/${id}/reviews`),
    ])
      .then(([p, r]) => {
        setPortfolio(p.data);
        setReviews(r.data.reviews);
      })
      .catch(() => setError(t("포트폴리오를 불러오지 못했습니다", "Failed to load the portfolio")))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return <p className="mx-auto max-w-4xl px-4 py-10 text-muted">{t("불러오는 중...", "Loading...")}</p>;
  if (error || !portfolio)
    return (
      <p className="mx-auto max-w-4xl px-4 py-10 text-red-600">
        {error || t("데이터 없음", "No data")}
      </p>
    );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{portfolio.creator.name}</h1>
        <p className="mt-1 text-sm text-muted">
          {t("가입", "Joined")}: {new Date(portfolio.creator.joinedAt).toLocaleDateString(locale)}
        </p>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryCard
          label={t("완료한 캠페인", "Completed campaigns")}
          value={t(`${portfolio.summary.totalCompleted}건`, `${portfolio.summary.totalCompleted}`)}
        />
        <SummaryCard
          label={t("받은 리뷰", "Reviews received")}
          value={t(`${portfolio.summary.reviewCount}건`, `${portfolio.summary.reviewCount}`)}
        />
        <SummaryCard
          label={t("평균 평점", "Average rating")}
          value={portfolio.summary.reviewCount === 0 ? "-" : `★ ${portfolio.summary.averageRating.toFixed(1)}`}
        />
        <SummaryCard
          label={t("평균 조회수", "Average views")}
          value={
            portfolio.summary.metricSampleSize === 0
              ? "-"
              : portfolio.summary.averageViews.toLocaleString(locale)
          }
        />
        <SummaryCard
          label={t("누적 조회수", "Total views")}
          value={portfolio.summary.totalViews.toLocaleString(locale)}
        />
        <SummaryCard
          label={t("누적 좋아요", "Total likes")}
          value={portfolio.summary.totalLikes.toLocaleString(locale)}
        />
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-foreground">{t("작업 이력", "Work history")}</h2>
        {portfolio.items.length === 0 ? (
          <p className="text-sm text-faint">{t("아직 완료한 캠페인이 없습니다.", "No completed campaigns yet.")}</p>
        ) : (
          <ul className="space-y-3">
            {portfolio.items.map((item) => (
              <li
                key={item.applicationId}
                className="rounded border border-line p-4"
              >
                <p className="text-xs text-muted">{item.brandName}</p>
                <p className="mt-0.5 font-semibold text-foreground">{item.campaignTitle}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
                  {item.rewardPaidAmount != null && (
                    <span>
                      {t("정산", "Payout")} ₩{item.rewardPaidAmount.toLocaleString(locale)}
                    </span>
                  )}
                  {item.settledAt && (
                    <span>
                      {t("완료", "Completed")}: {new Date(item.settledAt).toLocaleDateString(locale)}
                    </span>
                  )}
                  {item.videoFileKey && <span className="text-faint">{t("영상 제출됨", "Video submitted")}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-foreground">{t("리뷰", "Reviews")}</h2>
        <ReviewList reviews={reviews} />
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}
