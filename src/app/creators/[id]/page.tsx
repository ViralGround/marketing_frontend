"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import ReviewList, { type ReviewItem } from "@/components/review/ReviewList";

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
  summary: { totalCompleted: number; reviewCount: number; averageRating: number };
  items: PortfolioItem[];
}

export default function CreatorPortfolioPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
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
      .catch(() => setError("포트폴리오를 불러오지 못했습니다"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="mx-auto max-w-4xl px-4 py-10 text-gray-500">불러오는 중...</p>;
  if (error || !portfolio)
    return <p className="mx-auto max-w-4xl px-4 py-10 text-red-600">{error || "데이터 없음"}</p>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{portfolio.creator.name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          가입: {new Date(portfolio.creator.joinedAt).toLocaleDateString("ko-KR")}
        </p>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="완료한 캠페인"
          value={`${portfolio.summary.totalCompleted}건`}
        />
        <SummaryCard
          label="받은 리뷰"
          value={`${portfolio.summary.reviewCount}건`}
        />
        <SummaryCard
          label="평균 평점"
          value={portfolio.summary.reviewCount === 0 ? "-" : `★ ${portfolio.summary.averageRating.toFixed(1)}`}
        />
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">작업 이력</h2>
        {portfolio.items.length === 0 ? (
          <p className="text-sm text-gray-400">아직 완료한 캠페인이 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {portfolio.items.map((item) => (
              <li
                key={item.applicationId}
                className="rounded border border-gray-200 p-4"
              >
                <p className="text-xs text-gray-500">{item.brandName}</p>
                <p className="mt-0.5 font-semibold text-gray-900">{item.campaignTitle}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
                  {item.rewardPaidAmount != null && (
                    <span>정산 ₩{item.rewardPaidAmount.toLocaleString("ko-KR")}</span>
                  )}
                  {item.settledAt && (
                    <span>완료: {new Date(item.settledAt).toLocaleDateString("ko-KR")}</span>
                  )}
                  {item.videoFileKey && <span className="text-gray-400">영상 제출됨</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">리뷰</h2>
        <ReviewList reviews={reviews} />
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 p-5">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
