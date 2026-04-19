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
    return <p className="px-4 py-8 text-gray-500">불러오는 중...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <button
        onClick={() => router.push("/creator/campaigns")}
        className="mb-4 text-sm text-gray-500 hover:text-gray-900"
      >
        &larr; 캠페인 목록으로
      </button>

      {campaign.thumbnailUrl && (
        <div className="mb-6 aspect-video overflow-hidden rounded-xl bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={campaign.thumbnailUrl}
            alt={campaign.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="mb-2 flex items-center gap-2">
        <p className="text-sm text-gray-500">{campaign.brandName}</p>
        {campaign.myApplication && (
          <ApplicationStatusBadge status={campaign.myApplication.status} />
        )}
      </div>
      <h1 className="mb-4 text-3xl font-bold text-gray-900">{campaign.title}</h1>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded border border-gray-200 p-3">
          <p className="text-xs text-gray-500">보상</p>
          <p className="mt-1 font-bold text-gray-900">
            ₩{campaign.rewardAmount.toLocaleString("ko-KR")}
          </p>
        </div>
        <div className="rounded border border-gray-200 p-3">
          <p className="text-xs text-gray-500">마감일</p>
          <p className="mt-1 font-bold text-gray-900">
            {campaign.deadline
              ? new Date(campaign.deadline).toLocaleDateString("ko-KR")
              : "-"}
          </p>
        </div>
        <div className="rounded border border-gray-200 p-3">
          <p className="text-xs text-gray-500">지원 현황</p>
          <p className="mt-1 font-bold text-gray-900">
            {campaign.applicationCount} / {campaign.maxParticipants}
          </p>
        </div>
      </div>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">설명</h2>
        <p className="whitespace-pre-wrap text-sm text-gray-700">{campaign.description}</p>
      </section>

      {campaign.requirements && (
        <section className="mb-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">요구사항</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-700">{campaign.requirements}</p>
        </section>
      )}

      {/* 지원 섹션 */}
      {campaign.myApplication ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
          <p className="mb-1 text-sm text-gray-500">지원 현황</p>
          <div className="mb-2 flex items-center gap-2">
            <ApplicationStatusBadge status={campaign.myApplication.status} />
            <span className="text-sm text-gray-700">
              {new Date(campaign.myApplication.appliedAt).toLocaleDateString("ko-KR")} 지원
            </span>
          </div>
          <p className="text-sm text-gray-600">
            상세 진행은{" "}
            <a href="/creator/applications" className="text-primary underline">
              내 지원 현황
            </a>{" "}
            페이지에서 확인할 수 있어요.
          </p>
        </div>
      ) : campaign.status === "OPEN" ? (
        <div className="rounded-xl border border-gray-200 p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">이 캠페인에 지원하기</h2>
          <label htmlFor="message" className="block text-sm text-gray-700">
            지원 메시지 <span className="text-gray-400">(선택)</span>
          </label>
          <textarea
            id="message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="어떤 스타일의 영상을 만들 계획인지 간단히 소개해주세요."
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button
            onClick={handleApply}
            disabled={applying}
            className="mt-4 w-full rounded-lg bg-primary py-2.5 text-white font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
          >
            {applying ? "지원 중..." : "지원하기"}
          </button>
          <p className="mt-3 text-xs text-gray-500">
            관리자 검토 후 승인되면 영상 제작을 시작할 수 있어요.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
          이 캠페인은 모집이 종료되었습니다.
        </div>
      )}
    </div>
  );
}
