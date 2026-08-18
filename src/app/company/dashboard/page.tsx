"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, BriefcaseBusiness, CalendarDays, CircleOff, FilePlus2, RefreshCw } from "lucide-react";
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

type CampaignStatus = "DRAFT" | "OPEN" | "CLOSED";
type Summary = { totalCampaigns: number; pendingDeposit: number; depositConfirming: number; funded: number; closed: number };
type Campaign = { id: number; title: string; brandName: string; status: CampaignStatus; applicationCount: number; deadline: string | null; createdAt: string };
type DashboardTab = "operations" | "pipeline" | "schedule";
type LoadState = "loading" | "ready" | "error";

const STATUS: Record<CampaignStatus, { ko: string; en: string; className: string }> = {
  DRAFT: { ko: "작성 중", en: "Draft", className: styles.statusOrange },
  OPEN: { ko: "모집 중", en: "Recruiting", className: styles.statusGreen },
  CLOSED: { ko: "종료", en: "Closed", className: styles.statusNeutral },
};

function daysLeft(deadline: string) {
  const end = new Date(deadline);
  end.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - today.getTime()) / 86_400_000);
}

export default function CompanyDashboardPage() {
  const { t } = useLang();
  const user = useAuthStore((state) => state.user);
  const [tab, setTab] = useState<DashboardTab>("operations");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [summaryState, setSummaryState] = useState<LoadState>("loading");
  const [campaignState, setCampaignState] = useState<LoadState>("loading");

  const loadSummary = useCallback((signal?: AbortSignal) => {
    return api.get<Summary>("/company/dashboard", { signal })
      .then((response) => {
        setSummary(response.data);
        setSummaryState("ready");
      })
      .catch((requestError) => {
        if (requestError?.code !== "ERR_CANCELED") setSummaryState("error");
      });
  }, []);

  const loadCampaigns = useCallback((signal?: AbortSignal) => {
    return api.get<{ campaigns: Campaign[] }>("/company/campaigns", { signal })
      .then((response) => {
        setCampaigns(response.data.campaigns);
        setCampaignState("ready");
      })
      .catch((requestError) => {
        if (requestError?.code !== "ERR_CANCELED") setCampaignState("error");
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadSummary(controller.signal);
    void loadCampaigns(controller.signal);
    return () => controller.abort();
  }, [loadCampaigns, loadSummary]);

  const totalApplications = useMemo(() => campaigns.reduce((total, campaign) => total + campaign.applicationCount, 0), [campaigns]);
  const pipeline = useMemo(() => ([
    { label: t("작성 중", "Draft"), value: campaigns.filter((campaign) => campaign.status === "DRAFT").length },
    { label: t("모집 중", "Recruiting"), value: campaigns.filter((campaign) => campaign.status === "OPEN").length },
    { label: t("종료", "Closed"), value: campaigns.filter((campaign) => campaign.status === "CLOSED").length },
  ]), [campaigns, t]);
  const pipelineMax = Math.max(1, ...pipeline.map((item) => item.value));
  const applicationRows = useMemo(() => [...campaigns].filter((campaign) => campaign.applicationCount > 0).sort((a, b) => b.applicationCount - a.applicationCount).slice(0, 6), [campaigns]);
  const applicationMax = Math.max(1, ...applicationRows.map((campaign) => campaign.applicationCount));
  const schedule = useMemo(() => campaigns
    .filter((campaign) => campaign.deadline !== null && daysLeft(campaign.deadline as string) >= 0)
    .sort((a, b) => daysLeft(a.deadline as string) - daysLeft(b.deadline as string))
    .slice(0, 8), [campaigns]);

  if (summaryState === "loading" && campaignState === "loading") {
    return <div className={styles.loading} aria-label={t("브랜드 대시보드 불러오는 중", "Loading brand dashboard")} />;
  }

  const metrics = [
    { label: t("전체 캠페인", "Campaigns"), value: summaryState === "ready" ? summary!.totalCampaigns.toLocaleString() : "—", hint: t("등록된 브리프", "Created briefs") },
    { label: t("모집 중", "Recruiting"), value: summaryState === "ready" ? summary!.funded.toLocaleString() : "—", hint: t("현재 공개", "Currently open"), tone: "accent" as const },
    { label: t("누적 지원", "Applications"), value: campaignState === "ready" ? totalApplications.toLocaleString() : "—", hint: t("전체 캠페인 합계", "Across campaigns") },
    { label: t("종료", "Closed"), value: summaryState === "ready" ? summary!.closed.toLocaleString() : "—", hint: t("종료 기록", "Closed records") },
    { label: t("결제·정산", "Payments"), value: "OFF", hint: t("PG 연결 전 비활성", "Gateway not connected"), tone: "warning" as const },
  ];

  const header = (
    <>
      <header className={styles.compactHeader}>
        <div>
          <h1>{t("브랜드 운영 데스크", "Brand operations desk")}</h1>
          <p>{t(`${user?.name ?? "브랜드"}의 다음 행동과 주의 항목을 먼저 확인하세요.`, `Review ${user?.name ?? "your brand"}'s next actions and attention items first.`)}</p>
        </div>
        <Link href="/company/campaigns/new" className={styles.primaryAction}><FilePlus2 aria-hidden="true" />{t("새 캠페인", "New campaign")}</Link>
      </header>
      <MetricStrip items={metrics} label={t("브랜드 핵심 지표", "Brand key metrics")} />
      <WorkspaceTabs
        label={t("브랜드 대시보드 보기", "Brand dashboard views")}
        value={tab}
        onChange={setTab}
        options={[
          { value: "operations", label: t("운영", "Operations") },
          { value: "pipeline", label: t("지원·파이프라인", "Applications & pipeline"), count: totalApplications },
          { value: "schedule", label: t("일정", "Schedule"), count: schedule.length },
        ]}
      />
    </>
  );

  const campaignFailure = (
    <StatePanel
      icon={RefreshCw}
      tone="error"
      title={t("캠페인 영역을 불러오지 못했습니다.", "Campaign data is unavailable.")}
      description={t("다른 지표는 그대로 사용할 수 있습니다.", "The other dashboard areas remain available.")}
      action={<button type="button" className={styles.retry} onClick={() => void loadCampaigns()}>{t("이 영역 다시 불러오기", "Retry this area")}</button>}
    />
  );

  return (
    <WorkspaceStage header={header} className={styles.dashboardStage}>
      <WorkspaceTabPanel value="operations" activeValue={tab}>
        <div className={styles.operationGrid}>
          <section className={styles.workPanel}>
            <header><h2>{t("다음 작업", "Next actions")}</h2><span>01</span></header>
            <div className={styles.actionRows}>
              <Link href="/company/campaigns/new"><span><strong>{t("캠페인 브리프 작성", "Create a campaign brief")}</strong><small>{t("목표·보상·모집 조건을 단계별로 설정", "Set goals, reward, and recruiting conditions")}</small></span><ArrowRight aria-hidden="true" /></Link>
              <Link href="/company/campaigns"><span><strong>{t("지원자와 콘텐츠 확인", "Review applicants and content")}</strong><small>{t("주의가 필요한 진행 상태부터 확인", "Start with work that needs attention")}</small></span><ArrowRight aria-hidden="true" /></Link>
              <Link href="/company/profile"><span><strong>{t("브랜드 공개 정보 점검", "Review public brand details")}</strong><small>{t("크리에이터에게 보이는 정보를 관리", "Manage what creators can see")}</small></span><ArrowRight aria-hidden="true" /></Link>
            </div>
            <div className={styles.paymentNotice}><CircleOff aria-hidden="true" /><p><strong>{t("결제·정산 비활성", "Payments disabled")}</strong>{t("현재 어떤 계좌로도 송금하지 마세요. 운영 계약과 PG 연결 완료 후 검증된 절차가 안내됩니다.", "Do not transfer funds to any account. A verified flow will be provided after the operating contract and gateway setup.")}</p></div>
          </section>

          <section className={styles.workPanel}>
            <header><h2>{t("최근 캠페인", "Recent campaigns")}</h2><Link href="/company/campaigns">{t("전체 보기", "View all")}</Link></header>
            {campaignState === "error" ? campaignFailure : campaignState === "loading" ? <div className={styles.innerLoading} /> : campaigns.length === 0 ? (
              <StatePanel icon={FilePlus2} title={t("첫 캠페인을 준비해보세요.", "Prepare your first campaign.")} description={t("브리프를 작성하면 실제 운영 지표가 표시됩니다.", "Create a brief to start seeing real operating metrics.")} action={<Link className={styles.inlineAction} href="/company/campaigns/new">{t("새 캠페인 만들기", "Create a new campaign")}</Link>} />
            ) : (
              <WorkspaceScrollArea label={t("최근 캠페인 목록", "Recent campaign list")}>
                <div className={styles.tableHead}><span>{t("캠페인", "Campaign")}</span><span>{t("지원", "Applied")}</span><span>{t("상태", "Status")}</span></div>
                <div className={styles.list}>{campaigns.slice(0, 8).map((campaign) => (
                  <Link href={`/company/campaigns/${campaign.id}`} className={styles.row} key={campaign.id}>
                    <span><span className={styles.rowTitle}>{campaign.title}</span><span className={styles.rowMeta}>{campaign.brandName} · {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString("ko-KR") : t("마감일 미정", "No deadline")}</span></span>
                    <span className={styles.rowNumber}>{t(`${campaign.applicationCount}명 지원`, `${campaign.applicationCount} applications`)}</span>
                    <span className={`${styles.status} ${STATUS[campaign.status].className}`}>{t(STATUS[campaign.status].ko, STATUS[campaign.status].en)}</span>
                  </Link>
                ))}</div>
              </WorkspaceScrollArea>
            )}
          </section>
        </div>
      </WorkspaceTabPanel>

      <WorkspaceTabPanel value="pipeline" activeValue={tab}>
        {campaignState === "error" ? campaignFailure : (
          <div className={styles.splitGrid}>
            <section className={styles.workPanel}>
              <header><h2>{t("캠페인 파이프라인", "Campaign pipeline")}</h2><BriefcaseBusiness aria-hidden="true" /></header>
              <div className={styles.pipeline}>{pipeline.map((item) => <div className={styles.pipelineRow} key={item.label}><span>{item.label}</span><span className={styles.track}><span className={styles.fill} style={{ width: `${Math.max(item.value > 0 ? 8 : 0, (item.value / pipelineMax) * 100)}%` }} /></span><strong>{item.value}</strong></div>)}</div>
            </section>
            <section className={styles.workPanel}>
              <header><h2>{t("캠페인별 지원 현황", "Applications by campaign")}</h2><BarChart3 aria-hidden="true" /></header>
              {applicationRows.length === 0 ? <StatePanel title={t("아직 지원자가 없습니다.", "No applications yet.")} description={t("지원이 들어오면 캠페인별 분포가 표시됩니다.", "The campaign distribution appears when applications arrive.")} /> : (
                <WorkspaceScrollArea label={t("캠페인별 지원자 수", "Applications per campaign") }><div className={styles.chart}>{applicationRows.map((campaign) => <div className={styles.chartRow} key={campaign.id}><span>{campaign.title}</span><span className={styles.chartTrack}><span style={{ width: `${(campaign.applicationCount / applicationMax) * 100}%` }} /></span><strong>{campaign.applicationCount}</strong></div>)}</div></WorkspaceScrollArea>
              )}
            </section>
          </div>
        )}
      </WorkspaceTabPanel>

      <WorkspaceTabPanel value="schedule" activeValue={tab}>
        <section className={styles.workPanel}>
          <header><h2>{t("다가오는 마감", "Upcoming deadlines")}</h2><CalendarDays aria-hidden="true" /></header>
          {campaignState === "error" ? campaignFailure : schedule.length === 0 ? <StatePanel title={t("예정된 마감이 없습니다.", "No deadlines coming up.")} description={t("마감일이 있는 캠페인을 등록하면 여기에 표시됩니다.", "Campaigns with deadlines appear here.")} /> : (
            <WorkspaceScrollArea label={t("다가오는 마감 목록", "Upcoming deadline list")}><div className={styles.schedule}>{schedule.map((campaign) => { const remaining = daysLeft(campaign.deadline as string); const date = new Date(campaign.deadline as string); return <Link href={`/company/campaigns/${campaign.id}`} className={styles.scheduleRow} key={campaign.id}><span className={styles.scheduleDate}><b>{String(date.getMonth() + 1).padStart(2, "0")}.{String(date.getDate()).padStart(2, "0")}</b><small>{date.toLocaleDateString("ko-KR", { weekday: "short" })}</small></span><span><strong>{campaign.title}</strong><small>{t(`지원 ${campaign.applicationCount}명 · 모집 마감`, `${campaign.applicationCount} applied · closes`)}</small></span><span className={`${styles.dday} ${remaining <= 3 ? styles.ddaySoon : ""}`}>{remaining === 0 ? "D-DAY" : `D-${remaining}`}</span></Link>; })}</div></WorkspaceScrollArea>
          )}
        </section>
      </WorkspaceTabPanel>
    </WorkspaceStage>
  );
}
