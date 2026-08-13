"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import SubmissionTimeline, {
  type SubmissionHistoryItem,
} from "@/components/submission/SubmissionTimeline";
import ReviewForm from "@/components/review/ReviewForm";
import BackButton from "@/components/ui/BackButton";
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

type AppStatus =
  | "PENDING"
  | "WITHDRAWN"
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
  videoUrl: string | null;
  resubmissionCount: number | null;
  reviewComment: string | null;
  rewardPaidAmount: number | null;
  appliedAt: string;
  submittedAt: string | null;
  settledAt: string | null;
  creator: { id: number; name: string };
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

const ESCROW_LABEL: Record<EscrowStatus, { ko: string; en: string }> = {
  NONE: { ko: "-", en: "-" },
  PENDING_DEPOSIT: { ko: "결제 미활성", en: "Payment unavailable" },
  DEPOSIT_CONFIRMING: { ko: "기존 입금 확인 상태", en: "Legacy deposit review" },
  FUNDED: { ko: "기존 예치 완료 상태", en: "Legacy funded status" },
  PARTIALLY_RELEASED: { ko: "기존 지급 진행 상태", en: "Legacy payout status" },
  REFUNDED: { ko: "기존 환불 상태", en: "Legacy refund status" },
};

const ESCROW_TONE: Record<EscrowStatus, Tone> = {
  NONE: "neutral",
  PENDING_DEPOSIT: "warning",
  DEPOSIT_CONFIRMING: "warning",
  FUNDED: "success",
  PARTIALLY_RELEASED: "primary",
  REFUNDED: "error",
};

const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, { ko: string; en: string }> = {
  DRAFT: { ko: "작성중", en: "Draft" },
  OPEN: { ko: "모집중", en: "Recruiting" },
  CLOSED: { ko: "종료", en: "Closed" },
};

const APP_LABEL: Record<AppStatus, { ko: string; en: string }> = {
  PENDING: { ko: "지원 접수", en: "Application received" },
  WITHDRAWN: { ko: "지원자 탈퇴", en: "Creator withdrawn" },
  APPROVED: { ko: "선정 / 제작 대기", en: "Selected / awaiting content" },
  REJECTED: { ko: "탈락", en: "Rejected" },
  SUBMITTED: { ko: "제출 완료", en: "Submitted" },
  CHANGES_REQUESTED: { ko: "수정 요청 중", en: "Changes requested" },
  SETTLED: { ko: "정산 완료", en: "Settled" },
};

