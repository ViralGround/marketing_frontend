"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Banknote, BarChart3, BriefcaseBusiness, CircleDot, RefreshCw, Search, Sparkles, UserRound } from "lucide-react";
import api from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { useAuthStore } from "@/store/useAuthStore";
import {
  MetricStrip,
  StatePanel,
  WorkspaceScrollArea,
  WorkspaceStage,
  WorkspaceTabPanel,
  WorkspaceTabs,
} from "@/components/workspace/WorkspacePrimitives";
import styles from "@/components/workspace/Dashboard.module.css";

type AppStatus = "PENDING" | "WITHDRAWN" | "APPROVED" | "REJECTED" | "SUBMITTED" | "CHANGES_REQUESTED" | "SETTLED";
type Stats = { totalEarned: number; completedCount: number; activeCount: number };
type Application = { id: number; status: AppStatus; appliedAt: string; campaign: { id: number; title: string; brandName: string; rewardAmount: number } };
type Campaign = { id: number; title: string; brandName: string; rewardAmount: number; deadline: string | null; applicationCount: number; myApplication: { status: AppStatus } | null };
type PerformanceItem = { applicationId: number; campaignTitle: string; brandName: string; views: number };
type Performance = { totals: { views: number; likes: number; comments: number; completedCount: number }; items?: PerformanceItem[] };
type DashboardTab = "todo" | "performance" | "discover" | "settlement";
type LoadState = "loading" | "ready" | "error";

const STATUS: Record<AppStatus, { ko: string; en: string; className: string }> = {
  PENDING: { ko: "검토 중", en: "Pending", className: styles.statusOrange },
  WITHDRAWN: { ko: "철회", en: "Withdrawn", className: styles.statusNeutral },
  APPROVED: { ko: "제작 준비", en: "Ready", className: styles.statusViolet },
  REJECTED: { ko: "미선정", en: "Not selected", className: styles.statusNeutral },
  SUBMITTED: { ko: "검수 중", en: "In review", className: styles.statusOrange },
  CHANGES_REQUESTED: { ko: "수정 필요", en: "Changes needed", className: styles.statusOrange },
  SETTLED: { ko: "완료", en: "Complete", className: styles.statusGreen },
};

function daysLeft(deadline: string) {
  const end = new Date(deadline);
  end.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - today.getTime()) / 86_400_000);
}

