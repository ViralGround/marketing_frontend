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
import { useLang } from "@/lib/i18n";
import PageHeader from "@/components/workspace/PageHeader";
import {
  FilterToolbar,
  ResponsiveSheet,
  SegmentedControl,
  StatePanel,
  StateSkeleton,
  WorkspacePage,
  WorkspaceRecordCell,
  WorkspaceRecordList,
  WorkspaceRecordRow,
  WorkspaceScrollArea,
  WorkspaceStage,
  WorkspaceTabPanel,
  WorkspaceTabs,
} from "@/components/workspace/WorkspacePrimitives";
import viewStyles from "@/components/workspace/WorkspaceViews.module.css";

type AppStatus = "PENDING" | "WITHDRAWN" | "APPROVED" | "REJECTED" | "SUBMITTED" | "CHANGES_REQUESTED" | "SETTLED";
type Filter = "ALL" | AppStatus;
type WorkTab = "applications" | "instagram" | "account";

interface Stats { totalEarned: number; completedCount: number; activeCount: number }
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
  campaign: { id: number; title: string; brandName: string; rewardAmount: number; thumbnailUrl: string | null };
}

const FILTER_LABEL: Record<Filter, { ko: string; en: string }> = {
  ALL: { ko: "전체", en: "All" }, PENDING: { ko: "대기", en: "Pending" }, WITHDRAWN: { ko: "철회", en: "Withdrawn" }, APPROVED: { ko: "참여", en: "Approved" }, SUBMITTED: { ko: "제출", en: "Submitted" }, CHANGES_REQUESTED: { ko: "수정 요청", en: "Changes" }, SETTLED: { ko: "완료", en: "Settled" }, REJECTED: { ko: "미선정", en: "Rejected" },
};
const FILTERS = ["ALL", "PENDING", "WITHDRAWN", "APPROVED", "SUBMITTED", "CHANGES_REQUESTED", "SETTLED", "REJECTED"] as Filter[];
const COLUMNS = "minmax(14rem,1.4fr) minmax(10rem,.9fr) minmax(7rem,.6fr) minmax(7rem,.6fr)";

