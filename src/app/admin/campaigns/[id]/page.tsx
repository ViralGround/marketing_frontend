"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import CampaignForm from "@/components/admin/CampaignForm";
import ApplicationStatusBadge from "@/components/campaign/ApplicationStatusBadge";
import AlertModal from "@/components/ui/AlertModal";
import SubmissionTimeline from "@/components/submission/SubmissionTimeline";

type CampaignStatus = "OPEN" | "CLOSED";
type AppStatus =
  | "PENDING"
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
  videoFileKey: string | null;
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

const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  OPEN: "모집중",
  CLOSED: "마감",
};

export default function AdminCampaignDetailPage() {
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
    if (!confirm(`상태를 "${CAMPAIGN_STATUS_LABEL[newStatus]}"(으)로 변경할까요?`)) return;
    try {
      await api.put(`/admin/campaigns/${id}`, { status: newStatus });
      load();
    } catch {
      setErrorMessage("변경에 실패했습니다");
    }
  };

  const handleForceCompleteEscrow = async () => {
    if (
      !confirm(
        "이 캠페인을 예치금 완료 상태로 전환할까요? 크리에이터에게 즉시 노출됩니다.",
      )
    )
      return;
    try {
      await api.post(`/admin/campaigns/${id}/escrow/force-complete`);
      load();
    } catch (err: unknown) {
      const msg =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message;
      setErrorMessage(msg || "예치금 완료 처리에 실패했습니다");
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "캠페인을 삭제하시겠습니까? 지원자나 예치금 거래가 있으면 삭제할 수 없으며, 그 경우 '숨김' 처리를 사용해주세요.",
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
      setErrorMessage(msg || "삭제에 실패했습니다");
    }
  };

  const handleToggleVisibility = async () => {
    if (!campaign) return;
    const next = !campaign.hidden;
    const label = next ? "숨김" : "다시 노출";
    if (
      !confirm(
        next
          ? "이 캠페인을 숨김 처리할까요? 크리에이터에게 더 이상 보이지 않게 됩니다."
          : "이 캠페인을 다시 노출할까요? 크리에이터에게 보이게 됩니다.",
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
      setErrorMessage(msg || `${label} 처리에 실패했습니다`);
    }
  };

  const handleApplicationAction = async (
    appId: number,
    status: "APPROVED" | "REJECTED" | "SETTLED" | "CHANGES_REQUESTED",
    appCreatorName: string,
  ) => {
    const payload: { status: string; rewardPaidAmount?: number; reviewComment?: string } = { status };
    if (status === "SETTLED") {
      const input = prompt(`"${appCreatorName}" 에게 지급할 금액을 입력하세요 (원)`, String(campaign?.rewardAmount ?? 0));
      if (input === null) return;
      const amount = Number(input);
      if (!Number.isInteger(amount) || amount < 0) {
        setErrorMessage("금액이 올바르지 않습니다");
        return;
      }
      payload.rewardPaidAmount = amount;
    } else if (status === "CHANGES_REQUESTED") {
      const comment = prompt(`"${appCreatorName}" 에게 수정 요청 사유를 입력하세요`, "");
      if (comment === null || !comment.trim()) return;
      payload.reviewComment = comment.trim();
    } else {
      const label = status === "APPROVED" ? "승인" : "거절";
      if (!confirm(`"${appCreatorName}" 의 지원을 ${label}하시겠습니까?`)) return;
    }
    try {
      await api.patch(`/admin/applications/${appId}`, payload);
      load();
    } catch {
      setErrorMessage("처리에 실패했습니다");
    }
  };

  if (loading || !campaign) {
    return <p className="text-muted">불러오는 중...</p>;
  }

  if (editMode) {
    return (
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => setEditMode(false)}
          className="mb-4 text-sm text-muted hover:text-foreground"
        >
          &larr; 취소
        </button>
        <h1 className="mb-6 text-2xl font-bold text-foreground">캠페인 수정</h1>
        <CampaignForm
          mode="edit"
          initial={{
            id: campaign.id,
            title: campaign.title,
            description: campaign.description,
            brandName: campaign.brandName,
            rewardAmount: campaign.rewardAmount,
            thumbnailUrl: campaign.thumbnailUrl,
            requirements: campaign.requirements,
            deadline: campaign.deadline,
            maxParticipants: campaign.maxParticipants,
          }}
          onSuccess={() => { setEditMode(false); load(); }}
        />
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.push("/admin/campaigns")}
        className="mb-4 text-sm text-muted hover:text-foreground"
      >
        &larr; 캠페인 목록으로
      </button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{campaign.brandName}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">{campaign.title}</h1>
            {campaign.hidden && (
              <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs text-zinc-700">
                숨김 (사용자 미노출)
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setEditMode(true)}
            className="rounded border border-line-strong px-3 py-1.5 text-sm text-content-soft hover:bg-surface-muted"
          >
            수정
          </button>
          <button
            onClick={handleToggleVisibility}
            className="rounded border border-line-strong px-3 py-1.5 text-sm text-content-soft hover:bg-surface-muted"
          >
            {campaign.hidden ? "다시 노출" : "숨김 처리"}
          </button>
          <button
            onClick={handleDelete}
            className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
          >
            삭제
          </button>
        </div>
      </div>

      {/* 요약 */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded border border-line p-4">
          <p className="text-sm text-muted">보상</p>
          <p className="mt-1 text-xl font-bold text-foreground">
            ₩{campaign.rewardAmount.toLocaleString("ko-KR")}
          </p>
        </div>
        <div className="rounded border border-line p-4">
          <p className="text-sm text-muted">지원자</p>
          <p className="mt-1 text-xl font-bold text-foreground">
            {campaign.applications.length} / {campaign.maxParticipants}
          </p>
        </div>
        <div className="rounded border border-line p-4">
          <p className="text-sm text-muted">마감일</p>
          <p className="mt-1 text-xl font-bold text-foreground">
            {campaign.deadline
              ? new Date(campaign.deadline).toLocaleDateString("ko-KR")
              : "-"}
          </p>
        </div>
        <div className="rounded border border-line p-4">
          <p className="text-sm text-muted">상태</p>
          <p className="mt-1 text-xl font-bold text-foreground">
            {CAMPAIGN_STATUS_LABEL[campaign.status]}
          </p>
        </div>
      </div>

      {/* 예치금 */}
      <div className="mb-6 rounded border border-line p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-content-soft">예치금</p>
          <span
            className={`rounded px-2 py-0.5 text-xs ${ESCROW_CLASS[campaign.escrowStatus]}`}
          >
            {ESCROW_LABEL[campaign.escrowStatus]}
          </span>
        </div>
        {campaign.fundedAt && (
          <p className="mb-2 text-xs text-muted">
            완료 시각: {new Date(campaign.fundedAt).toLocaleString("ko-KR")}
          </p>
        )}
        {FORCE_COMPLETE_STATES.includes(campaign.escrowStatus) ? (
          <div>
            <button
              onClick={handleForceCompleteEscrow}
              className="rounded bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700"
            >
              예치금 입금완료 처리
            </button>
            <p className="mt-2 text-xs text-muted">
              관리자가 임의로 예치금 완료 처리합니다. 캠페인이 DRAFT 상태라면 모집중으로 전환되어
              크리에이터에게 노출됩니다.
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted">
            이미 예치금이 완료되었거나 정산/환불된 캠페인입니다.
          </p>
        )}
      </div>

      {/* 상태 변경 */}
      <div className="mb-6 rounded border border-line p-4">
        <p className="mb-2 text-sm font-medium text-content-soft">상태 변경</p>
        <div className="flex flex-wrap gap-2">
          {(["OPEN", "CLOSED"] as CampaignStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => handleStatus(s)}
              disabled={campaign.status === s}
              className="rounded border border-line-strong px-3 py-1.5 text-sm text-content-soft hover:bg-surface-muted disabled:cursor-not-allowed disabled:bg-surface-chip disabled:text-faint"
            >
              {CAMPAIGN_STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {/* 설명 */}
      <div className="mb-6 rounded border border-line p-6">
        <h2 className="mb-3 text-lg font-semibold text-foreground">설명</h2>
        <p className="whitespace-pre-wrap text-sm text-content-soft">{campaign.description}</p>
        {campaign.requirements && (
          <>
            <h3 className="mt-5 mb-2 text-sm font-semibold text-foreground">요구사항</h3>
            <p className="whitespace-pre-wrap text-sm text-content-soft">{campaign.requirements}</p>
          </>
        )}
        {campaign.thumbnailUrl && (
          <div className="mt-5">
            <p className="mb-2 text-xs text-muted">썸네일</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={campaign.thumbnailUrl}
              alt="썸네일"
              className="max-h-60 rounded border border-line"
            />
          </div>
        )}
      </div>

      {/* 지원자 */}
      <div className="rounded border border-line p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          지원자 ({campaign.applications.length})
        </h2>
        {campaign.applications.length === 0 ? (
          <p className="text-sm text-muted">아직 지원자가 없습니다.</p>
        ) : (
          <div className="space-y-4">
            {campaign.applications.map((app) => (
              <div key={app.id} className="rounded border border-line p-4">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/members/${app.creator.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {app.creator.name}
                      </Link>
                      <ApplicationStatusBadge status={app.status} />
                    </div>
                    <p className="text-xs text-muted">{app.creator.email}</p>
                  </div>
                  <p className="text-xs text-muted">
                    지원일: {new Date(app.appliedAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>

                {app.creator.creatorProfile && (
                  <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                    {app.creator.creatorProfile.gender && (
                      <span>성별: {app.creator.creatorProfile.gender}</span>
                    )}
                    {app.creator.creatorProfile.age && (
                      <span>나이: {app.creator.creatorProfile.age}</span>
                    )}
                    {app.creator.creatorProfile.editingTool && (
                      <span>편집툴: {app.creator.creatorProfile.editingTool}</span>
                    )}
                    <span>
                      얼굴 공개: {app.creator.creatorProfile.faceExposure ? "예" : "아니요"}
                    </span>
                    {app.creator.creatorProfile.instagramId && (
                      <span>IG: @{app.creator.creatorProfile.instagramId}</span>
                    )}
                  </div>
                )}

                {app.message && (
                  <div className="mb-3 rounded bg-surface-muted p-3 text-sm text-content-soft">
                    &ldquo;{app.message}&rdquo;
                  </div>
                )}

                {!app.videoFileKey && app.submissionUrl && (
                  <div className="mb-3 text-sm">
                    <span className="text-muted">제출 URL (레거시): </span>
                    {isSafeExternalLink(app.submissionUrl) ? (
                      <a
                        href={app.submissionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {app.submissionUrl}
                      </a>
                    ) : (
                      <span className="text-red-600">유효하지 않은 링크</span>
                    )}
                  </div>
                )}
                {app.status === "CHANGES_REQUESTED" && app.reviewComment && (
                  <div className="mb-3 rounded bg-orange-50 p-2 text-xs text-orange-800">
                    <span className="font-semibold">수정 요청 사유:</span> {app.reviewComment}
                  </div>
                )}
                {app.submissions && app.submissions.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-2 text-xs font-semibold text-muted">
                      제출 이력
                      {(app.resubmissionCount ?? 0) > 0 && ` (재제출 ${app.resubmissionCount}회)`}
                    </p>
                    <SubmissionTimeline submissions={app.submissions} />
                  </div>
                )}

                {app.rewardPaidAmount !== null && (
                  <p className="mb-3 text-sm text-content-soft">
                    정산액: ₩{app.rewardPaidAmount.toLocaleString("ko-KR")}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {app.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleApplicationAction(app.id, "APPROVED", app.creator.name)}
                        className="rounded bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => handleApplicationAction(app.id, "REJECTED", app.creator.name)}
                        className="rounded border border-red-300 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                      >
                        거절
                      </button>
                    </>
                  )}
                  {app.status === "SUBMITTED" && (
                    <>
                      <button
                        onClick={() => handleApplicationAction(app.id, "SETTLED", app.creator.name)}
                        className="rounded bg-purple-600 px-3 py-1.5 text-xs text-white hover:bg-purple-700"
                      >
                        승인·정산
                      </button>
                      <button
                        onClick={() => handleApplicationAction(app.id, "CHANGES_REQUESTED", app.creator.name)}
                        className="rounded border border-amber-300 px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50"
                      >
                        수정 요청
                      </button>
                      <button
                        onClick={() => handleApplicationAction(app.id, "REJECTED", app.creator.name)}
                        className="rounded border border-red-300 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                      >
                        거절
                      </button>
                    </>
                  )}
                  {app.status === "CHANGES_REQUESTED" && (
                    <span className="rounded bg-orange-100 px-3 py-1.5 text-xs text-orange-700">
                      재제출 대기 중
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
