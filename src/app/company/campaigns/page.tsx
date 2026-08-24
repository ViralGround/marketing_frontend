"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FilePlus2, Search } from "lucide-react";
import api from "@/lib/api";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useLang } from "@/lib/i18n";
import PageHeader from "@/components/workspace/PageHeader";
import {
  FilterToolbar,
  StatePanel,
  StateSkeleton,
  WorkspacePage,
  WorkspaceRecordCell,
  WorkspaceRecordList,
  WorkspaceRecordRow,
  WorkspaceStage,
} from "@/components/workspace/WorkspacePrimitives";
import viewStyles from "@/components/workspace/WorkspaceViews.module.css";
import { FEATURE_PAYMENTS_ENABLED } from "@/lib/featureFlags";

type CampaignStatus = "DRAFT" | "OPEN" | "CLOSED";
type EscrowStatus = "NONE" | "PENDING_DEPOSIT" | "DEPOSIT_CONFIRMING" | "FUNDED" | "PARTIALLY_RELEASED" | "RELEASED" | "REFUNDED";
type Tone = "primary" | "success" | "warning" | "error" | "info" | "neutral";
type Label = { ko: string; en: string };

interface CampaignItem {
  id: number;
  title: string;
  brandName: string;
  rewardAmount: number;
  totalBudget: number;
  maxParticipants: number;
  status: CampaignStatus;
  escrowStatus: EscrowStatus;
  deadline: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  applicationCount: number;
}

const ESCROW_LABEL: Record<EscrowStatus, Label> = {
  NONE: { ko: "-", en: "-" },
  PENDING_DEPOSIT: { ko: "결제 미활성", en: "Payment unavailable" },
  DEPOSIT_CONFIRMING: { ko: "기존 확인 기록", en: "Legacy review" },
  FUNDED: { ko: "기존 예치 기록", en: "Legacy funded" },
  PARTIALLY_RELEASED: { ko: "기존 지급 기록", en: "Legacy payout" },
  RELEASED: { ko: "기존 지급 완료", en: "Legacy released" },
  REFUNDED: { ko: "기존 환불 기록", en: "Legacy refund" },
};

const ESCROW_TONE: Record<EscrowStatus, Tone> = { NONE: "neutral", PENDING_DEPOSIT: "warning", DEPOSIT_CONFIRMING: "warning", FUNDED: "success", PARTIALLY_RELEASED: "primary", RELEASED: "primary", REFUNDED: "error" };
const STATUS_LABEL: Record<CampaignStatus, Label> = { DRAFT: { ko: "작성 중", en: "Draft" }, OPEN: { ko: "모집 중", en: "Recruiting" }, CLOSED: { ko: "종료", en: "Closed" } };
const STATUS_TONE: Record<CampaignStatus, Tone> = { DRAFT: "warning", OPEN: "success", CLOSED: "neutral" };
const COLUMNS = FEATURE_PAYMENTS_ENABLED
  ? "minmax(14rem,1.45fr) minmax(5.5rem,.55fr) minmax(4.5rem,.45fr) minmax(8rem,.8fr) minmax(7rem,.7fr) minmax(7rem,.7fr)"
  : "minmax(14rem,1.45fr) minmax(5.5rem,.55fr) minmax(4.5rem,.45fr) minmax(8rem,.8fr) minmax(7rem,.7fr)";

