import Badge from "@/components/ui/Badge";

type ApplicationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SUBMITTED"
  | "CHANGES_REQUESTED"
  | "SETTLED";

type Tone = "primary" | "success" | "warning" | "error" | "info" | "neutral";

const CONFIG: Record<ApplicationStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "지원 대기", tone: "warning" },
  APPROVED: { label: "참여 승인", tone: "success" },
  REJECTED: { label: "거절", tone: "error" },
  SUBMITTED: { label: "제출 완료", tone: "info" },
  CHANGES_REQUESTED: { label: "수정 요청", tone: "warning" },
  SETTLED: { label: "정산 완료", tone: "primary" },
};

export default function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const c = CONFIG[status];
  return <Badge tone={c.tone}>{c.label}</Badge>;
}

export const APPLICATION_STATUS_LABEL = Object.fromEntries(
  Object.entries(CONFIG).map(([k, v]) => [k, v.label]),
) as Record<ApplicationStatus, string>;
