"use client";

import Badge from "@/components/ui/Badge";
import { useLang } from "@/lib/i18n";

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

const ROLE_LABEL: Record<ReviewAuthorRole, { ko: string; en: string }> = {
  CREATOR: { ko: "크리에이터", en: "Creator" },
  COMPANY: { ko: "기업", en: "Company" },
  ADMIN: { ko: "관리자", en: "Admin" },
};

export default function ReviewList({ reviews }: { reviews: ReviewItem[] }) {
  const { t, lang } = useLang();

  if (reviews.length === 0) {
    return <p className="text-sm text-faint">{t("아직 작성된 리뷰가 없습니다.", "No reviews yet.")}</p>;
  }

  return (
    <ul className="space-y-3">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-2xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{r.authorName}</span>
              <Badge tone="neutral">{t(ROLE_LABEL[r.authorRole].ko, ROLE_LABEL[r.authorRole].en)}</Badge>
              <span className="text-sm text-warning">
                {"★".repeat(r.rating)}
                <span className="text-faint">{"★".repeat(5 - r.rating)}</span>
              </span>
            </div>
            <span className="text-xs text-faint">
              {new Date(r.createdAt).toLocaleDateString(lang === "en" ? "en-US" : "ko-KR")}
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
