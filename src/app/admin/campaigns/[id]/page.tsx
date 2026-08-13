"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import CampaignForm from "@/components/admin/CampaignForm";
import ApplicationStatusBadge from "@/components/campaign/ApplicationStatusBadge";
import AlertModal from "@/components/ui/AlertModal";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SubmissionTimeline from "@/components/submission/SubmissionTimeline";
import { useLang } from "@/lib/i18n";

type CampaignStatus = "OPEN" | "CLOSED";
type AppStatus =
  | "PENDING"
  | "WITHDRAWN"
  | "APPROVED"
  | "REJECTED"
  | "SUBMITTED"
  | "CHANGES_REQUESTED"
  | "SETTLED";
type EscrowStatus =
  | "NONE"
  | "PENDING_DEPOSIT"
  | "DEPOSIT_CONFIRMING"
  | "FUNDED"
  | "PARTIALLY_RELEASED"
  | "RELEASED"
  | "REFUNDED";

interface CampaignDetail {
  id: number;
  title: string;
  description: string;
  brandName: string;
  brandIntroduction: string | null;
  brandLogoUrl: string | null;
  rewardAmount: number;
  thumbnailUrl: string | null;
  requirements: string | null;
  deadline: string | null;
  maxParticipants: number;
  status: CampaignStatus;
  escrowStatus: EscrowStatus;
  fundedAt: string | null;
  createdAt: string;
  hidden: boolean;
  hiddenAt: string | null;
  applications: Application[];
}

type Tone = "primary" | "success" | "warning" | "error" | "info" | "neutral";

