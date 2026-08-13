"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useLang } from "@/lib/i18n";
import PageHeader from "@/components/workspace/PageHeader";

type CampaignStatus = "DRAFT" | "OPEN" | "CLOSED";
type EscrowStatus =
  | "NONE"
  | "PENDING_DEPOSIT"
  | "DEPOSIT_CONFIRMING"
  | "FUNDED"
  | "PARTIALLY_RELEASED"
  | "REFUNDED";

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

type Tone = "primary" | "success" | "warning" | "error" | "info" | "neutral";

type Label = { ko: string; en: string };

const ESCROW_LABEL: Record<EscrowStatus, Label> = {
  NONE: { ko: "-", en: "-" },
  PENDING_DEPOSIT: { ko: "결제 미활성", en: "Payment unavailable" },
  DEPOSIT_CONFIRMING: { ko: "기존 확인 기록", en: "Legacy review" },
  FUNDED: { ko: "기존 예치 기록", en: "Legacy funded" },
  PARTIALLY_RELEASED: { ko: "기존 지급 기록", en: "Legacy payout" },
  REFUNDED: { ko: "기존 환불 기록", en: "Legacy refund" },
};

const ESCROW_TONE: Record<EscrowStatus, Tone> = {
  NONE: "neutral",
  PENDING_DEPOSIT: "warning",
  DEPOSIT_CONFIRMING: "warning",
  FUNDED: "success",
  PARTIALLY_RELEASED: "primary",
  REFUNDED: "error",
};

const STATUS_LABEL: Record<CampaignStatus, Label> = {
  DRAFT: { ko: "작성중", en: "Draft" },
  OPEN: { ko: "모집중", en: "Recruiting" },
  CLOSED: { ko: "종료", en: "Closed" },
};

const STATUS_TONE: Record<CampaignStatus, Tone> = {
  DRAFT: "warning",
  OPEN: "success",
  CLOSED: "neutral",
};

export default function CompanyCampaignsPage() {
  const { t } = useLang();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .get<{ campaigns: CampaignItem[] }>("/company/campaigns")
      .then((res) => setCampaigns(res.data.campaigns))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // 워크스페이스 topbar 검색은 ?search= 로 진입한다 — 클라이언트 필터로 반영.
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("search")?.trim();
    if (initial) setSearch(initial);
  }, []);

  const visibleCampaigns = search
    ? campaigns.filter((campaign) => campaign.title.toLowerCase().includes(search.toLowerCase()))
    : campaigns;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        display="CAMPAIGNS"
        subtitle={t("등록한 캠페인과 관리 베타 결제 기록을 확인하세요.", "Check your campaigns and managed-beta payment records.")}
        action={
          <Link href="/company/campaigns/new">
            <Button>{t("새 캠페인 등록", "Create campaign")}</Button>
          </Link>
        }
      />

      {loading ? (
        <p className="mt-10 text-muted">{t("불러오는 중...", "Loading...")}</p>
      ) : visibleCampaigns.length === 0 ? (
        <Card className="mt-10 border-dashed bg-surface-muted py-12 text-center text-muted">
          {search
            ? t(`"${search}" 검색 결과가 없습니다.`, `No campaigns match "${search}".`)
            : t("아직 등록한 캠페인이 없습니다.", "No campaigns yet.")}
        </Card>
      ) : (
        <Card className="mt-8 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">{t("제목", "Title")}</th>
                  <th className="px-5 py-3 font-medium">{t("보상 × 모집", "Reward × Slots")}</th>
                  <th className="px-5 py-3 font-medium">{t("총 예산", "Total budget")}</th>
                  <th className="px-5 py-3 font-medium">{t("결제 기록", "Payment record")}</th>
                  <th className="px-5 py-3 font-medium">{t("캠페인", "Campaign")}</th>
                  <th className="px-5 py-3 font-medium">{t("지원", "Applications")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visibleCampaigns.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-surface-muted">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface-chip">
                          {c.thumbnailUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={c.thumbnailUrl}
                              alt={c.title}
                              className="h-full w-full object-contain"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/company/campaigns/${c.id}`}
                            className="font-medium text-foreground hover:text-primary"
                          >
                            {c.title}
                          </Link>
                          <p className="text-xs text-muted">{c.brandName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-content-soft">
                      {t(
                        `${c.rewardAmount.toLocaleString()}원 × ${c.maxParticipants}명`,
                        `₩${c.rewardAmount.toLocaleString()} × ${c.maxParticipants}`,
                      )}
                    </td>
                    <td className="px-5 py-3 font-semibold text-foreground">
                      {t(`${c.totalBudget.toLocaleString()}원`, `₩${c.totalBudget.toLocaleString()}`)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={ESCROW_TONE[c.escrowStatus]}>
                        {t(ESCROW_LABEL[c.escrowStatus].ko, ESCROW_LABEL[c.escrowStatus].en)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_TONE[c.status]}>
                        {t(STATUS_LABEL[c.status].ko, STATUS_LABEL[c.status].en)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-content-soft">
                      {t(`${c.applicationCount}명`, `${c.applicationCount}`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
