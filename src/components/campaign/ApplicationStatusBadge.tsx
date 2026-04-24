type ApplicationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SUBMITTED"
  | "CHANGES_REQUESTED"
  | "SETTLED";

const CONFIG: Record<ApplicationStatus, { label: string; className: string }> = {
  PENDING: { label: "지원 대기", className: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "참여 승인", className: "bg-green-100 text-green-700" },
  REJECTED: { label: "거절", className: "bg-red-100 text-red-700" },
  SUBMITTED: { label: "제출 완료", className: "bg-blue-100 text-blue-700" },
  CHANGES_REQUESTED: { label: "수정 요청", className: "bg-orange-100 text-orange-700" },
  SETTLED: { label: "정산 완료", className: "bg-purple-100 text-purple-700" },
};

export default function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const c = CONFIG[status];
  return (
    <span className={`rounded px-2 py-0.5 text-xs ${c.className}`}>{c.label}</span>
  );
}

export const APPLICATION_STATUS_LABEL = Object.fromEntries(
  Object.entries(CONFIG).map(([k, v]) => [k, v.label]),
) as Record<ApplicationStatus, string>;
