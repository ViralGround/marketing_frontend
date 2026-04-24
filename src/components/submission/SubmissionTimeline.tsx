"use client";

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

const STATUS_CONFIG: Record<
  SubmissionReviewStatus,
  { label: string; className: string }
> = {
  SUBMITTED: { label: "검토 대기", className: "bg-blue-100 text-blue-700" },
  APPROVED: { label: "승인", className: "bg-green-100 text-green-700" },
  CHANGES_REQUESTED: { label: "수정 요청", className: "bg-orange-100 text-orange-700" },
  REJECTED: { label: "거절", className: "bg-red-100 text-red-700" },
};

export default function SubmissionTimeline({
  submissions,
}: {
  submissions: SubmissionHistoryItem[];
}) {
  if (submissions.length === 0) {
    return <p className="text-sm text-gray-400">아직 제출된 영상이 없습니다.</p>;
  }

  return (
    <ol className="space-y-3">
      {submissions.map((s, idx) => {
        const cfg = STATUS_CONFIG[s.status];
        return (
          <li
            key={s.id}
            className="rounded border border-gray-200 bg-gray-50 p-3 text-sm"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {idx + 1}차 제출 · {formatDateTime(s.submittedAt)}
              </span>
              <span className={`rounded px-2 py-0.5 text-xs ${cfg.className}`}>
                {cfg.label}
              </span>
            </div>
            {s.videoFileKey && (
              <p className="text-xs text-gray-600">
                파일: <span className="font-mono">{s.videoFileKey}</span>
                {s.videoSizeBytes != null && ` · ${formatSize(s.videoSizeBytes)}`}
              </p>
            )}
            {!s.videoFileKey && s.submissionUrl && (
              <p className="text-xs text-gray-600">외부 URL 제출 (레거시)</p>
            )}
            {s.reviewComment && (
              <div className="mt-2 rounded bg-white p-2 text-xs text-gray-700">
                <span className="text-gray-500">검토 의견:</span> {s.reviewComment}
                {s.reviewedAt && (
                  <span className="ml-2 text-gray-400">
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
