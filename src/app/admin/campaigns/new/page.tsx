import CampaignForm from "@/components/admin/CampaignForm";

export default function NewCampaignPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground">새 캠페인 생성</h1>
      <CampaignForm mode="create" />
    </div>
  );
}
