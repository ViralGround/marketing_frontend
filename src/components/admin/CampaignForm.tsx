"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import AlertModal from "@/components/ui/AlertModal";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ImageUploader from "@/components/ui/ImageUploader";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { canEditBudget, EscrowStatus } from "@/lib/campaignPolicy";
import { useLang } from "@/lib/i18n";

interface CampaignFormInitial {
  id?: number;
  title?: string;
  description?: string;
  brandName?: string;
  brandIntroduction?: string | null;
  brandLogoUrl?: string | null;
  rewardAmount?: number;
  thumbnailUrl?: string | null;
  requirements?: string | null;
  deadline?: string | null;
  maxParticipants?: number;
}


export default function CampaignForm({
  mode,
  initial,
  escrowStatus,
  onSuccess,
}: {
  mode: "create" | "edit";
  initial?: CampaignFormInitial;
  escrowStatus?: EscrowStatus;
  onSuccess?: () => void;
}) {
  const { t } = useLang();
  // create 모드는 무조건 예산 입력 가능. edit 은 escrow 상태에 따라.
  const budgetEditable =
    mode === "create" || (escrowStatus ? canEditBudget("ADMIN", escrowStatus) : true);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [brandName, setBrandName] = useState(initial?.brandName ?? "");
  const [brandIntroduction, setBrandIntroduction] = useState(initial?.brandIntroduction ?? "");
  const [brandLogoPreview, setBrandLogoPreview] = useState<string | null>(
    initial?.brandLogoUrl ?? null,
  );
  const [brandLogoIntent, setBrandLogoIntent] = useState<
    { changed: false } | { changed: true; fileKey: string | null }
  >({ changed: false });
  const [rewardAmount, setRewardAmount] = useState(
    initial?.rewardAmount?.toString() ?? "30000",
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(initial?.thumbnailUrl ?? null);
  const [thumbnailIntent, setThumbnailIntent] = useState<
    { changed: false } | { changed: true; fileKey: string | null }
  >({ changed: false });
  const [requirements, setRequirements] = useState(initial?.requirements ?? "");
  const [deadline, setDeadline] = useState(
    initial?.deadline ? initial.deadline.slice(0, 10) : "",
  );
  const [maxParticipants, setMaxParticipants] = useState(
    initial?.maxParticipants?.toString() ?? "10",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const reward = Number(rewardAmount);
    const maxP = Number(maxParticipants);

    if (!brandName.trim()) return setWarning(t("브랜드명을 입력해주세요", "Please enter a brand name"));
    if (!title.trim()) return setWarning(t("캠페인 제목을 입력해주세요", "Please enter a campaign title"));
    if (!description.trim()) return setWarning(t("설명을 입력해주세요", "Please enter a description"));
    if (!Number.isInteger(reward) || reward < 1) {
      return setWarning(t("보상 금액은 1원 이상의 정수여야 합니다", "Reward amount must be a positive integer"));
    }
    if (!Number.isInteger(maxP) || maxP < 1) {
      return setWarning(t("최대 참여자 수는 1 이상의 정수여야 합니다", "Max participants must be an integer of 1 or more"));
    }

    setLoading(true);

    const payload: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim(),
      brandName: brandName.trim(),
      brandIntroduction: brandIntroduction.trim(),
      requirements: requirements.trim() || null,
      deadline: deadline ? `${deadline}T00:00:00` : null,
    };
    // 보상·인원은 변경 가능할 때만 payload 에 포함.
    // edit 모드에서 escrow 가 NONE/PENDING_DEPOSIT 이 아니면 두 필드를 보내는 순간
    // 백엔드가 INVALID_ESCROW_STATE 로 차단하므로, 변경 의도가 없으면 빼야 한다.
    if (budgetEditable) {
      payload.rewardAmount = reward;
      payload.maxParticipants = maxP;
    }
    if (mode === "create") {
      payload.thumbnailFileKey = thumbnailIntent.changed ? thumbnailIntent.fileKey : null;
      payload.brandLogoFileKey = brandLogoIntent.changed ? brandLogoIntent.fileKey : null;
    } else {
      if (thumbnailIntent.changed) payload.thumbnailFileKey = thumbnailIntent.fileKey ?? "";
      if (brandLogoIntent.changed) payload.brandLogoFileKey = brandLogoIntent.fileKey ?? "";
    }

    try {
      if (mode === "create") {
        // 상용 결제 공급자가 연결되기 전에는 관리자가 원장 없이 FUNDED/OPEN을 만들 수 없다.
        payload.immediatelyOpen = false;
        const { data } = await api.post("/admin/campaigns", payload);
        router.push(`/admin/campaigns/${data.id}`);
      } else if (initial?.id) {
        await api.put(`/admin/campaigns/${initial.id}`, payload);
        if (onSuccess) onSuccess();
        else router.push(`/admin/campaigns/${initial.id}`);
      }
    } catch (err: unknown) {
      const msg =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(msg || t("저장에 실패했습니다", "Failed to save"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-error/30 bg-error/5 p-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* ── 브랜드 정보 ─────────────────────────── */}
      <Card className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t("브랜드 정보", "Brand information")}</h2>
          <p className="mt-1 text-sm text-muted">
            {t(
              "랜딩 대표 캠페인 카드와 회사 소개 모달에 노출되는 브랜드 정보입니다.",
              "Brand information shown on the landing featured campaign card and company introduction modal.",
            )}
          </p>
        </div>

        <div>
          <label htmlFor="brandName" className="block text-sm font-medium text-content-soft">
            {t("브랜드명", "Brand name")}
          </label>
          <Input
            id="brandName"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder={t("예: ABC 코스메틱", "e.g. ABC Cosmetics")}
            className="mt-1.5"
          />
        </div>

        <div>
          <label
            htmlFor="brandIntroduction"
            className="block text-sm font-medium text-content-soft"
          >
            {t("브랜드 소개", "Brand introduction")} <span className="text-faint">{t("(선택)", "(optional)")}</span>
          </label>
          <Textarea
            id="brandIntroduction"
            rows={4}
            value={brandIntroduction}
            onChange={(e) => setBrandIntroduction(e.target.value)}
            placeholder={t(
              "브랜드와 회사를 소개해주세요. 랜딩 회사 소개 모달에 표시됩니다.",
              "Introduce your brand and company. Shown in the landing company introduction modal.",
            )}
            className="mt-1.5"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-content-soft">
            {t("브랜드 로고", "Brand logo")} <span className="text-faint">{t("(선택 · 정사각형)", "(optional · square)")}</span>
          </label>
          <ImageUploader
            aspect={1}
            previewUrl={brandLogoPreview}
            onChange={(fileKey) => {
              setBrandLogoIntent({ changed: true, fileKey });
              setBrandLogoPreview(null);
            }}
          />
        </div>
      </Card>

      {/* ── 캠페인 정보 ─────────────────────────── */}
      <Card className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t("캠페인 정보", "Campaign information")}</h2>
          <p className="mt-1 text-sm text-muted">
            {t(
              "크리에이터에게 노출되는 캠페인 모집 내용입니다.",
              "Campaign recruitment details shown to creators.",
            )}
          </p>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-content-soft">
            {t("캠페인 제목", "Campaign title")}
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("예: 신제품 바디워시 리뷰 영상", "e.g. New body wash review video")}
            className="mt-1.5"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-content-soft">
            {t("설명", "Description")}
          </label>
          <Textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("캠페인 상세 설명", "Campaign details")}
            className="mt-1.5"
          />
        </div>

        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-content-soft">
            {t("요구사항/가이드라인", "Requirements / guidelines")} <span className="text-faint">{t("(선택)", "(optional)")}</span>
          </label>
          <Textarea
            id="requirements"
            rows={3}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder={t(
              "예: 30초 이상 세로형 영상, 얼굴 공개 필요, 지정 해시태그 포함",
              "e.g. Vertical video 30s+, face shown, include the required hashtags",
            )}
            className="mt-1.5"
          />
        </div>

        <div>
          {!budgetEditable && (
            <p className="mb-2 text-xs text-warning">
              {t(
                "예치 완료 후에는 보상 금액과 최대 참여자 수를 변경할 수 없습니다.",
                "Reward amount and max participants can't be changed after the deposit is completed.",
              )}
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="rewardAmount" className="block text-sm font-medium text-content-soft">
                {t("보상 금액 (원)", "Reward amount (₩)")}
              </label>
              <Input
                id="rewardAmount"
                type="number"
                min={0}
                disabled={!budgetEditable}
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
                {t("최대 참여자 수", "Max participants")}
              </label>
              <Input
                id="maxParticipants"
                type="number"
                min={1}
                disabled={!budgetEditable}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-content-soft">
            {t("마감일", "Deadline")} <span className="text-faint">{t("(선택)", "(optional)")}</span>
          </label>
          <Input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-content-soft">
            {t("썸네일", "Thumbnail")} <span className="text-faint">{t("(선택 · 16:9)", "(optional · 16:9)")}</span>
          </label>
          <ImageUploader
            aspect={16 / 9}
            previewUrl={previewUrl}
            onChange={(fileKey) => {
              setThumbnailIntent({ changed: true, fileKey });
              setPreviewUrl(null);
            }}
          />
        </div>

        {mode === "create" && (
          <div className="rounded-2xl border border-line bg-surface-muted p-4">
            <p className="text-sm font-medium text-foreground">
              {t("관리 베타 · 결제 비활성", "Managed beta · payments unavailable")}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-warning">
              {t(
                "캠페인은 초안·결제 대기 상태로만 생성됩니다. 상용 PG와 운영 계약이 활성화되기 전에는 모집 시작이나 임의 입금 완료 처리를 할 수 없습니다.",
                "Campaigns are created only as drafts awaiting payment. Recruiting and manual payment completion remain unavailable until a commercial PG and operating agreement are active.",
              )}
            </p>
          </div>
        )}
      </Card>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? t("저장 중...", "Saving...")
            : mode === "create"
              ? t("캠페인 생성", "Create campaign")
              : t("수정 저장", "Save changes")}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          {t("취소", "Cancel")}
        </Button>
      </div>

      <AlertModal
        open={!!warning}
        title={t("입력값을 확인해주세요", "Please check your input")}
        message={warning}
        onClose={() => setWarning("")}
      />
    </form>
  );
}
