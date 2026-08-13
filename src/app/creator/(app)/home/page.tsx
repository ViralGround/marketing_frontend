"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import CampaignCard from "@/components/campaign/CampaignCard";
import ApplicationStatusBadge from "@/components/campaign/ApplicationStatusBadge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { useLang } from "@/lib/i18n";

type AppStatus = "PENDING" | "WITHDRAWN" | "APPROVED" | "REJECTED" | "SUBMITTED" | "SETTLED";
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

const SORT_LABEL: Record<SortKey, { ko: string; en: string }> = {
  recent: { ko: "최신순", en: "Latest" },
  reward: { ko: "보상 높은 순", en: "Highest reward" },
  deadline: { ko: "마감 임박순", en: "Deadline soon" },
};

const NEW_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;
const URGENT_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

export default function CreatorHomePage() {
  const { t } = useLang();
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
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
      <div className="mb-8">
        <p className="text-sm font-medium text-muted">{t("참여 가능한 캠페인", "Available campaigns")}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t("지금 모집 중인 캠페인", "Campaigns recruiting now")}
        </h1>
      </div>

      {/* 정렬 + 검색 */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {(["recent", "reward", "deadline"] as SortKey[]).map((s) => {
            const active = sort === s;
            return (
              <button
                key={s}
                onClick={() => changeSort(s)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-white"
                    : "border border-line text-content-soft hover:border-primary/40 hover:text-primary"
                }`}
              >
                {t(SORT_LABEL[s].ko, SORT_LABEL[s].en)}
              </button>
            );
          })}
        </div>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("캠페인 제목·브랜드 검색", "Search by campaign title or brand")}
            className="w-64"
          />
          <Button type="submit" size="sm">
            {t("검색", "Search")}
          </Button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setSearchInput("");
                setSearch("");
              }}
              className="text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {t("초기화", "Reset")}
            </button>
          )}
        </form>
      </div>

      {loading ? (
        <p className="text-muted">{t("불러오는 중...", "Loading...")}</p>
      ) : campaigns.length === 0 ? (
        <Card className="border-dashed bg-surface-muted py-16 text-center">
          <p className="text-muted">
            {search
              ? t(`"${search}" 로 검색된 캠페인이 없습니다.`, `No campaigns found for "${search}".`)
              : t("현재 모집 중인 캠페인이 없습니다.", "No campaigns are recruiting right now.")}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                      {t("지원", "Applied")} {c.applicationCount} / {c.maxParticipants}
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