const ESCROW_LABEL: Record<EscrowStatus, { ko: string; en: string }> = {
  NONE: { ko: "미신청", en: "Not requested" },
  PENDING_DEPOSIT: { ko: "입금 대기", en: "Awaiting deposit" },
  DEPOSIT_CONFIRMING: { ko: "확인 대기", en: "Confirming" },
  FUNDED: { ko: "예치 완료", en: "Deposited" },
  PARTIALLY_RELEASED: { ko: "일부 지급", en: "Partially released" },
  RELEASED: { ko: "전액 지급", en: "Fully released" },
  REFUNDED: { ko: "환불", en: "Refunded" },
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

const FORCE_COMPLETE_STATES: EscrowStatus[] = [
  "NONE",
  "PENDING_DEPOSIT",
  "DEPOSIT_CONFIRMING",
];

interface Application {
  id: number;
  status: AppStatus;
  message: string | null;
  submissionUrl: string | null;
  videoUrl: string | null;
  resubmissionCount: number | null;
  reviewComment: string | null;
  rewardPaidAmount: number | null;
  appliedAt: string;
  reviewedAt: string | null;
  submittedAt: string | null;
  settledAt: string | null;
  submissions: import("@/components/submission/SubmissionTimeline").SubmissionHistoryItem[];
  creator: {
    id: number;
    email: string;
    name: string;
    creatorProfile: {
      gender: string | null;
      age: number | null;
      faceExposure: boolean;
      editingTool: string | null;
      instagramId: string | null;
      tiktokId: string | null;
      youtubeId: string | null;
    } | null;
  };
}

const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, { ko: string; en: string }> = {
  OPEN: { ko: "모집중", en: "Recruiting" },
  CLOSED: { ko: "마감", en: "Closed" },
};

export default function AdminCampaignDetailPage() {
  const { t } = useLang();
  const { id } = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const load = () => {
    api
      .get(`/admin/campaigns/${id}`)
      .then((res) => setCampaign(res.data))
      .catch(() => router.push("/admin/campaigns"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatus = async (newStatus: CampaignStatus) => {
    const label = t(CAMPAIGN_STATUS_LABEL[newStatus].ko, CAMPAIGN_STATUS_LABEL[newStatus].en);
    if (
      !confirm(
        t(`상태를 "${label}"(으)로 변경할까요?`, `Change status to "${label}"?`),
      )
    )
      return;
    try {
      await api.put(`/admin/campaigns/${id}`, { status: newStatus });
      load();
    } catch {
      setErrorMessage(t("변경에 실패했습니다", "Failed to change status"));
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        t(
          "이 캠페인을 영구 삭제할까요?\n\n지원·제출·성과·예치금 내역과 업로드 파일이 함께 삭제되며 되돌릴 수 없습니다. (정산 지급이 진행된 캠페인은 삭제할 수 없으니, 그 경우 '숨김' 처리를 사용해주세요.)",
          "Permanently delete this campaign?\n\nApplications, submissions, performance, deposit records, and uploaded files will be deleted and cannot be recovered. (Campaigns with completed payouts can't be deleted — use 'Hide' instead in that case.)",
        ),
      )
    )
      return;
    try {
      await api.delete(`/admin/campaigns/${id}`);
      router.push("/admin/campaigns");
    } catch (err: unknown) {
      const msg =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message;
      setErrorMessage(msg || t("삭제에 실패했습니다", "Failed to delete"));
    }
  };

  const handleToggleVisibility = async () => {
    if (!campaign) return;
    const next = !campaign.hidden;
    const label = next ? t("숨김", "Hide") : t("다시 노출", "Show again");
    if (
      !confirm(
        next
          ? t(
              "이 캠페인을 숨김 처리할까요? 크리에이터에게 더 이상 보이지 않게 됩니다.",
              "Hide this campaign? It will no longer be visible to creators.",
            )
          : t(
              "이 캠페인을 다시 노출할까요? 크리에이터에게 보이게 됩니다.",
              "Show this campaign again? It will be visible to creators.",
            ),
      )
    )
      return;
    try {
      await api.patch(`/admin/campaigns/${id}/visibility`, { hidden: next });
      load();
    } catch (err: unknown) {
      const msg =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message;
      setErrorMessage(msg || t(`${label} 처리에 실패했습니다`, `Failed to ${label.toLowerCase()}`));
    }
  };

  const handleApplicationAction = async (
    appId: number,
    status: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED",
    appCreatorName: string,
  ) => {
    const payload: { status: string; rewardPaidAmount?: number; reviewComment?: string } = { status };
    if (status === "CHANGES_REQUESTED") {
      const comment = prompt(
        t(
          `"${appCreatorName}" 에게 수정 요청 사유를 입력하세요`,
          `Enter the reason for requesting changes from "${appCreatorName}"`,
        ),
        "",
      );
      if (comment === null || !comment.trim()) return;
      payload.reviewComment = comment.trim();
    } else {
      const label = status === "APPROVED" ? t("승인", "approve") : t("거절", "reject");
      if (
        !confirm(
          t(
            `"${appCreatorName}" 의 지원을 ${label}하시겠습니까?`,
            `${label.charAt(0).toUpperCase() + label.slice(1)} the application from "${appCreatorName}"?`,
          ),
        )
      )
        return;
    }
    try {
      await api.patch(`/admin/applications/${appId}`, payload);
      load();
    } catch {
      setErrorMessage(t("처리에 실패했습니다", "Failed to process"));
    }
  };

  if (loading || !campaign) {
    return <p className="text-muted">{t("불러오는 중...", "Loading...")}</p>;
  }

  if (editMode) {
    return (
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => setEditMode(false)}
          className="mb-6 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          &larr; {t("취소", "Cancel")}
        </button>
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground">{t("캠페인 수정", "Edit campaign")}</h1>
        <CampaignForm
          mode="edit"
          initial={{
            id: campaign.id,
            title: campaign.title,
            description: campaign.description,
            brandName: campaign.brandName,
            brandIntroduction: campaign.brandIntroduction,
            brandLogoUrl: campaign.brandLogoUrl,
            rewardAmount: campaign.rewardAmount,
            thumbnailUrl: campaign.thumbnailUrl,
            requirements: campaign.requirements,
            deadline: campaign.deadline,
            maxParticipants: campaign.maxParticipants,
          }}
          escrowStatus={campaign.escrowStatus}
          onSuccess={() => { setEditMode(false); load(); }}
        />
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.push("/admin/campaigns")}
        className="mb-6 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        &larr; {t("캠페인 목록으로", "Back to campaigns")}
      </button>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">{campaign.brandName}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{campaign.title}</h1>
            {campaign.hidden && (
              <Badge tone="neutral">{t("숨김 (사용자 미노출)", "Hidden (not shown to users)")}</Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditMode(true)}>
            {t("수정", "Edit")}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleToggleVisibility}>
            {campaign.hidden ? t("다시 노출", "Show again") : t("숨김 처리", "Hide")}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            {t("삭제", "Delete")}
          </Button>
        </div>
      </div>

      {/* 요약 */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs font-medium text-muted">{t("보상", "Reward")}</p>
          <p className="mt-1 text-xl font-bold tracking-tight text-foreground">
            ₩{campaign.rewardAmount.toLocaleString("ko-KR")}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium text-muted">{t("지원자", "Applicants")}</p>
          <p className="mt-1 text-xl font-bold tracking-tight text-foreground">
            {campaign.applications.length} / {campaign.maxParticipants}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium text-muted">{t("마감일", "Deadline")}</p>
          <p className="mt-1 text-xl font-bold tracking-tight text-foreground">
            {campaign.deadline
              ? new Date(campaign.deadline).toLocaleDateString("ko-KR")
              : "-"}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium text-muted">{t("상태", "Status")}</p>
          <p className="mt-1 text-xl font-bold tracking-tight text-foreground">
            {t(CAMPAIGN_STATUS_LABEL[campaign.status].ko, CAMPAIGN_STATUS_LABEL[campaign.status].en)}
          </p>
        </Card>
      </div>

      {/* 예치금 */}
      <Card className="mb-6 p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-content-soft">{t("예치금", "Deposit")}</p>
          <Badge tone={ESCROW_TONE[campaign.escrowStatus]}>
            {t(ESCROW_LABEL[campaign.escrowStatus].ko, ESCROW_LABEL[campaign.escrowStatus].en)}
          </Badge>
        </div>
        {campaign.fundedAt && (
          <p className="mb-3 text-xs text-muted">
            {t("완료 시각: ", "Completed at: ")}
            {new Date(campaign.fundedAt).toLocaleString("ko-KR")}
          </p>
        )}
        {FORCE_COMPLETE_STATES.includes(campaign.escrowStatus) ? (
          <div>
            <p className="text-xs leading-relaxed text-warning">
              {t(
                "상용 PG가 활성화되기 전에는 관리자도 예치 완료를 만들 수 없습니다. 어떤 계좌로도 송금을 안내하지 말고 운영 계약과 결제 공급자 설정을 먼저 완료하세요.",
                "Administrators cannot mark deposits complete before a commercial PG is active. Do not provide transfer instructions; complete the operating agreement and payment provider setup first.",
              )}
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted">
            {t(
              "이미 예치금이 완료되었거나 정산/환불된 캠페인입니다.",
              "This campaign's deposit is already complete, or it has been settled/refunded.",
            )}
          </p>
        )}
      </Card>

      {/* 상태 변경 */}
      <Card className="mb-6 p-5">
        <p className="mb-3 text-sm font-semibold text-content-soft">{t("상태 변경", "Change status")}</p>
        <div className="flex flex-wrap gap-2">
          {(["OPEN", "CLOSED"] as CampaignStatus[]).map((s) => (
            <Button
              key={s}
              variant="secondary"
              size="sm"
              onClick={() => handleStatus(s)}
              disabled={campaign.status === s}
            >
              {t(CAMPAIGN_STATUS_LABEL[s].ko, CAMPAIGN_STATUS_LABEL[s].en)}
            </Button>
          ))}
        </div>
      </Card>

      {/* 설명 */}
      <Card className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{t("설명", "Description")}</h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-content-soft">
          {campaign.description}
        </p>
        {campaign.requirements && (
          <>
            <h3 className="mt-6 mb-2 text-sm font-semibold text-foreground">{t("요구사항", "Requirements")}</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-content-soft">
              {campaign.requirements}
            </p>
          </>
        )}
        {campaign.thumbnailUrl && (
          <div className="mt-6">
            <p className="mb-2 text-xs font-medium text-muted">{t("썸네일", "Thumbnail")}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={campaign.thumbnailUrl}
              alt={t("썸네일", "Thumbnail")}
              className="max-h-60 rounded-2xl border border-line"
            />
          </div>
        )}
      </Card>

      {/* 지원자 */}
      <Card>
        <h2 className="mb-5 text-lg font-semibold text-foreground">
          {t("지원자", "Applicants")} ({campaign.applications.length})
        </h2>
        {campaign.applications.length === 0 ? (
          <p className="text-sm text-muted">{t("아직 지원자가 없습니다.", "No applicants yet.")}</p>
        ) : (
          <div className="space-y-3">
            {campaign.applications.map((app) => (
              <div
                key={app.id}
                className="rounded-2xl border border-line bg-surface p-5"
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/members/${app.creator.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {app.creator.name}
                      </Link>
                      <ApplicationStatusBadge status={app.status} />
                    </div>
                    <p className="text-xs text-muted">{app.creator.email}</p>
                  </div>
                  <p className="text-xs text-muted">
                    {t("지원일: ", "Applied: ")}
                    {new Date(app.appliedAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>

                {app.creator.creatorProfile && (
                  <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                    {app.creator.creatorProfile.gender && (
                      <span>{t("성별: ", "Gender: ")}{app.creator.creatorProfile.gender}</span>
                    )}
                    {app.creator.creatorProfile.age && (
                      <span>{t("나이: ", "Age: ")}{app.creator.creatorProfile.age}</span>
                    )}
                    {app.creator.creatorProfile.editingTool && (
                      <span>{t("편집툴: ", "Editing tool: ")}{app.creator.creatorProfile.editingTool}</span>
                    )}
                    <span>
                      {t("얼굴 공개: ", "Face shown: ")}
                      {app.creator.creatorProfile.faceExposure ? t("예", "Yes") : t("아니요", "No")}
                    </span>
                    {app.creator.creatorProfile.instagramId && (
                      <span>IG: @{app.creator.creatorProfile.instagramId}</span>
                    )}
                  </div>
                )}

                {app.message && (
                  <div className="mb-3 rounded-xl bg-surface-muted p-3 text-sm text-content-soft">
                    &ldquo;{app.message}&rdquo;
                  </div>
                )}

                {app.videoUrl && (
                  <a
                    href={app.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-3 inline-flex min-h-11 items-center text-sm font-bold text-primary underline underline-offset-4"
                  >
                    {t("현재 제출 영상 검토 →", "Review current submission →")}
                  </a>
                )}

                {!app.videoUrl && app.submissionUrl && (
                  <div className="mb-3 text-sm">
                    <span className="text-muted">{t("제출 URL (레거시): ", "Submission URL (legacy): ")}</span>
                    {isSafeExternalLink(app.submissionUrl) ? (
                      <a
                        href={app.submissionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-2 hover:underline"
                      >
                        {app.submissionUrl}
                      </a>
                    ) : (
                      <span className="text-error">{t("유효하지 않은 링크", "Invalid link")}</span>
                    )}
                  </div>
                )}
                {app.status === "CHANGES_REQUESTED" && app.reviewComment && (
                  <div className="mb-3 rounded-xl border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
                    <span className="font-semibold">{t("수정 요청 사유:", "Reason for changes:")}</span> {app.reviewComment}
                  </div>
                )}
                {app.submissions && app.submissions.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-2 text-xs font-semibold text-muted">
                      {t("제출 이력", "Submission history")}
                      {(app.resubmissionCount ?? 0) > 0 &&
                        t(
                          ` (재제출 ${app.resubmissionCount}회)`,
                          ` (resubmitted ${app.resubmissionCount} time${app.resubmissionCount === 1 ? "" : "s"})`,
                        )}
                    </p>
                    <SubmissionTimeline submissions={app.submissions} />
                  </div>
                )}

                {app.rewardPaidAmount !== null && (
                  <p className="mb-3 text-sm text-content-soft">
                    {t("정산액:", "Payout:")}{" "}
                    <span className="font-semibold text-foreground">
                      ₩{app.rewardPaidAmount.toLocaleString("ko-KR")}
                    </span>
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {app.status === "PENDING" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() =>
                          handleApplicationAction(app.id, "APPROVED", app.creator.name)
                        }
                      >
                        {t("승인", "Approve")}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          handleApplicationAction(app.id, "REJECTED", app.creator.name)
                        }
                      >
                        {t("거절", "Reject")}
                      </Button>
                    </>
                  )}
                  {app.status === "SUBMITTED" && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          handleApplicationAction(
                            app.id,
                            "CHANGES_REQUESTED",
                            app.creator.name,
                          )
                        }
                      >
                        {t("수정 요청", "Request changes")}
                      </Button>
                      <span className="self-center text-xs text-warning">
                        {t("승인·정산은 PG 활성화 후 제공", "Approval and payout require an active PG")}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleApplicationAction(app.id, "REJECTED", app.creator.name)
                        }
                      >
                        {t("거절", "Reject")}
                      </Button>
                    </>
                  )}
                  {app.status === "CHANGES_REQUESTED" && (
                    <Badge tone="warning">{t("재제출 대기 중", "Awaiting resubmission")}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <AlertModal
        open={!!errorMessage}
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />
    </div>
  );
}

/**
 * submissionUrl 같은 외부 입력값을 href 에 주입하기 전 프로토콜을 제한.
 * javascript:/data: 등 실행 가능한 스킴을 차단.
 */
function isSafeExternalLink(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
