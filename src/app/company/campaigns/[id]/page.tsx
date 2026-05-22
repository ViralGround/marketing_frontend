"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import SubmissionTimeline, {
  type SubmissionHistoryItem,
} from "@/components/submission/SubmissionTimeline";
import ReviewForm from "@/components/review/ReviewForm";
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
  thumbnailUrl: string | null;
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

const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  DRAFT: "작성중",
  OPEN: "모집중",
  CLOSED: "종료",
};

const APP_LABEL: Record<AppStatus, string> = {
  PENDING: "지원 접수",
  APPROVED: "선정 / 제작 대기",
  REJECTED: "탈락",
  SUBMITTED: "제출 완료",
  CHANGES_REQUESTED: "수정 요청 중",
  SETTLED: "정산 완료",
};

const APP_TONE: Record<AppStatus, Tone> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
  SUBMITTED: "info",
  CHANGES_REQUESTED: "warning",
  SETTLED: "primary",
};

const TEXTAREA_CLASS =
  "block w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-foreground placeholder-faint transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

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
        `/company/campaigns/${data.id}/deposit-request`,
      );
      return res;
    });

  const cancelCampaign = () => {
    if (!data) return;
    if (!confirm("캠페인을 취소하시겠어요? 예치금은 환불 처리됩니다.")) return;
    callAction(async () => {
      const { data: res } = await api.post<{ message: string }>(
        `/company/campaigns/${data.id}/cancel`,
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
    action: "APPROVE" | "REJECT" | "APPROVE_VIDEO" | "REQUEST_CHANGES" | "REJECT_VIDEO",
    opts?: { rewardPaidAmount?: number; reviewComment?: string },
  ) => {
    setRowActingId(appId);
    setMessage("");
    setError("");
    try {
      const { data: res } = await api.patch<{ message: string }>(
        `/company/applications/${appId}`,
        { action, ...opts },
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
  const [reviewModal, setReviewModal] = useState<{ appId: number; creatorName: string } | null>(
    null,
  );

  const canEdit =
    data &&
    data.escrowStatus !== "DEPOSIT_CONFIRMING" &&
    data.escrowStatus !== "REFUNDED" &&
    data.status !== "CLOSED";
  const canDelete =
    data && data.escrowStatus === "PENDING_DEPOSIT" && data.applicationCount === 0;
  const canCancel =
    data &&
    data.status !== "CLOSED" &&
    data.escrowStatus !== "REFUNDED" &&
    data.applicationCount === 0 &&
    (data.escrowStatus === "FUNDED" || data.escrowStatus === "PENDING_DEPOSIT");

  if (loading) return <p className="text-muted">불러오는 중...</p>;
  if (!data) return <p className="text-error">{error || "데이터 없음"}</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {data.thumbnailUrl && (
        <div className="aspect-video overflow-hidden rounded-2xl bg-surface-chip">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.thumbnailUrl}
            alt={data.title}
            className="h-full w-full object-contain"
          />
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={ESCROW_TONE[data.escrowStatus]}>
              {ESCROW_LABEL[data.escrowStatus]}
            </Badge>
            <span className="text-xs font-medium text-muted">
              {CAMPAIGN_STATUS_LABEL[data.status]}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {data.title}
          </h1>
          <p className="mt-1 text-sm font-medium text-muted">{data.brandName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <Link href={`/company/campaigns/${data.id}/edit`}>
              <Button variant="secondary" size="sm">
                수정
              </Button>
            </Link>
          )}
          {canCancel && (
            <Button variant="secondary" size="sm" onClick={cancelCampaign} disabled={acting}>
              캠페인 취소
            </Button>
          )}
          {canDelete && (
            <Button variant="ghost" size="sm" onClick={deleteCampaign} disabled={acting}>
              삭제
            </Button>
          )}
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-success/30 bg-success/5 p-3 text-sm text-success">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-error/30 bg-error/5 p-3 text-sm text-error">
          {error}
        </div>
      )}

      <Card>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">예치금</h2>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium text-muted">1인당 보상</p>
            <p className="mt-1 text-lg font-bold tracking-tight text-foreground">
              {data.rewardAmount.toLocaleString()}원
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">모집 인원</p>
            <p className="mt-1 text-lg font-bold tracking-tight text-foreground">
              {data.maxParticipants}명
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">총 예산</p>
            <p className="mt-1 text-lg font-bold tracking-tight text-foreground">
              {data.totalBudget.toLocaleString()}원
            </p>
          </div>
        </div>

        {data.escrowStatus === "PENDING_DEPOSIT" && (
          <div className="mt-6 rounded-xl border border-warning/30 bg-warning/5 p-5 text-sm text-warning">
            <p className="font-semibold">예치금 입금을 기다리고 있습니다.</p>
            <p className="mt-2">
              아래 계좌로{" "}
              <span className="font-bold">{data.totalBudget.toLocaleString()}원</span>을 입금한
              뒤 &quot;계좌이체 완료&quot; 버튼을 눌러주세요. 관리자 확인 후 캠페인이 공개됩니다.
            </p>
            <p className="mt-2 text-xs">예치 계좌: 국민은행 000-00-0000-000 (주)바이럴그라운드</p>
            <Button size="sm" onClick={requestDeposit} disabled={acting} className="mt-4">
              {acting ? "요청 중..." : "계좌이체 완료 (관리자에게 확인 요청)"}
            </Button>
          </div>
        )}

        {data.escrowStatus === "DEPOSIT_CONFIRMING" && (
          <div className="mt-6 rounded-xl border border-info/30 bg-info/5 p-4 text-sm text-info">
            관리자가 입금을 확인하고 있습니다. 확인이 완료되면 메일로 알려드립니다.
          </div>
        )}

        {data.escrowStatus === "FUNDED" && (
          <div className="mt-6 rounded-xl border border-success/30 bg-success/5 p-4 text-sm text-success">
            예치금 입금이 확인되어 캠페인이 공개되었습니다.
          </div>
        )}

        {data.escrowStatus === "REFUNDED" && (
          <div className="mt-6 rounded-xl bg-surface-chip p-4 text-sm text-content-soft">
            환불 처리된 캠페인입니다.
          </div>
        )}

        {data.escrowTransactions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              예치금 이력
            </h3>
            <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line">
              {data.escrowTransactions.map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs"
                >
                  <span className="font-medium text-content-soft">{tx.type}</span>
                  <span className="font-semibold text-foreground">
                    {tx.amount.toLocaleString()}원
                  </span>
                  <span className="text-faint">
                    {new Date(tx.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">캠페인 내용</h2>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-content-soft">
          {data.description}
        </p>
        {data.requirements && (
          <div className="mt-5 rounded-xl bg-surface-muted p-4 text-sm text-content-soft">
            <p className="font-semibold text-foreground">제출 요구사항</p>
            <p className="mt-1.5 whitespace-pre-wrap leading-relaxed">{data.requirements}</p>
          </div>
        )}
      </Card>

      <div className="flex justify-end">
        <Link href={`/company/campaigns/${data.id}/performance`}>
          <Button variant="secondary" size="sm">
            성과 리포트 보기 →
          </Button>
        </Link>
      </div>

      <Card>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          지원자 ({data.applicationCount})
        </h2>
        {data.applications.length === 0 ? (
          <p className="mt-4 text-sm text-muted">아직 지원자가 없습니다.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {data.applications.map((a) => (
              <li key={a.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/creators/${a.creator.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {a.creator.name}
                      </Link>
                      <Badge tone={APP_TONE[a.status]}>{APP_LABEL[a.status]}</Badge>
                      <Link
                        href={`/creators/${a.creator.id}`}
                        className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                      >
                        상세 프로필 →
                      </Link>
                    </div>
                    <p className="mt-1 text-xs text-muted">{a.creator.email}</p>
                    {a.message && (
                      <p className="mt-2 whitespace-pre-wrap text-xs text-muted">
                        지원 메시지: {a.message}
                      </p>
                    )}
                    {!a.videoFileKey &&
                      a.submissionUrl &&
                      isSafeExternalLink(a.submissionUrl) && (
                        <a
                          href={a.submissionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs font-medium text-primary underline-offset-2 hover:underline"
                        >
                          외부 링크 보기 (레거시) →
                        </a>
                      )}
                    {a.status === "CHANGES_REQUESTED" && a.reviewComment && (
                      <div className="mt-2 rounded-xl border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
                        <span className="font-semibold">수정 요청 사유:</span> {a.reviewComment}
                      </div>
                    )}
                    {a.rewardPaidAmount != null && (
                      <p className="mt-1.5 text-xs text-muted">
                        지급:{" "}
                        <span className="font-semibold text-foreground">
                          {a.rewardPaidAmount.toLocaleString()}원
                        </span>
                      </p>
                    )}
                    {a.submissions.length > 0 && (
                      <div className="mt-3">
                        <p className="mb-2 text-xs font-semibold text-muted">
                          제출 이력
                          {(a.resubmissionCount ?? 0) > 0 &&
                            ` (재제출 ${a.resubmissionCount}회)`}
                        </p>
                        <SubmissionTimeline submissions={a.submissions} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {a.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          disabled={rowActingId === a.id}
                          onClick={() => reviewApplication(a.id, "APPROVE")}
                        >
                          선정
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={rowActingId === a.id}
                          onClick={() => reviewApplication(a.id, "REJECT")}
                        >
                          탈락
                        </Button>
                      </>
                    )}
                    {a.status === "SUBMITTED" && (
                      <>
                        <Button
                          size="sm"
                          disabled={rowActingId === a.id}
                          onClick={() => reviewApplication(a.id, "APPROVE_VIDEO")}
                        >
                          승인 · 정산
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={rowActingId === a.id}
                          onClick={() => {
                            setChangesModal({ appId: a.id });
                            setChangesComment("");
                          }}
                        >
                          수정 요청
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={rowActingId === a.id}
                          onClick={() => {
                            if (!confirm("이 영상을 최종 거절하시겠어요?")) return;
                            reviewApplication(a.id, "REJECT_VIDEO");
                          }}
                        >
                          거절
                        </Button>
                      </>
                    )}
                    {a.status === "CHANGES_REQUESTED" && (
                      <Badge tone="warning">크리에이터 재제출 대기 중</Badge>
                    )}
                    {a.status === "SETTLED" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setReviewModal({ appId: a.id, creatorName: a.creator.name })
                        }
                      >
                        리뷰 작성
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl">
            <h3 className="mb-1 text-lg font-semibold text-foreground">크리에이터 리뷰 작성</h3>
            <p className="mb-5 text-sm text-muted">{reviewModal.creatorName}</p>
            <ReviewForm
              applicationId={reviewModal.appId}
              onSubmitted={() => {
                setReviewModal(null);
                load();
              }}
              onCancel={() => setReviewModal(null)}
            />
          </div>
        </div>
      )}

      {changesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl">
            <h3 className="mb-1 text-lg font-semibold text-foreground">수정 요청 사유</h3>
            <p className="mb-5 text-sm text-muted">
              크리에이터에게 전달되는 피드백입니다. 무엇을 어떻게 수정해야 할지 구체적으로 작성해주세요.
            </p>
            <textarea
              value={changesComment}
              onChange={(e) => setChangesComment(e.target.value)}
              rows={4}
              placeholder="예: 로고 노출 시간이 3초 미만입니다. 중반부 이후에도 3초 이상 노출되도록 편집해주세요."
              className={TEXTAREA_CLASS}
            />
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setChangesModal(null)}>
                취소
              </Button>
              <Button
                size="sm"
                onClick={async () => {
                  if (!changesModal || !changesComment.trim()) return;
                  await reviewApplication(changesModal.appId, "REQUEST_CHANGES", {
                    reviewComment: changesComment.trim(),
                  });
                  setChangesModal(null);
                }}
                disabled={!changesComment.trim() || rowActingId === changesModal.appId}
              >
                수정 요청 보내기
              </Button>
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
