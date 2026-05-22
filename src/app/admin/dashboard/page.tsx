"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import KPICards from "@/components/metric/KPICards";

interface Kpi {
  gmv: number;
  released: number;
  refunded: number;
  activeCreators: number;
  activeCompanies: number;
  openCampaigns: number;
  matchingRate: number;
  completionRate: number;
  contentMetrics: { views: number; likes: number; comments: number };
  reviews: { count: number; averageRating: number };
}

export default function AdminDashboardPage() {
  const [kpi, setKpi] = useState<Kpi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get<Kpi>("/admin/dashboard/kpi")
      .then((res) => setKpi(res.data))
      .catch(() => setError("KPI 를 불러오지 못했습니다"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="mx-auto max-w-5xl px-4 py-10 text-muted">불러오는 중...</p>;
  if (error || !kpi)
    return <p className="mx-auto max-w-5xl px-4 py-10 text-error">{error || "데이터 없음"}</p>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-10">
        <p className="text-sm font-medium text-muted">운영</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          플랫폼 KPI 대시보드
        </h1>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold text-muted">거래</h2>
        <KPICards
          items={[
            { label: "GMV (총 예치)", value: `₩${kpi.gmv.toLocaleString("ko-KR")}` },
            { label: "지급 완료", value: `₩${kpi.released.toLocaleString("ko-KR")}` },
            { label: "환불", value: `₩${kpi.refunded.toLocaleString("ko-KR")}` },
          ]}
        />
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold text-muted">참여</h2>
        <KPICards
          items={[
            { label: "활성 크리에이터", value: `${kpi.activeCreators}명` },
            { label: "활성 기업", value: `${kpi.activeCompanies}개` },
            { label: "오픈 캠페인", value: `${kpi.openCampaigns}건` },
            { label: "매칭률", value: `${kpi.matchingRate}%`, hint: "검토 단계 도달 / 전체 지원" },
            { label: "완료율", value: `${kpi.completionRate}%`, hint: "정산 완료 / 검토 단계 도달" },
          ]}
        />
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold text-muted">콘텐츠 성과 (수동 입력 합산)</h2>
        <KPICards
          items={[
            { label: "총 조회수", value: kpi.contentMetrics.views.toLocaleString("ko-KR") },
            { label: "총 좋아요", value: kpi.contentMetrics.likes.toLocaleString("ko-KR") },
            { label: "총 댓글", value: kpi.contentMetrics.comments.toLocaleString("ko-KR") },
          ]}
        />
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold text-muted">신뢰도</h2>
        <KPICards
          items={[
            { label: "리뷰 건수", value: `${kpi.reviews.count}건` },
            {
              label: "평균 평점",
              value: kpi.reviews.count === 0 ? "-" : `★ ${kpi.reviews.averageRating.toFixed(1)}`,
            },
          ]}
        />
      </section>
    </div>
  );
}
