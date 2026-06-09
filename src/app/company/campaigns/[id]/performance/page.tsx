"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import KPICards from "@/components/metric/KPICards";
import Card from "@/components/ui/Card";
import { useLang } from "@/lib/i18n";

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
  const { t } = useLang();
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
      .catch(() => setError(t("성과 정보를 불러오지 못했습니다", "Failed to load performance data")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading)
    return (
      <p className="mx-auto max-w-4xl px-6 py-10 text-muted">{t("불러오는 중...", "Loading...")}</p>
    );
  if (error || !data)
    return (
      <p className="mx-auto max-w-4xl px-6 py-10 text-error">
        {error || t("데이터 없음", "No data")}
      </p>
    );

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">
      <Link
        href={`/company/campaigns/${data.campaignId}`}
        className="text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        &larr; {t("캠페인 상세로", "Back to campaign")}
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        {data.campaignTitle}
      </h1>
      <p className="mt-2 text-sm text-muted">{t("지원 영상 성과 리포트", "Submission performance report")}</p>

      <div className="my-10">
        <KPICards
          items={[
            {
              label: t("완료 지원자", "Completed applicants"),
              value: `${data.totals.completedCount}${t("명", "")}`,
            },
            { label: t("총 조회수", "Total views"), value: data.totals.views.toLocaleString("ko-KR") },
            { label: t("총 좋아요", "Total likes"), value: data.totals.likes.toLocaleString("ko-KR") },
            {
              label: t("총 댓글", "Total comments"),
              value: data.totals.comments.toLocaleString("ko-KR"),
            },
          ]}
        />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          {t("크리에이터별 성과", "Performance by creator")}
        </h2>
        {data.items.length === 0 ? (
          <Card className="bg-surface-muted text-sm text-faint">
            {t("정산 완료된 지원자가 없습니다.", "No settled applicants yet.")}
          </Card>
        ) : (
          <ul className="space-y-3">
            {data.items.map((it) => (
              <li
                key={it.applicationId}
                className="rounded-2xl border border-line bg-surface p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link
                    href={`/creators/${it.creatorId}`}
                    className="font-semibold text-foreground hover:text-primary"
                  >
                    {it.creatorName}
                  </Link>
                  {it.externalUrl && isSafeHttpUrl(it.externalUrl) && (
                    <a
                      href={it.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                    >
                      {t("게시물 보기 →", "View post →")}
                    </a>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-muted">
                  {t("조회 ", "Views ")}
                  {it.views.toLocaleString("ko-KR")}
                  {t(" · 좋아요 ", " · Likes ")}
                  {it.likes.toLocaleString("ko-KR")}
                  {t(" · 댓글 ", " · Comments ")}
                  {it.comments.toLocaleString("ko-KR")}
                </p>
                {it.recordedAt && (
                  <p className="mt-0.5 text-xs text-faint">
                    {t("기록: ", "Recorded: ")}
                    {new Date(it.recordedAt).toLocaleDateString("ko-KR")}
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