export default function CreatorMyPage() {
  const { user } = useAuthStore();
  const { t } = useLang();
  const [tab, setTab] = useState<WorkTab>("applications");
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [appsError, setAppsError] = useState(false);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [submitModal, setSubmitModal] = useState<{ id: number; campaignTitle: string } | null>(null);
  const [reviewModal, setReviewModal] = useState<{ id: number; campaignTitle: string } | null>(null);

  const loadStats = () => {
    setStatsLoading(true);
    api.get<Stats>("/me/stats").then((response) => setStats(response.data)).catch(() => {}).finally(() => setStatsLoading(false));
  };

  const loadApps = () => {
    setAppsLoading(true);
    const params = new URLSearchParams();
    if (filter !== "ALL") params.set("status", filter);
    api.get<{ applications: ApplicationItem[] }>(`/me/applications?${params.toString()}`).then((response) => { setApplications(response.data.applications); setAppsError(false); }).catch(() => setAppsError(true)).finally(() => setAppsLoading(false));
  };

  useEffect(() => {
    let active = true;
    api.get<Stats>("/me/stats").then((response) => { if (active) setStats(response.data); }).catch(() => {}).finally(() => { if (active) setStatsLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (filter !== "ALL") params.set("status", filter);
    api.get<{ applications: ApplicationItem[] }>(`/me/applications?${params.toString()}`).then((response) => { if (active) { setApplications(response.data.applications); setAppsError(false); } }).catch(() => { if (active) setAppsError(true); }).finally(() => { if (active) setAppsLoading(false); });
    return () => { active = false; };
  }, [filter]);

  const handleUploaded = () => { setSubmitModal(null); loadApps(); loadStats(); };

  const actionFor = (application: ApplicationItem) => {
    if (["APPROVED", "SUBMITTED", "CHANGES_REQUESTED"].includes(application.status)) {
      const label = application.status === "APPROVED" ? t("영상 업로드", "Upload video") : application.status === "CHANGES_REQUESTED" ? t("재제출", "Resubmit") : t("영상 재업로드", "Re-upload");
      return <Button size="sm" onClick={() => setSubmitModal({ id: application.id, campaignTitle: application.campaign.title })}>{label}</Button>;
    }
    if (application.status === "SETTLED") return <Button size="sm" variant="secondary" onClick={() => setReviewModal({ id: application.id, campaignTitle: application.campaign.title })}>{t("리뷰 작성", "Write review")}</Button>;
    if (!application.videoFileKey && application.submissionUrl && isSafeExternalLink(application.submissionUrl)) return <a href={application.submissionUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center rounded-full border border-line-strong px-3 text-xs font-bold text-content-soft">{t("외부 링크", "External link")}</a>;
    return null;
  };

  const header = (
    <div className={viewStyles.headerStack}>
      <PageHeader display="MY WORK" subtitle={t(`${user?.name ?? "크리에이터"}님의 지원, 콘텐츠 제출과 계정 연결을 관리하세요.`, `Manage ${user?.name ?? "your"} applications, submissions, and account connections.`)} />
      {statsLoading || !stats ? <div className="h-[68px] animate-pulse bg-surface-chip" /> : <StatCards totalEarned={stats.totalEarned} completedCount={stats.completedCount} activeCount={stats.activeCount} />}
      <WorkspaceTabs label={t("내 작업 메뉴", "My work sections")} value={tab} onChange={setTab} options={[{ value: "applications", label: t("지원·콘텐츠", "Applications & content"), count: applications.length }, { value: "instagram", label: "Instagram" }, { value: "account", label: t("계정", "Account") }]} />
    </div>
  );

  return (
    <WorkspacePage size="wide" flow={false}>
      <WorkspaceStage className={viewStyles.pageStage} header={header}>
        <WorkspaceTabPanel value="applications" activeValue={tab}>
          <div id="creator-applications" className={viewStyles.tabBody}>
            <FilterToolbar primary={<SegmentedControl label={t("지원 상태 필터", "Application status filter")} value={filter} options={FILTERS.map((value) => ({ value, label: t(FILTER_LABEL[value].ko, FILTER_LABEL[value].en) }))} onChange={(value) => { if (value !== filter) { setAppsLoading(true); setFilter(value); } }} />} secondary={<Link href="/creator/home" className="inline-flex h-11 items-center rounded-full bg-primary px-4 text-xs font-bold text-white">{t("캠페인 탐색", "Discover campaigns")}</Link>} />
            {appsLoading ? <StateSkeleton label={t("지원 현황 불러오는 중", "Loading applications")} /> : appsError ? <StatePanel tone="error" title={t("지원 현황을 불러오지 못했습니다.", "Applications are unavailable.")} description={t("필터를 유지한 채 다시 시도할 수 있습니다.", "Retry without losing the selected filter.")} action={<Button onClick={loadApps}>{t("다시 불러오기", "Retry")}</Button>} /> : applications.length === 0 ? <StatePanel title={t("아직 지원한 캠페인이 없어요.", "You haven't applied to any campaigns yet.")} description={t("내 채널에 맞는 캠페인을 찾아 첫 지원을 시작하세요.", "Find a campaign that fits your channel and start your first application.")} action={<Link href="/creator/home" className="inline-flex h-11 items-center rounded-full bg-primary px-4 text-xs font-bold text-white">{t("캠페인 탐색", "Browse campaigns")}</Link>} /> : (
              <WorkspaceRecordList columns={COLUMNS} labels={[t("캠페인", "Campaign"), t("상태·작업", "Status & action"), t("지원일", "Applied"), t("정산", "Settled")]}>
                {applications.map((application) => (
                  <WorkspaceRecordRow key={application.id} columns={COLUMNS}>
                    <WorkspaceRecordCell label={t("캠페인", "Campaign")}><span className={viewStyles.applicationRowTitle}><span className={viewStyles.thumbnail}>{application.campaign.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={application.campaign.thumbnailUrl} alt="" />
                    ) : "VG"}</span><span className={viewStyles.titleCopy}><Link href={`/creator/campaigns/${application.campaign.id}`} className={viewStyles.recordTitle}>{application.campaign.title}</Link><small className={viewStyles.recordMeta}>{application.campaign.brandName} · ₩{application.campaign.rewardAmount.toLocaleString("ko-KR")}</small>{application.status === "CHANGES_REQUESTED" && application.reviewComment && <small className={viewStyles.applicationNote}>{t("수정 요청", "Changes")}: {application.reviewComment}</small>}</span></span></WorkspaceRecordCell>
                    <WorkspaceRecordCell label={t("상태·작업", "Status & action")}><span className={viewStyles.applicationStatus}><ApplicationStatusBadge status={application.status} />{actionFor(application)}</span></WorkspaceRecordCell>
                    <WorkspaceRecordCell label={t("지원일", "Applied")}>{new Date(application.appliedAt).toLocaleDateString("ko-KR")}</WorkspaceRecordCell>
                    <WorkspaceRecordCell label={t("정산", "Settled")}><span className={viewStyles.recordStrong}>{application.rewardPaidAmount !== null ? `₩${application.rewardPaidAmount.toLocaleString("ko-KR")}` : "—"}</span></WorkspaceRecordCell>
                  </WorkspaceRecordRow>
                ))}
              </WorkspaceRecordList>
            )}
          </div>
        </WorkspaceTabPanel>

        <WorkspaceTabPanel value="instagram" activeValue={tab}>
          <WorkspaceScrollArea padded label={t("Instagram 연결 설정", "Instagram connection settings")}><div className={viewStyles.settingsStack}><InstagramConnectCard /></div></WorkspaceScrollArea>
        </WorkspaceTabPanel>

        <WorkspaceTabPanel value="account" activeValue={tab}>
          <WorkspaceScrollArea padded label={t("계정 설정", "Account settings")}><div className={viewStyles.settingsStack}><MarketingConsentSettings /><CreatorAccountDeletion /></div></WorkspaceScrollArea>
        </WorkspaceTabPanel>
      </WorkspaceStage>

      <ResponsiveSheet open={Boolean(reviewModal)} onClose={() => setReviewModal(null)} title={t("브랜드 리뷰 작성", "Write a brand review")} description={reviewModal?.campaignTitle} label={t("리뷰 닫기", "Close review")} size="compact">
        {reviewModal && <ReviewForm applicationId={reviewModal.id} onSubmitted={() => { setReviewModal(null); loadApps(); }} onCancel={() => setReviewModal(null)} />}
      </ResponsiveSheet>
      <ResponsiveSheet open={Boolean(submitModal)} onClose={() => setSubmitModal(null)} title={t("영상 업로드", "Upload video")} description={submitModal?.campaignTitle} label={t("영상 업로드 닫기", "Close video upload")} size="compact">
        {submitModal && <VideoUploader applicationId={submitModal.id} onUploaded={handleUploaded} onCancel={() => setSubmitModal(null)} />}
      </ResponsiveSheet>
    </WorkspacePage>
  );
}

function isSafeExternalLink(raw: string): boolean {
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
