"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, BriefcaseBusiness, CircleDollarSign, CircleOff, FilePlus2, FolderCheck, UsersRound } from "lucide-react";
import api from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { useAuthStore } from "@/store/useAuthStore";
import styles from "@/components/workspace/Dashboard.module.css";

type CampaignStatus = "DRAFT" | "OPEN" | "CLOSED";
type Summary = { totalCampaigns: number; pendingDeposit: number; depositConfirming: number; funded: number; closed: number };
type Campaign = { id: number; title: string; brandName: string; status: CampaignStatus; applicationCount: number; deadline: string | null; createdAt: string };

const STATUS: Record<CampaignStatus, { ko: string; en: string; className: string }> = {
  DRAFT: { ko: "작성 중", en: "Draft", className: styles.statusOrange },
  OPEN: { ko: "모집 중", en: "Recruiting", className: styles.statusGreen },
  CLOSED: { ko: "종료", en: "Closed", className: styles.statusNeutral },
};

export default function CompanyDashboardPage() {
  const { t } = useLang();
  const user = useAuthStore((state) => state.user);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback((signal?: AbortSignal) => {
    return Promise.all([
      api.get<Summary>("/company/dashboard", { signal }),
      api.get<{ campaigns: Campaign[] }>("/company/campaigns", { signal }),
    ])
      .then(([summaryResponse, campaignsResponse]) => {
        setSummary(summaryResponse.data);
        setCampaigns(campaignsResponse.data.campaigns);
      })
      .catch((requestError) => {
        if (requestError?.code !== "ERR_CANCELED") setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const totalApplications = useMemo(() => campaigns.reduce((total, campaign) => total + campaign.applicationCount, 0), [campaigns]);
  const pipeline = useMemo(() => ([
    { label: t("작성 중", "Draft"), value: campaigns.filter((campaign) => campaign.status === "DRAFT").length },
    { label: t("모집 중", "Recruiting"), value: campaigns.filter((campaign) => campaign.status === "OPEN").length },
    { label: t("종료", "Closed"), value: campaigns.filter((campaign) => campaign.status === "CLOSED").length },
  ]), [campaigns, t]);
  const pipelineMax = Math.max(1, ...pipeline.map((item) => item.value));

  /* 캠페인별 지원 현황 — 지원자 수 내림차순 상위 6 (단일 시리즈 가로 바) */
  const applicationRows = useMemo(
    () => [...campaigns].filter((campaign) => campaign.applicationCount > 0).sort((a, b) => b.applicationCount - a.applicationCount).slice(0, 6),
    [campaigns],
  );
  const applicationMax = Math.max(1, ...applicationRows.map((campaign) => campaign.applicationCount));

  /* 다가오는 마감 — 마감일이 있는 캠페인, 임박순 */
  const daysLeft = (deadline: string) => {
    const end = new Date(deadline);
    end.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((end.getTime() - today.getTime()) / 86_400_000);
  };
  const schedule = useMemo(
    () => campaigns
      .filter((campaign) => campaign.deadline !== null && daysLeft(campaign.deadline as string) >= 0)
      .sort((a, b) => daysLeft(a.deadline as string) - daysLeft(b.deadline as string))
      .slice(0, 4),
    [campaigns],
  );

  if (loading) return <div className={styles.loading} aria-label={t("기업 대시보드 불러오는 중", "Loading company dashboard")} />;
  if (error || !summary) return (
    <div className={styles.error}>
      <div><strong>{t("대시보드를 불러오지 못했습니다.", "We couldn't load the dashboard.")}</strong><p>{t("서버 연결을 확인하고 다시 시도해주세요.", "Check the server connection and try again.")}</p><button type="button" className={styles.retry} onClick={() => { setLoading(true); setError(false); void load(); }}>{t("다시 불러오기", "Retry")}</button></div>
    </div>
  );

  const metrics = [
    { label: t("전체 캠페인", "Total campaigns"), value: summary.totalCampaigns.toLocaleString(), note: t("등록된 캠페인", "Campaigns created"), icon: BriefcaseBusiness },
    { label: t("모집 중", "Recruiting"), value: summary.funded.toLocaleString(), note: t("현재 공개 상태", "Currently open"), icon: FolderCheck },
    { label: t("누적 지원", "Applications"), value: totalApplications.toLocaleString(), note: t("전체 캠페인 합계", "Across all campaigns"), icon: UsersRound },
    { label: t("종료 캠페인", "Closed"), value: summary.closed.toLocaleString(), note: t("종료 기록", "Closed records"), icon: CircleDollarSign },
    { label: t("결제·정산", "Payments"), value: "OFF", note: t("PG 연결 전 비활성", "Disabled until gateway setup"), icon: CircleOff },
  ];

  return (
    <div className={styles.dashboard}>
      <span className={styles.ghost} aria-hidden="true">MAKE IT COUNT.</span>

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}><span>BRAND</span><span className={styles.titleOutline}>DASHBOARD</span></h1>
          <p className={styles.subtitle}>{t(`${user?.name ?? "기업"}의 캠페인 운영 현황과 다음 할 일을 한눈에 확인하세요.`, `Review ${user?.name ?? "your company"}'s campaign operation and next actions in one place.`)}</p>
        </div>
        <span className={styles.stamp}>RUN THE BRIEF.</span>
      </header>

      <section className={styles.metrics} aria-label={t("기업 핵심 지표", "Company key metrics")}>
        {metrics.map((metric) => { const Icon = metric.icon; return <div className={styles.metric} key={metric.label}><span className={styles.metricIcon}><Icon aria-hidden="true" /></span><span><span className={styles.metricLabel}>{metric.label}</span><span className={styles.metricValue}>{metric.value}</span><span className={styles.metricNote}>{metric.note}</span></span></div>; })}
      </section>

      <div className={styles.grid}>
        <section className={styles.panel}>
          <div className={styles.panelHead}><h2 className={styles.panelTitle}>{t("최근 캠페인", "Recent campaigns")}</h2><Link href="/company/campaigns" className={styles.panelLink}>{t("전체 보기 →", "View all →")}</Link></div>
          {campaigns.length === 0 ? (
            <div className={styles.empty}><div><span className={styles.emptyIcon}><FilePlus2 aria-hidden="true" /></span><p className={styles.emptyTitle}>{t("첫 캠페인을 준비해보세요.", "Prepare your first campaign.")}</p><p className={styles.emptyCopy}>{t("브리프를 작성하면 저장된 실제 캠페인 지표가 이 대시보드에 표시됩니다.", "Once you create a brief, real campaign metrics will appear here.")}</p></div></div>
          ) : (
            <>
              <div className={styles.tableHead} aria-hidden="true">
                <span>{t("캠페인", "Campaign")}</span>
                <span>{t("지원", "Applied")}</span>
                <span>{t("상태", "Status")}</span>
              </div>
              <div className={styles.list}>{campaigns.slice(0, 5).map((campaign) => <Link href={`/company/campaigns/${campaign.id}`} className={styles.row} key={campaign.id}><span><span className={styles.rowTitle}>{campaign.title}</span><span className={styles.rowMeta}>{campaign.brandName} · {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString("ko-KR") : t("마감일 미정", "No deadline")}</span></span><span className={styles.rowNumber}>{t(`${campaign.applicationCount}명 지원`, `${campaign.applicationCount} applications`)}</span><span className={`${styles.status} ${STATUS[campaign.status].className}`}>{t(STATUS[campaign.status].ko, STATUS[campaign.status].en)}</span></Link>)}</div>
            </>
          )}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}><h2 className={styles.panelTitle}>{t("캠페인 파이프라인", "Campaign pipeline")}</h2></div>
          <div className={styles.panelBody}><div className={styles.pipeline}>{pipeline.map((item) => <div className={styles.pipelineRow} key={item.label}><span className={styles.pipelineLabel}>{item.label}</span><span className={styles.track}><span className={styles.fill} style={{ width: `${Math.max(item.value > 0 ? 8 : 0, (item.value / pipelineMax) * 100)}%` }} /></span><span className={styles.pipelineValue}>{item.value}</span></div>)}</div></div>
          <div className={styles.operational}><strong>{t("운영 상태", "Operating status")}</strong><p><b>{t("결제·정산 비활성", "Payments disabled")}</b> — {t("현재 어떤 계좌로도 송금하지 마세요. 운영 계약과 PG 연결 완료 후 검증된 절차가 안내됩니다.", "Do not transfer funds to any account. A verified flow will be provided after the operating contract and gateway setup.")}</p></div>
        </section>
      </div>

      <div className={styles.lowerGrid}>
        {/* 캠페인별 지원 현황 — 지원자 수 가로 바 차트 (실데이터) */}
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>{t("캠페인별 지원 현황", "Applications by campaign")}</h2>
            <Link href="/company/campaigns" className={styles.panelLink}>{t("지원자 관리 →", "Manage applicants →")}</Link>
          </div>
          {applicationRows.length === 0 ? (
            <div className={styles.empty}>
              <div>
                <span className={styles.emptyIcon}><BarChart3 aria-hidden="true" /></span>
                <p className={styles.emptyTitle}>{t("아직 지원자가 없습니다.", "No applications yet.")}</p>
                <p className={styles.emptyCopy}>{t("캠페인이 공개되고 지원이 들어오면 캠페인별 분포가 여기에 표시됩니다.", "Once applications arrive, the per-campaign distribution appears here.")}</p>
              </div>
            </div>
          ) : (
            <div className={styles.chart} role="img" aria-label={t("캠페인별 지원자 수 차트", "Applications per campaign chart")}>
              {applicationRows.map((campaign) => (
                <div className={styles.chartRow} key={campaign.id} title={`${campaign.title} · ${campaign.applicationCount}`}>
                  <span className={styles.chartLabel}>{campaign.title}</span>
                  <span className={styles.chartTrack}>
                    <span className={styles.chartFill} style={{ width: `${(campaign.applicationCount / applicationMax) * 100}%` }} />
                  </span>
                  <span className={styles.chartValue}>{campaign.applicationCount.toLocaleString("ko-KR")}</span>
                </div>
              ))}
            </div>
          )}
          <div className={styles.chartFoot}>
            <span>{t("누적 지원", "Total applications")} <b>{totalApplications.toLocaleString("ko-KR")}</b></span>
            <span>{t("모집 중 캠페인", "Open campaigns")} <b>{summary.funded.toLocaleString("ko-KR")}</b></span>
          </div>
        </section>

        {/* 다가오는 마감 — D-day */}
        <section className={styles.panel}>
          <div className={styles.panelHead}><h2 className={styles.panelTitle}>{t("다가오는 마감", "Upcoming deadlines")}</h2></div>
          {schedule.length === 0 ? (
            <div className={styles.empty}>
              <div>
                <p className={styles.emptyTitle}>{t("예정된 마감이 없습니다.", "No deadlines coming up.")}</p>
                <p className={styles.emptyCopy}>{t("마감일이 있는 캠페인을 등록하면 여기에 표시됩니다.", "Campaigns with deadlines will appear here.")}</p>
              </div>
            </div>
          ) : (
            <div className={styles.schedule}>
              {schedule.map((campaign) => {
                const remaining = daysLeft(campaign.deadline as string);
                const date = new Date(campaign.deadline as string);
                return (
                  <Link href={`/company/campaigns/${campaign.id}`} className={styles.scheduleRow} key={campaign.id}>
                    <span className={styles.scheduleDate} aria-hidden="true">
                      <b>{String(date.getMonth() + 1).padStart(2, "0")}.{String(date.getDate()).padStart(2, "0")}</b>
                      <span>{date.toLocaleDateString("ko-KR", { weekday: "short" })}</span>
                    </span>
                    <span>
                      <span className={styles.scheduleTitle}>{campaign.title}</span>
                      <span className={styles.scheduleMeta}>{t(`지원 ${campaign.applicationCount}명 · 모집 마감`, `${campaign.applicationCount} applied · closes`)}</span>
                    </span>
                    <span className={`${styles.dday} ${remaining <= 3 ? styles.ddaySoon : ""}`}>{remaining === 0 ? "D-DAY" : `D-${remaining}`}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <div className={styles.lowerGrid}>
        <section className={styles.panel}><div className={styles.panelHead}><h2 className={styles.panelTitle}>{t("다음 작업", "Next actions")}</h2></div><div className={styles.panelBody}><div className={styles.actions}><Link href="/company/campaigns/new" className={styles.action}><span><strong>{t("새 캠페인 브리프 작성", "Create a campaign brief")}</strong><span>{t("목표, 보상, 모집 인원을 설정합니다.", "Set the goal, reward, and participant count.")}</span></span><ArrowRight aria-hidden="true" /></Link><Link href="/company/campaigns" className={styles.action}><span><strong>{t("지원자와 콘텐츠 확인", "Review applications and content")}</strong><span>{t("캠페인별 진행 상태를 확인합니다.", "Check progress by campaign.")}</span></span><ArrowRight aria-hidden="true" /></Link></div></div></section>
        <section className={styles.panel}><div className={styles.panelHead}><h2 className={styles.panelTitle}>{t("브랜드 준비도", "Brand readiness")}</h2><Link href="/company/profile" className={styles.panelLink}>{t("프로필 관리 →", "Manage profile →")}</Link></div><div className={styles.panelBody}><p className={styles.emptyTitle}>{t("크리에이터가 신뢰할 수 있는 정보를 채워주세요.", "Complete the information creators need to trust the brief.")}</p><p className={styles.emptyCopy} style={{ marginLeft: 0, textAlign: "left" }}>{t("기업 소개, 공식 홈페이지, 로고는 캠페인 판단에 직접 사용됩니다.", "Your company introduction, official website, and logo directly support campaign decisions.")}</p></div></section>
      </div>

      <div className={styles.cta}><span className={styles.ctaText}>MAKE THE BRIEF <b>MOVE.</b></span><Link href="/company/campaigns/new" className={styles.ctaLink}>{t("새 캠페인 만들기", "Create campaign")} <ArrowRight aria-hidden="true" /></Link></div>
    </div>
  );
}
