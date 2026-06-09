"use client";

import CampaignForm from "@/components/admin/CampaignForm";
import { useLang } from "@/lib/i18n";

export default function NewCampaignPage() {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground">{t("새 캠페인 생성", "New campaign")}</h1>
      <CampaignForm mode="create" />
    </div>
  );
}
