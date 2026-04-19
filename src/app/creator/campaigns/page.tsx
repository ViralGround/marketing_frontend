"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import CampaignCard from "@/components/campaign/CampaignCard";
import ApplicationStatusBadge from "@/components/campaign/ApplicationStatusBadge";

type AppStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUBMITTED" | "SETTLED";

interface CampaignItem {
  id: number;
  title: string;
  brandName: string;
  rewardAmount: number;
  thumbnailUrl: string | null;
  deadline: string | null;
  maxParticipants: number;
  applicationCount: number;
  myApplication: { id: number; status: AppStatus } | null;
}

export default function CreatorCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/campaigns")
      .then((res) => setCampaigns(res.data.campaigns))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <p className="text-sm text-gray-500">참여 가능한 캠페인</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          지금 모집 중인 캠페인
        </h1>
      </div>

      {loading ? (
        <p className="text-gray-500">불러오는 중...</p>
      ) : campaigns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">현재 모집 중인 캠페인이 없습니다.</p>
          <p className="mt-1 text-sm text-gray-400">새 캠페인이 열리면 이메일로 알려드릴게요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <CampaignCard
              key={c.id}
              href={`/creator/campaigns/${c.id}`}
              title={c.title}
              brandName={c.brandName}
              rewardAmount={c.rewardAmount}
              thumbnailUrl={c.thumbnailUrl}
              deadline={c.deadline}
              rightSlot={
                c.myApplication ? (
                  <ApplicationStatusBadge status={c.myApplication.status} />
                ) : (
                  <span className="text-xs text-gray-500">
                    지원 {c.applicationCount} / {c.maxParticipants}
                  </span>
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
