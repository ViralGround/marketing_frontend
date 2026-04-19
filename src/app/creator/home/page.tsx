"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";
import StatCards from "@/components/creator/StatCards";
import ApplicationStatusBadge from "@/components/campaign/ApplicationStatusBadge";

type AppStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUBMITTED" | "SETTLED";

interface RecentApplication {
  id: number;
  status: AppStatus;
  appliedAt: string;
  rewardPaidAmount: number | null;
  campaign: {
    id: number;
    title: string;
    brandName: string;
    thumbnailUrl: string | null;
    rewardAmount: number;
  };
}

interface StatsResponse {
  totalEarned: number;
  completedCount: number;
  activeCount: number;
  recentApplications: RecentApplication[];
}

export default function CreatorHomePage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<StatsResponse>("/me/stats")
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm text-gray-500">환영합니다</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          {user?.name ?? "크리에이터"} 님, 오늘도 좋은 콘텐츠를 만들어봐요.
        </h1>
      </div>

      {/* 스탯 카드 */}
      <div className="mb-10">
        {loading || !stats ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : (
          <StatCards
            totalEarned={stats.totalEarned}
            completedCount={stats.completedCount}
            activeCount={stats.activeCount}
          />
        )}
      </div>

      {/* 빠른 이동 */}
      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          href="/creator/campaigns"
          className="group rounded-xl border border-gray-200 p-6 transition hover:border-gray-400 hover:shadow-sm"
        >
          <h2 className="mb-1 text-lg font-semibold text-gray-900">캠페인 탐색</h2>
          <p className="text-sm text-gray-500">참여 가능한 새 광고 보기</p>
          <p className="mt-4 text-sm text-primary group-hover:underline">
            탐색하기 →
          </p>
        </Link>
        <Link
          href="/creator/applications"
          className="group rounded-xl border border-gray-200 p-6 transition hover:border-gray-400 hover:shadow-sm"
        >
          <h2 className="mb-1 text-lg font-semibold text-gray-900">내 지원 현황</h2>
          <p className="text-sm text-gray-500">승인·제출·정산 상태 확인</p>
          <p className="mt-4 text-sm text-primary group-hover:underline">
            확인하기 →
          </p>
        </Link>
        <Link
          href="/profile/setup"
          className="group rounded-xl border border-gray-200 p-6 transition hover:border-gray-400 hover:shadow-sm"
        >
          <h2 className="mb-1 text-lg font-semibold text-gray-900">프로필 관리</h2>
          <p className="text-sm text-gray-500">활동 정보와 채널 업데이트</p>
          <p className="mt-4 text-sm text-primary group-hover:underline">
            수정하기 →
          </p>
        </Link>
      </div>

      {/* 최근 지원 */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">최근 지원</h2>
          <Link
            href="/creator/applications"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            전체 보기 →
          </Link>
        </div>
        {loading || !stats ? (
          <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
        ) : stats.recentApplications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
            아직 지원한 캠페인이 없어요.{" "}
            <Link href="/creator/campaigns" className="text-primary underline">
              첫 캠페인 탐색하기
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.recentApplications.map((a) => (
              <Link
                key={a.id}
                href={`/creator/campaigns/${a.campaign.id}`}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition hover:border-gray-400"
              >
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded bg-gray-100">
                  {a.campaign.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.campaign.thumbnailUrl}
                      alt={a.campaign.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">{a.campaign.brandName}</p>
                  <p className="truncate text-sm font-medium text-gray-900">
                    {a.campaign.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <ApplicationStatusBadge status={a.status} />
                    <span>{new Date(a.appliedAt).toLocaleDateString("ko-KR")}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
