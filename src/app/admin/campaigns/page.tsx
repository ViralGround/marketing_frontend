"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

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
}

type Filter = "ALL" | CampaignStatus;

const STATUS_LABEL: Record<CampaignStatus, string> = {
  DRAFT: "예치금 대기",
  OPEN: "모집중",
  CLOSED: "마감",
};

const STATUS_CLASS: Record<CampaignStatus, string> = {
  DRAFT: "bg-amber-100 text-amber-700",
  OPEN: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-200 text-content-soft",
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

const ESCROW_CLASS: Record<EscrowStatus, string> = {
  NONE: "bg-surface-chip text-muted",
  PENDING_DEPOSIT: "bg-amber-100 text-amber-700",
  DEPOSIT_CONFIRMING: "bg-orange-100 text-orange-700",
  FUNDED: "bg-emerald-100 text-emerald-700",
  PARTIALLY_RELEASED: "bg-indigo-100 text-indigo-700",
  RELEASED: "bg-blue-100 text-blue-700",
  REFUNDED: "bg-red-100 text-red-700",
};

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">캠페인 관리</h1>
        <Link
          href="/admin/campaigns/new"
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
        >
          + 새 캠페인
        </Link>
      </div>

      {pendingEscrow > 0 && (
        <div className="mb-4 flex items-center justify-between rounded border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
          <span>
            예치금 확인 대기 캠페인이 <strong>{pendingEscrow}건</strong> 있습니다.
          </span>
          <Link
            href="/admin/escrow"
            className="rounded bg-orange-600 px-3 py-1 text-xs text-white hover:bg-orange-700"
          >
            예치금 확인 페이지로
          </Link>
        </div>
      )}

      <div className="mb-4 flex gap-1">
        {(["ALL", "DRAFT", "OPEN", "CLOSED"] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`rounded px-3 py-1.5 text-sm ${
              filter === f
                ? "bg-gray-900 text-white"
                : "border border-line-strong text-muted hover:bg-surface-muted"
            }`}
          >
            {f === "ALL" ? "전체" : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={load}
            className="mt-2 rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
          >
            다시 시도
          </button>
        </div>
      ) : loading ? (
        <p className="text-muted">불러오는 중...</p>
      ) : campaigns.length === 0 ? (
        <p className="text-muted">등록된 캠페인이 없습니다.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs text-muted uppercase">
              <tr>
                <th className="px-4 py-3">제목</th>
                <th className="px-4 py-3">브랜드</th>
                <th className="px-4 py-3">보상</th>
                <th className="px-4 py-3">지원자</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">예치금</th>
                <th className="px-4 py-3">마감일</th>
                <th className="px-4 py-3">생성일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {campaigns.map((c) => (
                <tr
                  key={c.id}
                  className={`hover:bg-surface-muted ${c.hidden ? "opacity-60" : ""}`}
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    <Link href={`/admin/campaigns/${c.id}`} className="hover:underline">
                      {c.title}
                    </Link>
                    {c.hidden && (
                      <span className="ml-2 rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] text-zinc-700">
                        숨김
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">{c.brandName}</td>
                  <td className="px-4 py-3 text-foreground">
                    ₩{c.rewardAmount.toLocaleString("ko-KR")}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {c.applicationCount} / {c.maxParticipants}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs ${STATUS_CLASS[c.status]}`}>
                      {STATUS_LABEL[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${ESCROW_CLASS[c.escrowStatus]}`}
                    >
                      {ESCROW_LABEL[c.escrowStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {c.deadline ? new Date(c.deadline).toLocaleDateString("ko-KR") : "-"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(c.createdAt).toLocaleDateString("ko-KR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
