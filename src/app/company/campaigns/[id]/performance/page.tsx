"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import KPICards from "@/components/metric/KPICards";

interface Item {
  applicationId: number;
  creatorId: number;
  creatorName: string;
  views: number;
  likes: number;
  comments: number;
  externalUrl: string | null;
  recordedAt: string | null;
}

interface Performance {
  campaignId: number;
  campaignTitle: string;
  totals: { views: number; likes: number; comments: number; completedCount: number };
  items: Item[];
}

export default function CampaignPerformancePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [data, setData] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get<Performance>(`/company/campaigns/${id}/performance`)
      .then((res) => setData(res.data))
      .catch(() => setError("성과 정보를 불러오지 못했습니다"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="mx-auto max-w-4xl px-4 py-10 text-gray-500">불러오는 중...</p>;
  if (error || !data)
    return <p className="mx-auto max-w-4xl px-4 py-10 text-red-600">{error || "데이터 없음"}</p>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href={`/company/campaigns/${data.campaignId}`}
        className="text-sm text-gray-500 hover:text-gray-900"
      >
        &larr; 캠페인 상세로
      </Link>
      <h1 className="mt-2 text-3xl font-bold text-gray-900">{data.campaignTitle}</h1>
      <p className="mt-1 text-sm text-gray-500">지원 영상 성과 리포트</p>

      <div className="my-8">
        <KPICards
          items={[
            { label: "완료 지원자", value: `${data.totals.completedCount}명` },
            { label: "총 조회수", value: data.totals.views.toLocaleString("ko-KR") },
            { label: "총 좋아요", value: data.totals.likes.toLocaleString("ko-KR") },
            { label: "총 댓글", value: data.totals.comments.toLocaleString("ko-KR") },
          ]}
        />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">크리에이터별 성과</h2>
        {data.items.length === 0 ? (
          <p className="text-sm text-gray-400">정산 완료된 지원자가 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {data.items.map((it) => (
              <li
                key={it.applicationId}
                className="rounded border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <Link
                    href={`/creators/${it.creatorId}`}
                    className="font-semibold text-gray-900 hover:underline"
                  >
                    {it.creatorName}
                  </Link>
                  {it.externalUrl && isSafeHttpUrl(it.externalUrl) && (
                    <a
                      href={it.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 underline"
                    >
                      게시물 보기 →
                    </a>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  조회 {it.views.toLocaleString("ko-KR")} · 좋아요{" "}
                  {it.likes.toLocaleString("ko-KR")} · 댓글{" "}
                  {it.comments.toLocaleString("ko-KR")}
                </p>
                {it.recordedAt && (
                  <p className="mt-0.5 text-xs text-gray-400">
                    기록: {new Date(it.recordedAt).toLocaleDateString("ko-KR")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function isSafeHttpUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
