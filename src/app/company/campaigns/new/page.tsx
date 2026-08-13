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
  Check,
  Eye,
  Gem,
  Laugh,
  Megaphone,
  Minus,
  MousePointerClick,
  Plus,
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

function daysUntil(dateValue: string): number | null {
  if (!dateValue) return null;
  const end = new Date(dateValue);
  if (Number.isNaN(end.getTime())) return null;
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / 86_400_000);
}

/* 킷 선택 카드 — 라벤더 활성(보더+배경+체크) */
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
    <button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      className={`relative rounded-xl border p-4 text-left transition-all duration-150 ${
        active
          ? "border-primary bg-primary-bg"
          : "border-line bg-surface hover:border-primary/40"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full transition-colors ${
          active ? "bg-primary text-white" : "border border-line-strong bg-surface text-transparent"
        }`}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
      <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted"}`} aria-hidden="true" />
      <span className="mt-2.5 block text-sm font-bold text-foreground">{t(option.ko, option.en)}</span>
      <span className="mt-1 block text-xs leading-relaxed text-muted">{t(option.descKo, option.descEn)}</span>
    </button>
  );
}

/* 섹션 패널 헤더 — 보라 번호 + 제목 (작성 순서가 곧 정보) */
function SectionHead({ no, title }: { no: string; title: string }) {
  return (
    <h2 className="mb-5 flex items-baseline gap-2.5 border-b border-line pb-4">
      <span className="font-display text-sm text-primary">{no}</span>
      <span className="text-base font-extrabold text-foreground">{title}</span>
    </h2>
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
  const stepParticipants = (delta: number) =>
    setMaxParticipants((prev) => String(Math.max(1, (Number(prev) || 1) + delta)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
    <div className="mx-auto max-w-6xl">
      <BackButton href="/company/campaigns" labelKo="캠페인 목록으로" labelEn="Back to campaigns" />
      <PageHeader
        display="NEW BRIEF"
        subtitle={t(
          "캠페인의 목표와 개요를 설정하고, 기본 정보를 입력하세요. 캠페인은 초안으로 저장되며 등록 후에도 수정할 수 있습니다.",
          "Set the campaign goal and basics. Campaigns are saved as drafts and can be edited after creation.",
        )}
      />

      <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <form onSubmit={handleSubmit} className="min-w-0 space-y-5">
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
          <section className="rounded-2xl border border-line bg-surface p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
            <SectionHead no="01" title={t("캠페인 기본 정보", "Campaign basics")} />
            <div className="space-y-5">
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

              <Field
                label={t("캠페인 목적", "Campaign goal")}
                hint={t("캠페인의 주요 목표를 선택하세요. (복수 선택 가능)", "Pick the main goals. (multiple allowed)")}
              >
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {GOALS.map((goal) => (
                    <OptionCard key={goal.key} option={goal} active={goals.includes(goal.key)} onToggle={() => toggleGoal(goal.key)} t={t} />
                  ))}
                </div>
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
            </div>
          </section>

          {/* 02 — 필수 결과물 · 요구사항 */}
          <section className="rounded-2xl border border-line bg-surface p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
            <SectionHead no="02" title={t("필수 결과물 · 요구사항", "Deliverables · Requirements")} />
            <div className="space-y-5">
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
            </div>
          </section>

          {/* 03 — 브랜드 톤앤매너 */}
          <section className="rounded-2xl border border-line bg-surface p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
            <SectionHead no="03" title={t("브랜드 톤앤매너", "Brand tone & manner")} />
            <Field
              label={t("추구하는 분위기", "Preferred mood")}
              optionalLabel={t("(선택)", "(optional)")}
              hint={t("브랜드가 추구하는 분위기를 선택하세요.", "Pick the mood your brand is going for.")}
            >
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                {TONES.map((option) => (
                  <OptionCard
                    key={option.key}
                    option={option}
                    active={tone === option.key}
                    onToggle={() => setTone((prev) => (prev === option.key ? null : option.key))}
                    t={t}
                  />
                ))}
              </div>
            </Field>
          </section>

          {/* 04 — 보상 · 모집 */}
          <section className="rounded-2xl border border-line bg-surface p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
            <SectionHead no="04" title={t("보상 · 모집", "Reward · Recruitment")} />
            <div className="space-y-5">
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
                  {/* 킷 스테퍼 [- n +] */}
                  <div className="flex h-11 items-stretch overflow-hidden rounded-[10px] border border-line bg-surface transition-[border-color,box-shadow] focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary-bg">
                    <button
                      type="button"
                      aria-label={t("인원 줄이기", "Decrease")}
                      onClick={() => stepParticipants(-1)}
                      className="grid w-11 flex-shrink-0 place-items-center border-r border-line text-content-soft transition-colors hover:bg-surface-chip hover:text-primary"
                    >
                      <Minus className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <input
                      id="maxParticipants"
                      type="number"
                      min={1}
                      required
                      value={maxParticipants}
                      onChange={(e) => setMaxParticipants(e.target.value)}
                      className="w-full min-w-0 border-0 bg-transparent text-center text-sm font-bold text-foreground outline-none tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      aria-label={t("인원 늘리기", "Increase")}
                      onClick={() => stepParticipants(1)}
                      className="grid w-11 flex-shrink-0 place-items-center border-l border-line text-content-soft transition-colors hover:bg-surface-chip hover:text-primary"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
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
                <div className="flex items-center gap-3">
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
            </div>
          </section>

          {/* 버튼 영역 — 킷 09 */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-muted">
              {t("선택한 목적·톤·결과물은 캠페인 설명과 요구사항에 함께 저장됩니다.", "Selected goals, tone, and deliverables are saved into the brief text.")}
            </p>
            <Button type="submit" size="lg" loading={loading} className="flex-shrink-0">
              {loading ? t("등록 중...", "Creating...") : t("캠페인 등록", "Create campaign")}
            </Button>
          </div>
        </form>

        {/* 입력 도움말 — 킷 사이드 패널 */}
        <aside className="hidden xl:block">
          <div className="sticky top-24 rounded-2xl border border-line bg-surface p-5 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
            <h2 className="text-sm font-extrabold text-foreground">{t("입력 도움말", "Writing tips")}</h2>
            <ul className="mt-4 space-y-4">
              {[
                { ko: "캠페인 제목은 80자 이내로 명확하고 간결하게 작성해 주세요.", en: "Keep the title clear and under 80 characters." },
                { ko: "목적은 캠페인 성과와 매칭 기준이 됩니다. 가장 중요한 목표를 선택하세요.", en: "Goals guide matching and reporting — pick what matters most." },
                { ko: "보상은 크리에이터 매칭과 지원율에 직접 영향을 줍니다.", en: "The reward directly affects matching and application rates." },
                { ko: "정확한 마감일 설정은 일정 관리에 도움이 됩니다.", en: "An accurate deadline helps everyone plan." },
                { ko: "상세한 브리프는 더 좋은 매칭과 콘텐츠로 이어집니다.", en: "A detailed brief leads to better matches and content." },
              ].map((tip) => (
                <li key={tip.ko} className="flex gap-2.5 text-xs leading-relaxed text-content-soft">
                  <Check aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" strokeWidth={3} />
                  {t(tip.ko, tip.en)}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
