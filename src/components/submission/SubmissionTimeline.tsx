"use client";

import Badge from "@/components/ui/Badge";

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
  { label: string; tone: Tone }
> = {
  SUBMITTED: { label: "검토 대기", tone: "info" },
  APPROVED: { label: "승인", tone: "success" },
  CHANGES_REQUESTED: { label: "수정 요청", tone: "warning" },
  REJECTED: { label: "거절", tone: "error" },
};

export default function SubmissionTimeline({
  submissions,
}: {
  submissions: SubmissionHistoryItem[];
}) {
  if (submissions.length === 0) {
    return <p className="text-sm text-faint">아직 제출된 영상이 없습니다.</p>;
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
                {idx + 1}차 제출 · {formatDateTime(s.submittedAt)}
              </span>
              <Badge tone={cfg.tone}>{cfg.label}</Badge>
            </div>
            {s.videoFileKey && (
              <p className="text-xs text-muted">
                파일: <span className="font-mono">{s.videoFileKey}</span>
                {s.videoSizeBytes != null && ` · ${formatSize(s.videoSizeBytes)}`}
              </p>
            )}
            {!s.videoFileKey && s.submissionUrl && (
              <p className="text-xs text-muted">외부 URL 제출 (레거시)</p>
            )}
            {s.reviewComment && (
              <div className="mt-2 rounded-lg bg-surface p-2.5 text-xs text-content-soft">
                <span className="font-medium text-muted">검토 의견:</span> {s.reviewComment}
                {s.reviewedAt && (
                  <span className="ml-2 text-faint">
                    ({formatDateTime(s.reviewedAt)})
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

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
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
