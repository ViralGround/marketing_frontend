"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import KPICards from "@/components/metric/KPICards";
import MetricForm from "@/components/metric/MetricForm";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useLang } from "@/lib/i18n";

interface PerformanceItem {
  applicationId: number;
  campaignTitle: string;
  brandName: string;
  views: number;
  likes: number;
  comments: number;
  externalUrl: string | null;
  recordedAt: string | null;
}

interface Performance {
  totals: { views: number; likes: number; comments: number; completedCount: number };
  items: PerformanceItem[];
}

function requestPerformance(signal?: AbortSignal) {
  return api.get<Performance>("/me/performance", { signal });
}

export default function CreatorPerformancePage() {
  const { t } = useLang();
  const [data, setData] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<PerformanceItem | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const response = await requestPerformance();
      setData(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    requestPerformance(controller.signal)
      .then((response) => {
        if (active) setData(response.data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  if (loading)
    return <p className="mx-auto max-w-4xl px-6 py-10 text-muted">{t("불러오는 중...", "Loading...")}</p>;
  if (!data)
    return <p className="mx-auto max-w-4xl px-6 py-10 text-error">{t("데이터 없음", "No data")}</p>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">
      <BackButton href="/creator/home" labelKo="홈으로" labelEn="Back to home" />
      <div className="mb-10">
        <p className="text-sm font-medium text-muted">{t("성과 대시보드", "Performance dashboard")}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t("내 영상 누적 성과", "My cumulative video performance")}
        </h1>
        <p className="mt-3 text-sm text-muted">
          {t(
            "SNS 게시물의 조회수·좋아요·댓글을 직접 입력하면 포트폴리오에 반영됩니다.",
            "Enter views, likes, and comments from your posts to update your portfolio.",
          )}
        </p>
      </div>

      <div className="mb-12">
        <KPICards
          items={[
            {
              label: t("완료 캠페인", "Completed campaigns"),
              value: `${data.totals.completedCount}${t("건", "")}`,
            },
            { label: t("누적 조회수", "Total views"), value: data.totals.views.toLocaleString("ko-KR") },
            { label: t("누적 좋아요", "Total likes"), value: data.totals.likes.toLocaleString("ko-KR") },
            { label: t("누적 댓글", "Total comments"), value: data.totals.comments.toLocaleString("ko-KR") },
          ]}
        />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">{t("작품별 성과", "Performance by video")}</h2>
        {data.items.length === 0 ? (
          <Card className="bg-surface-muted text-sm text-faint">
            {t("정산 완료된 작업이 없어요.", "No settled work yet.")}
          </Card>
        ) : (
          <ul className="space-y-3">
            {data.items.map((it) => (
              <li
                key={it.applicationId}
                className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted">{it.brandName}</p>
                  <p className="truncate font-semibold text-foreground">{it.campaignTitle}</p>
                  <p className="mt-1.5 text-xs text-muted">
                    {t("조회", "Views")} {it.views.toLocaleString("ko-KR")} · {t("좋아요", "Likes")}{" "}
                    {it.likes.toLocaleString("ko-KR")} · {t("댓글", "Comments")}{" "}
                    {it.comments.toLocaleString("ko-KR")}
                  </p>
                  {it.recordedAt && (
                    <p className="mt-0.5 text-xs text-faint">
                      {t("기록", "Recorded")}: {new Date(it.recordedAt).toLocaleDateString("ko-KR")}
                    </p>
                  )}
                </div>
                <Button variant="secondary" size="sm" onClick={() => setEditTarget(it)}>
                  {t("성과 입력/수정", "Enter / edit performance")}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl">
            <h3 className="mb-1 text-lg font-semibold text-foreground">{t("성과 입력", "Enter performance")}</h3>
            <p className="mb-4 text-sm text-muted">{editTarget.campaignTitle}</p>
            <MetricForm
              applicationId={editTarget.applicationId}
              initial={{
                views: editTarget.views,
                likes: editTarget.likes,
                comments: editTarget.comments,
                externalUrl: editTarget.externalUrl,
              }}
              onSaved={() => {
                setEditTarget(null);
                void reload();
              }}
              onCancel={() => setEditTarget(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
