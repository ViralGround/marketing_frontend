import Link from "next/link";

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
  const deadlineText = deadline
    ? new Date(deadline).toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-xl border border-line bg-surface transition hover:border-gray-400 hover:shadow-sm"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-surface-chip">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            썸네일 없음
          </div>
        )}

        {/* 뱃지 */}
        <div className="absolute top-2 left-2 flex gap-1">
          {isNew && (
            <span className="rounded bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white shadow">
              NEW
            </span>
          )}
          {isUrgent && (
            <span className="rounded bg-red-500 px-2 py-0.5 text-xs font-semibold text-white shadow">
              마감 임박
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-muted">{brandName}</p>
        <h3 className="mt-1 line-clamp-2 font-semibold text-foreground">{title}</h3>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">
            ₩{rewardAmount.toLocaleString("ko-KR")}
          </span>
          {deadlineText && (
            <span className="text-xs text-muted">~{deadlineText}</span>
          )}
        </div>
        {rightSlot && <div className="mt-2">{rightSlot}</div>}
      </div>
    </Link>
  );
}
