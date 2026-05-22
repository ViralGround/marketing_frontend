"use client";

import Badge from "@/components/ui/Badge";

export type ReviewAuthorRole = "CREATOR" | "COMPANY" | "ADMIN";

export interface ReviewItem {
  id: number;
  applicationId: number;
  authorId: number;
  authorRole: ReviewAuthorRole;
  authorName: string;
  targetId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
}

const ROLE_LABEL: Record<ReviewAuthorRole, string> = {
  CREATOR: "크리에이터",
  COMPANY: "기업",
  ADMIN: "관리자",
};

export default function ReviewList({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-faint">아직 작성된 리뷰가 없습니다.</p>;
  }

  return (
    <ul className="space-y-3">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-2xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{r.authorName}</span>
              <Badge tone="neutral">{ROLE_LABEL[r.authorRole]}</Badge>
              <span className="text-sm text-warning">
                {"★".repeat(r.rating)}
                <span className="text-faint">{"★".repeat(5 - r.rating)}</span>
              </span>
            </div>
            <span className="text-xs text-faint">
              {new Date(r.createdAt).toLocaleDateString("ko-KR")}
            </span>
          </div>
          {r.comment && (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-content-soft">
              {r.comment}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
