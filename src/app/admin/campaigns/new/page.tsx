"use client";

import CampaignForm from "@/components/admin/CampaignForm";
import BackButton from "@/components/ui/BackButton";
import { useLang } from "@/lib/i18n";

export default function NewCampaignPage() {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-2xl">
      <BackButton href="/admin/campaigns" labelKo="캠페인 목록으로" labelEn="Back to campaigns" />
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground">{t("새 캠페인 생성", "New campaign")}</h1>
      <CampaignForm mode="create" />
    </div>
  );
}
