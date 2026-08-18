"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import SubmissionTimeline, { type SubmissionHistoryItem } from "@/components/submission/SubmissionTimeline";
import ReviewForm from "@/components/review/ReviewForm";
import BackButton from "@/components/ui/BackButton";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import { useLang } from "@/lib/i18n";
import {
  MetricStrip,
  ResponsiveSheet,
  StatePanel,
  StateSkeleton,
  WorkspacePage,
  WorkspaceScrollArea,
  WorkspaceStage,
} from "@/components/workspace/WorkspacePrimitives";
import viewStyles from "@/components/workspace/WorkspaceViews.module.css";

type CampaignStatus = "DRAFT" | "OPEN" | "CLOSED";
type EscrowStatus = "NONE" | "PENDING_DEPOSIT" | "DEPOSIT_CONFIRMING" | "FUNDED" | "PARTIALLY_RELEASED" | "REFUNDED";
type AppStatus = "PENDING" | "WITHDRAWN" | "APPROVED" | "REJECTED" | "SUBMITTED" | "CHANGES_REQUESTED" | "SETTLED";
type Tone = "primary" | "success" | "warning" | "error" | "info" | "neutral";

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
  escrowTransactions: Array<{ id: number; type: "DEPOSIT" | "RELEASE" | "REFUND"; amount: number; memo: string | null; createdAt: string }>;
}

