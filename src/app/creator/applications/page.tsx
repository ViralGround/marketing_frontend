"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import ApplicationStatusBadge from "@/components/campaign/ApplicationStatusBadge";

type AppStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUBMITTED" | "SETTLED";

interface ApplicationItem {
  id: number;
  status: AppStatus;
  submissionUrl: string | null;
  rewardPaidAmount: number | null;
  appliedAt: string;
  settledAt: string | null;
  campaign: {
    id: number;
    title: string;
    brandName: string;
    rewardAmount: number;
    thumbnailUrl: string | null;
  };
}

type Filter = "ALL" | AppStatus;

const FILTER_LABEL: Record<Filter, string> = {
  ALL: "전체",
  PENDING: "대기",
  APPROVED: "참여",
  SUBMITTED: "제출",
  SETTLED: "정산",
  REJECTED: "거절",
};

export default function CreatorApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [loading, setLoading] = useState(true);
  const [submitModal, setSubmitModal] = useState<{
    id: number;
    campaignTitle: string;
  } | null>(null);
  const [submitUrl, setSubmitUrl] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== "ALL") params.set("status", filter);
    api
      .get(`/me/applications?${params.toString()}`)
      .then((res) => setApplications(res.data.applications))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const openSubmitModal = (id: number, campaignTitle: string) => {
    setSubmitModal({ id, campaignTitle });
    setSubmitUrl("");
    setSubmitError("");
  };

  const handleSubmitUrl = async () => {
    if (!submitModal) return;
    setSubmitError("");
    setSubmitLoading(true);
    try {
      await api.post(`/me/applications/${submitModal.id}/submit`, {
        submissionUrl: submitUrl,
      });
      setSubmitModal(null);
      load();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        "제출에 실패했습니다";
      setSubmitError(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <p className="text-sm text-gray-500">내 활동</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">지원 현황</h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-1">
        {(["ALL", "PENDING", "APPROVED", "SUBMITTED", "SETTLED", "REJECTED"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded px-3 py-1.5 text-sm ${
              filter === f
                ? "bg-gray-900 text-white"
                : "border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {FILTER_LABEL[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">불러오는 중...</p>
      ) : applications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">아직 지원한 캠페인이 없습니다.</p>
          <Link
            href="/creator/campaigns"
            className="mt-2 inline-block text-sm text-primary underline"
          >
            캠페인 탐색하러 가기
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((a) => (
            <div
              key={a.id}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4"
            >
              <Link
                href={`/creator/campaigns/${a.campaign.id}`}
                className="h-16 w-24 shrink-0 overflow-hidden rounded bg-gray-100"
              >
                {a.campaign.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.campaign.thumbnailUrl}
                    alt={a.campaign.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-300">
                    -
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">{a.campaign.brandName}</p>
                <Link
                  href={`/creator/campaigns/${a.campaign.id}`}
                  className="block truncate font-semibold text-gray-900 hover:underline"
                >
                  {a.campaign.title}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <ApplicationStatusBadge status={a.status} />
                  <span>
                    지원일: {new Date(a.appliedAt).toLocaleDateString("ko-KR")}
                  </span>
                  {a.rewardPaidAmount !== null && (
                    <span className="text-gray-900">
                      정산 ₩{a.rewardPaidAmount.toLocaleString("ko-KR")}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {(a.status === "APPROVED" || a.status === "SUBMITTED") && (
                  <button
                    onClick={() => openSubmitModal(a.id, a.campaign.title)}
                    className="rounded bg-gray-900 px-3 py-1.5 text-xs text-white hover:bg-gray-700"
                  >
                    {a.status === "APPROVED" ? "영상 제출" : "제출 URL 수정"}
                  </button>
                )}
                {a.submissionUrl && (
                  <a
                    href={a.submissionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    제출물 보기
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 제출 모달 */}
      {submitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h3 className="mb-1 text-lg font-semibold text-gray-900">영상 제출</h3>
            <p className="mb-4 text-sm text-gray-500">{submitModal.campaignTitle}</p>
            <label htmlFor="submitUrl" className="block text-sm text-gray-700">
              제출 URL (Google Drive, YouTube 등)
            </label>
            <input
              id="submitUrl"
              type="url"
              value={submitUrl}
              onChange={(e) => setSubmitUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none"
            />
            {submitError && (
              <p className="mt-2 text-sm text-red-600">{submitError}</p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setSubmitModal(null)}
                className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSubmitUrl}
                disabled={submitLoading}
                className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
              >
                {submitLoading ? "제출 중..." : "제출하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