export default function CreatorDashboardPage() {
  const { t } = useLang();
  const user = useAuthStore((state) => state.user);
  const [tab, setTab] = useState<DashboardTab>("todo");
  const [stats, setStats] = useState<Stats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [statsState, setStatsState] = useState<LoadState>("loading");
  const [applicationsState, setApplicationsState] = useState<LoadState>("loading");
  const [campaignsState, setCampaignsState] = useState<LoadState>("loading");
  const [performanceState, setPerformanceState] = useState<LoadState>("loading");

  const loadStats = useCallback((signal?: AbortSignal) => {
    return api.get<Stats>("/me/stats", { signal }).then((response) => { setStats(response.data); setStatsState("ready"); }).catch((error) => { if (error?.code !== "ERR_CANCELED") setStatsState("error"); });
  }, []);
  const loadApplications = useCallback((signal?: AbortSignal) => {
    return api.get<{ applications: Application[] }>("/me/applications", { signal }).then((response) => { setApplications(response.data.applications); setApplicationsState("ready"); }).catch((error) => { if (error?.code !== "ERR_CANCELED") setApplicationsState("error"); });
  }, []);
  const loadCampaigns = useCallback((signal?: AbortSignal) => {
    return api.get<{ campaigns: Campaign[] }>("/campaigns?sort=recent", { signal }).then((response) => { setCampaigns(response.data.campaigns); setCampaignsState("ready"); }).catch((error) => { if (error?.code !== "ERR_CANCELED") setCampaignsState("error"); });
  }, []);
  const loadPerformance = useCallback((signal?: AbortSignal) => {
    return api.get<Performance>("/me/performance", { signal }).then((response) => { setPerformance(response.data); setPerformanceState("ready"); }).catch((error) => { if (error?.code !== "ERR_CANCELED") setPerformanceState("error"); });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadStats(controller.signal);
    void loadApplications(controller.signal);
    void loadCampaigns(controller.signal);
    void loadPerformance(controller.signal);
    return () => controller.abort();
  }, [loadApplications, loadCampaigns, loadPerformance, loadStats]);

  const activeApplications = useMemo(() => applications.filter((application) => ["APPROVED", "SUBMITTED", "CHANGES_REQUESTED"].includes(application.status)), [applications]);
  const settledApplications = useMemo(() => applications.filter((application) => application.status === "SETTLED"), [applications]);
  const pendingCount = applications.filter((application) => application.status === "PENDING").length;
  const revisionCount = applications.filter((application) => application.status === "CHANGES_REQUESTED").length;
  const performanceRows = useMemo(() => [...(performance?.items ?? [])].sort((a, b) => b.views - a.views).slice(0, 8), [performance]);
  const performanceMax = Math.max(1, ...performanceRows.map((item) => item.views));
  const schedule = useMemo(() => campaigns.filter((campaign) => campaign.deadline !== null && daysLeft(campaign.deadline as string) >= 0).sort((a, b) => daysLeft(a.deadline as string) - daysLeft(b.deadline as string)).slice(0, 8), [campaigns]);

  if ([statsState, applicationsState, campaignsState, performanceState].every((state) => state === "loading")) {
    return <div className={styles.loading} aria-label={t("크리에이터 대시보드 불러오는 중", "Loading creator dashboard")} />;
  }

  const metrics = [
    { label: t("진행 중", "Active work"), value: statsState === "ready" ? stats!.activeCount.toLocaleString() : "—", hint: t("선정 이후 작업", "Post-selection work"), tone: "accent" as const },
    { label: t("검토 중 지원", "Pending"), value: applicationsState === "ready" ? pendingCount.toLocaleString() : "—", hint: t("브랜드 검토 대기", "Awaiting review") },
    { label: t("수정 요청", "Revisions"), value: applicationsState === "ready" ? revisionCount.toLocaleString() : "—", hint: t("확인 필요", "Needs attention"), tone: revisionCount > 0 ? "warning" as const : "default" as const },
    { label: t("누적 정산 기록", "Settled"), value: statsState === "ready" ? `₩${stats!.totalEarned.toLocaleString("ko-KR")}` : "—", hint: t("완료 기록 기준", "Completed records") },
    { label: t("누적 조회수", "Total views"), value: performanceState === "ready" ? performance!.totals.views.toLocaleString("ko-KR") : "—", hint: t("입력된 실제 성과", "Recorded performance") },
  ];

  const failure = (title: string, retry: () => void) => <StatePanel icon={RefreshCw} tone="error" title={title} description={t("다른 탭은 그대로 사용할 수 있습니다.", "The other tabs remain available.")} action={<button type="button" className={styles.retry} onClick={retry}>{t("이 영역 다시 불러오기", "Retry this area")}</button>} />;

  const header = (
    <>
      <header className={styles.compactHeader}>
        <div><h1>{t("크리에이터 작업 데스크", "Creator work desk")}</h1><p>{t(`${user?.name ?? "크리에이터"}님의 오늘 할 일과 주의 항목을 먼저 보여드립니다.`, `Your next actions and attention items come first, ${user?.name ?? "creator"}.`)}</p></div>
        <Link href="/creator/home" className={styles.primaryAction}><Search aria-hidden="true" />{t("캠페인 찾기", "Find campaigns")}</Link>
      </header>
      <MetricStrip items={metrics} label={t("크리에이터 핵심 지표", "Creator key metrics")} />
      <WorkspaceTabs
        label={t("크리에이터 대시보드 보기", "Creator dashboard views")}
        value={tab}
        onChange={setTab}
        options={[
          { value: "todo", label: t("할 일", "To do"), count: activeApplications.length + revisionCount },
          { value: "performance", label: t("성과", "Performance") },
          { value: "discover", label: t("탐색", "Discover"), count: campaigns.length },
          { value: "settlement", label: t("정산", "Settlement") },
        ]}
      />
    </>
  );

  return (
    <WorkspaceStage header={header} className={styles.dashboardStage}>
      <WorkspaceTabPanel value="todo" activeValue={tab}>
        <div className={styles.operationGrid}>
          <section className={styles.workPanel}>
            <header><h2>{t("다음 작업", "Next actions")}</h2><span>01</span></header>
            <div className={styles.actionRows}>
              <Link href="/creator/home"><span><strong>{t("내 채널에 맞는 캠페인 찾기", "Find a fitting campaign")}</strong><small>{t("모집 중인 AI SaaS 브리프 확인", "Review recruiting AI SaaS briefs")}</small></span><ArrowRight aria-hidden="true" /></Link>
              <Link href="/creator/profile"><span><strong>{t("크리에이터 프로필 정리", "Complete creator profile")}</strong><small>{t("활동 정보와 공개 범위 관리", "Manage activity details and visibility")}</small></span><UserRound aria-hidden="true" /></Link>
              <Link href="/creator/performance"><span><strong>{t("실제 성과 입력", "Record real performance")}</strong><small>{t("완료 콘텐츠의 조회·반응 기록", "Record views and engagement")}</small></span><BarChart3 aria-hidden="true" /></Link>
            </div>
            <div className={styles.paymentNotice}><Banknote aria-hidden="true" /><p><strong>MANAGED BETA</strong>{t("지급 방식과 일정은 캠페인 참여 확정 시 운영팀이 개별 안내합니다.", "Payout method and timing are confirmed with our team when participation is finalized.")}</p></div>
          </section>
          <section className={styles.workPanel}>
            <header><h2>{t("지금 진행할 작업", "Work in progress")}</h2><Link href="/creator/mypage#creator-applications">{t("전체 보기", "View all")}</Link></header>
            {applicationsState === "error" ? failure(t("지원 현황을 불러오지 못했습니다.", "Applications are unavailable."), () => void loadApplications()) : applicationsState === "loading" ? <div className={styles.innerLoading} /> : activeApplications.length === 0 ? (
              <StatePanel icon={BriefcaseBusiness} title={t("진행 중인 제작 작업이 없습니다.", "No production work is active.")} description={t("새 캠페인을 살펴보고 내 채널과 맞는 브리프에 지원해보세요.", "Explore campaigns and apply to a fitting brief.")} action={<Link className={styles.inlineAction} href="/creator/home">{t("캠페인 둘러보기", "Browse campaigns")}</Link>} />
            ) : (
              <WorkspaceScrollArea label={t("진행 중 작업 목록", "Active work list")}><div className={styles.tableHead}><span>{t("캠페인", "Campaign")}</span><span>{t("보상", "Reward")}</span><span>{t("상태", "Status")}</span></div><div className={styles.list}>{activeApplications.map((application) => <Link href="/creator/mypage#creator-applications" className={styles.row} key={application.id}><span><span className={styles.rowTitle}>{application.campaign.title}</span><span className={styles.rowMeta}>{application.campaign.brandName} · {new Date(application.appliedAt).toLocaleDateString("ko-KR")}</span></span><span className={styles.rowNumber}>₩{application.campaign.rewardAmount.toLocaleString("ko-KR")}</span><span className={`${styles.status} ${STATUS[application.status].className}`}>{t(STATUS[application.status].ko, STATUS[application.status].en)}</span></Link>)}</div></WorkspaceScrollArea>
            )}
          </section>
        </div>
      </WorkspaceTabPanel>

      <WorkspaceTabPanel value="performance" activeValue={tab}>
        {performanceState === "error" ? failure(t("성과 기록을 불러오지 못했습니다.", "Performance is unavailable."), () => void loadPerformance()) : (
          <div className={styles.splitGrid}>
            <section className={styles.workPanel}>
              <header><h2>{t("작품별 성과", "Performance by content")}</h2><Link href="/creator/performance">{t("성과 입력", "Record performance")}</Link></header>
              {performanceRows.length === 0 ? <StatePanel icon={BarChart3} title={t("기록된 성과가 아직 없습니다.", "No performance recorded yet.")} description={t("완료 콘텐츠의 실제 수치를 입력하면 작품별 성과가 표시됩니다.", "Record real results from completed content to see them here.")} /> : <WorkspaceScrollArea label={t("작품별 조회수", "Views by content")}><div className={styles.chart}>{performanceRows.map((item) => <div className={styles.chartRow} key={item.applicationId}><span>{item.campaignTitle}</span><span className={styles.chartTrack}><span style={{ width: `${(item.views / performanceMax) * 100}%` }} /></span><strong>{item.views.toLocaleString("ko-KR")}</strong></div>)}</div></WorkspaceScrollArea>}
            </section>
            <section className={styles.workPanel}>
              <header><h2>{t("성과 합계", "Performance totals")}</h2><Sparkles aria-hidden="true" /></header>
              <dl className={styles.summaryList}><div><dt>{t("좋아요", "Likes")}</dt><dd>{performance?.totals.likes.toLocaleString("ko-KR") ?? "—"}</dd></div><div><dt>{t("댓글", "Comments")}</dt><dd>{performance?.totals.comments.toLocaleString("ko-KR") ?? "—"}</dd></div><div><dt>{t("완료 콘텐츠", "Completed content")}</dt><dd>{performance?.totals.completedCount.toLocaleString("ko-KR") ?? "—"}</dd></div></dl>
            </section>
          </div>
        )}
      </WorkspaceTabPanel>

      <WorkspaceTabPanel value="discover" activeValue={tab}>
        {campaignsState === "error" ? failure(t("캠페인을 불러오지 못했습니다.", "Campaigns are unavailable."), () => void loadCampaigns()) : (
          <div className={styles.splitGrid}>
            <section className={styles.workPanel}>
              <header><h2>{t("새 캠페인", "New campaigns")}</h2><Link href="/creator/home">{t("전체 캠페인", "All campaigns")}</Link></header>
              {campaigns.length === 0 ? <StatePanel icon={Search} title={t("현재 모집 중인 캠페인이 없습니다.", "No campaigns are recruiting right now.")} description={t("새 브리프가 열리면 실제 캠페인 정보가 표시됩니다.", "New briefs appear here when they open.")} /> : <WorkspaceScrollArea label={t("새 캠페인 목록", "New campaign list")}><div className={styles.list}>{campaigns.map((campaign) => <Link href={`/creator/campaigns/${campaign.id}`} className={styles.row} key={campaign.id}><span><span className={styles.rowTitle}>{campaign.title}</span><span className={styles.rowMeta}>{campaign.brandName} · {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString("ko-KR") : t("마감일 미정", "No deadline")}</span></span><span className={styles.rowNumber}>₩{campaign.rewardAmount.toLocaleString("ko-KR")}</span><span className={`${styles.status} ${campaign.myApplication ? styles.statusNeutral : styles.statusViolet}`}>{campaign.myApplication ? t("지원함", "Applied") : t("모집 중", "Open")}</span></Link>)}</div></WorkspaceScrollArea>}
            </section>
            <section className={styles.workPanel}>
              <header><h2>{t("다가오는 일정", "Upcoming deadlines")}</h2><CircleDot aria-hidden="true" /></header>
              {schedule.length === 0 ? <StatePanel title={t("예정된 마감이 없습니다.", "No deadlines coming up.")} description={t("마감일이 있는 캠페인이 열리면 표시됩니다.", "Campaigns with deadlines appear here.")} /> : <WorkspaceScrollArea label={t("모집 마감 목록", "Recruiting deadline list")}><div className={styles.schedule}>{schedule.map((campaign) => { const remaining = daysLeft(campaign.deadline as string); return <Link href={`/creator/campaigns/${campaign.id}`} className={styles.scheduleRow} key={campaign.id}><span><strong>{campaign.title}</strong><small>{campaign.brandName}</small></span><span className={`${styles.dday} ${remaining <= 3 ? styles.ddaySoon : ""}`}>{remaining === 0 ? "D-DAY" : `D-${remaining}`}</span></Link>; })}</div></WorkspaceScrollArea>}
            </section>
          </div>
        )}
      </WorkspaceTabPanel>

      <WorkspaceTabPanel value="settlement" activeValue={tab}>
        <div className={styles.splitGrid}>
          <section className={`${styles.workPanel} ${styles.settlementPanel}`}>
            <header><h2>{t("정산 현황", "Settlement")}</h2><Banknote aria-hidden="true" /></header>
            {statsState === "error" ? failure(t("정산 기록을 불러오지 못했습니다.", "Settlement records are unavailable."), () => void loadStats()) : <div className={styles.settlementTotal}><span>{t("누적 정산 기록", "Total settled")}</span><strong>₩{stats?.totalEarned.toLocaleString("ko-KR") ?? "—"}</strong><p>{t("완료(SETTLED) 처리된 캠페인 보상 합계", "Rewards from campaigns marked SETTLED")}</p></div>}
          </section>
          <section className={styles.workPanel}>
            <header><h2>{t("완료 내역", "Completed records")}</h2><Link href="/creator/mypage#creator-applications">{t("전체 내역", "Full history")}</Link></header>
            {applicationsState === "error" ? failure(t("완료 내역을 불러오지 못했습니다.", "Completed records are unavailable."), () => void loadApplications()) : settledApplications.length === 0 ? <StatePanel title={t("아직 정산 완료된 캠페인이 없습니다.", "No settled campaigns yet.")} description={t("첫 캠페인을 완주하면 내역이 표시됩니다.", "Finish your first campaign to see records.")} /> : <WorkspaceScrollArea label={t("정산 완료 내역", "Settled campaign records")}><div className={styles.settleList}>{settledApplications.map((application) => <div className={styles.settleRow} key={application.id}><span>{application.campaign.title}</span><strong>+₩{application.campaign.rewardAmount.toLocaleString("ko-KR")}</strong></div>)}</div></WorkspaceScrollArea>}
          </section>
        </div>
      </WorkspaceTabPanel>
    </WorkspaceStage>
  );
}
