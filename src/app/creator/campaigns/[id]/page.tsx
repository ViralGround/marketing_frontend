"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import ApplicationStatusBadge from "@/components/campaign/ApplicationStatusBadge";

type AppStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUBMITTED" | "SETTLED";

interface CampaignDetail {
  id: number;
  title: string;
  description: string;
  brandName: string;
  rewardAmount: number;
  thumbnailUrl: string | null;
  requirements: string | null;
  deadline: string | null;
  maxParticipants: number;
  status: "OPEN" | "CLOSED";
  applicationCount: number;
  myApplication: {
    id: number;
    status: AppStatus;
    appliedAt: string;
    submissionUrl: string | null;
  } | null;
}

export default function CreatorCampaignDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    api
      .get(`/campaigns/${id}`)
      .then((res) => setCampaign(res.data))
      .catch(() => router.push("/creator/campaigns"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleApply = async () => {
    setError("");
    setApplying(true);
    try {
      await api.post(`/campaigns/${id}/apply`, { message: message.trim() || null });
      router.push("/creator/applications");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        "지원에 실패했습니다";
      setError(msg);
    } finally {
      setApplying(false);
    }
  };

  if (loading || !campaign) {
    return <p className="px-4 py-8 text-muted">불러오는 중...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <button
        onClick={() => router.push("/creator/campaigns")}
        className="mb-4 text-sm text-muted hover:text-foreground"
      >
        &larr; 캠페인 목록으로
      </button>

      {campaign.thumbnailUrl && (
        <div className="mb-6 aspect-video overflow-hidden rounded-xl bg-surface-chip">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={campaign.thumbnailUrl}
            alt={campaign.title}
            className="h-full w-full object-contain"
          />
        </div>
      )}

      <div className="mb-2 flex items-center gap-2">
        <p className="text-sm text-muted">{campaign.brandName}</p>
        {campaign.myApplication && (
          <ApplicationStatusBadge status={campaign.myApplication.status} />
        )}
      </div>
      <h1 className="mb-4 text-3xl font-bold text-foreground">{campaign.title}</h1>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded border border-line p-3">
          <p className="text-xs text-muted">보상</p>
          <p className="mt-1 font-bold text-foreground">
            ₩{campaign.rewardAmount.toLocaleString("ko-KR")}
          </p>
        </div>
        <div className="rounded border border-line p-3">
          <p className="text-xs text-muted">마감일</p>
          <p className="mt-1 font-bold text-foreground">
            {campaign.deadline
              ? new Date(campaign.deadline).toLocaleDateString("ko-KR")
              : "-"}
          </p>
        </div>
        <div className="rounded border border-line p-3">
          <p className="text-xs text-muted">지원 현황</p>
          <p className="mt-1 font-bold text-foreground">
            {campaign.applicationCount} / {campaign.maxParticipants}
          </p>
        </div>
      </div>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold text-foreground">설명</h2>
        <p className="whitespace-pre-wrap text-sm text-content-soft">{campaign.description}</p>
      </section>

      {campaign.requirements && (
        <section className="mb-6">
          <h2 className="mb-2 text-lg font-semibold text-foreground">요구사항</h2>
          <p className="whitespace-pre-wrap text-sm text-content-soft">{campaign.requirements}</p>
        </section>
      )}

      {/* 지원 섹션 */}
      {campaign.myApplication ? (
        <div className="rounded-xl border border-line bg-surface-muted p-6">
          <p className="mb-1 text-sm text-muted">지원 현황</p>
          <div className="mb-2 flex items-center gap-2">
            <ApplicationStatusBadge status={campaign.myApplication.status} />
            <span className="text-sm text-content-soft">
              {new Date(campaign.myApplication.appliedAt).toLocaleDateString("ko-KR")} 지원
            </span>
          </div>
          <p className="text-sm text-muted">
            상세 진행은{" "}
            <a href="/creator/applications" className="text-primary underline">
              내 지원 현황
            </a>{" "}
            페이지에서 확인할 수 있어요.
          </p>
        </div>
      ) : campaign.status === "OPEN" ? (
        <div className="rounded-xl border border-line p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">이 캠페인에 지원하기</h2>
          <label htmlFor="message" className="block text-sm text-content-soft">
            지원 메시지 <span className="text-faint">(선택)</span>
          </label>
          <textarea
            id="message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="어떤 스타일의 영상을 만들 계획인지 간단히 소개해주세요."
            className="mt-1 block w-full rounded border border-line-strong px-3 py-2 text-sm text-foreground placeholder-faint focus:border-gray-500 focus:outline-none"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button
            onClick={handleApply}
            disabled={applying}
            className="mt-4 w-full rounded-lg bg-primary py-2.5 text-white font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
          >
            {applying ? "지원 중..." : "지원하기"}
          </button>
          <p className="mt-3 text-xs text-muted">
            관리자 검토 후 승인되면 영상 제작을 시작할 수 있어요.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-line bg-surface-muted p-6 text-sm text-muted">
          이 캠페인은 모집이 종료되었습니다.
        </div>
      )}
    </div>
  );
}
