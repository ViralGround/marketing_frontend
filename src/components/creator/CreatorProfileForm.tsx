"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { useLang } from "@/lib/i18n";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/workspace/PageHeader";
import { StatePanel, StateSkeleton, WorkspacePage, WorkspaceScrollArea, WorkspaceStage } from "@/components/workspace/WorkspacePrimitives";
import viewStyles from "@/components/workspace/WorkspaceViews.module.css";

type EditingSkill = "HIGH" | "MEDIUM" | "LOW";
type LoadStatus = "loading" | "ready" | "error";
interface CreatorProfile { canEdit: boolean | null; editingSkill: EditingSkill | null; faceExposure: boolean | null; profileImage: string | null; instagramId: string | null; publicProfileOptIn: boolean }
interface ProfileResponse { hasProfile: boolean; profile?: Partial<CreatorProfile> }

const EDITING_SKILLS: Array<{ value: EditingSkill; ko: string; en: string }> = [
  { value: "HIGH", ko: "상", en: "High" }, { value: "MEDIUM", ko: "중", en: "Medium" }, { value: "LOW", ko: "하", en: "Low" },
];

export default function CreatorProfileForm({ mode = "workspace" }: { mode?: "workspace" | "onboarding" }) {
  const router = useRouter();
  const { t } = useLang();
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [canEdit, setCanEdit] = useState<boolean | null>(null);
  const [editingSkill, setEditingSkill] = useState<EditingSkill | "">("");
  const [faceExposure, setFaceExposure] = useState<boolean | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [instagramId, setInstagramId] = useState("");
  const [publicProfileOptIn, setPublicProfileOptIn] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    api.get<ProfileResponse>("/profile", { signal: controller.signal })
      .then(({ data }) => {
        if (!active) return;
        const profile = data.hasProfile ? data.profile : undefined;
        if (profile) {
          setCanEdit(typeof profile.canEdit === "boolean" ? profile.canEdit : null);
          setEditingSkill(profile.editingSkill && EDITING_SKILLS.some(({ value }) => value === profile.editingSkill) ? profile.editingSkill : "");
          setFaceExposure(typeof profile.faceExposure === "boolean" ? profile.faceExposure : null);
          setProfileImage(typeof profile.profileImage === "string" && profile.profileImage ? profile.profileImage : null);
          setInstagramId(typeof profile.instagramId === "string" ? profile.instagramId : "");
          setPublicProfileOptIn(profile.publicProfileOptIn === true);
        }
        setLoadStatus("ready");
      })
      .catch(() => { if (active) setLoadStatus("error"); });
    return () => { active = false; controller.abort(); };
  }, [loadAttempt]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (canEdit === null) { setError(t("편집 가능 여부를 선택해주세요.", "Please select whether you can edit.")); return; }
    if (!editingSkill) { setError(t("편집 실력을 선택해주세요.", "Please select your editing skill level.")); return; }
    if (faceExposure === null) { setError(t("얼굴 공개 가능 여부를 선택해주세요.", "Please select whether you can show your face.")); return; }
    setSaving(true);
    try {
      await api.post("/profile", { canEdit, editingSkill, faceExposure, profileImage, instagramId: instagramId.trim() || null, publicProfileOptIn });
      router.push("/creator/dashboard");
    } catch {
      setError(t("프로필 저장에 실패했습니다. 입력 내용은 유지되니 다시 시도해주세요.", "We couldn't save your profile. Your entries are preserved, so please try again."));
    } finally { setSaving(false); }
  };

  const retryLoad = () => { setLoadStatus("loading"); setLoadAttempt((attempt) => attempt + 1); };
  const fields = (
    <>
      {error && <p role="alert" className="border-y-2 border-error bg-error/5 px-4 py-3 text-sm font-semibold text-error">{error}</p>}
      <div className="grid gap-6 md:grid-cols-2">
        <fieldset><legend className="mb-3 text-base font-bold text-foreground">{t("영상 편집이 가능한가요?", "Can you edit videos?")}</legend><div className="grid grid-cols-2 gap-3"><ChoiceButton selected={canEdit === true} disabled={saving} onClick={() => setCanEdit(true)}>{t("예", "Yes")}</ChoiceButton><ChoiceButton selected={canEdit === false} disabled={saving} onClick={() => setCanEdit(false)}>{t("아니요", "No")}</ChoiceButton></div></fieldset>
        <fieldset><legend className="mb-3 text-base font-bold text-foreground">{t("편집 실력은 어느 정도인가요?", "How would you rate your editing skill?")}</legend><div className="grid grid-cols-3 gap-3">{EDITING_SKILLS.map((option) => <ChoiceButton key={option.value} selected={editingSkill === option.value} disabled={saving} onClick={() => setEditingSkill(option.value)}>{t(option.ko, option.en)}</ChoiceButton>)}</div></fieldset>
        <fieldset><legend className="mb-1 text-base font-bold text-foreground">{t("얼굴 공개가 가능한가요?", "Are you able to show your face?")}</legend><p className="mb-3 text-sm text-muted">{t("캠페인의 얼굴 공개 조건과 지원 가능 여부를 확인할 때 사용합니다.", "Used to determine whether you match on-camera requirements.")}</p><div className="grid grid-cols-2 gap-3"><ChoiceButton selected={faceExposure === true} disabled={saving} onClick={() => setFaceExposure(true)}>{t("예", "Yes")}</ChoiceButton><ChoiceButton selected={faceExposure === false} disabled={saving} onClick={() => setFaceExposure(false)}>{t("아니요", "No")}</ChoiceButton></div></fieldset>
        <div><label htmlFor="instagram" className="block text-base font-bold text-foreground">{t("인스타그램 아이디", "Instagram handle")} <span className="font-medium text-muted">{t("(선택)", "(optional)")}</span></label><p id="instagram-hint" className="mt-1 text-sm text-muted">{t("운영 중인 계정이 있다면 @ 없이 입력해주세요.", "Enter your handle without @.")}</p><div className="mt-3 flex items-center border-b-2 border-foreground bg-surface px-3 focus-within:border-primary"><span className="mr-1 text-base font-bold text-primary" aria-hidden="true">@</span><Input id="instagram" value={instagramId} onChange={(event) => setInstagramId(event.target.value)} aria-describedby="instagram-hint" disabled={saving} autoComplete="off" placeholder="instagram_id" className="min-h-11 rounded-none border-0 bg-transparent px-1 text-base focus:border-0 focus:ring-0" /></div></div>
      </div>
      <fieldset className="border-y-2 border-foreground py-5"><legend className="px-2 text-lg font-bold text-foreground">{t("공개 프로필", "Public profile")}</legend><label className={`mt-1 flex min-h-11 cursor-pointer items-start gap-3 p-4 ${publicProfileOptIn ? "bg-primary-bg" : "bg-surface"}`}><input type="checkbox" name="publicProfileOptIn" checked={publicProfileOptIn} onChange={(event) => setPublicProfileOptIn(event.target.checked)} aria-describedby="public-profile-details public-profile-optional" disabled={saving} className="mt-0.5 h-5 w-5 shrink-0 accent-primary" /><span className="text-base font-bold leading-relaxed text-foreground">{t("공개 크리에이터 풀에 내 프로필 노출", "Show my profile in the public creator pool")} <span className="font-medium text-muted">{t("(선택)", "(optional)")}</span></span></label><div id="public-profile-details" className="mt-4 grid gap-2 text-sm leading-relaxed text-content-soft"><p>{t("동의하면 표시 이름과 완료한 작업 이력, 집계 성과, 브랜드가 남긴 공개 리뷰가 비로그인 크리에이터 풀과 상세 페이지에 공개됩니다.", "If you agree, your display name, completed-work history, aggregate performance, and public reviews appear in the public creator pool.")}</p><p className="font-semibold text-foreground">{t("연락처와 제출 파일은 공개되지 않습니다.", "Your contact details and submitted files are never public.")}</p><p>{t("언제든 체크를 해제하고 저장하면 목록·상세·리뷰가 즉시 숨겨집니다.", "You can withdraw at any time by clearing this checkbox and saving.")}</p></div><p id="public-profile-optional" className="mt-4 bg-primary px-4 py-3 text-sm font-bold leading-relaxed text-white">{t("동의하지 않아도 프로필 저장과 캠페인 참여가 가능합니다.", "You can save your profile and join campaigns without opting in.")}</p></fieldset>
    </>
  );

  if (mode === "workspace") {
    if (loadStatus === "loading") return <WorkspacePage flow={false}><StateSkeleton label={t("프로필 불러오는 중", "Loading profile")} /></WorkspacePage>;
    if (loadStatus === "error") return <WorkspacePage flow={false}><StatePanel tone="error" title={t("프로필을 불러오지 못했습니다.", "We couldn't load your profile.")} description={t("기존 정보를 보호하기 위해 빈 폼을 열지 않았습니다.", "We did not open an empty form to protect your existing details.")} action={<Button onClick={retryLoad}>{t("다시 불러오기", "Load again")}</Button>} /></WorkspacePage>;
    return <WorkspacePage size="standard" flow={false}><WorkspaceStage className={viewStyles.pageStage} header={<PageHeader display="CREATOR PROFILE" subtitle={t("캠페인 매칭 정보와 공개 프로필 노출 여부를 관리하세요.", "Manage campaign matching details and public profile visibility.")} />} footer={<div className={viewStyles.formActions}><Link href="/creator/mypage" className="inline-flex h-11 items-center text-sm font-bold text-muted">{t("취소", "Cancel")}</Link><Button type="submit" form="creator-profile-form" loading={saving}>{t("프로필 저장", "Save profile")}</Button></div>}><WorkspaceScrollArea padded label={t("크리에이터 프로필 폼", "Creator profile form")}><form id="creator-profile-form" onSubmit={handleSubmit} aria-busy={saving} className="grid gap-6">{fields}</form></WorkspaceScrollArea></WorkspaceStage></WorkspacePage>;
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-paper px-5 py-8 text-ink md:px-10 md:py-14">
      <div className="mx-auto w-full max-w-3xl">
        <Link href="/creator/mypage" className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-ink underline decoration-violet decoration-2 underline-offset-4"><ArrowLeft className="h-4 w-4" aria-hidden="true" />{t("마이페이지로", "Back to my page")}</Link>
        <header className="border-b-2 border-ink pb-7"><h1 className="font-display text-[clamp(2.6rem,9vw,5.5rem)] leading-[0.86] tracking-[-0.03em] text-ink" aria-label={t("크리에이터 프로필 설정", "Creator profile settings")}>CREATOR<br />PROFILE</h1><p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-ink/75">{t("캠페인 매칭에 필요한 활동 정보를 관리하고, 공개 프로필 노출 여부를 직접 선택하세요.", "Manage the details used for campaign matching and public visibility.")}</p></header>
        {loadStatus === "loading" && <div role="status" aria-live="polite" className="flex min-h-64 items-center justify-center border-b-2 border-ink text-sm font-bold text-ink/70">{t("기존 프로필을 불러오는 중...", "Loading your existing profile...")}</div>}
        {loadStatus === "error" && <div role="alert" className="my-8 border-y-2 border-ink bg-violet-soft/55 px-5 py-6"><h2 className="text-lg font-bold text-ink">{t("프로필을 불러오지 못했습니다.", "We couldn't load your profile.")}</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/75">{t("기존 정보를 보호하기 위해 빈 폼을 열지 않았습니다. 연결 상태를 확인한 뒤 다시 불러와주세요.", "To protect your existing details, we haven't opened an empty form. Check your connection and try again.")}</p><Button type="button" onClick={retryLoad} className="mt-5 min-h-11">{t("다시 불러오기", "Load again")}</Button></div>}
        {loadStatus === "ready" && <form onSubmit={handleSubmit} aria-busy={saving} className="grid gap-8 py-8">{fields}<Button type="submit" loading={saving} fullWidth className="min-h-12">{t("프로필 저장", "Save profile")}</Button></form>}
      </div>
    </div>
  );
}

function ChoiceButton({ selected, disabled, onClick, children }: { selected: boolean; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-pressed={selected} disabled={disabled} onClick={onClick} className={`min-h-11 border-2 px-4 py-2 text-base font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${selected ? "border-primary bg-primary text-white" : "border-foreground bg-surface text-foreground hover:bg-primary-bg"}`}>{children}</button>;
}
