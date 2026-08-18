"use client";

import { useEffect, useState } from "react";
import { Search, SearchX } from "lucide-react";
import api from "@/lib/api";
import ApplicationStatusBadge from "@/components/campaign/ApplicationStatusBadge";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useLang } from "@/lib/i18n";
import PageHeader from "@/components/workspace/PageHeader";
import {
  FilterToolbar,
  SegmentedControl,
  StatePanel,
  StateSkeleton,
  WorkspacePage,
  WorkspaceRecordCell,
  WorkspaceRecordList,
  WorkspaceRecordRow,
  WorkspaceStage,
} from "@/components/workspace/WorkspacePrimitives";
import viewStyles from "@/components/workspace/WorkspaceViews.module.css";

type AppStatus = "PENDING" | "WITHDRAWN" | "APPROVED" | "REJECTED" | "SUBMITTED" | "SETTLED";
type SortKey = "recent" | "reward" | "deadline";

interface CampaignItem {
  id: number;
  title: string;
  brandName: string;
  rewardAmount: number;
  thumbnailUrl: string | null;
  deadline: string | null;
  maxParticipants: number;
  createdAt: string;
  applicationCount: number;
  myApplication: { id: number; status: AppStatus } | null;
}

const SORT_LABEL: Record<SortKey, { ko: string; en: string }> = { recent: { ko: "최신순", en: "Latest" }, reward: { ko: "보상 높은 순", en: "Highest reward" }, deadline: { ko: "마감 임박순", en: "Deadline soon" } };
const NEW_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;
const URGENT_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;
const COLUMNS = "minmax(14rem,1.5fr) minmax(7rem,.7fr) minmax(7rem,.65fr) minmax(7rem,.65fr) minmax(7rem,.65fr)";

export default function CreatorHomePage() {
  const { t } = useLang();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sort, setSort] = useState<SortKey>("recent");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("search")?.trim();
    if (!initial) return;
    const frame = window.requestAnimationFrame(() => { setSearchInput(initial); setSearch(initial); });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ sort });
    if (search) params.set("search", search);
    api.get<{ campaigns: CampaignItem[] }>(`/campaigns?${params.toString()}`)
      .then((response) => { if (active) { setCampaigns(response.data.campaigns); setError(false); } })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retryKey, sort, search]);

  const changeSort = (next: SortKey) => { setLoading(true); setSort(next); };
  const handleSearch = (event: React.FormEvent) => { event.preventDefault(); setLoading(true); setSearch(searchInput.trim()); };
  const resetSearch = () => { setLoading(true); setSearchInput(""); setSearch(""); };

  const header = (
    <div className={viewStyles.headerStack}>
      <PageHeader display="DISCOVER" subtitle={t("지금 모집 중인 캠페인을 비교하고 내 채널과 맞는 브리프를 선택하세요.", "Compare recruiting campaigns and choose a brief that fits your channel.")} />
      <FilterToolbar
        primary={<SegmentedControl label={t("정렬", "Sort")} value={sort} options={(Object.keys(SORT_LABEL) as SortKey[]).map((value) => ({ value, label: t(SORT_LABEL[value].ko, SORT_LABEL[value].en) }))} onChange={changeSort} />}
        secondary={<form onSubmit={handleSearch} className={viewStyles.searchForm}><div className={viewStyles.searchField}><Search aria-hidden="true" /><Input type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder={t("캠페인·브랜드 검색", "Search campaigns or brands")} aria-label={t("캠페인 검색", "Search campaigns")} /></div><Button type="submit" size="sm">{t("검색", "Search")}</Button>{search && <button type="button" className={viewStyles.resetButton} onClick={resetSearch}>{t("초기화", "Reset")}</button>}</form>}
      />
    </div>
  );

  return (
    <WorkspacePage size="wide" flow={false}>
      <WorkspaceStage className={viewStyles.pageStage} header={header}>
        {loading ? <StateSkeleton label={t("캠페인 목록 불러오는 중", "Loading campaigns")} /> : error ? (
          <StatePanel tone="error" icon={SearchX} title={t("캠페인 목록을 불러오지 못했습니다.", "Campaigns are unavailable.")} description={t("필터를 유지한 채 다시 불러올 수 있습니다.", "You can retry without losing your filters.")} action={<Button onClick={() => { setLoading(true); setRetryKey((value) => value + 1); }}>{t("다시 불러오기", "Retry")}</Button>} />
        ) : campaigns.length === 0 ? (
          <StatePanel icon={SearchX} title={search ? t(`"${search}" 검색 결과가 없습니다.`, `No campaigns found for "${search}".`) : t("현재 모집 중인 캠페인이 없습니다.", "No campaigns are recruiting right now.")} description={search ? t("다른 제품명이나 브랜드명으로 검색해보세요.", "Try another product or brand name.") : t("새 브리프가 열리면 검증된 캠페인 정보가 여기에 표시됩니다.", "Verified campaign briefs appear here when they open.")} />
        ) : (
          <WorkspaceRecordList columns={COLUMNS} labels={[t("캠페인", "Campaign"), t("지원 상태", "Application"), t("보상", "Reward"), t("모집", "Recruiting"), t("마감", "Deadline")]}>
            {campaigns.map((campaign) => {
              const isNew = now - new Date(campaign.createdAt).getTime() < NEW_WINDOW_MS;
              const deadlineMs = campaign.deadline ? new Date(campaign.deadline).getTime() : null;
              const isUrgent = deadlineMs !== null && deadlineMs >= now && deadlineMs - now <= URGENT_WINDOW_MS;
              return (
                <WorkspaceRecordRow key={campaign.id} href={`/creator/campaigns/${campaign.id}`} columns={COLUMNS}>
                  <WorkspaceRecordCell label={t("캠페인", "Campaign")}><span className={viewStyles.titleCell}><span className={viewStyles.thumbnail}>{campaign.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={campaign.thumbnailUrl} alt="" />
                  ) : "VG"}</span><span className={viewStyles.titleCopy}><strong className={viewStyles.recordTitle}>{campaign.title}</strong><small className={viewStyles.recordMeta}>{campaign.brandName}{isNew ? ` · ${t("신규", "New")}` : ""}{isUrgent ? ` · ${t("마감 임박", "Closing soon")}` : ""}</small></span></span></WorkspaceRecordCell>
                  <WorkspaceRecordCell label={t("지원 상태", "Application")}>{campaign.myApplication ? <ApplicationStatusBadge status={campaign.myApplication.status} /> : <Badge tone={isUrgent ? "warning" : "primary"}>{isUrgent ? t("마감 임박", "Closing") : t("지원 가능", "Open")}</Badge>}</WorkspaceRecordCell>
                  <WorkspaceRecordCell label={t("보상", "Reward")}><span className={viewStyles.recordStrong}>₩{campaign.rewardAmount.toLocaleString("ko-KR")}</span></WorkspaceRecordCell>
                  <WorkspaceRecordCell label={t("모집", "Recruiting")}>{campaign.applicationCount} / {campaign.maxParticipants}</WorkspaceRecordCell>
                  <WorkspaceRecordCell label={t("마감", "Deadline")}>{campaign.deadline ? new Date(campaign.deadline).toLocaleDateString("ko-KR") : t("미정", "Open")}</WorkspaceRecordCell>
                </WorkspaceRecordRow>
              );
            })}
          </WorkspaceRecordList>
        )}
      </WorkspaceStage>
    </WorkspacePage>
  );
}
