"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import ImageUploader from "@/components/ui/ImageUploader";
import CompanyAccountDeletion from "@/components/company/CompanyAccountDeletion";
import MarketingConsentSettings from "@/components/account/MarketingConsentSettings";
import { useLang } from "@/lib/i18n";
import PageHeader from "@/components/workspace/PageHeader";
import {
  StatePanel,
  StateSkeleton,
  WorkspacePage,
  WorkspacePanel,
  WorkspaceScrollArea,
  WorkspaceStage,
  WorkspaceTabPanel,
  WorkspaceTabs,
} from "@/components/workspace/WorkspacePrimitives";
import viewStyles from "@/components/workspace/WorkspaceViews.module.css";

interface ProfileData { companyName: string; industry: string | null; homepage: string | null; introduction: string | null; logoUrl: string | null }
type ProfileTab = "public" | "marketing" | "account";

export default function CompanyProfilePage() {
  const { t } = useLang();
  const [tab, setTab] = useState<ProfileTab>("public");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [industry, setIndustry] = useState("");
  const [homepage, setHomepage] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoKey, setLogoKey] = useState<string | null | undefined>(undefined);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<ProfileData>("/company/profile")
      .then((response) => {
        const data = response.data;
        setCompanyName(data.companyName ?? "");
        setIntroduction(data.introduction ?? "");
        setIndustry(data.industry ?? "");
        setHomepage(data.homepage ?? "");
        setLogoPreview(data.logoUrl);
      })
      .catch(() => setError(t("회사 정보를 불러오지 못했습니다.", "Failed to load company info.")))
      .finally(() => setLoading(false));
    // The initial locale is intentionally captured with the initial request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogoChange = (key: string | null) => { setLogoKey(key); if (key === null) setLogoPreview(null); };
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    const body: Record<string, string> = { introduction, industry, homepage };
    if (logoKey !== undefined) body.logoFileKey = logoKey ?? "";
    api.patch("/company/profile", body)
      .then(() => setMessage(t("회사 정보가 저장되었습니다.", "Company info saved.")))
      .catch(() => setError(t("저장에 실패했습니다. 잠시 후 다시 시도해주세요.", "Failed to save. Please try again shortly.")))
      .finally(() => setSaving(false));
  };

  if (loading) return <WorkspacePage flow={false}><StateSkeleton label={t("브랜드 프로필 불러오는 중", "Loading brand profile")} /></WorkspacePage>;
  if (error && !companyName) return <WorkspacePage flow={false}><StatePanel tone="error" title={error} description={t("잠시 후 페이지를 다시 열어주세요.", "Please reopen this page shortly.")} /></WorkspacePage>;

  const header = (
    <div className={viewStyles.headerStack}>
      <PageHeader display="BRAND SETTINGS" subtitle={t("공개 정보, 마케팅 동의와 계정 설정을 한 화면에서 관리하세요.", "Manage public information, marketing consent, and account settings in one place.")} />
      <WorkspaceTabs label={t("브랜드 설정 메뉴", "Brand settings sections")} value={tab} onChange={setTab} options={[{ value: "public", label: t("공개 정보", "Public information") }, { value: "marketing", label: t("마케팅 동의", "Marketing consent") }, { value: "account", label: t("계정", "Account") }]} />
    </div>
  );

  return (
    <WorkspacePage size="standard" flow={false}>
      <WorkspaceStage className={viewStyles.pageStage} header={header}>
        <WorkspaceTabPanel value="public" activeValue={tab}>
          <form onSubmit={handleSubmit} className={viewStyles.formTab}>
            <div className={viewStyles.formScroll}>
              <WorkspacePanel title={t("크리에이터에게 보이는 정보", "Information shown to creators")} description={t("캠페인을 판단할 때 확인하는 공개 정보입니다.", "Creators review this information when considering a campaign.")}>
                <div className={viewStyles.publicProfileGrid}>
                  <div className={viewStyles.logoField}>
                    <label className="mb-1.5 block text-sm font-semibold text-content-soft">{t("회사 로고", "Company logo")} <span className="text-faint">{t("(선택)", "(optional)")}</span></label>
                    <ImageUploader previewUrl={logoPreview} onChange={handleLogoChange} aspect={1} />
                    <p className="mt-1.5 text-xs text-faint">{t("정사각형 이미지를 권장합니다.", "A square image is recommended.")}</p>
                  </div>
                  <div className={viewStyles.profileFields}>
                    <div className={viewStyles.fieldPair}>
                      <div><label className="mb-1.5 block text-sm font-semibold text-content-soft">{t("회사명", "Company name")}</label><Input value={companyName} disabled /></div>
                      <div><label htmlFor="industry" className="mb-1.5 block text-sm font-semibold text-content-soft">{t("산업", "Industry")}</label><Input id="industry" value={industry} onChange={(event) => setIndustry(event.target.value)} placeholder={t("예: 뷰티, 식음료, 패션", "e.g. Beauty, F&B, Fashion")} /></div>
                    </div>
                    <div><label htmlFor="homepage" className="mb-1.5 block text-sm font-semibold text-content-soft">{t("홈페이지", "Website")}</label><Input id="homepage" type="url" value={homepage} onChange={(event) => setHomepage(event.target.value)} placeholder="https://" /></div>
                    <div><label htmlFor="introduction" className="mb-1.5 block text-sm font-semibold text-content-soft">{t("회사 소개", "Company introduction")}</label><Textarea id="introduction" value={introduction} onChange={(event) => setIntroduction(event.target.value)} rows={4} placeholder={t("회사와 브랜드를 간결하게 소개해주세요.", "Briefly introduce your company and brand.")} /></div>
                  </div>
                </div>
              </WorkspacePanel>
            </div>
            <div className={viewStyles.formActions}><div className={viewStyles.formMessages}>{message && <span className="text-success">{message}</span>}{error && <span className="text-error">{error}</span>}</div><Button type="submit" loading={saving}>{t("공개 정보 저장", "Save public information")}</Button></div>
          </form>
        </WorkspaceTabPanel>

        <WorkspaceTabPanel value="marketing" activeValue={tab}>
          <WorkspaceScrollArea padded label={t("마케팅 동의 설정", "Marketing consent settings")}><MarketingConsentSettings /></WorkspaceScrollArea>
        </WorkspaceTabPanel>

        <WorkspaceTabPanel value="account" activeValue={tab}>
          <WorkspaceScrollArea padded label={t("브랜드 계정 설정", "Brand account settings")}><CompanyAccountDeletion /></WorkspaceScrollArea>
        </WorkspaceTabPanel>
      </WorkspaceStage>
    </WorkspacePage>
  );
}
