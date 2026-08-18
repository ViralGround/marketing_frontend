"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { trackEvent } from "@/lib/gtag";
import { useLang } from "@/lib/i18n";
import ApplicationStatusBadge from "@/components/campaign/ApplicationStatusBadge";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import BackButton from "@/components/ui/BackButton";
import {
  MetricStrip,
  ResponsiveSheet,
  StateSkeleton,
  WorkspacePage,
  WorkspaceStage,
  WorkspaceTabPanel,
  WorkspaceTabs,
} from "@/components/workspace/WorkspacePrimitives";
import viewStyles from "@/components/workspace/WorkspaceViews.module.css";

type AppStatus = "PENDING" | "WITHDRAWN" | "APPROVED" | "REJECTED" | "SUBMITTED" | "SETTLED";
type DetailTab = "overview" | "requirements";

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
  status: "OPEN" | "CLOSED";
  applicationCount: number;
  myApplication: { id: number; status: AppStatus; appliedAt: string; submissionUrl: string | null } | null;
}

export default function CreatorCampaignDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, lang } = useLang();
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<DetailTab>("overview");
  const [applyOpen, setApplyOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get<CampaignDetail>(`/campaigns/${id}`)
      .then((response) => { if (active) setCampaign(response.data); })
      .catch(() => router.push("/creator/campaigns"))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, router]);

  const handleApply = async () => {
    setError("");
    setApplying(true);
    const campaignId = Number(id);
    trackEvent("campaign_apply_submit", { campaign_id: campaignId });
    try {
      await api.post(`/campaigns/${id}/apply`, { message: message.trim() || null });
      trackEvent("campaign_apply_success", { campaign_id: campaignId });
      router.push("/creator/applications");
    } catch (caught: unknown) {
      const response = (caught as { response?: { status?: number; data?: { message?: string } } }).response;
      setError(response?.data?.message || t("지원에 실패했습니다", "Failed to apply"));
      trackEvent("campaign_apply_fail", { campaign_id: campaignId, status: response?.status ?? 0 });
    } finally {
      setApplying(false);
    }
  };

  if (loading || !campaign) return <WorkspacePage flow={false}><StateSkeleton label={t("캠페인 불러오는 중", "Loading campaign")} /></WorkspacePage>;

  const locale = lang === "en" ? "en-US" : "ko-KR";
  const header = (
    <div className={viewStyles.detailHeader}>
      <BackButton href="/creator/campaigns" labelKo="캠페인 목록으로" labelEn="Back to campaigns" className="!mb-0" />
      <div className={viewStyles.detailTitleRow}><div><p>{campaign.brandName}</p><h1>{campaign.title}</h1></div>{campaign.myApplication && <ApplicationStatusBadge status={campaign.myApplication.status} />}</div>
      <MetricStrip label={t("캠페인 핵심 정보", "Campaign key information")} items={[
        { label: t("보상", "Reward"), value: `₩${campaign.rewardAmount.toLocaleString(locale)}`, tone: "accent" },
        { label: t("마감일", "Deadline"), value: campaign.deadline ? new Date(campaign.deadline).toLocaleDateString(locale) : "—" },
        { label: t("지원 현황", "Applicants"), value: `${campaign.applicationCount} / ${campaign.maxParticipants}` },
      ]} />
      <WorkspaceTabs label={t("캠페인 상세 메뉴", "Campaign detail sections")} value={tab} onChange={setTab} options={[{ value: "overview", label: t("개요", "Overview") }, { value: "requirements", label: t("요구사항", "Requirements") }]} />
    </div>
  );

  const footer = (
    <div className={viewStyles.dockedAction}>
      <p><strong>{campaign.title}</strong>{campaign.myApplication ? t(`${new Date(campaign.myApplication.appliedAt).toLocaleDateString(locale)} 지원`, `Applied ${new Date(campaign.myApplication.appliedAt).toLocaleDateString(locale)}`) : t("지원 메시지는 다음 시트에서 선택적으로 작성합니다.", "Add an optional message in the next sheet.")}</p>
      <div className={viewStyles.dockedActionButtons}>
        {campaign.myApplication ? <Link href="/creator/applications" className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-white">{t("내 지원 현황", "My applications")}</Link> : campaign.status === "OPEN" ? <Button onClick={() => setApplyOpen(true)}>{t("이 캠페인에 지원", "Apply to campaign")}</Button> : <Button disabled>{t("모집 종료", "Recruiting closed")}</Button>}
      </div>
    </div>
  );

  return (
    <WorkspacePage size="standard" flow={false}>
      <WorkspaceStage className={viewStyles.pageStage} header={header} footer={footer}>
        <WorkspaceTabPanel value="overview" activeValue={tab} className={viewStyles.detailContent}>
          <div className={viewStyles.detailOverview}>
            <div className={viewStyles.detailMedia}>{campaign.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={campaign.thumbnailUrl} alt={campaign.title} />
            ) : <div className={viewStyles.detailMediaFallback}>VIRAL GROUND</div>}</div>
            <div className={viewStyles.detailCopy}>{campaign.description}</div>
          </div>
        </WorkspaceTabPanel>
        <WorkspaceTabPanel value="requirements" activeValue={tab} className={viewStyles.detailContent}>
          <div className={viewStyles.detailCopy}>{campaign.requirements || t("별도로 등록된 요구사항이 없습니다.", "No additional requirements were provided.")}</div>
        </WorkspaceTabPanel>
      </WorkspaceStage>

      <ResponsiveSheet open={applyOpen} onClose={() => setApplyOpen(false)} title={t("캠페인 지원", "Apply to campaign")} description={campaign.title} label={t("지원 시트 닫기", "Close application sheet")} size="compact">
        <div className="grid gap-4"><div><label htmlFor="application-message" className="mb-1.5 block text-sm font-semibold text-content-soft">{t("지원 메시지", "Application message")} <span className="text-faint">{t("(선택)", "(optional)")}</span></label><Textarea id="application-message" rows={5} value={message} onChange={(event) => setMessage(event.target.value)} placeholder={t("어떤 스타일의 영상을 만들 계획인지 간단히 소개해주세요.", "Briefly describe the style of video you plan to create.")} /></div>{error && <p role="alert" className="text-sm font-medium text-error">{error}</p>}<p className="text-xs leading-relaxed text-muted">{t("관리자 검토 후 승인되면 영상 제작을 시작할 수 있습니다.", "You can begin production after admin review and approval.")}</p><Button onClick={handleApply} loading={applying} fullWidth>{t("지원 제출", "Submit application")}</Button></div>
      </ResponsiveSheet>
    </WorkspacePage>
  );
}
