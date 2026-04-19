"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { removeTokens } from "@/lib/auth";
import { useAuthStore } from "@/store/useAuthStore";
import StatCards from "@/components/creator/StatCards";
import ApplicationStatusBadge from "@/components/campaign/ApplicationStatusBadge";

type AppStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUBMITTED" | "SETTLED";
type Filter = "ALL" | AppStatus;

interface Stats {
  totalEarned: number;
  completedCount: number;
  activeCount: number;
}

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

const FILTER_LABEL: Record<Filter, string> = {
  ALL: "전체",
  PENDING: "대기",
  APPROVED: "참여",
  SUBMITTED: "제출",
  SETTLED: "정산",
  REJECTED: "거절",
};

export default function CreatorMyPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [submitModal, setSubmitModal] = useState<{ id: number; campaignTitle: string } | null>(
    null,
  );
  const [submitUrl, setSubmitUrl] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");

  const loadStats = () => {
    setStatsLoading(true);
    api
      .get<Stats>("/me/stats")
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  };

  const loadApps = () => {
    setAppsLoading(true);
    const params = new URLSearchParams();
    if (filter !== "ALL") params.set("status", filter);
    api
      .get(`/me/applications?${params.toString()}`)
      .then((res) => setApplications(res.data.applications))
      .catch(() => {})
      .finally(() => setAppsLoading(false));
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const openSubmitModal = (id: number, campaignTitle: string) => {
    setSubmitModal({ id, campaignTitle });
    setSubmitUrl("");
    setSubmitError("");
  };

  const handleWithdraw = async () => {
    setWithdrawError("");
    setWithdrawLoading(true);
    try {
      await api.delete("/me");
      removeTokens();
      logout();
      router.push("/");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        "탈퇴에 실패했습니다";
      setWithdrawError(msg);
      setWithdrawLoading(false);
    }
  };

  const handleSubmitUrl = async () => {
    if (!submitModal) return;
    setSubmitError("");
    setSubmitLoading(true);
    try {
      await api.post(`/me/applications/${submitModal.id}/submit`, { submissionUrl: submitUrl });
      setSubmitModal(null);
      loadApps();
      loadStats();
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
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm text-gray-500">마이페이지</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          {user?.name ?? "크리에이터"} 님의 활동 요약
        </h1>
      </div>

      {/* 스탯 카드 */}
      <div className="mb-8">
        {statsLoading || !stats ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : (
          <StatCards
            totalEarned={stats.totalEarned}
            completedCount={stats.completedCount}
            activeCount={stats.activeCount}
          />
        )}
      </div>

      {/* 빠른 이동 */}
      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          href="/creator/home"
          className="group rounded-xl border border-gray-200 p-6 transition hover:border-gray-400 hover:shadow-sm"
        >
          <h2 className="mb-1 text-lg font-semibold text-gray-900">캠페인 보러가기</h2>
          <p className="text-sm text-gray-500">새로 열린 광고 탐색</p>
          <p className="mt-4 text-sm text-primary group-hover:underline">바로 가기 →</p>
        </Link>
        <Link
          href="/profile/setup"
          className="group rounded-xl border border-gray-200 p-6 transition hover:border-gray-400 hover:shadow-sm"
        >
          <h2 className="mb-1 text-lg font-semibold text-gray-900">프로필 관리</h2>
          <p className="text-sm text-gray-500">활동 정보와 채널 업데이트</p>
          <p className="mt-4 text-sm text-primary group-hover:underline">수정하기 →</p>
        </Link>
      </div>

      {/* 내 지원 현황 */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">내 지원 현황</h2>
        <div className="mb-4 flex flex-wrap gap-1">
          {(["ALL", "PENDING", "APPROVED", "SUBMITTED", "SETTLED", "REJECTED"] as Filter[]).map(
            (f) => (
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
            ),
          )}
        </div>

        {appsLoading ? (
          <p className="text-gray-500">불러오는 중...</p>
        ) : applications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-500">아직 지원한 캠페인이 없어요.</p>
            <Link href="/creator/home" className="mt-2 inline-block text-sm text-primary underline">
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
                    <span>지원일: {new Date(a.appliedAt).toLocaleDateString("ko-KR")}</span>
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
      </section>

      {/* 계정 탈퇴 */}
      <section className="mt-16 border-t border-gray-200 pt-8">
        <h2 className="mb-1 text-sm font-semibold text-gray-500">계정 관리</h2>
        <p className="mb-4 text-sm text-gray-400">탈퇴 시 모든 지원 내역이 삭제되며 복구할 수 없습니다.</p>
        <button
          onClick={() => { setWithdrawModal(true); setWithdrawError(""); }}
          className="rounded border border-red-300 px-4 py-2 text-sm text-red-500 hover:bg-red-50"
        >
          회원 탈퇴
        </button>
      </section>

      {/* 탈퇴 확인 모달 */}
      {withdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">정말 탈퇴하시겠어요?</h3>
            <p className="mb-1 text-sm text-gray-500">탈퇴하면 모든 지원 내역과 계정 정보가 영구 삭제됩니다.</p>
            <p className="mb-4 text-sm text-red-500">이 작업은 되돌릴 수 없습니다.</p>
            {withdrawError && <p className="mb-3 text-sm text-red-600">{withdrawError}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setWithdrawModal(false)}
                disabled={withdrawLoading}
                className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawLoading}
                className="rounded bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600 disabled:opacity-50"
              >
                {withdrawLoading ? "처리 중..." : "탈퇴하기"}
              </button>
            </div>
          </div>
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
            {submitError && <p className="mt-2 text-sm text-red-600">{submitError}</p>}
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
