"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import SubmissionTimeline, {
  type SubmissionHistoryItem,
} from "@/components/submission/SubmissionTimeline";

type CampaignStatus = "DRAFT" | "OPEN" | "CLOSED";
type EscrowStatus =
  | "NONE"
  | "PENDING_DEPOSIT"
  | "DEPOSIT_CONFIRMING"
  | "FUNDED"
  | "PARTIALLY_RELEASED"
  | "REFUNDED";

type AppStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SUBMITTED"
  | "CHANGES_REQUESTED"
  | "SETTLED";

interface ApplicationItem {
  id: number;
  status: AppStatus;
  message: string | null;
  submissionUrl: string | null;
  videoFileKey: string | null;
  resubmissionCount: number | null;
  reviewComment: string | null;
  rewardPaidAmount: number | null;
  appliedAt: string;
  submittedAt: string | null;
  settledAt: string | null;
  creator: { id: number; name: string; email: string };
  submissions: SubmissionHistoryItem[];
}

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
  applications: ApplicationItem[];
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

const APP_LABEL: Record<AppStatus, string> = {
  PENDING: "지원 접수",
  APPROVED: "선정 / 제작 대기",
  REJECTED: "탈락",
  SUBMITTED: "제출 완료",
  CHANGES_REQUESTED: "수정 요청 중",
  SETTLED: "정산 완료",
};

