"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import ImageUploader from "@/components/ui/ImageUploader";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { useLang } from "@/lib/i18n";
import PageHeader from "@/components/workspace/PageHeader";
import {
  FieldStack,
  FormContextRail,
  FormLayout,
  FormStack,
  SectionProgress,
  StatePanel,
  StateSkeleton,
  SummaryRow,
  SummaryRows,
  WorkspacePage,
  WorkspacePanel,
  WorkspaceScrollArea,
  WorkspaceStage,
} from "@/components/workspace/WorkspacePrimitives";
import viewStyles from "@/components/workspace/WorkspaceViews.module.css";
import { canEditBudget, canEditCampaignFields, CampaignStatus, EscrowStatus } from "@/lib/campaignPolicy";

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
  applicationCount: number;
}

const STEPS = ["edit-basics", "edit-content", "edit-recruiting"] as const;

export default function EditCampaignPage() {
  const params = useParams<{ id: string }>();
  const { t } = useLang();
  const id = params?.id;
  const router = useRouter();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<(typeof STEPS)[number]>("edit-basics");
  const [title, setTitle] = useState("");
  const [brandName, setBrandName] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [deadline, setDeadline] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [thumbnailIntent, setThumbnailIntent] = useState<{ changed: false } | { changed: true; fileKey: string | null }>({ changed: false });

  useEffect(() => {
    if (!id) return;
    api.get<Detail>(`/company/campaigns/${id}`)
      .then((response) => {
        const data = response.data;
        setDetail(data);
        setTitle(data.title);
        setBrandName(data.brandName);
        setDescription(data.description);
        setRequirements(data.requirements ?? "");
        setRewardAmount(String(data.rewardAmount));
        setMaxParticipants(String(data.maxParticipants));
        setDeadline(data.deadline ? data.deadline.slice(0, 16) : "");
        setPreviewUrl(data.thumbnailUrl ?? null);
      })
      .catch(() => setError(t("캠페인을 불러오지 못했습니다", "Failed to load campaign")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const budgetEditable = useMemo(() => detail ? canEditBudget("COMPANY", detail.escrowStatus) : false, [detail]);
  const readOnly = useMemo(() => detail ? !canEditCampaignFields("COMPANY", detail.escrowStatus, detail.status) : true, [detail]);
  const totalBudget = Math.max(0, Number(rewardAmount) || 0) * Math.max(0, Number(maxParticipants) || 0);
  const stepIndex = STEPS.indexOf(step);

  const focusFirst = (fieldId: string) => window.requestAnimationFrame(() => document.getElementById(fieldId)?.focus());
  const setValidationError = (nextStep: (typeof STEPS)[number], fieldId: string, message: string) => {
    setStep(nextStep);
    setError(message);
    focusFirst(fieldId);
    return false;
  };
  const validateAll = () => {
    if (!title.trim()) return setValidationError("edit-basics", "title", t("캠페인 제목을 입력해주세요.", "Enter a campaign title."));
    if (!brandName.trim()) return setValidationError("edit-basics", "brandName", t("브랜드명을 입력해주세요.", "Enter the brand name."));
    if (!description.trim()) return setValidationError("edit-content", "description", t("캠페인 설명을 입력해주세요.", "Enter the campaign description."));
    if (budgetEditable && (Number(rewardAmount) < 0 || !Number.isInteger(Number(maxParticipants)) || Number(maxParticipants) < 1)) return setValidationError("edit-recruiting", "rewardAmount", t("보상과 모집 인원을 확인해주세요.", "Check reward and recruiting count."));
    return true;
  };
  const goToStep = (next: string) => {
    const nextIndex = STEPS.indexOf(next as (typeof STEPS)[number]);
    if (nextIndex < 0) return;
    const form = document.getElementById("edit-campaign-form") as HTMLFormElement | null;
    if (nextIndex > stepIndex && form && !form.reportValidity()) return;
    setError("");
    setStep(STEPS[nextIndex]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!detail || !validateAll()) return;
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, unknown> = { title, brandName, description, requirements: requirements.trim() || null, deadline: deadline || null };
      if (thumbnailIntent.changed) payload.thumbnailFileKey = thumbnailIntent.fileKey ?? "";
      if (budgetEditable) { payload.rewardAmount = Number(rewardAmount); payload.maxParticipants = Number(maxParticipants); }
      await api.patch(`/company/campaigns/${detail.id}`, payload);
      router.push(`/company/campaigns/${detail.id}`);
    } catch (caught: unknown) {
      const response = typeof caught === "object" && caught !== null && "response" in caught ? (caught as { response?: { data?: { message?: string } } }).response : undefined;
      const message = response?.data?.message ?? t("수정에 실패했습니다", "Failed to save changes");
      const lower = message.toLowerCase();
      if (lower.includes("reward") || lower.includes("participant") || lower.includes("보상") || lower.includes("모집")) setValidationError("edit-recruiting", "rewardAmount", message);
      else if (lower.includes("description") || lower.includes("requirement") || lower.includes("설명") || lower.includes("요구")) setValidationError("edit-content", "description", message);
      else setValidationError("edit-basics", "title", message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <WorkspacePage size="compact" flow={false}><StateSkeleton label={t("브리프 불러오는 중", "Loading brief")} /></WorkspacePage>;
  if (!detail) return <WorkspacePage size="compact" flow={false}><StatePanel tone="error" title={error || t("브리프를 찾을 수 없습니다.", "Brief not found.")} description={t("목록으로 돌아가 캠페인 상태를 확인해주세요.", "Return to the list and review the campaign status.")} /></WorkspacePage>;

  const header = (
    <div className={viewStyles.headerStack}>
      <BackButton href={`/company/campaigns/${detail.id}`} labelKo="캠페인 상세로" labelEn="Back to campaign" className="!mb-0" />
      <PageHeader display="EDIT BRIEF" subtitle={readOnly ? t("현재 상태에서는 브리프 수정이 제한됩니다.", "Editing is restricted in the current status.") : t("수정할 영역만 단계별로 확인하고 저장하세요.", "Review only the section you need, then save.")} />
      <SectionProgress label={t("브리프 수정 단계", "Brief editing steps")} activeId={step} onChange={goToStep} items={[{ id: "edit-basics", label: t("기본", "Basics") }, { id: "edit-content", label: t("콘텐츠", "Content") }, { id: "edit-recruiting", label: t("모집 조건", "Recruiting") }]} />
    </div>
  );

  return (
    <WorkspacePage size="form" flow={false}>
      <WorkspaceStage className={viewStyles.pageStage} header={header} footer={<div className={viewStyles.formActions}><Button type="button" variant="secondary" disabled={stepIndex === 0 || saving} onClick={() => goToStep(STEPS[Math.max(0, stepIndex - 1)])}>{t("이전", "Previous")}</Button><span className="text-xs font-bold text-muted tabular-nums">{stepIndex + 1} / {STEPS.length}</span>{stepIndex < STEPS.length - 1 ? <Button type="button" onClick={() => goToStep(STEPS[stepIndex + 1])}>{t("다음", "Next")}</Button> : <Button type="submit" form="edit-campaign-form" loading={saving} disabled={readOnly}>{t("변경 저장", "Save changes")}</Button>}</div>}>
        <FormLayout>
          <WorkspaceScrollArea label={t("현재 브리프 수정 단계", "Current brief editing step")}>
            <form id="edit-campaign-form" onSubmit={handleSubmit}>
              <FormStack>
                {error && <div role="alert" className="rounded-[10px] border border-error/25 bg-error/5 px-4 py-3 text-sm font-medium text-error">{error}</div>}
                {step === "edit-basics" && <WorkspacePanel number="01" title={t("기본 정보", "Basic information")} description={t("캠페인 제목, 브랜드명과 대표 이미지를 관리합니다.", "Manage the title, brand, and campaign image.")}><FieldStack><div className={viewStyles.fieldPair}><div><label htmlFor="title" className="mb-1.5 block text-sm font-semibold text-content-soft">{t("캠페인 제목", "Campaign title")}</label><Input id="title" required disabled={readOnly} value={title} onChange={(event) => setTitle(event.target.value)} /></div><div><label htmlFor="brandName" className="mb-1.5 block text-sm font-semibold text-content-soft">{t("브랜드명", "Brand name")}</label><Input id="brandName" required disabled={readOnly} value={brandName} onChange={(event) => setBrandName(event.target.value)} /></div></div><div><label className="mb-1.5 block text-sm font-semibold text-content-soft">{t("썸네일", "Thumbnail")}</label><ImageUploader aspect={16 / 9} previewUrl={previewUrl} disabled={readOnly} onChange={(fileKey) => { setThumbnailIntent({ changed: true, fileKey }); setPreviewUrl(null); }} /></div></FieldStack></WorkspacePanel>}
                {step === "edit-content" && <WorkspacePanel number="02" title={t("콘텐츠", "Content")} description={t("크리에이터가 실행할 브리프와 제출 요구사항을 정리합니다.", "Define the brief and submission requirements.")}><FieldStack><div><label htmlFor="description" className="mb-1.5 block text-sm font-semibold text-content-soft">{t("캠페인 설명", "Campaign description")}</label><Textarea id="description" rows={7} required disabled={readOnly} value={description} onChange={(event) => setDescription(event.target.value)} /></div><div><label htmlFor="requirements" className="mb-1.5 block text-sm font-semibold text-content-soft">{t("제출 요구사항", "Submission requirements")}</label><Textarea id="requirements" rows={5} disabled={readOnly} value={requirements} onChange={(event) => setRequirements(event.target.value)} /></div></FieldStack></WorkspacePanel>}
                {step === "edit-recruiting" && <WorkspacePanel number="03" title={t("모집 조건", "Recruiting conditions")} description={t("보상, 모집 인원과 마감일을 확인합니다.", "Review reward, recruiting count, and deadline.")}><FieldStack>{!budgetEditable && <p className="rounded-lg bg-warning/5 p-3 text-xs font-medium text-warning">{t("현재 결제 기록 상태에서는 보상과 모집 인원을 변경할 수 없습니다.", "Reward and recruiting count are locked by the current payment record.")}</p>}<div className={viewStyles.fieldPair}><div><label htmlFor="rewardAmount" className="mb-1.5 block text-sm font-semibold text-content-soft">{t("1인당 보상", "Reward per creator")}</label><Input id="rewardAmount" type="number" min={0} required disabled={readOnly || !budgetEditable} value={rewardAmount} onChange={(event) => setRewardAmount(event.target.value)} /></div><div><label htmlFor="maxParticipants" className="mb-1.5 block text-sm font-semibold text-content-soft">{t("모집 인원", "Recruiting count")}</label><Input id="maxParticipants" type="number" min={1} required disabled={readOnly || !budgetEditable} value={maxParticipants} onChange={(event) => setMaxParticipants(event.target.value)} /></div></div><div><label htmlFor="deadline" className="mb-1.5 block text-sm font-semibold text-content-soft">{t("모집 마감일", "Recruiting deadline")}</label><Input id="deadline" type="datetime-local" disabled={readOnly} value={deadline} onChange={(event) => setDeadline(event.target.value)} /></div></FieldStack></WorkspacePanel>}
              </FormStack>
            </form>
          </WorkspaceScrollArea>
          <FormContextRail>
            <WorkspacePanel title={t("변경 요약", "Change summary")} density="compact" tone="raised"><SummaryRows><SummaryRow label={t("상태", "Status")} value={detail.status} /><SummaryRow label={t("지원", "Applications")} value={t(`${detail.applicationCount}명`, `${detail.applicationCount}`)} /><SummaryRow label={t("모집 인원", "Creators")} value={t(`${Number(maxParticipants) || 0}명`, `${Number(maxParticipants) || 0}`)} /><SummaryRow label={t("예상 총 예산", "Estimated budget")} value={t(`${totalBudget.toLocaleString()}원`, `₩${totalBudget.toLocaleString()}`)} strong /></SummaryRows></WorkspacePanel>
            <WorkspacePanel title={t("수정 권한", "Editing policy")} density="compact" tone="dark"><p className="text-xs leading-relaxed text-zinc-300">{readOnly ? t("현재 상태에서는 모든 필드가 잠겨 있습니다.", "All fields are locked in the current status.") : budgetEditable ? t("브리프와 모집 조건을 수정할 수 있습니다.", "Brief and recruiting conditions can be edited.") : t("브리프는 수정할 수 있지만 보상·인원은 잠겨 있습니다.", "The brief is editable, but reward and slots are locked.")}</p></WorkspacePanel>
          </FormContextRail>
        </FormLayout>
      </WorkspaceStage>
    </WorkspacePage>
  );
}
