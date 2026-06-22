"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronDown, ExternalLink, RefreshCw, Users } from "lucide-react";
import api from "@/lib/api";
import { useLang } from "@/lib/i18n";
import Badge from "@/components/ui/Badge";
import { compactNumber, exactNumber, percent } from "@/lib/format";

type ReelSource = "AUTO" | "MANUAL" | "NONE";

interface Summary {
  activeCampaigns: number;
  totalReels: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  avgEngagementRate: number;
}
interface ReelItem {
  applicationId: number;
  campaignId: number;
  campaignTitle: string;
  creatorId: number;
  creatorName: string;
  reelUrl: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  source: ReelSource;
}
interface CampaignGroup {
  campaignId: number;
  title: string;
  brandName: string;
  status: string;
  reelCount: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  reels: ReelItem[];
}
interface CreatorRank {
  creatorId: number;
  creatorName: string;
  reelCount: number;
  views: number;
  likes: number;
  comments: number;
}
interface ReelAnalytics {
  summary: Summary;
  campaigns: CampaignGroup[];
  topReels: ReelItem[];
  topCreators: CreatorRank[];
  viewsTrend: number[];
  connectedCreators: number;
}

interface SyncResult {
  synced: number;
  failed: number;
}

type Translate = (ko: string, en: string) => string;

const chartLoading = () => <div className="h-[260px] animate-pulse rounded-lg bg-surface-muted" />;
const ViewsTrendChart = dynamic(
  () => import("@/components/admin/ReelAnalyticsCharts").then((m) => m.ViewsTrendChart),
  { ssr: false, loading: chartLoading },
);
const CampaignViewsChart = dynamic(
  () => import("@/components/admin/ReelAnalyticsCharts").then((m) => m.CampaignViewsChart),
  { ssr: false, loading: chartLoading },
);

