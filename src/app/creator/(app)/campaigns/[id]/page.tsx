"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { trackEvent } from "@/lib/gtag";
import { useLang } from "@/lib/i18n";
import ApplicationStatusBadge from "@/components/campaign/ApplicationStatusBadge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

type AppStatus = "PENDING" | "WITHDRAWN" | "APPROVED" | "REJECTED" | "SUBMITTED" | "SETTLED";

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
  myApplication: {
    id: number;
    status: AppStatus;
    appliedAt: string;
    submissionUrl: string | null;
  } | null;
}

const TEXTAREA_CLASS =
  "block w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-foreground placeholder-faint transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export default function CreatorCampaignDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, lang } = useLang();
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    api
      .get(`/campaigns/${id}`)
      .then((res) => setCampaign(res.data))
      .catch(() => router.push("/creator/campaigns"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleApply = async () => {
    setError("");
    setApplying(true);
    const campaignId = Number(id);
    trackEvent("campaign_apply_submit", { campaign_id: campaignId });
    try {
      await api.post(`/campaigns/${id}/apply`, { message: message.trim() || null });
      trackEvent("campaign_apply_success", { campaign_id: campaignId });
      router.push("/creator/applications");
    } catch (err: unknown) {
      const response = (err as { response?: { status?: number; data?: { message?: string } } })
        .response;
      const msg = response?.data?.message || t("지원에 실패했습니다", "Failed to apply");
      setError(msg);
      trackEvent("campaign_apply_fail", {
        campaign_id: campaignId,
        status: response?.status ?? 0,
      });
    } finally {
      setApplying(false);
    }
  };

  if (loading || !campaign) {
    return <p className="px-6 py-10 text-muted">{t("불러오는 중...", "Loading...")}</p>;
  }

  const locale = lang === "en" ? "en-US" : "ko-KR";

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => router.push("/creator/campaigns")}
        className="mb-6 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        &larr; {t("캠페인 목록으로", "Back to campaigns")}
      </button>

      {campaign.thumbnailUrl && (
        <div className="mb-8 aspect-video overflow-hidden rounded-2xl bg-surface-chip">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={campaign.thumbnailUrl}
            alt={campaign.title}
            className="h-full w-full object-contain"
          />
        </div>
      )}

      <div className="mb-2 flex items-center gap-2">
        <p className="text-sm font-medium text-muted">{campaign.brandName}</p>
        {campaign.myApplication && (
          <ApplicationStatusBadge status={campaign.myApplication.status} />
        )}
      </div>
      <h1 className="mb-6 text-3xl font-black tracking-[-0.03em] text-foreground md:text-4xl">
        {campaign.title}
      </h1>

      <div className="mb-8 grid grid-cols-3 gap-3">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted">{t("보상", "Reward")}</p>
          <p className="mt-1 font-bold tracking-tight text-foreground">
            ₩{campaign.rewardAmount.toLocaleString(locale)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted">{t("마감일", "Deadline")}</p>
          <p className="mt-1 font-bold tracking-tight text-foreground">
            {campaign.deadline
              ? new Date(campaign.deadline).toLocaleDateString(locale)
              : "-"}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted">{t("지원 현황", "Applicants")}</p>
          <p className="mt-1 font-bold tracking-tight text-foreground">
            {campaign.applicationCount} / {campaign.maxParticipants}
          </p>
        </Card>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-foreground">{t("설명", "Description")}</h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-content-soft">
          {campaign.description}
        </p>
      </section>

      {campaign.requirements && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-foreground">{t("요구사항", "Requirements")}</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-content-soft">
            {campaign.requirements}
          </p>
        </section>
      )}

      {/* 지원 섹션 */}
      {campaign.myApplication ? (
        <Card className="bg-surface-muted">
          <p className="mb-2 text-sm font-medium text-muted">{t("지원 현황", "Application status")}</p>
          <div className="mb-3 flex items-center gap-2">
            <ApplicationStatusBadge status={campaign.myApplication.status} />
            <span className="text-sm text-content-soft">
              {t(
                `${new Date(campaign.myApplication.appliedAt).toLocaleDateString(locale)} 지원`,
                `Applied on ${new Date(campaign.myApplication.appliedAt).toLocaleDateString(locale)}`,
              )}
            </span>
          </div>
          <p className="text-sm text-muted">
            {t("상세 진행은 ", "Track the details on the ")}
            <a
              href="/creator/applications"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {t("내 지원 현황", "My applications")}
            </a>
            {t(" 페이지에서 확인할 수 있어요.", " page.")}
          </p>
        </Card>
      ) : campaign.status === "OPEN" ? (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-foreground">{t("이 캠페인에 지원하기", "Apply to this campaign")}</h2>
          <label htmlFor="message" className="block text-sm font-medium text-content-soft">
            {t("지원 메시지", "Application message")} <span className="text-faint">{t("(선택)", "(optional)")}</span>
          </label>
          <textarea
            id="message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t(
              "어떤 스타일의 영상을 만들 계획인지 간단히 소개해주세요.",
              "Briefly describe the style of video you plan to create.",
            )}
            className={`${TEXTAREA_CLASS} mt-1.5`}
          />
          {error && <p className="mt-2 text-sm text-error">{error}</p>}
          <Button onClick={handleApply} disabled={applying} fullWidth className="mt-5">
            {applying ? t("지원 중...", "Applying...") : t("지원하기", "Apply")}
          </Button>
          <p className="mt-3 text-xs text-muted">
            {t(
              "관리자 검토 후 승인되면 영상 제작을 시작할 수 있어요.",
              "Once approved after admin review, you can start creating your video.",
            )}
          </p>
        </Card>
      ) : (
        <Card className="bg-surface-muted text-sm text-muted">
          {t("이 캠페인은 모집이 종료되었습니다.", "Recruiting for this campaign has ended.")}
        </Card>
      )}
    </div>
  );
}
