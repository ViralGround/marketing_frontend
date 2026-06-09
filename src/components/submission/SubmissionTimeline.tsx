"use client";

import Badge from "@/components/ui/Badge";
import { useLang } from "@/lib/i18n";

export type SubmissionReviewStatus =
  | "SUBMITTED"
  | "APPROVED"
  | "CHANGES_REQUESTED"
  | "REJECTED";

export interface SubmissionHistoryItem {
  id: number;
  videoFileKey: string | null;
  videoContentType: string | null;
  videoSizeBytes: number | null;
  submissionUrl: string | null;
  status: SubmissionReviewStatus;
  reviewComment: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}

type Tone = "primary" | "success" | "warning" | "error" | "info" | "neutral";

const STATUS_CONFIG: Record<
  SubmissionReviewStatus,
  { label: string; labelEn: string; tone: Tone }
> = {
  SUBMITTED: { label: "검토 대기", labelEn: "Pending review", tone: "info" },
  APPROVED: { label: "승인", labelEn: "Approved", tone: "success" },
  CHANGES_REQUESTED: { label: "수정 요청", labelEn: "Changes requested", tone: "warning" },
  REJECTED: { label: "거절", labelEn: "Rejected", tone: "error" },
};

export default function SubmissionTimeline({
  submissions,
}: {
  submissions: SubmissionHistoryItem[];
}) {
  const { t, lang } = useLang();

  if (submissions.length === 0) {
    return <p className="text-sm text-faint">{t("아직 제출된 영상이 없습니다.", "No videos submitted yet.")}</p>;
  }

  return (
    <ol className="space-y-3">
      {submissions.map((s, idx) => {
        const cfg = STATUS_CONFIG[s.status];
        return (
          <li
            key={s.id}
            className="rounded-xl border border-line bg-surface-muted p-3 text-sm"
          >
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-xs font-medium text-muted">
                {t(`${idx + 1}차 제출`, `Submission #${idx + 1}`)} · {formatDateTime(s.submittedAt, lang)}
              </span>
              <Badge tone={cfg.tone}>{t(cfg.label, cfg.labelEn)}</Badge>
            </div>
            {s.videoFileKey && (
              <p className="text-xs text-muted">
                {t("파일", "File")}: <span className="font-mono">{s.videoFileKey}</span>
                {s.videoSizeBytes != null && ` · ${formatSize(s.videoSizeBytes)}`}
              </p>
            )}
            {!s.videoFileKey && s.submissionUrl && (
              <p className="text-xs text-muted">{t("외부 URL 제출 (레거시)", "External URL submission (legacy)")}</p>
            )}
            {s.reviewComment && (
              <div className="mt-2 rounded-lg bg-surface p-2.5 text-xs text-content-soft">
                <span className="font-medium text-muted">{t("검토 의견:", "Review comment:")}</span> {s.reviewComment}
                {s.reviewedAt && (
                  <span className="ml-2 text-faint">
                    ({formatDateTime(s.reviewedAt, lang)})
                  </span>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function formatDateTime(iso: string, lang: "ko" | "en") {
  const d = new Date(iso);
  return d.toLocaleString(lang === "en" ? "en-US" : "ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}
