"use client";

import { Coins, CalendarClock, Users, UserCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLang } from "@/lib/i18n";
import type { FeaturedCampaign } from "@/types/landing";

interface Props {
  campaign: FeaturedCampaign;
  onOpen: (campaign: FeaturedCampaign) => void;
}

/** 마감까지 남은 '달력 일수'. deadline 이 없으면 상시모집으로 표기. */
function deadlineLabel(deadline: string | null, t: (ko: string, en: string) => string): string {
  if (!deadline) return t("상시모집", "Always open");
  const end = new Date(deadline);
  end.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "D-day";
  return `D-${days}`;
}

function InfoCell({
  icon: Icon,
  value,
  highlight = false,
}: {
  icon: LucideIcon;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-3 py-2.5 ${
        highlight ? "bg-primary/10 text-primary" : "bg-surface-muted text-content-soft"
      }`}
    >
      <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
      <span className="truncate text-sm font-semibold">{value}</span>
    </div>
  );
}

export default function FeaturedCampaignCard({ campaign, onOpen }: Props) {
  const { t } = useLang();
  const initial = campaign.brandName.trim().charAt(0) || "?";

  return (
    <button
      type="button"
      onClick={() => onOpen(campaign)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
    >
      {/* 배너 + 오버랩 원형 이니셜 아바타 */}
      <div className="relative">
        <div className="aspect-video w-full overflow-hidden bg-surface-chip">
          {campaign.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={campaign.thumbnailUrl}
              alt={campaign.title}
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-faint">
              {t("썸네일 없음", "No thumbnail")}
            </div>
          )}
        </div>
        <div className="absolute -bottom-7 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-primary/10 text-lg font-bold text-primary">
          {campaign.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={campaign.logoUrl}
              alt={`${campaign.brandName} ${t("로고", "logo")}`}
              className="h-full w-full object-cover"
            />
          ) : (
            initial
          )}
        </div>
      </div>

      {/* 제목 · 브랜드명 */}
      <div className="px-5 pt-10 pb-5">
        <h3 className="line-clamp-2 text-center text-lg font-bold text-foreground">
          {campaign.title}
        </h3>
        <p className="mt-1 text-center text-sm font-medium text-muted">{campaign.brandName}</p>

        {/* 2x2 정보 그리드 */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <InfoCell
            icon={Coins}
            value={`₩${campaign.rewardAmount.toLocaleString("ko-KR")}`}
            highlight
          />
          <InfoCell icon={CalendarClock} value={deadlineLabel(campaign.deadline, t)} />
          <InfoCell
            icon={Users}
            value={t(`모집 ${campaign.maxParticipants}`, `${campaign.maxParticipants} slots`)}
          />
          <InfoCell
            icon={UserCheck}
            value={t(`지원 ${campaign.applicationCount}`, `${campaign.applicationCount} applied`)}
          />
        </div>

        {/* 하단 CTA (시각용 — 클릭은 카드 전체가 처리) */}
        <div className="mt-5 w-full rounded-full bg-surface-muted py-3 text-center text-sm font-semibold text-content-soft transition-colors group-hover:bg-primary group-hover:text-white">
          {t("회사 정보 보기", "View company")}
        </div>
      </div>
    </button>
  );
}
