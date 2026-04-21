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
  createdAt: string;
  applicationCount: number;
}

const ESCROW_LABEL: Record<EscrowStatus, string> = {
  NONE: "-",
  PENDING_DEPOSIT: "입금 대기",
  DEPOSIT_CONFIRMING: "입금 확인중",
  FUNDED: "예치 완료",
  PARTIALLY_RELEASED: "지급 진행중",
  REFUNDED: "환불됨",
};

const STATUS_LABEL: Record<CampaignStatus, string> = {
  DRAFT: "작성중",
  OPEN: "모집중",
  CLOSED: "종료",
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">내 캠페인</h1>
          <p className="mt-1 text-sm text-gray-500">
            등록한 캠페인과 예치금 상태를 확인하세요.
          </p>
        </div>
        <Link
          href="/company/campaigns/new"
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          새 캠페인 등록
        </Link>
      </div>

      {loading ? (
        <p className="mt-8 text-gray-500">불러오는 중...</p>
      ) : campaigns.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
          아직 등록한 캠페인이 없습니다.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3">제목</th>
                <th className="px-4 py-3">보상 × 모집</th>
                <th className="px-4 py-3">총 예산</th>
                <th className="px-4 py-3">예치 상태</th>
                <th className="px-4 py-3">캠페인</th>
                <th className="px-4 py-3">지원</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/company/campaigns/${c.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {c.title}
                    </Link>
                    <p className="text-xs text-gray-500">{c.brandName}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {c.rewardAmount.toLocaleString()}원 × {c.maxParticipants}명
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {c.totalBudget.toLocaleString()}원
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                      {ESCROW_LABEL[c.escrowStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {STATUS_LABEL[c.status]}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {c.applicationCount}명
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
