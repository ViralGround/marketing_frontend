"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

type CampaignStatus = "OPEN" | "CLOSED";

interface CampaignItem {
  id: number;
  title: string;
  brandName: string;
  rewardAmount: number;
  thumbnailUrl: string | null;
  deadline: string | null;
  maxParticipants: number;
  status: CampaignStatus;
  applicationCount: number;
  createdAt: string;
}

type Filter = "ALL" | CampaignStatus;

const STATUS_LABEL: Record<CampaignStatus, string> = {
  OPEN: "모집중",
  CLOSED: "마감",
};

const STATUS_CLASS: Record<CampaignStatus, string> = {
  OPEN: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-200 text-gray-700",
};

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== "ALL") params.set("status", filter);
    api
      .get(`/admin/campaigns?${params.toString()}`)
      .then((res) => setCampaigns(res.data.campaigns))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">캠페인 관리</h1>
        <Link
          href="/admin/campaigns/new"
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
        >
          + 새 캠페인
        </Link>
      </div>

      <div className="mb-4 flex gap-1">
        {(["ALL", "OPEN", "CLOSED"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded px-3 py-1.5 text-sm ${
              filter === f
                ? "bg-gray-900 text-white"
                : "border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f === "ALL" ? "전체" : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">불러오는 중...</p>
      ) : campaigns.length === 0 ? (
        <p className="text-gray-500">등록된 캠페인이 없습니다.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">제목</th>
                <th className="px-4 py-3">브랜드</th>
                <th className="px-4 py-3">보상</th>
                <th className="px-4 py-3">지원자</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">마감일</th>
                <th className="px-4 py-3">생성일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <Link href={`/admin/campaigns/${c.id}`} className="hover:underline">
                      {c.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.brandName}</td>
                  <td className="px-4 py-3 text-gray-900">
                    ₩{c.rewardAmount.toLocaleString("ko-KR")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.applicationCount} / {c.maxParticipants}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs ${STATUS_CLASS[c.status]}`}>
                      {STATUS_LABEL[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.deadline ? new Date(c.deadline).toLocaleDateString("ko-KR") : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(c.createdAt).toLocaleDateString("ko-KR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
