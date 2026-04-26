"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import KPICards from "@/components/metric/KPICards";
import MetricForm from "@/components/metric/MetricForm";

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

export default function CreatorPerformancePage() {
  const [data, setData] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<PerformanceItem | null>(null);

  const load = () => {
    setLoading(true);
    api
      .get<Performance>("/me/performance")
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p className="mx-auto max-w-4xl px-4 py-10 text-muted">불러오는 중...</p>;
  if (!data) return <p className="mx-auto max-w-4xl px-4 py-10 text-red-600">데이터 없음</p>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm text-muted">성과 대시보드</p>
        <h1 className="mt-1 text-3xl font-bold text-foreground">내 영상 누적 성과</h1>
        <p className="mt-2 text-sm text-muted">
          SNS 게시물의 조회수·좋아요·댓글을 직접 입력하면 포트폴리오에 반영됩니다.
        </p>
      </div>

      <div className="mb-10">
        <KPICards
          items={[
            { label: "완료 캠페인", value: `${data.totals.completedCount}건` },
            { label: "누적 조회수", value: data.totals.views.toLocaleString("ko-KR") },
            { label: "누적 좋아요", value: data.totals.likes.toLocaleString("ko-KR") },
            { label: "누적 댓글", value: data.totals.comments.toLocaleString("ko-KR") },
          ]}
        />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-foreground">작품별 성과</h2>
        {data.items.length === 0 ? (
          <p className="text-sm text-faint">정산 완료된 작업이 없어요.</p>
        ) : (
          <ul className="space-y-3">
            {data.items.map((it) => (
              <li
                key={it.applicationId}
                className="flex items-center justify-between rounded border border-line p-4"
              >
                <div className="min-w-0">
                  <p className="text-xs text-muted">{it.brandName}</p>
                  <p className="truncate font-semibold text-foreground">{it.campaignTitle}</p>
                  <p className="mt-1 text-xs text-muted">
                    조회 {it.views.toLocaleString("ko-KR")} · 좋아요{" "}
                    {it.likes.toLocaleString("ko-KR")} · 댓글{" "}
                    {it.comments.toLocaleString("ko-KR")}
                  </p>
                  {it.recordedAt && (
                    <p className="mt-0.5 text-xs text-faint">
                      기록: {new Date(it.recordedAt).toLocaleDateString("ko-KR")}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setEditTarget(it)}
                  className="rounded border border-line-strong px-3 py-1.5 text-xs text-content-soft hover:bg-surface-muted"
                >
                  성과 입력/수정
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-surface p-6">
            <h3 className="mb-1 text-lg font-semibold text-foreground">성과 입력</h3>
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
                load();
              }}
              onCancel={() => setEditTarget(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