export default function CompanyCampaignsPage() {
  const { t } = useLang();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(() => api.get<{ campaigns: CampaignItem[] }>("/company/campaigns")
    .then((response) => { setCampaigns(response.data.campaigns); setError(false); })
    .catch(() => setError(true))
    .finally(() => setLoading(false)), []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("search")?.trim();
    if (!initial) return;
    const frame = window.requestAnimationFrame(() => setSearch(initial));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const visibleCampaigns = search ? campaigns.filter((campaign) => `${campaign.title} ${campaign.brandName}`.toLowerCase().includes(search.toLowerCase())) : campaigns;
  const header = (
    <div className={viewStyles.headerStack}>
      <PageHeader
        display="CAMPAIGNS"
        subtitle={FEATURE_PAYMENTS_ENABLED
          ? t("등록 캠페인, 지원 현황과 관리 베타 결제 기록을 한곳에서 확인하세요.", "Review campaigns, applications, and managed-beta payment records in one place.")
          : t("등록 캠페인과 지원 현황을 한곳에서 확인하세요.", "Review campaigns and applications in one place.")}
        action={<Link href="/company/campaigns/new" className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-white hover:bg-primary-dark"><FilePlus2 className="h-4 w-4" aria-hidden="true" />{t("새 캠페인", "New campaign")}</Link>}
      />
      <FilterToolbar
        primary={<span className="text-xs font-bold text-content-soft">{t(`총 ${visibleCampaigns.length}개`, `${visibleCampaigns.length} total`)}</span>}
        secondary={
          <div className={viewStyles.searchForm}>
            <div className={viewStyles.searchField}><Search aria-hidden="true" /><Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("제목·브랜드 검색", "Search title or brand")} aria-label={t("캠페인 검색", "Search campaigns")} /></div>
            {search && <button type="button" className={viewStyles.resetButton} onClick={() => setSearch("")}>{t("초기화", "Reset")}</button>}
          </div>
        }
      />
    </div>
  );

  return (
    <WorkspacePage size="wide" flow={false}>
      <WorkspaceStage className={viewStyles.pageStage} header={header}>
        {loading ? <StateSkeleton label={t("캠페인 목록 불러오는 중", "Loading campaigns")} /> : error ? (
          <StatePanel tone="error" title={t("캠페인 목록을 불러오지 못했습니다.", "Campaigns are unavailable.")} description={t("연결을 확인한 뒤 이 목록만 다시 불러오세요.", "Check the connection and retry this list.")} action={<Button onClick={() => { setLoading(true); void load(); }}>{t("다시 불러오기", "Retry")}</Button>} />
        ) : visibleCampaigns.length === 0 ? (
          <StatePanel icon={FilePlus2} title={search ? t(`"${search}" 검색 결과가 없습니다.`, `No campaigns match "${search}".`) : t("아직 등록한 캠페인이 없습니다.", "No campaigns yet.")} description={search ? t("검색어를 바꾸거나 전체 목록으로 돌아가세요.", "Try another search or return to the full list.") : t("첫 브리프를 작성하면 캠페인 상태와 지원 현황을 여기서 관리할 수 있습니다.", "Create your first brief to manage campaign status and applications here.")} action={!search ? <Link href="/company/campaigns/new" className="inline-flex h-11 items-center rounded-full bg-primary px-4 text-sm font-bold text-white">{t("첫 캠페인 등록", "Create first campaign")}</Link> : undefined} />
        ) : (
          <WorkspaceRecordList columns={COLUMNS} labels={[t("캠페인", "Campaign"), t("상태", "Status"), t("지원", "Applications"), t("보상 × 모집", "Reward × slots"), t("총 예산", "Total budget"), ...(FEATURE_PAYMENTS_ENABLED ? [t("결제 기록", "Payment record")] : [])]}>
            {visibleCampaigns.map((campaign) => (
              <WorkspaceRecordRow key={campaign.id} href={`/company/campaigns/${campaign.id}`} columns={COLUMNS}>
                <WorkspaceRecordCell label={t("캠페인", "Campaign")}><span className={viewStyles.titleCell}><span className={viewStyles.thumbnail}>{campaign.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={campaign.thumbnailUrl} alt="" />
                ) : "VG"}</span><span className={viewStyles.titleCopy}><strong className={viewStyles.recordTitle}>{campaign.title}</strong><small className={viewStyles.recordMeta}>{campaign.brandName} · {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString("ko-KR") : t("마감일 미정", "No deadline")}</small></span></span></WorkspaceRecordCell>
                <WorkspaceRecordCell label={t("상태", "Status")}><Badge tone={STATUS_TONE[campaign.status]}>{t(STATUS_LABEL[campaign.status].ko, STATUS_LABEL[campaign.status].en)}</Badge></WorkspaceRecordCell>
                <WorkspaceRecordCell label={t("지원", "Applications")}><span className={viewStyles.recordStrong}>{t(`${campaign.applicationCount}명`, `${campaign.applicationCount}`)}</span></WorkspaceRecordCell>
                <WorkspaceRecordCell label={t("보상 × 모집", "Reward × slots")}>{t(`${campaign.rewardAmount.toLocaleString()}원 × ${campaign.maxParticipants}명`, `₩${campaign.rewardAmount.toLocaleString()} × ${campaign.maxParticipants}`)}</WorkspaceRecordCell>
                <WorkspaceRecordCell label={t("총 예산", "Total budget")}><span className={viewStyles.recordStrong}>{t(`${campaign.totalBudget.toLocaleString()}원`, `₩${campaign.totalBudget.toLocaleString()}`)}</span></WorkspaceRecordCell>
                {FEATURE_PAYMENTS_ENABLED && <WorkspaceRecordCell label={t("결제 기록", "Payment record")}><Badge tone={ESCROW_TONE[campaign.escrowStatus]}>{t(ESCROW_LABEL[campaign.escrowStatus].ko, ESCROW_LABEL[campaign.escrowStatus].en)}</Badge></WorkspaceRecordCell>}
              </WorkspaceRecordRow>
            ))}
          </WorkspaceRecordList>
        )}
      </WorkspaceStage>
    </WorkspacePage>
  );
}
