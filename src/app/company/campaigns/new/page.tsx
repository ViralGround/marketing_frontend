"use client";

/**
 * 캠페인 등록(NEW BRIEF) — VG UI 킷 "CAMPAIGN REGISTRATION" 스크린 문법.
 *
 * 킷 컴포넌트 구현: 목적 선택 카드(복수) · 필수 결과물 체크 · 톤앤매너 카드(단일) ·
 * 보상 퀵 금액 칩 · 모집 인원 스테퍼 · 글자수 카운터 · 마감 D-day 뱃지 ·
 * 입력 도움말 사이드 패널 · 넘버드 섹션 패널.
 *
 * 데이터 원칙: 백엔드 스키마(title/description/requirements/reward/…)를 바꾸지 않고,
 * 구조화 선택값(목적·톤·결과물)은 [라벨] 라인으로 description/requirements 에
 * 직렬화해 저장한다 — 크리에이터 상세 화면(whitespace-pre-wrap)에 그대로 보인다.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Gem,
  Laugh,
  Megaphone,
  MousePointerClick,
  ShoppingBag,
  Smile,
  Sparkles,
  Square,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import api from "@/lib/api";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import ImageUploader from "@/components/ui/ImageUploader";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { useLang } from "@/lib/i18n";
import PageHeader from "@/components/workspace/PageHeader";
import {
  ChoiceGrid,
  ChoiceTile,
  FieldStack,
  FormContextRail,
  FormLayout,
  FormStack,
  NumberStepper,
  SectionProgress,
  SummaryRow,
  SummaryRows,
  WorkspacePage,
  WorkspacePanel,
  WorkspaceScrollArea,
  WorkspaceStage,
} from "@/components/workspace/WorkspacePrimitives";
import viewStyles from "@/components/workspace/WorkspaceViews.module.css";

const TITLE_MAX = 80;
const DESC_MAX = 1000;
const REQ_MAX = 500;

interface GoalOption {
  key: string;
  icon: LucideIcon;
  ko: string;
  en: string;
  descKo: string;
  descEn: string;
}

const GOALS: GoalOption[] = [
  { key: "awareness", icon: Eye, ko: "브랜드 인지도", en: "Brand awareness", descKo: "브랜드를 더 많은 사람들에게 알리고 노출을 높입니다.", descEn: "Reach more people and raise visibility." },
  { key: "promotion", icon: Megaphone, ko: "제품 홍보", en: "Product promotion", descKo: "특정 제품 또는 서비스를 효과적으로 알립니다.", descEn: "Promote a specific product or service." },
  { key: "traffic", icon: MousePointerClick, ko: "트래픽 / 유입", en: "Traffic", descKo: "웹사이트, 앱, 채널 등의 트래픽을 늘립니다.", descEn: "Drive traffic to your site, app, or channel." },
  { key: "conversion", icon: ShoppingBag, ko: "매출 전환", en: "Conversion", descKo: "구매, 가입 등 전환을 유도해 성과를 만듭니다.", descEn: "Drive purchases, signups, and conversions." },
];

const TONES: GoalOption[] = [
  { key: "professional", icon: TrendingUp, ko: "프로페셔널", en: "Professional", descKo: "전문적이고 신뢰감 있는", descEn: "Expert and trustworthy" },
  { key: "friendly", icon: Smile, ko: "프렌들리", en: "Friendly", descKo: "친근하고 편안한", descEn: "Warm and approachable" },
  { key: "trendy", icon: Sparkles, ko: "트렌디", en: "Trendy", descKo: "트렌디하고 감각적인", descEn: "Current and stylish" },
  { key: "luxury", icon: Gem, ko: "럭셔리", en: "Luxury", descKo: "고급스럽고 프리미엄한", descEn: "Premium and refined" },
  { key: "fun", icon: Laugh, ko: "펀", en: "Fun", descKo: "재미있고 유쾌한", descEn: "Playful and upbeat" },
  { key: "minimal", icon: Square, ko: "미니멀", en: "Minimal", descKo: "심플하고 깔끔한", descEn: "Simple and clean" },
];

const DELIVERABLES = [
  { key: "ig-feed", ko: "인스타그램 피드 포스팅", en: "Instagram feed post" },
  { key: "ig-story", ko: "인스타그램 스토리", en: "Instagram story" },
  { key: "ig-reels", ko: "인스타그램 릴스", en: "Instagram Reels" },
  { key: "yt-shorts", ko: "유튜브 숏폼 (Shorts)", en: "YouTube Shorts" },
  { key: "yt-long", ko: "유튜브 롱폼 (영상)", en: "YouTube long-form" },
  { key: "tiktok", ko: "틱톡 영상", en: "TikTok video" },
] as const;

const REWARD_CHIPS = [
  { amount: 100_000, ko: "+10만", en: "+100K" },
  { amount: 500_000, ko: "+50만", en: "+500K" },
  { amount: 1_000_000, ko: "+100만", en: "+1M" },
] as const;

const STEP_IDS = ["brief-basics", "brief-content", "brief-tone", "brief-budget"] as const;

function daysUntil(dateValue: string): number | null {
  if (!dateValue) return null;
  const end = new Date(dateValue);
  if (Number.isNaN(end.getTime())) return null;
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / 86_400_000);
}

function OptionCard({
  option,
  active,
  onToggle,
  t,
}: {
  option: GoalOption;
  active: boolean;
  onToggle: () => void;
  t: (ko: string, en: string) => string;
}) {
  const Icon = option.icon;
  return (
    <ChoiceTile
      icon={Icon}
      title={t(option.ko, option.en)}
      description={t(option.descKo, option.descEn)}
      active={active}
      onClick={onToggle}
    />
  );
}

export default function NewCampaignPage() {
  const { t } = useLang();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [tone, setTone] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [brandName, setBrandName] = useState("");
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [deliverableEtc, setDeliverableEtc] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("1");
  const [thumbnailFileKey, setThumbnailFileKey] = useState<string | null>(null);
  const [requirements, setRequirements] = useState("");
  const [deadline, setDeadline] = useState("");
  const [activeSection, setActiveSection] = useState("brief-basics");

  const totalBudget = useMemo(() => {
    const r = Number(rewardAmount);
    const m = Number(maxParticipants);
    if (!Number.isFinite(r) || !Number.isInteger(m) || r < 0 || m < 1) return 0;
    return r * m;
  }, [rewardAmount, maxParticipants]);

  const remainingDays = daysUntil(deadline);

  const toggleGoal = (key: string) =>
    setGoals((prev) => (prev.includes(key) ? prev.filter((v) => v !== key) : [...prev, key]));
  const toggleDeliverable = (key: string) =>
    setDeliverables((prev) => (prev.includes(key) ? prev.filter((v) => v !== key) : [...prev, key]));

  const addReward = (amount: number) =>
    setRewardAmount((prev) => String(Math.max(0, (Number(prev) || 0) + amount)));

  const stepIndex = STEP_IDS.indexOf(activeSection as (typeof STEP_IDS)[number]);
  const validateVisibleStep = () => {
    const form = document.getElementById("campaign-brief-form") as HTMLFormElement | null;
    return form?.reportValidity() ?? true;
  };
  const goToStep = (nextId: string) => {
    const nextIndex = STEP_IDS.indexOf(nextId as (typeof STEP_IDS)[number]);
    if (nextIndex < 0) return;
    if (nextIndex > stepIndex && !validateVisibleStep()) return;
    setError("");
    setActiveSection(nextId);
  };
  const validateAll = () => {
    if (!title.trim() || !brandName.trim() || !description.trim()) {
      setActiveSection("brief-basics");
      setError(t("기본 정보의 필수 항목을 입력해주세요.", "Complete the required basic information."));
      return false;
    }
    if (!rewardAmount || Number(rewardAmount) < 0 || !Number.isInteger(Number(maxParticipants)) || Number(maxParticipants) < 1) {
      setActiveSection("brief-budget");
      setError(t("보상과 모집 인원을 확인해주세요.", "Check the reward and recruiting count."));
      return false;
    }
    if (remainingDays !== null && remainingDays < 0) {
      setActiveSection("brief-budget");
      setError(t("마감일은 오늘 이후여야 합니다.", "The deadline must be in the future."));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateAll()) return;
    setLoading(true);

    /* 구조화 선택값 → 라벨 라인 직렬화 (크리에이터 상세에 그대로 노출) */
    const goalLabels = GOALS.filter((g) => goals.includes(g.key)).map((g) => t(g.ko, g.en));
    const toneOption = TONES.find((v) => v.key === tone);
    const composedDescription = [
      goalLabels.length ? `[${t("캠페인 목적", "Goal")}] ${goalLabels.join(", ")}` : null,
      toneOption ? `[${t("톤앤매너", "Tone")}] ${t(toneOption.ko, toneOption.en)} — ${t(toneOption.descKo, toneOption.descEn)}` : null,
      goalLabels.length || toneOption ? "" : null,
      description.trim(),
    ]
      .filter((line) => line !== null)
      .join("\n");

    const deliverableLabels = DELIVERABLES.filter((d) => deliverables.includes(d.key)).map((d) => t(d.ko, d.en));
    if (deliverableEtc.trim()) deliverableLabels.push(deliverableEtc.trim());
    const composedRequirements = [
      deliverableLabels.length ? `[${t("필수 결과물", "Deliverables")}] ${deliverableLabels.join(", ")}` : null,
      requirements.trim() || null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const { data } = await api.post<{ id: number }>("/company/campaigns", {
        title,
        description: composedDescription,
        brandName,
        rewardAmount: Number(rewardAmount),
        maxParticipants: Number(maxParticipants),
        thumbnailFileKey,
        requirements: composedRequirements || null,
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
    <WorkspacePage size="form" flow={false}>
      <WorkspaceStage
        className={viewStyles.pageStage}
        header={
          <div className={viewStyles.headerStack}>
            <BackButton href="/company/campaigns" labelKo="캠페인 목록으로" labelEn="Back to campaigns" className="!mb-0" />
            <PageHeader display="NEW BRIEF" subtitle={t("한 단계씩 입력하면 값은 다음 단계에서도 그대로 유지됩니다.", "Complete one step at a time. Your values stay preserved between steps.")} />
            <SectionProgress
              label={t("브리프 작성 단계", "Brief steps")}
              activeId={activeSection}
              onChange={goToStep}
              items={[
                { id: "brief-basics", label: t("기본 정보", "Basics") },
                { id: "brief-content", label: t("결과물", "Deliverables") },
                { id: "brief-tone", label: t("톤앤매너", "Tone") },
                { id: "brief-budget", label: t("보상·모집", "Reward") },
              ]}
            />
          </div>
        }
        footer={
          <div className={viewStyles.formActions}>
            <Button type="button" variant="secondary" disabled={stepIndex === 0 || loading} onClick={() => goToStep(STEP_IDS[Math.max(0, stepIndex - 1)])}>{t("이전", "Previous")}</Button>
            <span className="text-xs font-bold text-muted tabular-nums">{stepIndex + 1} / {STEP_IDS.length}</span>
            {stepIndex < STEP_IDS.length - 1 ? (
              <Button type="button" onClick={() => goToStep(STEP_IDS[stepIndex + 1])}>{t("다음", "Next")}</Button>
            ) : (
              <Button type="submit" form="campaign-brief-form" loading={loading}>{t("캠페인 등록", "Create campaign")}</Button>
            )}
          </div>
        }
      >
      <FormLayout>
        <WorkspaceScrollArea label={t("현재 브리프 단계 입력", "Current brief step form")}>
        <form id="campaign-brief-form" onSubmit={handleSubmit}>
          <FormStack>
          {error && (
            <div
              role="alert"
              className="flex items-center gap-2.5 rounded-[10px] border border-error/25 bg-error/5 px-4 py-3 text-sm font-medium text-error"
            >
              <span aria-hidden="true" className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-error text-[11px] font-black text-white">!</span>
              {error}
            </div>
          )}

          {/* 01 — 캠페인 기본 정보 */}
          {activeSection === "brief-basics" && <WorkspacePanel
            id="brief-basics"
            number="01"
            title={t("캠페인 기본 정보", "Campaign basics")}
            description={t("크리에이터가 목록에서 가장 먼저 확인하는 정보입니다.", "This is what creators scan first in the campaign list.")}
          >
            <FieldStack>
              <div className="grid gap-4 md:grid-cols-[minmax(0,1.45fr)_minmax(12rem,.75fr)]">
                <Field label={t("캠페인 제목", "Campaign title")} htmlFor="title" required>
                <div className="relative">
                  <Input
                    id="title"
                    type="text"
                    required
                    maxLength={TITLE_MAX}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("눈에 띄는 캠페인 제목을 입력하세요", "Enter a campaign title that stands out")}
                    className="pr-16"
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-faint tabular-nums">
                    {title.length} / {TITLE_MAX}
                  </span>
                </div>
                </Field>

                <Field label={t("브랜드명", "Brand name")} htmlFor="brandName" required>
                  <Input id="brandName" type="text" required value={brandName} onChange={(e) => setBrandName(e.target.value)} />
                </Field>
              </div>

              <Field
                label={t("캠페인 목적", "Campaign goal")}
                hint={t("캠페인의 주요 목표를 선택하세요. (복수 선택 가능)", "Pick the main goals. (multiple allowed)")}
              >
                <ChoiceGrid columns={4}>
                  {GOALS.map((goal) => (
                    <OptionCard key={goal.key} option={goal} active={goals.includes(goal.key)} onToggle={() => toggleGoal(goal.key)} t={t} />
                  ))}
                </ChoiceGrid>
              </Field>

              <Field label={t("캠페인 설명", "Campaign description")} htmlFor="description" required>
                <Textarea
                  id="description"
                  required
                  rows={5}
                  maxLength={DESC_MAX}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("제품과 캠페인을 소개하고, 크리에이터가 알아야 할 맥락을 적어주세요.", "Introduce the product and the context creators need.")}
                />
                <p className="mt-1.5 text-right text-xs text-faint tabular-nums">
                  {description.length} / {DESC_MAX}
                </p>
              </Field>
            </FieldStack>
          </WorkspacePanel>}

          {/* 02 — 필수 결과물 · 요구사항 */}
          {activeSection === "brief-content" && <WorkspacePanel
            id="brief-content"
            number="02"
            title={t("필수 결과물 · 요구사항", "Deliverables · Requirements")}
            description={t("제작 범위와 검수 기준을 구체적으로 남겨주세요.", "Define the production scope and review criteria.")}
          >
            <FieldStack>
              <Field
                label={t("필수 결과물 (Deliverables)", "Deliverables")}
                hint={t("캠페인을 통해 받고자 하는 결과물을 선택하세요.", "Select the content you expect from this campaign.")}
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  {DELIVERABLES.map((d) => {
                    const active = deliverables.includes(d.key);
                    return (
                      <label
                        key={d.key}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-[10px] border px-3.5 py-3 text-sm font-medium transition-colors ${
                          active ? "border-primary bg-primary-bg text-foreground" : "border-line bg-surface text-content-soft hover:border-primary/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => toggleDeliverable(d.key)}
                          className="h-4 w-4 rounded border-line-strong accent-primary"
                        />
                        {t(d.ko, d.en)}
                      </label>
                    );
                  })}
                  <div className="flex items-center gap-2.5 rounded-[10px] border border-line px-3.5 sm:col-span-2">
                    <span className="text-sm font-medium text-content-soft">{t("기타", "Other")}</span>
                    <input
                      type="text"
                      value={deliverableEtc}
                      onChange={(e) => setDeliverableEtc(e.target.value)}
                      placeholder={t("직접 입력하세요", "Type your own")}
                      className="h-11 min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder-faint outline-none"
                    />
                  </div>
                </div>
              </Field>

              <Field
                label={t("추가 요구사항", "Additional requirements")}
                htmlFor="requirements"
                optionalLabel={t("(선택)", "(optional)")}
              >
                <Textarea
                  id="requirements"
                  rows={4}
                  maxLength={REQ_MAX}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder={t("예: 제품 노출 3초 이상, 강조하고 싶은 메시지, 금지 표현 등", "e.g. show the product for 3s+, key messages, restricted claims")}
                />
                <p className="mt-1.5 text-right text-xs text-faint tabular-nums">
                  {requirements.length} / {REQ_MAX}
                </p>
              </Field>
            </FieldStack>
          </WorkspacePanel>}

          {/* 03 — 브랜드 톤앤매너 */}
          {activeSection === "brief-tone" && <WorkspacePanel
            id="brief-tone"
            number="03"
            title={t("브랜드 톤앤매너", "Brand tone & manner")}
            description={t("한 가지 기준을 선택해 콘텐츠 방향을 선명하게 만드세요.", "Choose one direction to keep content decisions clear.")}
          >
            <Field
              label={t("추구하는 분위기", "Preferred mood")}
              optionalLabel={t("(선택)", "(optional)")}
              hint={t("브랜드가 추구하는 분위기를 선택하세요.", "Pick the mood your brand is going for.")}
            >
              <ChoiceGrid columns={3}>
                {TONES.map((option) => (
                  <OptionCard
                    key={option.key}
                    option={option}
                    active={tone === option.key}
                    onToggle={() => setTone((prev) => (prev === option.key ? null : option.key))}
                    t={t}
                  />
                ))}
              </ChoiceGrid>
            </Field>
          </WorkspacePanel>}

          {/* 04 — 보상 · 모집 */}
          {activeSection === "brief-budget" && <WorkspacePanel
            id="brief-budget"
            number="04"
            title={t("보상 · 모집", "Reward · Recruitment")}
            description={t("1인당 보상과 모집 규모를 기준으로 총 예산을 확인합니다.", "Review the total budget from the reward and number of creators.")}
          >
            <FieldStack>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("1인당 보상 (원)", "Reward per creator (KRW)")} htmlFor="rewardAmount" required>
                  <Input
                    id="rewardAmount"
                    type="number"
                    min={0}
                    required
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(e.target.value)}
                    placeholder={t("예: 300,000", "e.g. 300,000")}
                    className="tabular-nums"
                  />
                  {/* 킷 퀵 금액 칩 */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {REWARD_CHIPS.map((chip) => (
                      <button
                        key={chip.amount}
                        type="button"
                        onClick={() => addReward(chip.amount)}
                        className="h-8 rounded-lg border border-line bg-surface px-3 text-[13px] font-semibold text-content-soft transition-colors hover:border-primary/50 hover:bg-primary-bg hover:text-primary"
                      >
                        {t(chip.ko, chip.en)}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setRewardAmount("")}
                      className="h-8 rounded-lg border border-line bg-surface px-3 text-[13px] font-semibold text-content-soft transition-colors hover:border-primary/50 hover:bg-primary-bg hover:text-primary"
                    >
                      {t("직접 입력", "Custom")}
                    </button>
                  </div>
                </Field>

                <Field label={t("모집 인원", "Number of creators")} htmlFor="maxParticipants" required>
                  <NumberStepper
                    id="maxParticipants"
                    value={maxParticipants}
                    min={1}
                    onChange={setMaxParticipants}
                    decreaseLabel={t("인원 줄이기", "Decrease")}
                    increaseLabel={t("인원 늘리기", "Increase")}
                  />
                </Field>
              </div>

              <Field label={t("모집 마감일", "Recruitment deadline")} htmlFor="deadline" optionalLabel={t("(선택)", "(optional)")}>
                <div className="flex flex-wrap items-center gap-3">
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="max-w-xs"
                  />
                  {remainingDays !== null && (
                    <span
                      className={`inline-flex h-8 flex-shrink-0 items-center rounded-full px-3 text-[13px] font-bold tabular-nums ${
                        remainingDays < 0 ? "bg-error/10 text-error" : "bg-primary text-white"
                      }`}
                    >
                      {remainingDays < 0
                        ? t("지난 날짜", "Past date")
                        : remainingDays === 0
                          ? "D-DAY"
                          : `D-${remainingDays}`}
                    </span>
                  )}
                </div>
                {remainingDays !== null && remainingDays < 0 && (
                  <p role="alert" className="mt-1.5 text-xs font-medium text-error">
                    {t("마감일은 오늘 이후여야 합니다.", "The deadline must be in the future.")}
                  </p>
                )}
              </Field>

              <Field label={t("썸네일", "Thumbnail")} optionalLabel={t("(선택)", "(optional)")}>
                <ImageUploader previewUrl={null} onChange={setThumbnailFileKey} aspect={16 / 9} />
              </Field>
            </FieldStack>
          </WorkspacePanel>}
          </FormStack>
        </form>
        </WorkspaceScrollArea>

        <FormContextRail>
          <WorkspacePanel title={t("브리프 요약", "Brief summary")} density="compact" tone="raised">
            <SummaryRows>
              <SummaryRow label={t("캠페인 목적", "Goals")} value={goals.length ? t(`${goals.length}개 선택`, `${goals.length} selected`) : t("미선택", "Not selected")} />
              <SummaryRow label={t("필수 결과물", "Deliverables")} value={deliverables.length || deliverableEtc.trim() ? t(`${deliverables.length + (deliverableEtc.trim() ? 1 : 0)}개`, `${deliverables.length + (deliverableEtc.trim() ? 1 : 0)}`) : t("미선택", "Not selected")} />
              <SummaryRow label={t("톤앤매너", "Tone")} value={tone ? t(TONES.find((item) => item.key === tone)?.ko ?? "미선택", TONES.find((item) => item.key === tone)?.en ?? "Not selected") : t("미선택", "Not selected")} />
              <SummaryRow label={t("모집 인원", "Creators")} value={t(`${Number(maxParticipants) || 0}명`, `${Number(maxParticipants) || 0}`)} />
              <SummaryRow label={t("마감", "Deadline")} value={remainingDays === null ? t("미정", "Not set") : remainingDays < 0 ? t("지난 날짜", "Past date") : remainingDays === 0 ? "D-DAY" : `D-${remainingDays}`} />
              <SummaryRow label={t("예상 총 예산", "Estimated budget")} value={t(`${totalBudget.toLocaleString()}원`, `₩${totalBudget.toLocaleString()}`)} strong />
            </SummaryRows>
          </WorkspacePanel>

          <WorkspacePanel title={t("등록 전 확인", "Before creating")} density="compact" tone="dark">
            <p className="text-xs leading-relaxed text-zinc-300">
              <strong className="text-[#b9a3ff]">{t("초안으로 저장", "Saved as a draft")}</strong>{" "}
              {t(
                "작성한 브리프는 검토 가능한 비공개 초안으로 등록됩니다. 공개 전 조건과 권한을 다시 확인해주세요.",
                "Your brief is registered as a private, reviewable draft. Check its conditions and permissions before publishing.",
              )}
            </p>
            <p className="mt-3 text-[11px] leading-relaxed text-zinc-400">
              {t("선택한 목적·톤·결과물은 캠페인 설명과 요구사항에 함께 저장됩니다.", "Goals, tone, and deliverables are saved with the brief.")}
            </p>
          </WorkspacePanel>
        </FormContextRail>
      </FormLayout>
      </WorkspaceStage>
    </WorkspacePage>
  );
}
