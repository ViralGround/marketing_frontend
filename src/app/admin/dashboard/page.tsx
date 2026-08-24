"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import KPICards from "@/components/metric/KPICards";
import { useLang } from "@/lib/i18n";
import { FEATURE_PAYMENTS_ENABLED } from "@/lib/featureFlags";

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
  const { t } = useLang();
  const [kpi, setKpi] = useState<Kpi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    api
      .get<Kpi>("/admin/dashboard/kpi", { signal: controller.signal })
      .then((res) => {
        if (!active) return;
        setKpi(res.data);
        setError("");
      })
      .catch(() => {
        if (!active) return;
        setError(t("KPI 를 불러오지 못했습니다", "Failed to load KPIs"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [t, reloadKey]);

  if (loading)
    return (
      <p className="mx-auto max-w-5xl px-4 py-10 text-muted">{t("불러오는 중...", "Loading...")}</p>
    );
  if (error || !kpi)
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="max-w-xl rounded-xl border border-error/30 bg-error/5 p-5">
          <p className="text-sm text-error">{error || t("데이터 없음", "No data")}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setReloadKey((key) => key + 1);
            }}
            className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            {t("다시 시도", "Retry")}
          </button>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-10">
        <p className="text-sm font-medium text-muted">{t("운영", "Operations")}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t("플랫폼 KPI 대시보드", "Platform KPI dashboard")}
        </h1>
      </div>

      {FEATURE_PAYMENTS_ENABLED && <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold text-muted">{t("거래", "Transactions")}</h2>
        <KPICards
          items={[
            {
              label: t("GMV (총 예치)", "GMV (total deposits)"),
              value: `₩${kpi.gmv.toLocaleString("ko-KR")}`,
            },
            { label: t("지급 완료", "Released"), value: `₩${kpi.released.toLocaleString("ko-KR")}` },
            { label: t("환불", "Refunded"), value: `₩${kpi.refunded.toLocaleString("ko-KR")}` },
          ]}
        />
      </section>}

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold text-muted">{t("참여", "Engagement")}</h2>
        <KPICards
          items={[
            { label: t("활성 크리에이터", "Active creators"), value: `${kpi.activeCreators}${t("명", "")}` },
            { label: t("활성 브랜드", "Active brands"), value: `${kpi.activeCompanies}${t("개", "")}` },
            { label: t("오픈 캠페인", "Open campaigns"), value: `${kpi.openCampaigns}${t("건", "")}` },
            {
              label: t("매칭률", "Matching rate"),
              value: `${kpi.matchingRate}%`,
              hint: t("검토 단계 도달 / 전체 지원", "Reached review stage / total applications"),
            },
            {
              label: t("완료율", "Completion rate"),
              value: `${kpi.completionRate}%`,
              hint: t("정산 완료 / 검토 단계 도달", "Payout completed / reached review stage"),
            },
          ]}
        />
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold text-muted">
          {t("콘텐츠 성과 (수동 입력 합산)", "Content performance (manual entry totals)")}
        </h2>
        <KPICards
          items={[
            { label: t("총 조회수", "Total views"), value: kpi.contentMetrics.views.toLocaleString("ko-KR") },
            { label: t("총 좋아요", "Total likes"), value: kpi.contentMetrics.likes.toLocaleString("ko-KR") },
            { label: t("총 댓글", "Total comments"), value: kpi.contentMetrics.comments.toLocaleString("ko-KR") },
          ]}
        />
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold text-muted">{t("신뢰도", "Trust")}</h2>
        <KPICards
          items={[
            { label: t("리뷰 건수", "Reviews"), value: `${kpi.reviews.count}${t("건", "")}` },
            {
              label: t("평균 평점", "Average rating"),
              value: kpi.reviews.count === 0 ? "-" : `★ ${kpi.reviews.averageRating.toFixed(1)}`,
            },
          ]}
        />
      </section>
    </div>
  );
}