const ESCROW_LABEL: Record<EscrowStatus, { ko: string; en: string }> = {
  NONE: { ko: "-", en: "-" }, PENDING_DEPOSIT: { ko: "결제 미활성", en: "Payment unavailable" }, DEPOSIT_CONFIRMING: { ko: "기존 입금 확인 상태", en: "Legacy deposit review" }, FUNDED: { ko: "기존 예치 완료 상태", en: "Legacy funded status" }, PARTIALLY_RELEASED: { ko: "기존 지급 진행 상태", en: "Legacy payout status" }, REFUNDED: { ko: "기존 환불 상태", en: "Legacy refund status" },
};
const ESCROW_TONE: Record<EscrowStatus, Tone> = { NONE: "neutral", PENDING_DEPOSIT: "warning", DEPOSIT_CONFIRMING: "warning", FUNDED: "success", PARTIALLY_RELEASED: "primary", REFUNDED: "error" };
const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, { ko: string; en: string }> = { DRAFT: { ko: "작성 중", en: "Draft" }, OPEN: { ko: "모집 중", en: "Recruiting" }, CLOSED: { ko: "종료", en: "Closed" } };
const APP_LABEL: Record<AppStatus, { ko: string; en: string }> = { PENDING: { ko: "지원 접수", en: "Application received" }, WITHDRAWN: { ko: "지원자 철회", en: "Creator withdrawn" }, APPROVED: { ko: "선정 / 제작 대기", en: "Selected / awaiting content" }, REJECTED: { ko: "탈락", en: "Rejected" }, SUBMITTED: { ko: "제출 완료", en: "Submitted" }, CHANGES_REQUESTED: { ko: "수정 요청 중", en: "Changes requested" }, SETTLED: { ko: "정산 완료", en: "Settled" } };
const APP_TONE: Record<AppStatus, Tone> = { PENDING: "warning", WITHDRAWN: "neutral", APPROVED: "success", REJECTED: "error", SUBMITTED: "info", CHANGES_REQUESTED: "warning", SETTLED: "primary" };

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
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [changesModal, setChangesModal] = useState<{ appId: number } | null>(null);
  const [changesComment, setChangesComment] = useState("");
  const [reviewModal, setReviewModal] = useState<{ appId: number; creatorName: string } | null>(null);

  const load = () => {
    setLoading(true);
    api.get<Detail>(`/company/campaigns/${id}`).then((response) => setData(response.data)).catch(() => setError(t("캠페인 정보를 불러오지 못했습니다", "Failed to load campaign details"))).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!id) return;
    let active = true;
    const controller = new AbortController();
    api.get<Detail>(`/company/campaigns/${id}`, { signal: controller.signal }).then((response) => { if (active) setData(response.data); }).catch(() => { if (active) setError(t("캠페인 정보를 불러오지 못했습니다", "Failed to load campaign details")); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [id, t]);

  const callAction = async (fn: () => Promise<{ message: string }>) => {
    setActing(true); setMessage(""); setError("");
    try { const result = await fn(); setMessage(result.message); load(); }
    catch (caught: unknown) { const response = typeof caught === "object" && caught !== null && "response" in caught ? (caught as { response?: { data?: { message?: string } } }).response : undefined; setError(response?.data?.message ?? t("요청에 실패했습니다", "Request failed")); }
    finally { setActing(false); }
  };

  const cancelCampaign = () => {
    if (!data || !confirm(t("캠페인을 취소하시겠어요? 결제·정산 관련 후속 처리는 운영 계약과 관리자 확인에 따라 별도로 안내됩니다.", "Cancel this campaign? Payment or settlement follow-up is handled separately under your agreement and administrator review."))) return;
    void callAction(async () => (await api.post<{ message: string }>(`/company/campaigns/${data.id}/cancel`)).data);
  };
  const deleteCampaign = () => {
    if (!data || !confirm(t("캠페인을 삭제하시겠어요? 이 작업은 되돌릴 수 없습니다.", "Delete this campaign? This action cannot be undone."))) return;
    setActing(true); setMessage(""); setError("");
    api.delete(`/company/campaigns/${data.id}`).then(() => router.push("/company/campaigns")).catch((caught: unknown) => { const response = typeof caught === "object" && caught !== null && "response" in caught ? (caught as { response?: { data?: { message?: string } } }).response : undefined; setError(response?.data?.message ?? t("삭제에 실패했습니다", "Failed to delete")); }).finally(() => setActing(false));
  };
  const reviewApplication = async (appId: number, action: "APPROVE" | "REJECT" | "REQUEST_CHANGES" | "REJECT_VIDEO", opts?: { rewardPaidAmount?: number; reviewComment?: string }) => {
    setRowActingId(appId); setMessage(""); setError("");
    try { const response = await api.patch<{ message: string }>(`/company/applications/${appId}`, { action, ...opts }); setMessage(response.data.message); load(); }
    catch (caught: unknown) { const response = typeof caught === "object" && caught !== null && "response" in caught ? (caught as { response?: { data?: { message?: string } } }).response : undefined; setError(response?.data?.message ?? t("요청에 실패했습니다", "Request failed")); }
    finally { setRowActingId(null); }
  };

  if (loading) return <WorkspacePage flow={false}><StateSkeleton label={t("캠페인 상세 불러오는 중", "Loading campaign details")} /></WorkspacePage>;
  if (!data) return <WorkspacePage flow={false}><StatePanel tone="error" title={error || t("캠페인 정보를 찾을 수 없습니다.", "Campaign not found.")} description={t("목록으로 돌아가 캠페인 상태를 확인해주세요.", "Return to the list and review the campaign status.")} /></WorkspacePage>;

  const canEdit = data.escrowStatus !== "DEPOSIT_CONFIRMING" && data.escrowStatus !== "REFUNDED" && data.status !== "CLOSED";
  const canDelete = data.escrowStatus === "PENDING_DEPOSIT" && data.applicationCount === 0;
  const canCancel = data.status !== "CLOSED" && data.escrowStatus !== "REFUNDED" && data.applicationCount === 0 && (data.escrowStatus === "FUNDED" || data.escrowStatus === "PENDING_DEPOSIT");
  const selectedApplication = data.applications.find((application) => application.id === selectedAppId) ?? null;

  const paymentNotice = data.escrowStatus === "PENDING_DEPOSIT" ? (
    <div className={viewStyles.truthNotice}><strong>{t("현재 관리 베타에서는 결제·정산 기능이 비활성화되어 있습니다.", "Payment and settlement are currently disabled in the managed beta.")}</strong><p>{t("화면에 표시된 예산을 어떤 계좌로도 송금하지 마세요.", "Do not transfer the displayed budget to any bank account.")}</p><p>{t("운영 계약이 체결되고 PG 결제가 활성화된 뒤, 검증된 결제 절차를 별도로 안내합니다.", "A verified payment process will be provided after an operating agreement and PG activation.")}</p></div>
  ) : data.escrowStatus === "DEPOSIT_CONFIRMING" ? (
    <div className={viewStyles.truthNotice}>{t("기존 운영 기록상 입금 확인 단계입니다. 현재 셀프서비스 결제·정산은 비활성화되어 있으며, 이 상태만으로 실제 송금이나 확인 완료를 보장하지 않습니다. 후속 처리는 운영 계약과 관리자 기록을 기준으로 확인해주세요.", "This is a deposit-review state from legacy operations. It does not confirm a transfer or completed review.")}</div>
  ) : data.escrowStatus === "FUNDED" ? (
    <div className={viewStyles.truthNotice}>{t("기존 운영 기록상 예치 완료 상태입니다. 이 표시는 결제·정산 보증이나 현재 PG 처리 완료를 의미하지 않습니다. 실제 운영 조건은 계약과 관리자 기록을 확인해주세요.", "This is a funded state from legacy operations. It is not a payment or settlement guarantee or proof of current PG completion.")}</div>
  ) : data.escrowStatus === "REFUNDED" ? <div className={viewStyles.truthNotice}>{t("기존 운영 기록상 환불 상태입니다. 실제 처리 내역은 운영 계약과 관리자 기록을 확인해주세요.", "This is a legacy refund state. Check the agreement and administrator records.")}</div> : null;

  const header = (
    <div className={viewStyles.detailHeader}>
      <BackButton href="/company/campaigns" labelKo="캠페인 목록으로" labelEn="Back to campaigns" className="!mb-0" />
      <div className={viewStyles.detailTitleRow}><div><p>{data.brandName}</p><h1>{data.title}</h1></div><div className="flex flex-wrap items-center gap-2"><Badge tone={ESCROW_TONE[data.escrowStatus]}>{t(ESCROW_LABEL[data.escrowStatus].ko, ESCROW_LABEL[data.escrowStatus].en)}</Badge><Badge tone="neutral">{t(CAMPAIGN_STATUS_LABEL[data.status].ko, CAMPAIGN_STATUS_LABEL[data.status].en)}</Badge>{canEdit && <Link href={`/company/campaigns/${data.id}/edit`} className="inline-flex h-11 items-center rounded-full border border-primary px-4 text-xs font-bold text-primary">{t("수정", "Edit")}</Link>}{canCancel && <Button variant="secondary" size="sm" onClick={cancelCampaign} disabled={acting}>{t("취소", "Cancel")}</Button>}{canDelete && <Button variant="ghost" size="sm" onClick={deleteCampaign} disabled={acting}>{t("삭제", "Delete")}</Button>}</div></div>
      <MetricStrip label={t("캠페인 핵심 정보", "Campaign key information")} items={[{ label: t("1인당 보상", "Reward"), value: t(`${data.rewardAmount.toLocaleString()}원`, `₩${data.rewardAmount.toLocaleString()}`), tone: "accent" }, { label: t("모집 인원", "Creators"), value: t(`${data.maxParticipants}명`, `${data.maxParticipants}`) }, { label: t("총 예산", "Budget"), value: t(`${data.totalBudget.toLocaleString()}원`, `₩${data.totalBudget.toLocaleString()}`) }, { label: t("지원자", "Applicants"), value: data.applicationCount.toLocaleString() }]} />
      {(message || error) && <div role={error ? "alert" : "status"} className={`rounded-lg px-3 py-2 text-xs font-bold ${error ? "bg-error/5 text-error" : "bg-success/5 text-success"}`}>{error || message}</div>}
    </div>
  );

  return (
    <WorkspacePage size="wide" flow={false}>
      <WorkspaceStage className={viewStyles.pageStage} header={header}>
        <div className={viewStyles.masterDetail}>
          <section className={viewStyles.masterPanel}>
            <header><h2>{t("캠페인 정보", "Campaign information")}</h2><Link href={`/company/campaigns/${data.id}/performance`}>{t("성과 리포트", "Performance")}</Link></header>
            <WorkspaceScrollArea label={t("캠페인 정보", "Campaign information")}><div className={viewStyles.briefStack}>{data.thumbnailUrl && <div className={viewStyles.detailMedia}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.thumbnailUrl} alt={data.title} />
            </div>}<section className={viewStyles.briefSection}><h3>{t("캠페인 설명", "Description")}</h3><p>{data.description}</p></section>{data.requirements && <section className={viewStyles.briefSection}><h3>{t("제출 요구사항", "Requirements")}</h3><p>{data.requirements}</p></section>}{paymentNotice}{data.escrowTransactions.length > 0 && <section className={viewStyles.briefSection}><h3>{t("결제·정산 관리 이력", "Payment admin history")}</h3><div className={viewStyles.historyRows}>{data.escrowTransactions.map((transaction) => <div key={transaction.id}><span>{transaction.type} · {new Date(transaction.createdAt).toLocaleDateString("ko-KR")}</span><strong>{transaction.amount.toLocaleString()}{t("원", " KRW")}</strong></div>)}</div></section>}</div></WorkspaceScrollArea>
          </section>

          <section className={viewStyles.masterPanel}>
            <header><h2>{t("지원자 큐", "Applicant queue")}</h2><span>{t(`${data.applicationCount}명`, `${data.applicationCount} applicants`)}</span></header>
            {data.applications.length === 0 ? <StatePanel title={t("아직 지원자가 없습니다.", "No applicants yet.")} description={t("지원이 접수되면 이 큐에서 검토할 수 있습니다.", "New applications will appear in this review queue.")} /> : <WorkspaceScrollArea label={t("지원자 목록", "Applicant list")}><div className={viewStyles.applicantList}>{data.applications.map((application) => <button type="button" key={application.id} className={viewStyles.applicantRow} onClick={() => setSelectedAppId(application.id)}><span><strong>{application.creator.name}</strong><small>{new Date(application.appliedAt).toLocaleDateString("ko-KR")}{application.message ? ` · ${t("메시지 있음", "Message included")}` : ""}</small></span><Badge tone={APP_TONE[application.status]}>{t(APP_LABEL[application.status].ko, APP_LABEL[application.status].en)}</Badge><ChevronRight aria-hidden="true" /></button>)}</div></WorkspaceScrollArea>}
          </section>
        </div>
      </WorkspaceStage>

      <ResponsiveSheet open={Boolean(selectedApplication)} onClose={() => setSelectedAppId(null)} title={selectedApplication?.creator.name ?? ""} description={selectedApplication ? t(APP_LABEL[selectedApplication.status].ko, APP_LABEL[selectedApplication.status].en) : undefined} label={t("지원자 상세 닫기", "Close applicant details")} size="standard">
        {selectedApplication && <div className={viewStyles.sheetDetailStack}>
          <section className={viewStyles.sheetDetailSection}><h3>{t("지원 메시지", "Application message")}</h3><p>{selectedApplication.message || t("작성된 메시지가 없습니다.", "No application message was provided.")}</p></section>
          {(selectedApplication.videoUrl || (selectedApplication.submissionUrl && isSafeExternalLink(selectedApplication.submissionUrl))) && <section className={viewStyles.sheetDetailSection}><h3>{t("제출 콘텐츠", "Submitted content")}</h3><a href={selectedApplication.videoUrl || selectedApplication.submissionUrl || "#"} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center text-sm font-bold text-primary underline underline-offset-4">{selectedApplication.videoUrl ? t("제출 영상 검토", "Review submitted video") : t("외부 링크 보기 (레거시)", "View external link (legacy)")}</a></section>}
          {selectedApplication.reviewComment && <section className={viewStyles.sheetDetailSection}><h3>{t("최근 수정 요청", "Latest change request")}</h3><p>{selectedApplication.reviewComment}</p></section>}
          {selectedApplication.rewardPaidAmount != null && <section className={viewStyles.sheetDetailSection}><h3>{t("지급 기록", "Payment record")}</h3><p>{selectedApplication.rewardPaidAmount.toLocaleString()}{t("원", " KRW")}</p></section>}
          {selectedApplication.submissions.length > 0 && <section className={viewStyles.sheetDetailSection}><h3>{t("제출 이력", "Submission history")}{(selectedApplication.resubmissionCount ?? 0) > 0 && t(` · 재제출 ${selectedApplication.resubmissionCount}회`, ` · ${selectedApplication.resubmissionCount} resubmission(s)`)}</h3><SubmissionTimeline submissions={selectedApplication.submissions} /></section>}
          <section className={viewStyles.reviewActions}>
            {selectedApplication.status === "PENDING" && <><Button disabled={rowActingId === selectedApplication.id} onClick={() => void reviewApplication(selectedApplication.id, "APPROVE")}>{t("선정", "Select")}</Button><Button variant="secondary" disabled={rowActingId === selectedApplication.id} onClick={() => void reviewApplication(selectedApplication.id, "REJECT")}>{t("탈락", "Reject")}</Button></>}
            {selectedApplication.status === "SUBMITTED" && <><Button variant="secondary" onClick={() => { setSelectedAppId(null); setChangesModal({ appId: selectedApplication.id }); setChangesComment(""); }}>{t("수정 요청", "Request changes")}</Button><Button variant="ghost" disabled={rowActingId === selectedApplication.id} onClick={() => { if (confirm(t("이 영상을 최종 거절하시겠어요?", "Permanently reject this video?"))) void reviewApplication(selectedApplication.id, "REJECT_VIDEO"); }}>{t("거절", "Reject")}</Button><p className="basis-full text-xs leading-relaxed text-warning">{t("승인·정산은 상용 PG 활성화 후 제공됩니다. 영상을 검토하고 수정 요청 또는 거절을 기록하세요.", "Approval and settlement become available after commercial PG activation. Review the video and record a change request or rejection.")}</p></>}
            {selectedApplication.status === "CHANGES_REQUESTED" && <Badge tone="warning">{t("크리에이터 재제출 대기 중", "Awaiting creator resubmission")}</Badge>}
            {selectedApplication.status === "SETTLED" && <Button variant="secondary" onClick={() => { setSelectedAppId(null); setReviewModal({ appId: selectedApplication.id, creatorName: selectedApplication.creator.name }); }}>{t("리뷰 작성", "Write review")}</Button>}
          </section>
        </div>}
      </ResponsiveSheet>

      <ResponsiveSheet open={Boolean(reviewModal)} onClose={() => setReviewModal(null)} title={t("크리에이터 리뷰 작성", "Write a creator review")} description={reviewModal?.creatorName} label={t("리뷰 닫기", "Close review")} size="compact">{reviewModal && <ReviewForm applicationId={reviewModal.appId} onSubmitted={() => { setReviewModal(null); load(); }} onCancel={() => setReviewModal(null)} />}</ResponsiveSheet>
      <ResponsiveSheet open={Boolean(changesModal)} onClose={() => setChangesModal(null)} title={t("수정 요청 사유", "Reason for changes")} description={t("무엇을 어떻게 수정해야 하는지 구체적으로 작성해주세요.", "Describe specifically what to change and how.")} label={t("수정 요청 닫기", "Close change request")} size="compact">
        <div className="grid gap-4"><Textarea value={changesComment} onChange={(event) => setChangesComment(event.target.value)} rows={5} placeholder={t("예: 로고 노출 시간을 중반부 이후에도 3초 이상 유지해주세요.", "e.g. Keep the logo visible for at least 3 seconds past the midpoint.")} /><div className={viewStyles.formSheetActions}><Button variant="secondary" onClick={() => setChangesModal(null)}>{t("취소", "Cancel")}</Button><Button onClick={async () => { if (!changesModal || !changesComment.trim()) return; await reviewApplication(changesModal.appId, "REQUEST_CHANGES", { reviewComment: changesComment.trim() }); setChangesModal(null); }} disabled={!changesComment.trim() || rowActingId === changesModal?.appId}>{t("수정 요청 보내기", "Send change request")}</Button></div></div>
      </ResponsiveSheet>
    </WorkspacePage>
  );
}

function isSafeExternalLink(raw: string): boolean {
  try { const url = new URL(raw); return url.protocol === "http:" || url.protocol === "https:"; }
  catch { return false; }
}
