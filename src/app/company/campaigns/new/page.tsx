"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import ImageUploader from "@/components/ui/ImageUploader";
import Field from "@/components/ui/Field";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { useLang } from "@/lib/i18n";
import PageHeader from "@/components/workspace/PageHeader";


export default function NewCampaignPage() {
  const { t } = useLang();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [brandName, setBrandName] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [thumbnailFileKey, setThumbnailFileKey] = useState<string | null>(null);
  const [requirements, setRequirements] = useState("");
  const [deadline, setDeadline] = useState("");

  const totalBudget = useMemo(() => {
    const r = Number(rewardAmount);
    const m = Number(maxParticipants);
    if (!Number.isFinite(r) || !Number.isInteger(m) || r < 0 || m < 1) return 0;
    return r * m;
  }, [rewardAmount, maxParticipants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post<{ id: number }>("/company/campaigns", {
        title,
        description,
        brandName,
        rewardAmount: Number(rewardAmount),
        maxParticipants: Number(maxParticipants),
        thumbnailFileKey,
        requirements: requirements.trim() || null,
        deadline: deadline || null,
      });
      router.push(`/company/campaigns/${data.id}`);
    } catch (err: unknown) {
      const response =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
          : undefined;
      setError(response?.data?.message ?? t("캠페인 등록에 실패했습니다", "Failed to create campaign"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <BackButton href="/company/campaigns" labelKo="캠페인 목록으로" labelEn="Back to campaigns" />
      <PageHeader
        display="NEW BRIEF"
        subtitle={t(
          "캠페인은 초안으로 저장됩니다. 관리 베타의 결제·모집 절차는 운영 계약 확정 후 별도로 안내됩니다.",
          "The campaign is saved as a draft. Payment and recruiting steps for the managed beta are provided after the operating agreement is finalized.",
        )}
      />

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2.5 rounded-[10px] border border-error/25 bg-error/5 px-4 py-3 text-sm font-medium text-error"
          >
            <span aria-hidden="true" className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-error text-[11px] font-black text-white">!</span>
            {error}
          </div>
        )}

        {/* 01 — 캠페인 기본 정보 (킷 폼 문법: 넘버드 섹션 패널) */}
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          <h2 className="mb-5 flex items-baseline gap-2.5 border-b border-line pb-4">
            <span className="font-display text-sm text-primary">01</span>
            <span className="text-base font-extrabold text-foreground">{t("캠페인 기본 정보", "Campaign basics")}</span>
          </h2>
          <div className="space-y-5">
            <Field label={t("캠페인 제목", "Campaign title")} htmlFor="title" required>
              <Input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("눈에 띄는 캠페인 제목을 입력하세요", "Enter a campaign title that stands out")}
              />
            </Field>
            <Field label={t("브랜드명", "Brand name")} htmlFor="brandName" required>
              <Input
                id="brandName"
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </Field>
            <Field label={t("캠페인 설명", "Campaign description")} htmlFor="description" required>
              <Textarea
                id="description"
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
            <Field
              label={t("제출 요구사항", "Submission requirements")}
              htmlFor="requirements"
              optionalLabel={t("(선택)", "(optional)")}
            >
              <Textarea
                id="requirements"
                rows={4}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder={t(
                  "예: 제품 노출 3초 이상, 릴스 15초 이상 등",
                  "e.g. show the product for 3s+, Reels 15s+, etc.",
                )}
              />
            </Field>
          </div>
        </section>

        {/* 02 — 보상 · 모집 */}
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          <h2 className="mb-5 flex items-baseline gap-2.5 border-b border-line pb-4">
            <span className="font-display text-sm text-primary">02</span>
            <span className="text-base font-extrabold text-foreground">{t("보상 · 모집", "Reward · Recruitment")}</span>
          </h2>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label={t("1인당 보상 (원)", "Reward per creator (KRW)")} htmlFor="rewardAmount" required>
                <Input
                  id="rewardAmount"
                  type="number"
                  min={0}
                  required
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                  className="tabular-nums"
                />
              </Field>
              <Field label={t("모집 인원", "Number of creators")} htmlFor="maxParticipants" required>
                <Input
                  id="maxParticipants"
                  type="number"
                  min={1}
                  required
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  className="tabular-nums"
                />
              </Field>
            </div>

            {/* 예산 요약 — 킷 라벤더 하이라이트 카드 */}
            <div className="rounded-[10px] border border-primary/25 bg-primary-bg p-5">
              <p className="text-xs font-semibold text-primary">{t("예상 총 예산", "Estimated total budget")}</p>
              <p className="mt-1 text-2xl font-black tracking-tight text-foreground tabular-nums">
                {t(`${totalBudget.toLocaleString()}원`, `₩${totalBudget.toLocaleString()}`)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-content-soft">
                {t("등록 직후 캠페인은 ", "Right after creation, the campaign is ")}
                <span className="font-semibold text-warning">{t("결제 비활성", "Payment unavailable")}</span>{" "}
                {t(
                  "상태로 저장됩니다. 현재 어떤 계좌로도 송금하지 마세요. 결제·모집은 PG 활성화와 계약 확인 후 진행합니다.",
                  ". Do not transfer money to any account. Payment and recruiting begin only after PG activation and contract confirmation.",
                )}
              </p>
            </div>

            <Field label={t("모집 마감일", "Recruitment deadline")} htmlFor="deadline" optionalLabel={t("(선택)", "(optional)")}>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </Field>
            <Field label={t("썸네일", "Thumbnail")} optionalLabel={t("(선택)", "(optional)")}>
              <ImageUploader previewUrl={null} onChange={setThumbnailFileKey} aspect={16 / 9} />
            </Field>
          </div>
        </section>

        <Button type="submit" size="lg" loading={loading} fullWidth>
          {loading ? t("등록 중...", "Creating...") : t("캠페인 등록", "Create campaign")}
        </Button>
      </form>
    </div>
  );
}
