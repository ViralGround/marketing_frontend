"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

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

const ESCROW_LABEL: Record<EscrowStatus, string> = {
  NONE: "-",
  PENDING_DEPOSIT: "입금 대기",
  DEPOSIT_CONFIRMING: "입금 확인중",
  FUNDED: "예치 완료",
  PARTIALLY_RELEASED: "지급 진행중",
  REFUNDED: "환불됨",
};

const ESCROW_TONE: Record<EscrowStatus, Tone> = {
  NONE: "neutral",
  PENDING_DEPOSIT: "warning",
  DEPOSIT_CONFIRMING: "warning",
  FUNDED: "success",
  PARTIALLY_RELEASED: "primary",
  REFUNDED: "error",
};

const STATUS_LABEL: Record<CampaignStatus, string> = {
  DRAFT: "작성중",
  OPEN: "모집중",
  CLOSED: "종료",
};

const STATUS_TONE: Record<CampaignStatus, Tone> = {
  DRAFT: "warning",
  OPEN: "success",
  CLOSED: "neutral",
};

export default function CompanyCampaignsPage() {
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
            내 캠페인
          </h1>
          <p className="mt-2 text-sm text-muted">등록한 캠페인과 예치금 상태를 확인하세요.</p>
        </div>
        <Link href="/company/campaigns/new">
          <Button>새 캠페인 등록</Button>
        </Link>
      </div>

      {loading ? (
        <p className="mt-10 text-muted">불러오는 중...</p>
      ) : campaigns.length === 0 ? (
        <Card className="mt-10 border-dashed bg-surface-muted py-12 text-center text-muted">
          아직 등록한 캠페인이 없습니다.
        </Card>
      ) : (
        <Card className="mt-8 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">제목</th>
                  <th className="px-5 py-3 font-medium">보상 × 모집</th>
                  <th className="px-5 py-3 font-medium">총 예산</th>
                  <th className="px-5 py-3 font-medium">예치 상태</th>
                  <th className="px-5 py-3 font-medium">캠페인</th>
                  <th className="px-5 py-3 font-medium">지원</th>
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
                      {c.rewardAmount.toLocaleString()}원 × {c.maxParticipants}명
                    </td>
                    <td className="px-5 py-3 font-semibold text-foreground">
                      {c.totalBudget.toLocaleString()}원
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={ESCROW_TONE[c.escrowStatus]}>
                        {ESCROW_LABEL[c.escrowStatus]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</Badge>
                    </td>
                    <td className="px-5 py-3 text-content-soft">{c.applicationCount}명</td>
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
