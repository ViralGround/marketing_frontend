"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useLang } from "@/lib/i18n";

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
  PENDING_DEPOSIT: { ko: "입금 대기", en: "Pending deposit" },
  DEPOSIT_CONFIRMING: { ko: "입금 확인중", en: "Confirming deposit" },
  FUNDED: { ko: "예치 완료", en: "Deposited" },
  PARTIALLY_RELEASED: { ko: "지급 진행중", en: "Payment in progress" },
  REFUNDED: { ko: "환불됨", en: "Refunded" },
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

  useEffect(() => {
    api
      .get<{ campaigns: CampaignItem[] }>("/company/campaigns")
      .then((res) => setCampaigns(res.data.campaigns))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t("내 캠페인", "My campaigns")}
          </h1>
          <p className="mt-2 text-sm text-muted">{t("등록한 캠페인과 예치금 상태를 확인하세요.", "Check your campaigns and deposits.")}</p>
        </div>
        <Link href="/company/campaigns/new">
          <Button>{t("새 캠페인 등록", "Create campaign")}</Button>
        </Link>
      </div>

      {loading ? (
        <p className="mt-10 text-muted">{t("불러오는 중...", "Loading...")}</p>
      ) : campaigns.length === 0 ? (
        <Card className="mt-10 border-dashed bg-surface-muted py-12 text-center text-muted">
          {t("아직 등록한 캠페인이 없습니다.", "No campaigns yet.")}
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
                  <th className="px-5 py-3 font-medium">{t("예치 상태", "Deposit status")}</th>
                  <th className="px-5 py-3 font-medium">{t("캠페인", "Campaign")}</th>
                  <th className="px-5 py-3 font-medium">{t("지원", "Applications")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {campaigns.map((c) => (
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
