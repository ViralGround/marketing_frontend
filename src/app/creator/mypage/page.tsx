"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { removeTokens } from "@/lib/auth";
import { useAuthStore } from "@/store/useAuthStore";
import StatCards from "@/components/creator/StatCards";
import ApplicationStatusBadge from "@/components/campaign/ApplicationStatusBadge";
import VideoUploader from "@/components/submission/VideoUploader";
import ReviewForm from "@/components/review/ReviewForm";

type AppStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SUBMITTED"
  | "CHANGES_REQUESTED"
  | "SETTLED";
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
  videoFileKey?: string | null;
  resubmissionCount?: number | null;
  reviewComment?: string | null;
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
  CHANGES_REQUESTED: "수정요청",
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
  const [reviewModal, setReviewModal] = useState<{ id: number; campaignTitle: string } | null>(
    null,
  );
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

  const handleUploaded = () => {
    setSubmitModal(null);
    loadApps();
    loadStats();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm text-muted">마이페이지</p>
        <h1 className="mt-1 text-3xl font-bold text-foreground">
          {user?.name ?? "크리에이터"} 님의 활동 요약
        </h1>
      </div>

      {/* 스탯 카드 */}
      <div className="mb-8">
        {statsLoading || !stats ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-surface-chip" />
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
          className="group rounded-xl border border-line p-6 transition hover:border-gray-400 hover:shadow-sm"
        >
          <h2 className="mb-1 text-lg font-semibold text-foreground">캠페인 보러가기</h2>
          <p className="text-sm text-muted">새로 열린 광고 탐색</p>
          <p className="mt-4 text-sm text-primary group-hover:underline">바로 가기 →</p>
        </Link>
        <Link
          href="/profile/setup"
          className="group rounded-xl border border-line p-6 transition hover:border-gray-400 hover:shadow-sm"
        >
          <h2 className="mb-1 text-lg font-semibold text-foreground">프로필 관리</h2>
          <p className="text-sm text-muted">활동 정보와 채널 업데이트</p>
          <p className="mt-4 text-sm text-primary group-hover:underline">수정하기 →</p>
        </Link>
        <Link
          href="/creator/performance"
          className="group rounded-xl border border-line p-6 transition hover:border-gray-400 hover:shadow-sm"
        >
          <h2 className="mb-1 text-lg font-semibold text-foreground">성과 대시보드</h2>
          <p className="text-sm text-muted">SNS 조회수·좋아요·댓글 입력 및 확인</p>
          <p className="mt-4 text-sm text-primary group-hover:underline">보러 가기 →</p>
        </Link>
      </div>

      {/* 내 지원 현황 */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-foreground">내 지원 현황</h2>
        <div className="mb-4 flex flex-wrap gap-1">
          {(["ALL", "PENDING", "APPROVED", "SUBMITTED", "CHANGES_REQUESTED", "SETTLED", "REJECTED"] as Filter[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded px-3 py-1.5 text-sm ${
                  filter === f
                    ? "bg-gray-900 text-white"
                    : "border border-line-strong text-muted hover:bg-surface-muted"
                }`}
              >
                {FILTER_LABEL[f]}
              </button>
            ),
          )}
        </div>

        {appsLoading ? (
          <p className="text-muted">불러오는 중...</p>
        ) : applications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line-strong p-12 text-center">
            <p className="text-muted">아직 지원한 캠페인이 없어요.</p>
            <Link href="/creator/home" className="mt-2 inline-block text-sm text-primary underline">
              캠페인 탐색하러 가기
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-surface p-4"
              >
                <Link
                  href={`/creator/campaigns/${a.campaign.id}`}
                  className="h-16 w-24 shrink-0 overflow-hidden rounded bg-surface-chip"
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
                  <p className="text-xs text-muted">{a.campaign.brandName}</p>
                  <Link
                    href={`/creator/campaigns/${a.campaign.id}`}
                    className="block truncate font-semibold text-foreground hover:underline"
                  >
                    {a.campaign.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <ApplicationStatusBadge status={a.status} />
                    <span>지원일: {new Date(a.appliedAt).toLocaleDateString("ko-KR")}</span>
                    {a.rewardPaidAmount !== null && (
                      <span className="text-foreground">
                        정산 ₩{a.rewardPaidAmount.toLocaleString("ko-KR")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    {(a.status === "APPROVED" || a.status === "SUBMITTED") && (
                      <button
                        onClick={() => openSubmitModal(a.id, a.campaign.title)}
                        className="rounded bg-gray-900 px-3 py-1.5 text-xs text-white hover:bg-gray-700"
                      >
                        {a.status === "APPROVED" ? "영상 업로드" : "영상 재업로드"}
                      </button>
                    )}
                    {a.status === "CHANGES_REQUESTED" && (
                      <button
                        onClick={() => openSubmitModal(a.id, a.campaign.title)}
                        className="rounded bg-amber-600 px-3 py-1.5 text-xs text-white hover:bg-amber-700"
                      >
                        재제출
                      </button>
                    )}
                    {a.status === "SETTLED" && (
                      <button
                        onClick={() => setReviewModal({ id: a.id, campaignTitle: a.campaign.title })}
                        className="rounded border border-line-strong px-3 py-1.5 text-xs text-content-soft hover:bg-surface-muted"
                      >
                        리뷰 작성
                      </button>
                    )}
                    {a.videoFileKey && a.status !== "CHANGES_REQUESTED" && (
                      <span className="rounded bg-surface-chip px-3 py-1.5 text-xs text-content-soft">
                        영상 제출됨
                      </span>
                    )}
                    {!a.videoFileKey && a.submissionUrl && isSafeExternalLink(a.submissionUrl) && (
                      <a
                        href={a.submissionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded border border-line-strong px-3 py-1.5 text-xs text-content-soft hover:bg-surface-muted"
                      >
                        외부 링크 보기
                      </a>
                    )}
                  </div>
                  {a.status === "CHANGES_REQUESTED" && a.reviewComment && (
                    <p className="max-w-xs rounded bg-orange-50 px-3 py-1.5 text-xs text-orange-800">
                      <span className="font-semibold">수정 요청:</span> {a.reviewComment}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 계정 탈퇴 */}
      <section className="mt-16 border-t border-line pt-8">
        <h2 className="mb-1 text-sm font-semibold text-muted">계정 관리</h2>
        <p className="mb-4 text-sm text-faint">탈퇴 시 모든 지원 내역이 삭제되며 복구할 수 없습니다.</p>
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
          <div className="w-full max-w-sm rounded-xl bg-surface p-6">
            <h3 className="mb-2 text-lg font-semibold text-foreground">정말 탈퇴하시겠어요?</h3>
            <p className="mb-1 text-sm text-muted">탈퇴하면 모든 지원 내역과 계정 정보가 영구 삭제됩니다.</p>
            <p className="mb-4 text-sm text-red-500">이 작업은 되돌릴 수 없습니다.</p>
            {withdrawError && <p className="mb-3 text-sm text-red-600">{withdrawError}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setWithdrawModal(false)}
                disabled={withdrawLoading}
                className="rounded border border-line-strong px-3 py-1.5 text-sm text-content-soft hover:bg-surface-muted disabled:opacity-50"
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

      {/* 리뷰 작성 모달 */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-surface p-6">
            <h3 className="mb-1 text-lg font-semibold text-foreground">기업 리뷰 작성</h3>
            <p className="mb-4 text-sm text-muted">{reviewModal.campaignTitle}</p>
            <ReviewForm
              applicationId={reviewModal.id}
              onSubmitted={() => {
                setReviewModal(null);
                loadApps();
              }}
              onCancel={() => setReviewModal(null)}
            />
          </div>
        </div>
      )}

      {/* 제출 모달 */}
      {submitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-surface p-6">
            <h3 className="mb-1 text-lg font-semibold text-foreground">영상 업로드</h3>
            <p className="mb-4 text-sm text-muted">{submitModal.campaignTitle}</p>
            <VideoUploader
              applicationId={submitModal.id}
              onUploaded={handleUploaded}
              onCancel={() => setSubmitModal(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 레거시 submissionUrl 렌더링 시 javascript:/data: 스킴 주입을 차단.
 * 새로 업로드된 영상은 videoFileKey 로만 서빙하므로 이 함수는 레거시 데이터 대응 용도.
 */
function isSafeExternalLink(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