export default function AdminReelAnalyticsPage() {
  const { t, lang } = useLang();
  const [data, setData] = useState<ReelAnalytics | null>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  // 효과 안에서 동기적으로 setState 하지 않도록(cascading render 방지) 비동기 콜백에서만 상태를 갱신한다.
  const fetchData = useCallback(() => {
    return api
      .get<ReelAnalytics>("/admin/reel-analytics")
      .then((res) => {
        setData(res.data);
        setError("");
      })
      .catch(() => setError(t("릴스 분석 데이터를 불러오지 못했습니다", "Failed to load reel analytics")))
      .finally(() => setRefreshing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // 지금 동기화: 연동된 크리에이터의 릴스 지표를 즉시 수집한 뒤 대시보드를 다시 불러온다.
  const handleSync = () => {
    setSyncing(true);
    setSyncResult(null);
    api
      .post<SyncResult>("/admin/reel-analytics/sync")
      .then((res) => {
        setSyncResult(res.data);
        setError("");
        return fetchData();
      })
      .catch(() => setError(t("동기화에 실패했습니다", "Sync failed")))
      .finally(() => setSyncing(false));
  };

  if (!data)
    return error ? (
      <p className="mx-auto max-w-6xl px-4 py-10 text-error">{error}</p>
    ) : (
      <p className="mx-auto max-w-6xl px-4 py-10 text-muted">{t("불러오는 중...", "Loading...")}</p>
    );

  const { summary, campaigns, topReels, topCreators, viewsTrend, connectedCreators } = data;
  const isEmpty = summary.totalReels === 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">{t("운영", "Operations")}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t("릴스 분석 대시보드", "Reel analytics")}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{t("Instagram 연동", "Instagram")}</Badge>
            <Badge tone="info">
              <Users className="h-3 w-3" />
              {t(`연동 크리에이터 ${connectedCreators}명`, `${connectedCreators} connected`)}
            </Badge>
            <span className="text-xs text-faint">
              {t("크리에이터가 제출한 릴스 성과를 집계합니다", "Aggregated from creator-submitted reels")}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {syncResult && (
            <span className="text-xs text-muted">
              {t(
                `동기화 완료 · 성공 ${syncResult.synced}건${syncResult.failed > 0 ? ` · 실패 ${syncResult.failed}건` : ""}`,
                `Synced ${syncResult.synced}${syncResult.failed > 0 ? ` · ${syncResult.failed} failed` : ""}`,
              )}
            </span>
          )}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? t("동기화 중...", "Syncing...") : t("지금 동기화", "Sync now")}
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-medium text-content-soft transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {t("새로고침", "Refresh")}
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-6 rounded-lg border border-error/30 bg-error/5 px-4 py-2.5 text-sm text-error">
          {error}
        </p>
      )}

      {isEmpty ? (
        <div className="rounded-2xl border border-line bg-surface-muted px-6 py-16 text-center">
          <p className="text-foreground">{t("아직 제출된 릴스가 없습니다", "No reels submitted yet")}</p>
          <p className="mt-1 text-sm text-muted">
            {t(
              "크리에이터가 릴스 URL을 제출하면 여기에 성과가 표시됩니다",
              "Performance appears here once creators submit reel URLs",
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 핵심 지표 — 하나로 묶은 클러스터 */}
          <StatStrip
            items={[
              { label: t("진행 중인 캠페인", "Live campaigns"), value: `${summary.activeCampaigns}${t("건", "")}` },
              { label: t("업로드된 릴스", "Reels"), value: `${summary.totalReels}${t("개", "")}` },
              { label: t("총 조회수", "Total views"), value: compactNumber(summary.totalViews, lang) },
              { label: t("총 좋아요", "Total likes"), value: compactNumber(summary.totalLikes, lang) },
              { label: t("총 댓글", "Total comments"), value: compactNumber(summary.totalComments, lang) },
              { label: t("총 공유", "Total shares"), value: compactNumber(summary.totalShares, lang) },
              {
                label: t("평균 참여율", "Avg. engagement"),
                value: percent(summary.avgEngagementRate),
                accent: true,
              },
            ]}
          />

          {/* 추이(넓게) + 인기 릴스(좁게) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Panel title={t("최근 14일 조회수 추이", "Views over the last 14 days")}>
                <div className="px-4 py-4">
                  <ViewsTrendChart viewsTrend={viewsTrend} />
                </div>
              </Panel>
            </div>
            <Panel title={t("인기 릴스 TOP 5", "Top reels")}>
              <ul className="divide-y divide-line/60">
                {topReels.map((r, i) => (
                  <li key={r.applicationId} className="flex items-center gap-3 px-5 py-3">
                    <RankBadge rank={i + 1} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        <CreatorLink id={r.creatorId} name={r.creatorName} className="text-foreground" />
                      </p>
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-xs text-faint">{r.campaignTitle}</p>
                        <SourceChip source={r.source} />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums text-foreground">
                        {compactNumber(r.views, lang)}
                      </p>
                      <p className="text-[11px] text-faint">{t("조회수", "views")}</p>
                    </div>
                    <ReelLink url={r.reelUrl} label={t("릴스 열기", "Open reel")} />
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          {/* 캠페인별 조회수(넓게) + 크리에이터 랭킹(좁게) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Panel title={t("캠페인별 조회수", "Views by campaign")}>
                <div className="px-4 py-4">
                  <CampaignViewsChart campaigns={campaigns} />
                </div>
              </Panel>
            </div>
            <Panel title={t("크리에이터 랭킹 TOP 5", "Top creators")}>
              <ul className="divide-y divide-line/60">
                {topCreators.map((c, i) => (
                  <li key={c.creatorId} className="flex items-center gap-3 px-5 py-3">
                    <RankBadge rank={i + 1} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        <CreatorLink id={c.creatorId} name={c.creatorName} className="text-foreground" />
                      </p>
                      <p className="truncate text-xs text-faint">
                        {t("릴스", "Reels")} {c.reelCount}
                        {t("개", "")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums text-foreground">
                        {compactNumber(c.views, lang)}
                      </p>
                      <p className="text-[11px] text-faint">{t("조회수", "views")}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          {/* 캠페인별 상세 — 접기/펼치기 */}
          <Panel
            title={t("캠페인별 상세", "By campaign")}
            action={
              <span className="text-xs text-faint">
                {campaigns.length}
                {t("개 캠페인", " campaigns")}
              </span>
            }
          >
            <CampaignAccordion campaigns={campaigns} />
          </Panel>
        </div>
      )}
    </div>
  );
}

/** 일관된 패널 chrome — 헤더(타이틀 + 우측 액션) + 본문. 모든 섹션이 이걸 공유해 '정리된' 느낌을 만든다. */
function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface">
      <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}

