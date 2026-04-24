"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type PendingEscrowStatus = "PENDING_DEPOSIT" | "DEPOSIT_CONFIRMING";

interface PendingCampaign {
  id: number;
  title: string;
  brandName: string;
  companyName: string;
  totalBudget: number;
  rewardAmount: number;
  maxParticipants: number;
  escrowStatus: PendingEscrowStatus;
  depositRequestedAt: string | null;
  createdAt: string;
}

export default function AdminEscrowPage() {
  const [items, setItems] = useState<PendingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get<{ campaigns: PendingCampaign[] }>("/admin/escrow/pending")
      .then((res) => setItems(res.data.campaigns))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (id: number, kind: "confirm" | "reject") => {
    setActingId(id);
    try {
      await api.post(`/admin/campaigns/${id}/escrow/${kind}`);
      setToast(kind === "confirm" ? "입금이 확인되었습니다" : "반려되었습니다");
      load();
    } catch {
      setToast("처리에 실패했습니다");
    } finally {
      setActingId(null);
      setTimeout(() => setToast(""), 2500);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">예치금 입금 확인</h1>
      <p className="mt-1 text-sm text-gray-500">
        기업이 입금을 신청한 캠페인을 검토하고, 아직 입금 신청 전인 캠페인의 현황도 함께 확인할 수 있습니다.
      </p>

      {toast && (
        <div className="mt-4 rounded bg-blue-50 p-3 text-sm text-blue-700">{toast}</div>
      )}

      {loading ? (
        <p className="mt-6 text-gray-500">불러오는 중...</p>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
          예치 대기 중인 캠페인이 없습니다.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3">캠페인</th>
                <th className="px-4 py-3">기업</th>
                <th className="px-4 py-3">예치 금액</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">요청 시각</th>
                <th className="px-4 py-3">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{c.title}</p>
                    <p className="text-xs text-gray-500">
                      {c.brandName} · {c.rewardAmount.toLocaleString()}원 × {c.maxParticipants}명
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{c.companyName}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {c.totalBudget.toLocaleString()}원
                  </td>
                  <td className="px-4 py-3">
                    {c.escrowStatus === "DEPOSIT_CONFIRMING" ? (
                      <span className="rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
                        확인 대기
                      </span>
                    ) : (
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                        기업 입금 신청 전
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.depositRequestedAt
                      ? new Date(c.depositRequestedAt).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {c.escrowStatus === "DEPOSIT_CONFIRMING" ? (
                      <div className="flex gap-2">
                        <button
                          disabled={actingId === c.id}
                          onClick={() => act(c.id, "confirm")}
                          className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          확인
                        </button>
                        <button
                          disabled={actingId === c.id}
                          onClick={() => act(c.id, "reject")}
                          className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          반려
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">기업의 계좌이체 완료 대기 중</span>
                    )}
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