export default function CompanyCampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [rowActingId, setRowActingId] = useState<number | null>(null);
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

  const callAction = async (fn: () => Promise<{ message: string }>) => {
    setActing(true);
    setMessage("");
    setError("");
    try {
      const result = await fn();
      setMessage(result.message);
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

  const requestDeposit = () =>
    callAction(async () => {
      if (!data) return { message: "" };
      const { data: res } = await api.post<{ message: string }>(
        `/company/campaigns/${data.id}/deposit-request`
      );
      return res;
    });

  const cancelCampaign = () => {
    if (!data) return;
    if (!confirm("캠페인을 취소하시겠어요? 예치금은 환불 처리됩니다.")) return;
    callAction(async () => {
      const { data: res } = await api.post<{ message: string }>(
        `/company/campaigns/${data.id}/cancel`
      );
      return res;
    });
  };

  const deleteCampaign = () => {
    if (!data) return;
    if (!confirm("캠페인을 삭제하시겠어요? 이 작업은 되돌릴 수 없습니다.")) return;
    setActing(true);
    setMessage("");
    setError("");
    api
      .delete(`/company/campaigns/${data.id}`)
      .then(() => router.push("/company/campaigns"))
      .catch((err: unknown) => {
        const response =
          typeof err === "object" && err !== null && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response
            : undefined;
        setError(response?.data?.message ?? "삭제에 실패했습니다");
      })
      .finally(() => setActing(false));
  };

  const reviewApplication = async (
    appId: number,
    action:
      | "APPROVE"
      | "REJECT"
      | "APPROVE_VIDEO"
      | "REQUEST_CHANGES"
      | "REJECT_VIDEO",
    opts?: { rewardPaidAmount?: number; reviewComment?: string }
  ) => {
    setRowActingId(appId);
    setMessage("");
    setError("");
    try {
      const { data: res } = await api.patch<{ message: string }>(
        `/company/applications/${appId}`,
        { action, ...opts }
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
      setRowActingId(null);
    }
  };

  const [changesModal, setChangesModal] = useState<{ appId: number } | null>(null);
  const [changesComment, setChangesComment] = useState("");

  const canEdit =
    data &&
    data.escrowStatus !== "DEPOSIT_CONFIRMING" &&
    data.escrowStatus !== "REFUNDED" &&
    data.status !== "CLOSED";
  const canDelete =
    data &&
    data.escrowStatus === "PENDING_DEPOSIT" &&
    data.applicationCount === 0;
  const canCancel =
    data &&
    data.status !== "CLOSED" &&
    data.escrowStatus !== "REFUNDED" &&
    data.applicationCount === 0 &&
    (data.escrowStatus === "FUNDED" || data.escrowStatus === "PENDING_DEPOSIT");

  if (loading) return <p className="text-gray-500">불러오는 중...</p>;
  if (!data) return <p className="text-red-600">{error || "데이터 없음"}</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-start justify-between gap-4">
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
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <Link
              href={`/company/campaigns/${data.id}/edit`}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              수정
            </Link>
          )}
          {canCancel && (
            <button
              onClick={cancelCampaign}
              disabled={acting}
              className="rounded border border-amber-300 px-3 py-1.5 text-sm text-amber-700 hover:bg-amber-50 disabled:opacity-50"
            >
              캠페인 취소
            </button>
          )}
          {canDelete && (
            <button
              onClick={deleteCampaign}
              disabled={acting}
              className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              삭제
            </button>
          )}
        </div>
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

        {data.escrowStatus === "REFUNDED" && (
          <div className="mt-5 rounded bg-gray-100 p-4 text-sm text-gray-700">
            환불 처리된 캠페인입니다.
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
        <h2 className="text-sm font-semibold text-gray-500">
          지원자 ({data.applicationCount})
        </h2>
        {data.applications.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">아직 지원자가 없습니다.</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-200">
            {data.applications.map((a) => (
              <li key={a.id} className="py-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{a.creator.name}</span>
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                        {APP_LABEL[a.status]}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{a.creator.email}</p>
                    {a.message && (
                      <p className="mt-2 whitespace-pre-wrap text-xs text-gray-600">
                        지원 메시지: {a.message}
                      </p>
                    )}
                    {!a.videoFileKey && a.submissionUrl && isSafeExternalLink(a.submissionUrl) && (
                      <a
                        href={a.submissionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-xs text-blue-600 underline"
                      >
                        외부 링크 보기 (레거시) →
                      </a>
                    )}
                    {a.status === "CHANGES_REQUESTED" && a.reviewComment && (
                      <div className="mt-2 rounded bg-orange-50 p-2 text-xs text-orange-800">
                        <span className="font-semibold">수정 요청 사유:</span> {a.reviewComment}
                      </div>
                    )}
                    {a.rewardPaidAmount != null && (
                      <p className="mt-1 text-xs text-gray-500">
                        지급: {a.rewardPaidAmount.toLocaleString()}원
                      </p>
                    )}
                    {a.submissions.length > 0 && (
                      <div className="mt-3">
                        <p className="mb-2 text-xs font-semibold text-gray-500">
                          제출 이력
                          {(a.resubmissionCount ?? 0) > 0 && ` (재제출 ${a.resubmissionCount}회)`}
                        </p>
                        <SubmissionTimeline submissions={a.submissions} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {a.status === "PENDING" && (
                      <>
                        <button
                          disabled={rowActingId === a.id}
                          onClick={() => reviewApplication(a.id, "APPROVE")}
                          className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          선정
                        </button>
                        <button
                          disabled={rowActingId === a.id}
                          onClick={() => reviewApplication(a.id, "REJECT")}
                          className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          탈락
                        </button>
                      </>
                    )}
                    {a.status === "SUBMITTED" && (
                      <>
                        <button
                          disabled={rowActingId === a.id}
                          onClick={() => reviewApplication(a.id, "APPROVE_VIDEO")}
                          className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          승인 · 정산
                        </button>
                        <button
                          disabled={rowActingId === a.id}
                          onClick={() => {
                            setChangesModal({ appId: a.id });
                            setChangesComment("");
                          }}
                          className="rounded border border-amber-300 px-3 py-1 text-xs text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                        >
                          수정 요청
                        </button>
                        <button
                          disabled={rowActingId === a.id}
                          onClick={() => {
                            if (!confirm("이 영상을 최종 거절하시겠어요?")) return;
                            reviewApplication(a.id, "REJECT_VIDEO");
                          }}
                          className="rounded border border-red-300 px-3 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          거절
                        </button>
                      </>
                    )}
                    {a.status === "CHANGES_REQUESTED" && (
                      <span className="rounded bg-orange-100 px-3 py-1 text-xs text-orange-700">
                        크리에이터 재제출 대기 중
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {changesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h3 className="mb-1 text-lg font-semibold text-gray-900">수정 요청 사유</h3>
            <p className="mb-4 text-sm text-gray-500">
              크리에이터에게 전달되는 피드백입니다. 무엇을 어떻게 수정해야 할지 구체적으로 작성해주세요.
            </p>
            <textarea
              value={changesComment}
              onChange={(e) => setChangesComment(e.target.value)}
              rows={4}
              placeholder="예: 로고 노출 시간이 3초 미만입니다. 중반부 이후에도 3초 이상 노출되도록 편집해주세요."
              className="block w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setChangesModal(null)}
                className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  if (!changesModal || !changesComment.trim()) return;
                  await reviewApplication(changesModal.appId, "REQUEST_CHANGES", {
                    reviewComment: changesComment.trim(),
                  });
                  setChangesModal(null);
                }}
                disabled={!changesComment.trim() || rowActingId === changesModal.appId}
                className="rounded bg-amber-600 px-3 py-1.5 text-sm text-white hover:bg-amber-700 disabled:opacity-50"
              >
                수정 요청 보내기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** submissionUrl 렌더링 전 프로토콜 검증. javascript:/data: 차단. */
function isSafeExternalLink(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
