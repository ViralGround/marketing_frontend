"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";

type CampaignStatus = "DRAFT" | "OPEN" | "CLOSED";
type EscrowStatus =
  | "NONE"
  | "PENDING_DEPOSIT"
  | "DEPOSIT_CONFIRMING"
  | "FUNDED"
  | "PARTIALLY_RELEASED"
  | "REFUNDED";

interface Detail {
  id: number;
  title: string;
  description: string;
  brandName: string;
  rewardAmount: number;
  totalBudget: number;
  maxParticipants: number;
  status: CampaignStatus;
  escrowStatus: EscrowStatus;
  deadline: string | null;
  requirements: string | null;
  depositRequestedAt: string | null;
  fundedAt: string | null;
  createdAt: string;
  applicationCount: number;
  applications: Array<{
    id: number;
    status: string;
    appliedAt: string;
    submittedAt: string | null;
    settledAt: string | null;
    creator: { id: number; name: string; email: string };
  }>;
  escrowTransactions: Array<{
    id: number;
    type: "DEPOSIT" | "RELEASE" | "REFUND";
    amount: number;
    memo: string | null;
    createdAt: string;
  }>;
}

const ESCROW_LABEL: Record<EscrowStatus, string> = {
  NONE: "-",
  PENDING_DEPOSIT: "입금 대기",
  DEPOSIT_CONFIRMING: "입금 확인중",
  FUNDED: "예치 완료",
  PARTIALLY_RELEASED: "지급 진행중",
  REFUNDED: "환불됨",
};

export default function CompanyCampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get<Detail>(`/company/campaigns/${id}`)
      .then((res) => setData(res.data))
      .catch(() => setError("캠페인 정보를 불러오지 못했습니다"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const requestDeposit = async () => {
    if (!data) return;
    setActing(true);
    setMessage("");
    setError("");
    try {
      const { data: res } = await api.post<{ message: string }>(
        `/company/campaigns/${data.id}/deposit-request`
      );
      setMessage(res.message);
      load();
    } catch (err: unknown) {
      const response =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
          : undefined;
      setError(response?.data?.message ?? "요청에 실패했습니다");
    } finally {
      setActing(false);
    }
  };

  if (loading) return <p className="text-gray-500">불러오는 중...</p>;
  if (!data) return <p className="text-red-600">{error || "데이터 없음"}</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-flex rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
            {ESCROW_LABEL[data.escrowStatus]}
          </span>
          <span className="text-xs text-gray-500">{data.status}</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{data.title}</h1>
        <p className="mt-1 text-sm text-gray-500">{data.brandName}</p>
      </div>

      {message && (
        <div className="rounded bg-green-50 p-3 text-sm text-green-700">{message}</div>
      )}
      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <section className="rounded-lg border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-500">예치금</h2>
        <div className="mt-3 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500">1인당 보상</p>
            <p className="mt-1 font-bold text-gray-900">
              {data.rewardAmount.toLocaleString()}원
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">모집 인원</p>
            <p className="mt-1 font-bold text-gray-900">{data.maxParticipants}명</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">총 예산</p>
            <p className="mt-1 font-bold text-gray-900">
              {data.totalBudget.toLocaleString()}원
            </p>
          </div>
        </div>

        {data.escrowStatus === "PENDING_DEPOSIT" && (
          <div className="mt-5 rounded bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-semibold">예치금 입금을 기다리고 있습니다.</p>
            <p className="mt-1">
              아래 계좌로 <span className="font-bold">{data.totalBudget.toLocaleString()}원</span>을 입금한 뒤 &quot;계좌이체 완료&quot; 버튼을 눌러주세요. 관리자 확인 후 캠페인이 공개됩니다.
            </p>
            <p className="mt-2 text-xs">예치 계좌: 국민은행 000-00-0000-000 (주)바이럴그라운드</p>
            <button
              onClick={requestDeposit}
              disabled={acting}
              className="mt-4 rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {acting ? "요청 중..." : "계좌이체 완료 (관리자에게 확인 요청)"}
            </button>
          </div>
        )}

        {data.escrowStatus === "DEPOSIT_CONFIRMING" && (
          <div className="mt-5 rounded bg-blue-50 p-4 text-sm text-blue-800">
            관리자가 입금을 확인하고 있습니다. 확인이 완료되면 메일로 알려드립니다.
          </div>
        )}

        {data.escrowStatus === "FUNDED" && (
          <div className="mt-5 rounded bg-green-50 p-4 text-sm text-green-800">
            예치금 입금이 확인되어 캠페인이 공개되었습니다.
          </div>
        )}

        {data.escrowTransactions.length > 0 && (
          <div className="mt-5">
            <h3 className="text-xs font-semibold text-gray-500">예치금 이력</h3>
            <ul className="mt-2 divide-y divide-gray-200 rounded border border-gray-200">
              {data.escrowTransactions.map((tx) => (
                <li key={tx.id} className="flex items-center justify-between px-3 py-2 text-xs">
                  <span className="text-gray-700">{tx.type}</span>
                  <span className="text-gray-900">{tx.amount.toLocaleString()}원</span>
                  <span className="text-gray-400">{new Date(tx.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-500">캠페인 내용</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{data.description}</p>
        {data.requirements && (
          <div className="mt-4 rounded bg-gray-50 p-3 text-sm text-gray-700">
            <p className="font-semibold">제출 요구사항</p>
            <p className="mt-1 whitespace-pre-wrap">{data.requirements}</p>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-500">지원자 ({data.applicationCount})</h2>
        {data.applications.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">아직 지원자가 없습니다.</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-200">
            {data.applications.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-gray-900">{a.creator.name}</span>
                <span className="text-xs text-gray-500">{a.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
