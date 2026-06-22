"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ImageUploader from "@/components/ui/ImageUploader";
import Input from "@/components/ui/Input";
import { useLang } from "@/lib/i18n";
import {
  canEditBudget,
  canEditCampaignFields,
  CampaignStatus,
  EscrowStatus,
} from "@/lib/campaignPolicy";

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

const TEXTAREA_CLASS =
  "block w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-foreground placeholder-faint transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-surface-muted disabled:text-muted";

export default function EditCampaignPage() {
  const params = useParams<{ id: string }>();
  const { t } = useLang();
  const id = params?.id;
  const router = useRouter();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [brandName, setBrandName] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [deadline, setDeadline] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [thumbnailIntent, setThumbnailIntent] = useState<
    { changed: false } | { changed: true; fileKey: string | null }
  >({ changed: false });

  useEffect(() => {
    if (!id) return;
    api
      .get<Detail>(`/company/campaigns/${id}`)
      .then((res) => {
        const d = res.data;
        setDetail(d);
        setTitle(d.title);
        setBrandName(d.brandName);
        setDescription(d.description);
        setRequirements(d.requirements ?? "");
        setRewardAmount(String(d.rewardAmount));
        setMaxParticipants(String(d.maxParticipants));
        setDeadline(d.deadline ? d.deadline.slice(0, 16) : "");
        setPreviewUrl(d.thumbnailUrl ?? null);
      })
      .catch(() => setError(t("캠페인을 불러오지 못했습니다", "Failed to load campaign")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 백엔드 CompanyService 가드와 일치시킨다.
  // - 보상/인원: PENDING_DEPOSIT 만 (이전엔 FUNDED+지원자0 도 허용했으나 백엔드와 어긋남)
  // - 그 외 필드: CLOSED 또는 REFUNDED 만 잠금. DEPOSIT_CONFIRMING/FUNDED 에서도 썸네일·제목 등은 변경 가능.
  const budgetEditable = useMemo(
    () => (detail ? canEditBudget("COMPANY", detail.escrowStatus) : false),
    [detail],
  );

  const readOnly = useMemo(() => {
    if (!detail) return true;
    return !canEditCampaignFields("COMPANY", detail.escrowStatus, detail.status);
  }, [detail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail) return;
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        title,
        brandName,
        description,
        requirements: requirements.trim() || null,
        deadline: deadline || null,
      };
      if (thumbnailIntent.changed) {
        payload.thumbnailFileKey = thumbnailIntent.fileKey ?? "";
      }
      if (budgetEditable) {
        payload.rewardAmount = Number(rewardAmount);
        payload.maxParticipants = Number(maxParticipants);
      }
      await api.patch(`/company/campaigns/${detail.id}`, payload);
      router.push(`/company/campaigns/${detail.id}`);
    } catch (err: unknown) {
      const response =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
          : undefined;
      setError(response?.data?.message ?? t("수정에 실패했습니다", "Failed to save changes"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted">{t("불러오는 중...", "Loading...")}</p>;
  if (!detail) return <p className="text-error">{error || t("데이터 없음", "No data")}</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <BackButton href="/company/campaigns" labelKo="캠페인 목록으로" labelEn="Back to campaigns" />
      <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        {t("캠페인 수정", "Edit campaign")}
      </h1>
      {readOnly && (
        <Card className="mt-5 border-warning/30 bg-warning/5 p-3 text-sm text-warning">
          {t("현재 상태에서는 수정이 제한됩니다.", "Editing is restricted in the current status.")}
        </Card>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="rounded-xl border border-error/30 bg-error/5 p-3 text-sm text-error">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-content-soft">
            {t("캠페인 제목", "Campaign title")}
          </label>
          <Input
            id="title"
            type="text"
            required
            disabled={readOnly}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="brandName" className="block text-sm font-medium text-content-soft">
            {t("브랜드명", "Brand name")}
          </label>
          <Input
            id="brandName"
            type="text"
            required
            disabled={readOnly}
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-content-soft">
            {t("캠페인 설명", "Campaign description")}
          </label>
          <textarea
            id="description"
            rows={5}
            required
            disabled={readOnly}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${TEXTAREA_CLASS} mt-1.5`}
          />
        </div>
        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-content-soft">
            {t("제출 요구사항", "Submission requirements")}{" "}
            <span className="text-faint">{t("(선택)", "(optional)")}</span>
          </label>
          <textarea
            id="requirements"
            rows={4}
            disabled={readOnly}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            className={`${TEXTAREA_CLASS} mt-1.5`}
          />
        </div>

        <section className="space-y-5 border-t border-line pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            {t("보상 · 모집", "Reward · recruiting")}
          </h2>
          {!budgetEditable && (
            <p className="text-xs text-warning">
              {t(
                "예치 완료 후에는 보상/모집 인원을 수정할 수 없습니다.",
                "Reward and recruiting count can't be changed after the deposit is funded.",
              )}
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="rewardAmount"
                className="block text-sm font-medium text-content-soft"
              >
                {t("1인당 보상 (원)", "Reward per person (KRW)")}
              </label>
              <Input
                id="rewardAmount"
                type="number"
                min={0}
                required
                disabled={readOnly || !budgetEditable}
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <label
                htmlFor="maxParticipants"
                className="block text-sm font-medium text-content-soft"
              >
                {t("모집 인원", "Recruiting count")}
              </label>
              <Input
                id="maxParticipants"
                type="number"
                min={1}
                required
                disabled={readOnly || !budgetEditable}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-content-soft">
              {t("모집 마감일", "Recruiting deadline")}{" "}
              <span className="text-faint">{t("(선택)", "(optional)")}</span>
            </label>
            <Input
              id="deadline"
              type="datetime-local"
              disabled={readOnly}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-content-soft">
              {t("썸네일", "Thumbnail")} <span className="text-faint">{t("(선택)", "(optional)")}</span>
            </label>
            <ImageUploader
              aspect={16 / 9}
              previewUrl={previewUrl}
              disabled={readOnly}
              onChange={(fileKey) => {
                setThumbnailIntent({ changed: true, fileKey });
                setPreviewUrl(null);
              }}
            />
          </div>
        </section>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saving || readOnly} className="flex-1">
            {saving ? t("저장 중...", "Saving...") : t("저장", "Save")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(`/company/campaigns/${detail.id}`)}
          >
            {t("취소", "Cancel")}
          </Button>
        </div>
      </form>
    </div>
  );
}