/** 핵심 지표를 한 덩어리로 묶은 클러스터(테두리 격자). 흩어진 카드보다 정돈돼 보인다. */
function StatStrip({
  items,
}: {
  items: { label: string; value: string; accent?: boolean }[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {items.map((it) => (
          <div key={it.label} className="-ml-px -mt-px border-l border-t border-line p-4 sm:p-5">
            <p className="text-xs font-medium text-muted">{it.label}</p>
            <p
              className={`mt-1.5 text-xl font-bold tracking-tight ${
                it.accent ? "text-primary" : "text-foreground"
              }`}
            >
              {it.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
        rank === 1 ? "bg-primary/10 text-primary" : "bg-surface-chip text-muted"
      }`}
    >
      {rank}
    </span>
  );
}

/** 캠페인 행을 접었다 폈다. 캠페인이 많아져도 요약만 쭉 보이고, 펼치면 릴스 표가 나온다. */
function CampaignAccordion({ campaigns }: { campaigns: CampaignGroup[] }) {
  const { t, lang } = useLang();
  const [open, setOpen] = useState<Set<number>>(
    () => new Set(campaigns[0] ? [campaigns[0].campaignId] : []),
  );

  const toggle = (id: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="divide-y divide-line">
      {campaigns.map((g) => {
        const meta = statusMeta(g.status, t);
        const isOpen = open.has(g.campaignId);
        return (
          <div key={g.campaignId}>
            <button
              type="button"
              onClick={() => toggle(g.campaignId)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-muted"
            >
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-muted transition-transform ${isOpen ? "" : "-rotate-90"}`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-foreground">{g.title}</span>
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                </div>
                <p className="mt-0.5 truncate text-xs text-faint">
                  {g.brandName} · {t("릴스", "Reels")} {g.reelCount}
                  {t("개", "")}
                </p>
              </div>
              <div className="hidden shrink-0 gap-6 text-right sm:flex">
                <MiniStat label={t("조회수", "Views")} value={compactNumber(g.views, lang)} />
                <MiniStat label={t("좋아요", "Likes")} value={compactNumber(g.likes, lang)} />
                <MiniStat label={t("댓글", "Comments")} value={compactNumber(g.comments, lang)} />
                <MiniStat label={t("공유", "Shares")} value={compactNumber(g.shares, lang)} />
              </div>
            </button>

            {isOpen && (
              <div className="overflow-x-auto border-t border-line bg-surface-muted/40">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs text-muted">
                      <Th>{t("크리에이터", "Creator")}</Th>
                      <Th>{t("수집", "Source")}</Th>
                      <Th className="text-right">{t("조회수", "Views")}</Th>
                      <Th className="text-right">{t("좋아요", "Likes")}</Th>
                      <Th className="text-right">{t("댓글", "Comments")}</Th>
                      <Th className="text-right">{t("공유", "Shares")}</Th>
                      <Th className="text-right">{t("참여율", "Eng.")}</Th>
                      <Th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {g.reels.map((r) => (
                      <tr key={r.applicationId} className="border-b border-line/60 last:border-0">
                        <Td className="font-medium">
                          <CreatorLink id={r.creatorId} name={r.creatorName} className="text-foreground" />
                        </Td>
                        <Td>
                          <SourceChip source={r.source} />
                        </Td>
                        <Td className="text-right tabular-nums">{exactNumber(r.views, lang)}</Td>
                        <Td className="text-right tabular-nums">{exactNumber(r.likes, lang)}</Td>
                        <Td className="text-right tabular-nums">{exactNumber(r.comments, lang)}</Td>
                        <Td className="text-right tabular-nums">{exactNumber(r.shares, lang)}</Td>
                        <Td className="text-right tabular-nums text-content-soft">
                          {percent(r.engagementRate)}
                        </Td>
                        <Td className="text-right">
                          <ReelLink url={r.reelUrl} label={t("릴스 열기", "Open reel")} />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** 릴스 지표 수집 출처 칩. AUTO=연동 자동수집 / MANUAL=크리에이터 수동입력 / NONE=미연동(데이터 없음). */
function SourceChip({ source }: { source: ReelSource }) {
  const { t } = useLang();
  switch (source) {
    case "AUTO":
      return <Badge tone="success">{t("자동", "Auto")}</Badge>;
    case "MANUAL":
      return <Badge tone="neutral">{t("수동", "Manual")}</Badge>;
    default:
      return <Badge tone="warning">{t("미연동", "Not linked")}</Badge>;
  }
}

function statusMeta(status: string, t: Translate): { tone: "success" | "neutral" | "warning"; label: string } {
  switch (status) {
    case "OPEN":
      return { tone: "success", label: t("진행 중", "Live") };
    case "DRAFT":
      return { tone: "warning", label: t("초안", "Draft") };
    default:
      return { tone: "neutral", label: t("종료", "Closed") };
  }
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-faint">{label}</p>
      <p className="font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-2.5 font-medium ${className}`}>{children}</th>;
}

function Td({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function CreatorLink({ id, name, className = "" }: { id: number; name: string; className?: string }) {
  return (
    <Link href={`/admin/members/${id}`} className={`hover:text-primary hover:underline ${className}`}>
      {name}
    </Link>
  );
}

function ReelLink({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="inline-flex text-muted transition-colors hover:text-primary"
    >
      <ExternalLink className="h-4 w-4" />
    </a>
  );
}