const APP_TONE: Record<AppStatus, Tone> = {
  PENDING: "warning",
  WITHDRAWN: "neutral",
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
  const { t } = useLang();
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
      .catch(() => setError(t("캠페인 정보를 불러오지 못했습니다", "Failed to load campaign details")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!id) return;
    let active = true;
    const controller = new AbortController();

    api
      .get<Detail>(`/company/campaigns/${id}`, { signal: controller.signal })
      .then((res) => {
        if (active) setData(res.data);
      })
      .catch(() => {
        if (active) {
          setError(t("캠페인 정보를 불러오지 못했습니다", "Failed to load campaign details"));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [id, t]);

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
      setError(response?.data?.message ?? t("요청에 실패했습니다", "Request failed"));
    } finally {
      setActing(false);
    }
  };

  const cancelCampaign = () => {
    if (!data) return;
    if (
      !confirm(
        t(
          "캠페인을 취소하시겠어요? 결제·정산 관련 후속 처리는 운영 계약과 관리자 확인에 따라 별도로 안내됩니다.",
          "Cancel this campaign? Any payment or settlement follow-up will be handled separately under your operating agreement and administrator review.",
        ),
      )
    )
      return;
    callAction(async () => {
      const { data: res } = await api.post<{ message: string }>(
        `/company/campaigns/${data.id}/cancel`,
      );
      return res;
    });
  };

  const deleteCampaign = () => {
    if (!data) return;
    if (
      !confirm(
        t(
          "캠페인을 삭제하시겠어요? 이 작업은 되돌릴 수 없습니다.",
          "Delete this campaign? This action cannot be undone.",
        ),
      )
    )
      return;
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
        setError(response?.data?.message ?? t("삭제에 실패했습니다", "Failed to delete"));
      })
      .finally(() => setActing(false));
  };

  const reviewApplication = async (
    appId: number,
    action: "APPROVE" | "REJECT" | "REQUEST_CHANGES" | "REJECT_VIDEO",
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
      setError(response?.data?.message ?? t("요청에 실패했습니다", "Request failed"));
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

  if (loading) return <p className="text-muted">{t("불러오는 중...", "Loading...")}</p>;
  if (!data) return <p className="text-error">{error || t("데이터 없음", "No data")}</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <BackButton href="/company/campaigns" labelKo="캠페인 목록으로" labelEn="Back to campaigns" />
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
              {t(ESCROW_LABEL[data.escrowStatus].ko, ESCROW_LABEL[data.escrowStatus].en)}
            </Badge>
            <span className="text-xs font-medium text-muted">
              {t(
                CAMPAIGN_STATUS_LABEL[data.status].ko,
                CAMPAIGN_STATUS_LABEL[data.status].en,
              )}
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
                {t("수정", "Edit")}
              </Button>
            </Link>
          )}
          {canCancel && (
            <Button variant="secondary" size="sm" onClick={cancelCampaign} disabled={acting}>
              {t("캠페인 취소", "Cancel campaign")}
            </Button>
          )}
          {canDelete && (
            <Button variant="ghost" size="sm" onClick={deleteCampaign} disabled={acting}>
              {t("삭제", "Delete")}
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
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          {t("예산 및 결제 상태", "Budget and payment status")}
        </h2>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium text-muted">{t("1인당 보상", "Reward per person")}</p>
            <p className="mt-1 text-lg font-bold tracking-tight text-foreground">
              {data.rewardAmount.toLocaleString()}
              {t("원", " KRW")}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">{t("모집 인원", "Recruiting count")}</p>
            <p className="mt-1 text-lg font-bold tracking-tight text-foreground">
              {data.maxParticipants}
              {t("명", "")}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted">{t("총 예산", "Total budget")}</p>
            <p className="mt-1 text-lg font-bold tracking-tight text-foreground">
              {data.totalBudget.toLocaleString()}
              {t("원", " KRW")}
            </p>
          </div>
        </div>

        {data.escrowStatus === "PENDING_DEPOSIT" && (
          <div className="mt-6 rounded-xl bg-warning/10 p-5 text-sm leading-relaxed text-foreground">
            <p className="font-bold text-warning">
              {t(
                "현재 관리 베타에서는 결제·정산 기능이 비활성화되어 있습니다.",
                "Payment and settlement are currently disabled in the managed beta.",
              )}
            </p>
            <p className="mt-3 font-semibold">
              {t(
                "화면에 표시된 예산을 어떤 계좌로도 송금하지 마세요.",
                "Do not transfer the displayed budget to any bank account.",
              )}
            </p>
            <p className="mt-2 text-content-soft">
              {t(
                "운영 계약이 체결되고 PG 결제가 활성화된 뒤, 검증된 결제 절차를 별도로 안내합니다.",
                "A verified payment process will be provided separately after an operating agreement is in place and PG payments are activated.",
              )}
            </p>
          </div>
        )}

        {data.escrowStatus === "DEPOSIT_CONFIRMING" && (
          <div className="mt-6 rounded-xl bg-info/10 p-4 text-sm leading-relaxed text-content-soft">
            {t(
              "기존 운영 기록상 입금 확인 단계입니다. 현재 셀프서비스 결제·정산은 비활성화되어 있으며, 이 상태만으로 실제 송금이나 확인 완료를 보장하지 않습니다. 후속 처리는 운영 계약과 관리자 기록을 기준으로 확인해주세요.",
              "This is a deposit-review state from legacy operations. Self-service payment and settlement are currently disabled, and this status alone does not confirm a transfer or completed review. Check the operating agreement and administrator records for any follow-up.",
            )}
          </div>
        )}

        {data.escrowStatus === "FUNDED" && (
          <div className="mt-6 rounded-xl bg-success/10 p-4 text-sm leading-relaxed text-content-soft">
            {t(
              "기존 운영 기록상 예치 완료 상태입니다. 이 표시는 결제·정산 보증이나 현재 PG 처리 완료를 의미하지 않습니다. 실제 운영 조건은 계약과 관리자 기록을 확인해주세요.",
              "This is a funded state from legacy operations. It is not a payment or settlement guarantee and does not indicate current PG completion. Check the agreement and administrator records for the applicable terms.",
            )}
          </div>
        )}

        {data.escrowStatus === "REFUNDED" && (
          <div className="mt-6 rounded-xl bg-surface-chip p-4 text-sm text-content-soft">
            {t(
              "기존 운영 기록상 환불 상태입니다. 실제 처리 내역은 운영 계약과 관리자 기록을 확인해주세요.",
              "This is a refund state from legacy operations. Check the operating agreement and administrator records for the actual processing details.",
            )}
          </div>
        )}

        {data.escrowTransactions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              {t("결제·정산 관리 이력", "Payment and settlement admin history")}
            </h3>
            <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line">
              {data.escrowTransactions.map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs"
                >
                  <span className="font-medium text-content-soft">{tx.type}</span>
                  <span className="font-semibold text-foreground">
                    {tx.amount.toLocaleString()}
                    {t("원", " KRW")}
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
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          {t("캠페인 내용", "Campaign details")}
        </h2>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-content-soft">
          {data.description}
        </p>
        {data.requirements && (
          <div className="mt-5 rounded-xl bg-surface-muted p-4 text-sm text-content-soft">
            <p className="font-semibold text-foreground">{t("제출 요구사항", "Submission requirements")}</p>
            <p className="mt-1.5 whitespace-pre-wrap leading-relaxed">{data.requirements}</p>
          </div>
        )}
      </Card>

      <div className="flex justify-end">
        <Link href={`/company/campaigns/${data.id}/performance`}>
          <Button variant="secondary" size="sm">
            {t("성과 리포트 보기 →", "View performance report →")}
          </Button>
        </Link>
      </div>

      <Card>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          {t("지원자", "Applicants")} ({data.applicationCount})
        </h2>
        {data.applications.length === 0 ? (
          <p className="mt-4 text-sm text-muted">{t("아직 지원자가 없습니다.", "No applicants yet.")}</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {data.applications.map((a) => (
              <li key={a.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">
                        {a.creator.name}
                      </span>
                      <Badge tone={APP_TONE[a.status]}>
                        {t(APP_LABEL[a.status].ko, APP_LABEL[a.status].en)}
                      </Badge>
                    </div>
                    {a.message && (
                      <p className="mt-2 whitespace-pre-wrap text-xs text-muted">
                        {t("지원 메시지: ", "Application message: ")}
                        {a.message}
                      </p>
                    )}
                    {a.videoUrl && (
                      <a
                        href={a.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex min-h-11 items-center text-xs font-bold text-primary underline underline-offset-4"
                      >
                        {t("제출 영상 검토 →", "Review submitted video →")}
                      </a>
                    )}
                    {!a.videoUrl &&
                      a.submissionUrl &&
                      isSafeExternalLink(a.submissionUrl) && (
                        <a
                          href={a.submissionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs font-medium text-primary underline-offset-2 hover:underline"
                        >
                          {t("외부 링크 보기 (레거시) →", "View external link (legacy) →")}
                        </a>
                      )}
                    {a.status === "CHANGES_REQUESTED" && a.reviewComment && (
                      <div className="mt-2 rounded-xl border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
                        <span className="font-semibold">{t("수정 요청 사유:", "Reason for changes:")}</span>{" "}
                        {a.reviewComment}
                      </div>
                    )}
                    {a.rewardPaidAmount != null && (
                      <p className="mt-1.5 text-xs text-muted">
                        {t("지급: ", "Payment: ")}
                        <span className="font-semibold text-foreground">
                          {a.rewardPaidAmount.toLocaleString()}
                          {t("원", " KRW")}
                        </span>
                      </p>
                    )}
                    {a.submissions.length > 0 && (
                      <div className="mt-3">
                        <p className="mb-2 text-xs font-semibold text-muted">
                          {t("제출 이력", "Submission history")}
                          {(a.resubmissionCount ?? 0) > 0 &&
                            t(
                              ` (재제출 ${a.resubmissionCount}회)`,
                              ` (${a.resubmissionCount} resubmission(s))`,
                            )}
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
                          {t("선정", "Select")}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={rowActingId === a.id}
                          onClick={() => reviewApplication(a.id, "REJECT")}
                        >
                          {t("탈락", "Reject")}
                        </Button>
                      </>
                    )}
                    {a.status === "SUBMITTED" && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={rowActingId === a.id}
                          onClick={() => {
                            setChangesModal({ appId: a.id });
                            setChangesComment("");
                          }}
                        >
                          {t("수정 요청", "Request changes")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={rowActingId === a.id}
                          onClick={() => {
                            if (
                              !confirm(
                                t(
                                  "이 영상을 최종 거절하시겠어요?",
                                  "Permanently reject this video?",
                                ),
                              )
                            )
                              return;
                            reviewApplication(a.id, "REJECT_VIDEO");
                          }}
                        >
                          {t("거절", "Reject")}
                        </Button>
                        <p className="basis-full text-xs leading-relaxed text-warning">
                          {t(
                            "승인·정산은 상용 PG 활성화 후 제공됩니다. 영상을 먼저 검토하고 필요하면 수정 요청 또는 거절을 기록하세요.",
                            "Approval and settlement become available after commercial PG activation. Review the video first, then record a change request or rejection if needed.",
                          )}
                        </p>
                      </>
                    )}
                    {a.status === "CHANGES_REQUESTED" && (
                      <Badge tone="warning">
                        {t("크리에이터 재제출 대기 중", "Awaiting creator resubmission")}
                      </Badge>
                    )}
                    {a.status === "SETTLED" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setReviewModal({ appId: a.id, creatorName: a.creator.name })
                        }
                      >
                        {t("리뷰 작성", "Write review")}
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
            <h3 className="mb-1 text-lg font-semibold text-foreground">
              {t("크리에이터 리뷰 작성", "Write a creator review")}
            </h3>
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
            <h3 className="mb-1 text-lg font-semibold text-foreground">
              {t("수정 요청 사유", "Reason for changes")}
            </h3>
            <p className="mb-5 text-sm text-muted">
              {t(
                "크리에이터에게 전달되는 피드백입니다. 무엇을 어떻게 수정해야 할지 구체적으로 작성해주세요.",
                "This feedback is sent to the creator. Describe specifically what to change and how.",
              )}
            </p>
            <textarea
              value={changesComment}
              onChange={(e) => setChangesComment(e.target.value)}
              rows={4}
              placeholder={t(
                "예: 로고 노출 시간이 3초 미만입니다. 중반부 이후에도 3초 이상 노출되도록 편집해주세요.",
                "e.g. The logo appears for under 3 seconds. Please edit so it stays on screen for at least 3 seconds past the midpoint.",
              )}
              className={TEXTAREA_CLASS}
            />
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setChangesModal(null)}>
                {t("취소", "Cancel")}
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
                {t("수정 요청 보내기", "Send change request")}
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
