"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import StatCards from "@/components/creator/StatCards";
import InstagramConnectCard from "@/components/creator/InstagramConnectCard";
import CreatorAccountDeletion from "@/components/creator/CreatorAccountDeletion";
import MarketingConsentSettings from "@/components/account/MarketingConsentSettings";
import ApplicationStatusBadge from "@/components/campaign/ApplicationStatusBadge";
import VideoUploader from "@/components/submission/VideoUploader";
import ReviewForm from "@/components/review/ReviewForm";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useLang } from "@/lib/i18n";

type AppStatus =
  | "PENDING"
  | "WITHDRAWN"
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

const FILTER_LABEL: Record<Filter, { ko: string; en: string }> = {
  ALL: { ko: "전체", en: "All" },
  PENDING: { ko: "대기", en: "Pending" },
  WITHDRAWN: { ko: "탈퇴", en: "Withdrawn" },
  APPROVED: { ko: "참여", en: "Approved" },
  SUBMITTED: { ko: "제출", en: "Submitted" },
  CHANGES_REQUESTED: { ko: "수정요청", en: "Changes requested" },
  SETTLED: { ko: "정산", en: "Settled" },
  REJECTED: { ko: "거절", en: "Rejected" },
};

export default function CreatorMyPage() {
  const { user } = useAuthStore();
  const { t } = useLang();
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
    let active = true;
    api
      .get<Stats>("/me/stats")
      .then((res) => {
        if (active) setStats(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setStatsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (filter !== "ALL") params.set("status", filter);
    api
      .get(`/me/applications?${params.toString()}`)
      .then((res) => {
        if (active) setApplications(res.data.applications);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setAppsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filter]);

  const openSubmitModal = (id: number, campaignTitle: string) => {
    setSubmitModal({ id, campaignTitle });
  };

  const handleUploaded = () => {
    setSubmitModal(null);
    loadApps();
    loadStats();
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
      <div className="mb-10">
        <p className="text-sm font-medium text-muted">{t("마이페이지", "My Page")}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t(
            `${user?.name ?? "크리에이터"} 님의 활동 요약`,
            `${user?.name ?? "Creator"}'s activity summary`,
          )}
        </h1>
      </div>

      {/* 스탯 카드 */}
      <div className="mb-10">
        {statsLoading || !stats ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface-chip" />
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
      <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          href="/creator/home"
          className="group rounded-2xl border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
        >
          <h2 className="mb-1 text-lg font-semibold text-foreground">{t("캠페인 보러가기", "Browse campaigns")}</h2>
          <p className="text-sm text-muted">{t("새로 열린 광고 탐색", "Discover newly opened campaigns")}</p>
          <p className="mt-4 text-sm font-medium text-primary">{t("바로 가기 →", "Go now →")}</p>
        </Link>
        <Link
          href="/profile/setup"
          className="group rounded-2xl border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
        >
          <h2 className="mb-1 text-lg font-semibold text-foreground">{t("프로필 관리", "Manage profile")}</h2>
          <p className="text-sm text-muted">{t("활동 정보와 채널 업데이트", "Update your info and channels")}</p>
          <p className="mt-4 text-sm font-medium text-primary">{t("수정하기 →", "Edit →")}</p>
        </Link>
        <Link
          href="/creator/performance"
          className="group rounded-2xl border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
        >
          <h2 className="mb-1 text-lg font-semibold text-foreground">{t("성과 대시보드", "Performance dashboard")}</h2>
          <p className="text-sm text-muted">{t("SNS 조회수·좋아요·댓글 입력 및 확인", "Enter and review views, likes, and comments")}</p>
          <p className="mt-4 text-sm font-medium text-primary">{t("보러 가기 →", "View →")}</p>
        </Link>
      </div>

      {/* 인스타그램 연동 */}
      <div className="mb-12">
        <InstagramConnectCard />
      </div>

      {/* 내 지원 현황 */}
      <section id="creator-applications" className="scroll-mt-24">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{t("내 지원 현황", "My application status")}</h2>
        <div className="mb-5 flex flex-wrap gap-1.5">
          {(
            [
              "ALL",
              "PENDING",
              "WITHDRAWN",
              "APPROVED",
              "SUBMITTED",
              "CHANGES_REQUESTED",
              "SETTLED",
              "REJECTED",
            ] as Filter[]
          ).map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  if (active) return;
                  setAppsLoading(true);
                  setFilter(f);
                }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-white"
                    : "border border-line text-content-soft hover:border-primary/40 hover:text-primary"
                }`}
              >
                {t(FILTER_LABEL[f].ko, FILTER_LABEL[f].en)}
              </button>
            );
          })}
        </div>

        {appsLoading ? (
          <p className="text-muted">{t("불러오는 중...", "Loading...")}</p>
        ) : applications.length === 0 ? (
          <Card className="border-dashed bg-surface-muted py-16 text-center">
            <p className="text-muted">{t("아직 지원한 캠페인이 없어요.", "You haven't applied to any campaigns yet.")}</p>
            <Link
              href="/creator/home"
              className="mt-2 inline-block text-sm font-medium text-primary underline-offset-2 hover:underline"
            >
              {t("캠페인 탐색하러 가기", "Browse campaigns")}
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {applications.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-line-strong"
              >
                <Link
                  href={`/creator/campaigns/${a.campaign.id}`}
                  className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-chip"
                >
                  {a.campaign.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.campaign.thumbnailUrl}
                      alt={a.campaign.title}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-faint">
                      -
                    </div>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted">{a.campaign.brandName}</p>
                  <Link
                    href={`/creator/campaigns/${a.campaign.id}`}
                    className="block truncate font-semibold text-foreground hover:text-primary"
                  >
                    {a.campaign.title}
                  </Link>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <ApplicationStatusBadge status={a.status} />
                    <span>
                      {t("지원일", "Applied")}: {new Date(a.appliedAt).toLocaleDateString("ko-KR")}
                    </span>
                    {a.rewardPaidAmount !== null && (
                      <span className="font-semibold text-foreground">
                        {t("정산", "Settled")} ₩{a.rewardPaidAmount.toLocaleString("ko-KR")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex flex-wrap gap-2">
                    {(a.status === "APPROVED" || a.status === "SUBMITTED") && (
                      <Button size="sm" onClick={() => openSubmitModal(a.id, a.campaign.title)}>
                        {a.status === "APPROVED"
                          ? t("영상 업로드", "Upload video")
                          : t("영상 재업로드", "Re-upload video")}
                      </Button>
                    )}
                    {a.status === "CHANGES_REQUESTED" && (
                      <Button size="sm" onClick={() => openSubmitModal(a.id, a.campaign.title)}>
                        {t("재제출", "Resubmit")}
                      </Button>
                    )}
                    {a.status === "SETTLED" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setReviewModal({ id: a.id, campaignTitle: a.campaign.title })
                        }
                      >
                        {t("리뷰 작성", "Write review")}
                      </Button>
                    )}
                    {a.videoFileKey && a.status !== "CHANGES_REQUESTED" && (
                      <span className="inline-flex items-center rounded-full bg-surface-chip px-3 py-1.5 text-xs font-medium text-content-soft">
                        {t("영상 제출됨", "Video submitted")}
                      </span>
                    )}
                    {!a.videoFileKey && a.submissionUrl && isSafeExternalLink(a.submissionUrl) && (
                      <a
                        href={a.submissionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-full border border-line-strong px-3 py-1.5 text-xs font-medium text-content-soft transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        {t("외부 링크 보기", "View external link")}
                      </a>
                    )}
                  </div>
                  {a.status === "CHANGES_REQUESTED" && a.reviewComment && (
                    <p className="max-w-xs rounded-xl border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning">
                      <span className="font-semibold">{t("수정 요청", "Changes requested")}:</span> {a.reviewComment}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <MarketingConsentSettings />
      <CreatorAccountDeletion />

      {/* 리뷰 작성 모달 */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl">
            <h3 className="mb-1 text-lg font-semibold text-foreground">{t("브랜드 리뷰 작성", "Write a brand review")}</h3>
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
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl">
            <h3 className="mb-1 text-lg font-semibold text-foreground">{t("영상 업로드", "Upload video")}</h3>
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
