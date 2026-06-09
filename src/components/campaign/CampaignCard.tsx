"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { useLang } from "@/lib/i18n";

interface CampaignCardProps {
  href: string;
  title: string;
  brandName: string;
  rewardAmount: number;
  thumbnailUrl?: string | null;
  deadline?: string | Date | null;
  isNew?: boolean;
  isUrgent?: boolean;
  rightSlot?: React.ReactNode;
}

export default function CampaignCard({
  href,
  title,
  brandName,
  rewardAmount,
  thumbnailUrl,
  deadline,
  isNew,
  isUrgent,
  rightSlot,
}: CampaignCardProps) {
  const { t, lang } = useLang();
  const deadlineText = deadline
    ? new Date(deadline).toLocaleDateString(lang === "en" ? "en-US" : "ko-KR", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-surface-chip">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-faint">
            {t("썸네일 없음", "No thumbnail")}
          </div>
        )}

        {/* 뱃지 */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {isNew && <Badge tone="info">NEW</Badge>}
          {isUrgent && <Badge tone="error">{t("마감 임박", "Deadline soon")}</Badge>}
        </div>
      </div>
      <div className="p-5">
        <p className="text-xs font-medium text-muted">{brandName}</p>
        <h3 className="mt-1 line-clamp-2 text-base font-semibold text-foreground">{title}</h3>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-base font-bold tracking-tight text-foreground">
            ₩{rewardAmount.toLocaleString(lang === "en" ? "en-US" : "ko-KR")}
          </span>
          {deadlineText && (
            <span className="text-xs text-muted">~{deadlineText}</span>
          )}
        </div>
        {rightSlot && <div className="mt-3">{rightSlot}</div>}
      </div>
    </Link>
  );
}
