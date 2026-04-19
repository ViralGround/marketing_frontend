import Link from "next/link";

interface CampaignCardProps {
  href: string;
  title: string;
  brandName: string;
  rewardAmount: number;
  thumbnailUrl?: string | null;
  deadline?: string | Date | null;
  rightSlot?: React.ReactNode;
}

export default function CampaignCard({
  href,
  title,
  brandName,
  rewardAmount,
  thumbnailUrl,
  deadline,
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
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-gray-400 hover:shadow-sm"
    >
      <div className="aspect-video w-full overflow-hidden bg-gray-100">
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
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-500">{brandName}</p>
        <h3 className="mt-1 line-clamp-2 font-semibold text-gray-900">{title}</h3>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-900">
            ₩{rewardAmount.toLocaleString("ko-KR")}
          </span>
          {deadlineText && (
            <span className="text-xs text-gray-500">~{deadlineText}</span>
          )}
        </div>
        {rightSlot && <div className="mt-2">{rightSlot}</div>}
      </div>
    </Link>
  );
}
