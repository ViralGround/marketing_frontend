"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import CampaignCard from "@/components/campaign/CampaignCard";
import ApplicationStatusBadge from "@/components/campaign/ApplicationStatusBadge";

type AppStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUBMITTED" | "SETTLED";
type SortKey = "recent" | "reward" | "deadline";

interface CampaignItem {
  id: number;
  title: string;
  brandName: string;
  rewardAmount: number;
  thumbnailUrl: string | null;
  deadline: string | null;
  maxParticipants: number;
  createdAt: string;
  applicationCount: number;
  myApplication: { id: number; status: AppStatus } | null;
}

const SORT_LABEL: Record<SortKey, string> = {
  recent: "최신순",
  reward: "보상 높은 순",
  deadline: "마감 임박순",
};

const NEW_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;
const URGENT_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

export default function CreatorHomePage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("recent");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("sort", sort);
    if (search) params.set("search", search);

    api
      .get(`/campaigns?${params.toString()}`)
      .then((res) => setCampaigns(res.data.campaigns))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sort, search]);

  const changeSort = (s: SortKey) => {
    setLoading(true);
    setSort(s);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearch(searchInput.trim());
  };

  const [now] = useState(() => Date.now());

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <p className="text-sm text-muted">참여 가능한 캠페인</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">
          지금 모집 중인 캠페인
        </h1>
      </div>

      {/* 정렬 + 검색 */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {(["recent", "reward", "deadline"] as SortKey[]).map((s) => (
            <button
              key={s}
              onClick={() => changeSort(s)}
              className={`rounded px-3 py-1.5 text-sm ${
                sort === s
                  ? "bg-gray-900 text-white"
                  : "border border-line-strong text-muted hover:bg-surface-muted"
              }`}
            >
              {SORT_LABEL[s]}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="캠페인 제목·브랜드 검색"
            className="rounded border border-line-strong px-3 py-1.5 text-sm text-foreground placeholder-faint focus:border-gray-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700"
          >
            검색
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setSearchInput("");
                setSearch("");
              }}
              className="text-sm text-muted hover:text-foreground"
            >
              초기화
            </button>
          )}
        </form>
      </div>

      {loading ? (
        <p className="text-muted">불러오는 중...</p>
      ) : campaigns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line-strong p-12 text-center">
          <p className="text-muted">
            {search
              ? `"${search}" 로 검색된 캠페인이 없습니다.`
              : "현재 모집 중인 캠페인이 없습니다."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => {
            const createdMs = new Date(c.createdAt).getTime();
            const isNew = now - createdMs < NEW_WINDOW_MS;
            const deadlineMs = c.deadline ? new Date(c.deadline).getTime() : null;
            const isUrgent =
              deadlineMs !== null &&
              deadlineMs >= now &&
              deadlineMs - now <= URGENT_WINDOW_MS;
            return (
              <CampaignCard
                key={c.id}
                href={`/creator/campaigns/${c.id}`}
                title={c.title}
                brandName={c.brandName}
                rewardAmount={c.rewardAmount}
                thumbnailUrl={c.thumbnailUrl}
                deadline={c.deadline}
                isNew={isNew}
                isUrgent={isUrgent}
                rightSlot={
                  c.myApplication ? (
                    <ApplicationStatusBadge status={c.myApplication.status} />
                  ) : (
                    <span className="text-xs text-muted">
                      지원 {c.applicationCount} / {c.maxParticipants}
                    </span>
                  )
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
