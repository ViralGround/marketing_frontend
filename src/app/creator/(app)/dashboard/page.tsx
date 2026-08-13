"use client";

/**
 * 크리에이터 대시보드 — 시안(다크 topbar + 사이드바 + 아카이보 타이틀 + 지표 행 +
 * 차트/테이블/정산/일정 패널) 레이아웃.
 *
 * 데이터 원칙: 모든 숫자는 실제 API(/me/stats·/me/applications·/campaigns·/me/performance)
 * 기준. 시계열 API 가 없으므로 "성과 추이" 라인 차트 대신 작품별 성과(가로 바)로
 * 정직하게 그린다. 없는 기능(메시지·오디언스 인사이트)은 흉내 내지 않는다.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BarChart3,
  BriefcaseBusiness,
  CircleDot,
  Search,
  Sparkles,
} from "lucide-react";
import api from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { useAuthStore } from "@/store/useAuthStore";
import styles from "@/components/workspace/Dashboard.module.css";

type AppStatus = "PENDING" | "WITHDRAWN" | "APPROVED" | "REJECTED" | "SUBMITTED" | "CHANGES_REQUESTED" | "SETTLED";
type Stats = { totalEarned: number; completedCount: number; activeCount: number };
type Application = {
  id: number;
  status: AppStatus;
  appliedAt: string;
  campaign: { id: number; title: string; brandName: string; rewardAmount: number };
};
type Campaign = {
  id: number;
  title: string;
  brandName: string;
  rewardAmount: number;
  deadline: string | null;
  applicationCount: number;
  myApplication: { status: AppStatus } | null;
};
type PerformanceItem = { applicationId: number; campaignTitle: string; brandName: string; views: number };
type Performance = {
  totals: { views: number; likes: number; comments: number; completedCount: number };
  items?: PerformanceItem[];
};

const STATUS: Record<AppStatus, { ko: string; en: string }> = {
  PENDING: { ko: "검토 중", en: "Pending" },
  WITHDRAWN: { ko: "철회", en: "Withdrawn" },
  APPROVED: { ko: "제작 준비", en: "Ready" },
  REJECTED: { ko: "미선정", en: "Not selected" },
  SUBMITTED: { ko: "검수 중", en: "In review" },
  CHANGES_REQUESTED: { ko: "수정 필요", en: "Changes needed" },
  SETTLED: { ko: "완료", en: "Complete" },
};

function daysLeft(deadline: string): number {
  const end = new Date(deadline);
  end.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - today.getTime()) / 86_400_000);
}

export default function CreatorDashboardPage() {
  const { t } = useLang();
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<Stats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback((signal?: AbortSignal) => {
    return Promise.all([
      api.get<Stats>("/me/stats", { signal }),
      api.get<{ applications: Application[] }>("/me/applications", { signal }),
      api.get<{ campaigns: Campaign[] }>("/campaigns?sort=recent", { signal }),
      api.get<Performance>("/me/performance", { signal }),
    ])
      .then(([statsResponse, applicationsResponse, campaignsResponse, performanceResponse]) => {
        setStats(statsResponse.data);
        setApplications(applicationsResponse.data.applications);
        setCampaigns(campaignsResponse.data.campaigns);
        setPerformance(performanceResponse.data);
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

  const activeApplications = useMemo(
    () => applications.filter((application) => ["APPROVED", "SUBMITTED", "CHANGES_REQUESTED"].includes(application.status)),
    [applications],
  );
  const settledApplications = useMemo(
    () => applications.filter((application) => application.status === "SETTLED"),
    [applications],
  );
  const pendingCount = applications.filter((application) => application.status === "PENDING").length;
  const revisionCount = applications.filter((application) => application.status === "CHANGES_REQUESTED").length;

  const pipeline = useMemo(
    () => [
      { label: t("검토 중", "Pending"), value: pendingCount },
      { label: t("진행 중", "Active"), value: activeApplications.length },
      { label: t("완료", "Complete"), value: stats?.completedCount ?? 0 },
    ],
    [activeApplications.length, pendingCount, stats?.completedCount, t],
  );
  const pipelineMax = Math.max(1, ...pipeline.map((item) => item.value));

  /* 작품별 성과 — 조회수 내림차순 상위 6 (단일 시리즈 가로 바) */
  const performanceRows = useMemo(() => {
    const items = performance?.items ?? [];
    return [...items].sort((a, b) => b.views - a.views).slice(0, 6);
  }, [performance]);
  const performanceMax = Math.max(1, ...performanceRows.map((item) => item.views));

  /* 다가오는 일정 — 마감일이 있는 모집 캠페인, 임박순. 내가 지원한 건 우선 표기 */
  const schedule = useMemo(() => {
    return campaigns
      .filter((campaign) => campaign.deadline !== null && daysLeft(campaign.deadline as string) >= 0)
      .sort((a, b) => daysLeft(a.deadline as string) - daysLeft(b.deadline as string))
      .slice(0, 4);
  }, [campaigns]);

  if (loading) return <div className={styles.loading} aria-label={t("크리에이터 대시보드 불러오는 중", "Loading creator dashboard")} />;
  if (error || !stats || !performance)
    return (
      <div className={styles.error}>
        <div>
          <strong>{t("대시보드를 불러오지 못했습니다.", "We couldn't load the dashboard.")}</strong>
          <p>{t("서버 연결을 확인하고 다시 시도해주세요.", "Check the server connection and try again.")}</p>
          <button
            type="button"
            className={styles.retry}
            onClick={() => {
              setLoading(true);
              setError(false);
              void load();
            }}
          >
            {t("다시 불러오기", "Retry")}
          </button>
        </div>
      </div>
    );

  const statusClass: Record<AppStatus, string> = {
    PENDING: styles.statusOrange,
    WITHDRAWN: styles.statusNeutral,
    APPROVED: styles.statusViolet,
    REJECTED: styles.statusNeutral,
    SUBMITTED: styles.statusOrange,
    CHANGES_REQUESTED: styles.statusOrange,
    SETTLED: styles.statusGreen,
  };

  const metrics = [
    { label: t("진행 중 작업", "Active work"), value: stats.activeCount.toLocaleString(), note: t("선정 이후 작업", "Post-selection work"), icon: BriefcaseBusiness },
    { label: t("검토 중 지원", "Pending"), value: pendingCount.toLocaleString(), note: t("브랜드 검토 대기", "Awaiting brand review"), icon: CircleDot },
    { label: t("수정 요청", "Revisions"), value: revisionCount.toLocaleString(), note: t("확인이 필요한 작업", "Needs your attention"), icon: Sparkles },
    { label: t("완료 캠페인", "Completed"), value: stats.completedCount.toLocaleString(), note: t("정산 완료 기록", "Settled records"), icon: BadgeCheck },
    { label: t("누적 정산 기록", "Settled amount"), value: `₩${stats.totalEarned.toLocaleString("ko-KR")}`, note: t("실제 완료 기록 기준", "Based on completed records"), icon: Banknote },
  ];

  return (
    <div className={styles.dashboard}>
      <span className={styles.ghost} aria-hidden="true">SHOW REAL.</span>

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <span>CREATOR</span>
            <span className={styles.titleOutline}>DASHBOARD</span>
          </h1>
          <p className={styles.subtitle}>
            {t(
              `${user?.name ?? "크리에이터"}님의 지원, 콘텐츠 제출, 실제 성과 기록을 한 화면에서 관리하세요.`,
              `Manage ${user?.name ?? "your"} applications, submissions, and real performance records in one place.`,
            )}
          </p>
        </div>
        <span className={styles.stamp}>AUTHENTIC IMPACT.</span>
      </header>

      <section className={styles.metrics} aria-label={t("크리에이터 핵심 지표", "Creator key metrics")}>
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div className={styles.metric} key={metric.label}>
              <span className={styles.metricIcon}><Icon aria-hidden="true" /></span>
              <span>
                <span className={styles.metricLabel}>{metric.label}</span>
                <span className={styles.metricValue}>{metric.value}</span>
                <span className={styles.metricNote}>{metric.note}</span>
              </span>
            </div>
          );
        })}
      </section>

      <div className={styles.grid}>
        {/* 성과 기록 — 작품별 조회수 바 차트 (실데이터) */}
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>{t("성과 기록", "Performance record")}</h2>
            <Link href="/creator/performance" className={styles.panelLink}>{t("성과 입력·전체 보기 →", "Record & view all →")}</Link>
          </div>
          {performanceRows.length === 0 ? (
            <div className={styles.empty}>
              <div>
                <span className={styles.emptyIcon}><BarChart3 aria-hidden="true" /></span>
                <p className={styles.emptyTitle}>{t("기록된 성과가 아직 없습니다.", "No performance recorded yet.")}</p>
                <p className={styles.emptyCopy}>
                  {t("캠페인을 완료하고 게시물 조회수를 입력하면 작품별 성과가 여기에 표시됩니다.", "Complete a campaign and record its views to see per-video performance here.")}
                </p>
              </div>
            </div>
          ) : (
            <div className={styles.chart} role="img" aria-label={t("작품별 조회수 차트", "Views by video chart")}>
              {performanceRows.map((item) => (
                <div className={styles.chartRow} key={item.applicationId} title={`${item.campaignTitle} · ${item.views.toLocaleString("ko-KR")}`}>
                  <span className={styles.chartLabel}>{item.campaignTitle}</span>
                  <span className={styles.chartTrack}>
                    <span className={styles.chartFill} style={{ width: `${(item.views / performanceMax) * 100}%` }} />
                  </span>
                  <span className={styles.chartValue}>{item.views.toLocaleString("ko-KR")}</span>
                </div>
              ))}
            </div>
          )}
          <div className={styles.chartFoot}>
            <span>{t("누적 조회수", "Total views")} <b>{performance.totals.views.toLocaleString("ko-KR")}</b></span>
            <span>{t("좋아요", "Likes")} <b>{performance.totals.likes.toLocaleString("ko-KR")}</b></span>
            <span>{t("댓글", "Comments")} <b>{performance.totals.comments.toLocaleString("ko-KR")}</b></span>
          </div>
        </section>

        {/* 활동 파이프라인 */}
        <section className={styles.panel}>
          <div className={styles.panelHead}><h2 className={styles.panelTitle}>{t("활동 파이프라인", "Activity pipeline")}</h2></div>
          <div className={styles.panelBody}>
            <div className={styles.pipeline}>
              {pipeline.map((item) => (
                <div className={styles.pipelineRow} key={item.label}>
                  <span className={styles.pipelineLabel}>{item.label}</span>
                  <span className={styles.track}>
                    <span className={styles.fill} style={{ width: `${Math.max(item.value > 0 ? 8 : 0, (item.value / pipelineMax) * 100)}%` }} />
                  </span>
                  <span className={styles.pipelineValue}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.operational}>
            <strong>MANAGED BETA</strong>
            <p>{t("지급 방식과 일정은 캠페인 참여 확정 시 운영팀이 개별 안내합니다.", "Payout method and timing are confirmed with our team when participation is finalized.")}</p>
          </div>
        </section>
      </div>

      <div className={styles.lowerGrid}>
        {/* 진행 중 작업 — 컬럼 헤더 있는 테이블 */}
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>{t("지금 진행할 작업", "Work in progress")}</h2>
            <Link href="/creator/mypage#creator-applications" className={styles.panelLink}>{t("지원 현황 전체 보기 →", "View all applications →")}</Link>
          </div>
          {activeApplications.length === 0 ? (
            <div className={styles.empty}>
              <div>
                <span className={styles.emptyIcon}><BriefcaseBusiness aria-hidden="true" /></span>
                <p className={styles.emptyTitle}>{t("진행 중인 제작 작업이 없습니다.", "No production work is active.")}</p>
                <p className={styles.emptyCopy}>{t("새 캠페인을 살펴보고 내 채널과 맞는 브리프에 지원해보세요.", "Explore campaigns and apply to a brief that fits your channel.")}</p>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.tableHead} aria-hidden="true">
                <span>{t("캠페인", "Campaign")}</span>
                <span>{t("보상", "Reward")}</span>
                <span>{t("상태", "Status")}</span>
              </div>
              <div className={styles.list}>
                {activeApplications.slice(0, 5).map((application) => (
                  <Link href="/creator/mypage#creator-applications" className={styles.row} key={application.id}>
                    <span>
                      <span className={styles.rowTitle}>{application.campaign.title}</span>
                      <span className={styles.rowMeta}>{application.campaign.brandName} · {new Date(application.appliedAt).toLocaleDateString("ko-KR")}</span>
                    </span>
                    <span className={styles.rowNumber}>₩{application.campaign.rewardAmount.toLocaleString("ko-KR")}</span>
                    <span className={`${styles.status} ${statusClass[application.status]}`}>{t(STATUS[application.status].ko, STATUS[application.status].en)}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>

        {/* 정산 현황 — 보라 카드 + 완료 내역 */}
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>{t("정산 현황", "Settlement")}</h2>
            <Link href="/creator/mypage#creator-applications" className={styles.panelLink}>{t("전체 내역 →", "Full history →")}</Link>
          </div>
          <div className={styles.settleCard}>
            <span className={styles.settleLabel}>{t("누적 정산 기록", "Total settled")}</span>
            <span className={styles.settleValue}>₩{stats.totalEarned.toLocaleString("ko-KR")}</span>
            <span className={styles.settleNote}>{t("완료(SETTLED) 처리된 캠페인 보상 합계", "Sum of rewards from settled campaigns")}</span>
          </div>
          {settledApplications.length === 0 ? (
            <p className={styles.emptyCopy} style={{ margin: "0 1rem 1rem", textAlign: "left" }}>
              {t("아직 정산 완료된 캠페인이 없습니다. 첫 캠페인을 완주하면 내역이 표시됩니다.", "No settled campaigns yet. Finish your first campaign to see records here.")}
            </p>
          ) : (
            <div className={styles.settleList}>
              {settledApplications.slice(0, 4).map((application) => (
                <div className={styles.settleRow} key={application.id}>
                  <span className={styles.settleTitle}>{application.campaign.title}</span>
                  <span className={styles.settleAmount}>+₩{application.campaign.rewardAmount.toLocaleString("ko-KR")}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className={styles.lowerGrid}>
        {/* 새 캠페인 */}
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>{t("새 캠페인", "New campaigns")}</h2>
            <Link href="/creator/home" className={styles.panelLink}>{t("전체 캠페인 →", "All campaigns →")}</Link>
          </div>
          {campaigns.length === 0 ? (
            <div className={styles.empty}>
              <div>
                <span className={styles.emptyIcon}><Search aria-hidden="true" /></span>
                <p className={styles.emptyTitle}>{t("현재 모집 중인 캠페인이 없습니다.", "No campaigns are recruiting right now.")}</p>
                <p className={styles.emptyCopy}>{t("새 브리프가 열리면 실제 캠페인 정보가 여기에 표시됩니다.", "New briefs will appear here when they open.")}</p>
              </div>
            </div>
          ) : (
            <div className={styles.list}>
              {campaigns.slice(0, 4).map((campaign) => (
                <Link href={`/creator/campaigns/${campaign.id}`} className={styles.row} key={campaign.id}>
                  <span>
                    <span className={styles.rowTitle}>{campaign.title}</span>
                    <span className={styles.rowMeta}>{campaign.brandName} · {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString("ko-KR") : t("마감일 미정", "No deadline")}</span>
                  </span>
                  <span className={styles.rowNumber}>₩{campaign.rewardAmount.toLocaleString("ko-KR")}</span>
                  <span className={`${styles.status} ${campaign.myApplication ? styles.statusNeutral : styles.statusViolet}`}>
                    {campaign.myApplication ? t("지원함", "Applied") : t("모집 중", "Open")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 다가오는 일정 — 모집 마감 D-day */}
        <section className={styles.panel}>
          <div className={styles.panelHead}><h2 className={styles.panelTitle}>{t("다가오는 일정", "Upcoming deadlines")}</h2></div>
          {schedule.length === 0 ? (
            <div className={styles.empty}>
              <div>
                <p className={styles.emptyTitle}>{t("예정된 마감이 없습니다.", "No deadlines coming up.")}</p>
                <p className={styles.emptyCopy}>{t("마감일이 있는 캠페인이 열리면 여기에 표시됩니다.", "Campaigns with deadlines will appear here.")}</p>
              </div>
            </div>
          ) : (
            <div className={styles.schedule}>
              {schedule.map((campaign) => {
                const remaining = daysLeft(campaign.deadline as string);
                const date = new Date(campaign.deadline as string);
                return (
                  <Link href={`/creator/campaigns/${campaign.id}`} className={styles.scheduleRow} key={campaign.id}>
                    <span className={styles.scheduleDate} aria-hidden="true">
                      <b>{String(date.getMonth() + 1).padStart(2, "0")}.{String(date.getDate()).padStart(2, "0")}</b>
                      <span>{date.toLocaleDateString("ko-KR", { weekday: "short" })}</span>
                    </span>
                    <span>
                      <span className={styles.scheduleTitle}>{campaign.title}</span>
                      <span className={styles.scheduleMeta}>
                        {campaign.myApplication ? t("지원한 캠페인 · 모집 마감", "You applied · closes") : t("모집 마감", "Applications close")}
                      </span>
                    </span>
                    <span className={`${styles.dday} ${remaining <= 3 ? styles.ddaySoon : ""}`}>{remaining === 0 ? "D-DAY" : `D-${remaining}`}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* 다음 작업 — 풀폭 3열 */}
      <div className={styles.lowerGrid} style={{ gridTemplateColumns: "1fr" }}>
        <section className={styles.panel}>
          <div className={styles.panelHead}><h2 className={styles.panelTitle}>{t("다음 작업", "Next actions")}</h2></div>
          <div className={styles.panelBody}>
            <div className={styles.actionsWide}>
              <Link href="/creator/home" className={styles.action}>
                <span>
                  <strong>{t("내 채널에 맞는 캠페인 찾기", "Find a campaign that fits")}</strong>
                  <span>{t("모집 중인 AI SaaS 브리프를 확인합니다.", "Review recruiting AI SaaS briefs.")}</span>
                </span>
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link href="/profile/setup" className={styles.action}>
                <span>
                  <strong>{t("크리에이터 프로필 정리", "Complete creator profile")}</strong>
                  <span>{t("활동 정보와 공개 범위를 관리합니다.", "Manage activity information and visibility.")}</span>
                </span>
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link href="/creator/performance" className={styles.action}>
                <span>
                  <strong>{t("실제 성과 입력", "Record real performance")}</strong>
                  <span>{t("완료 콘텐츠의 조회·반응 수치를 기록합니다.", "Record views and engagement for completed content.")}</span>
                </span>
                <BarChart3 aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      <div className={styles.cta}>
        <span className={styles.ctaText}>MAKE IT <b>VIRAL.</b></span>
        <Link href="/creator/home" className={styles.ctaLink}>{t("새 캠페인 찾기", "Find a campaign")} <ArrowRight aria-hidden="true" /></Link>
      </div>
    </div>
  );
}
