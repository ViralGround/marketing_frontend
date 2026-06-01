"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import api from "@/lib/api";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import AlertModal from "@/components/ui/AlertModal";

type CampaignStatus = "DRAFT" | "OPEN" | "CLOSED";
type EscrowStatus =
  | "NONE"
  | "PENDING_DEPOSIT"
  | "DEPOSIT_CONFIRMING"
  | "FUNDED"
  | "PARTIALLY_RELEASED"
  | "RELEASED"
  | "REFUNDED";

interface CampaignItem {
  id: number;
  title: string;
  brandName: string;
  rewardAmount: number;
  thumbnailUrl: string | null;
  deadline: string | null;
  maxParticipants: number;
  status: CampaignStatus;
  escrowStatus: EscrowStatus;
  applicationCount: number;
  createdAt: string;
  hidden: boolean;
  featured: boolean;
}

type Filter = "ALL" | CampaignStatus;

type Tone = "primary" | "success" | "warning" | "error" | "info" | "neutral";

const STATUS_LABEL: Record<CampaignStatus, string> = {
  DRAFT: "예치금 대기",
  OPEN: "모집중",
  CLOSED: "마감",
};

const STATUS_TONE: Record<CampaignStatus, Tone> = {
  DRAFT: "warning",
  OPEN: "success",
  CLOSED: "neutral",
};

const ESCROW_LABEL: Record<EscrowStatus, string> = {
  NONE: "미신청",
  PENDING_DEPOSIT: "입금 대기",
  DEPOSIT_CONFIRMING: "확인 대기",
  FUNDED: "예치 완료",
  PARTIALLY_RELEASED: "일부 지급",
  RELEASED: "전액 지급",
  REFUNDED: "환불",
};

const ESCROW_TONE: Record<EscrowStatus, Tone> = {
  NONE: "neutral",
  PENDING_DEPOSIT: "warning",
  DEPOSIT_CONFIRMING: "warning",
  FUNDED: "success",
  PARTIALLY_RELEASED: "primary",
  RELEASED: "info",
  REFUNDED: "error",
};

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const toggleFeatured = (c: CampaignItem) => {
    setTogglingId(c.id);
    api
      .patch(`/admin/campaigns/${c.id}/featured`, { featured: !c.featured })
      .then(load)
      .catch((err: unknown) => {
        const message =
          typeof err === "object" && err !== null && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
            : undefined;
        setAlertMsg(message ?? "대표 캠페인 지정에 실패했습니다. 잠시 후 다시 시도해주세요.");
      })
      .finally(() => setTogglingId(null));
  };

  const load = () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (filter !== "ALL") params.set("status", filter);
    api
      .get(`/admin/campaigns?${params.toString()}`)
      .then((res) => setCampaigns(res.data.campaigns))
      .catch((err: unknown) => {
        const status =
          typeof err === "object" && err !== null && "response" in err
            ? (err as { response?: { status?: number } }).response?.status
            : undefined;
        if (status === 401 || status === 403) {
          setError("접근 권한이 없습니다. 다시 로그인해주세요.");
        } else {
          setError("캠페인 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
        }
        setCampaigns([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const pendingEscrow = campaigns.filter(
    (c) => c.escrowStatus === "DEPOSIT_CONFIRMING",
  ).length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">캠페인 관리</h1>
        <Link href="/admin/campaigns/new">
          <Button size="sm">+ 새 캠페인</Button>
        </Link>
      </div>

      <p className="mb-6 text-sm text-muted">
        별표로 지정한 <strong className="font-semibold text-foreground">모집중</strong> 캠페인이
        랜딩 페이지에 대표로 노출됩니다 (최대 3건).
      </p>

      {pendingEscrow > 0 && (
        <Card className="mb-5 flex flex-wrap items-center justify-between gap-3 border-warning/30 bg-warning/5 p-4">
          <span className="text-sm text-warning">
            예치금 확인 대기 캠페인이 <strong className="font-semibold">{pendingEscrow}건</strong>{" "}
            있습니다.
          </span>
          <Link href="/admin/escrow">
            <Button size="sm" variant="secondary">
              예치금 확인 페이지로
            </Button>
          </Link>
        </Card>
      )}

      <div className="mb-5 flex gap-1.5">
        {(["ALL", "DRAFT", "OPEN", "CLOSED"] as Filter[]).map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-white"
                  : "border border-line text-content-soft hover:border-primary/40 hover:text-primary"
              }`}
            >
              {f === "ALL" ? "전체" : STATUS_LABEL[f]}
            </button>
          );
        })}
      </div>

      {error ? (
        <Card className="border-error/30 bg-error/5">
          <p className="text-sm text-error">{error}</p>
          <Button size="sm" className="mt-3" onClick={load}>
            다시 시도
          </Button>
        </Card>
      ) : loading ? (
        <p className="text-muted">불러오는 중...</p>
      ) : campaigns.length === 0 ? (
        <Card className="bg-surface-muted py-12 text-center text-muted">
          등록된 캠페인이 없습니다.
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">제목</th>
                  <th className="px-5 py-3 font-medium">브랜드</th>
                  <th className="px-5 py-3 font-medium">보상</th>
                  <th className="px-5 py-3 font-medium">지원자</th>
                  <th className="px-5 py-3 font-medium">상태</th>
                  <th className="px-5 py-3 font-medium">예치금</th>
                  <th className="px-5 py-3 font-medium">마감일</th>
                  <th className="px-5 py-3 font-medium">생성일</th>
                  <th className="px-5 py-3 text-center font-medium">대표</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {campaigns.map((c) => (
                  <tr
                    key={c.id}
                    className={`transition-colors hover:bg-surface-muted ${c.hidden ? "opacity-60" : ""}`}
                  >
                    <td className="px-5 py-3 font-medium text-foreground">
                      <Link
                        href={`/admin/campaigns/${c.id}`}
                        className="hover:text-primary"
                      >
                        {c.title}
                      </Link>
                      {c.hidden && (
                        <span className="ml-2">
                          <Badge tone="neutral">숨김</Badge>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-content-soft">{c.brandName}</td>
                    <td className="px-5 py-3 font-medium text-foreground">
                      ₩{c.rewardAmount.toLocaleString("ko-KR")}
                    </td>
                    <td className="px-5 py-3 text-content-soft">
                      {c.applicationCount} / {c.maxParticipants}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={ESCROW_TONE[c.escrowStatus]}>
                        {ESCROW_LABEL[c.escrowStatus]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {c.deadline ? new Date(c.deadline).toLocaleDateString("ko-KR") : "-"}
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {new Date(c.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleFeatured(c)}
                        disabled={togglingId === c.id}
                        aria-pressed={c.featured}
                        aria-label={c.featured ? "대표 지정 해제" : "대표로 지정"}
                        title={c.featured ? "대표 지정 해제" : "대표로 지정"}
                        className="rounded-full p-1.5 transition-colors hover:bg-surface-muted disabled:opacity-40"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            c.featured ? "fill-primary text-primary" : "text-muted"
                          }`}
                          strokeWidth={2}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <AlertModal
        open={alertMsg !== null}
        title="대표 캠페인"
        message={alertMsg ?? ""}
        onClose={() => setAlertMsg(null)}
      />
    </div>
  );
}
