"use client";

import Badge from "@/components/ui/Badge";
import { useLang } from "@/lib/i18n";

type ApplicationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SUBMITTED"
  | "CHANGES_REQUESTED"
  | "SETTLED";

type Tone = "primary" | "success" | "warning" | "error" | "info" | "neutral";

const CONFIG: Record<ApplicationStatus, { label: string; labelEn: string; tone: Tone }> = {
  PENDING: { label: "지원 대기", labelEn: "Pending", tone: "warning" },
  APPROVED: { label: "참여 승인", labelEn: "Approved", tone: "success" },
  REJECTED: { label: "거절", labelEn: "Rejected", tone: "error" },
  SUBMITTED: { label: "제출 완료", labelEn: "Submitted", tone: "info" },
  CHANGES_REQUESTED: { label: "수정 요청", labelEn: "Changes requested", tone: "warning" },
  SETTLED: { label: "정산 완료", labelEn: "Settled", tone: "primary" },
};

export default function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const { t } = useLang();
  const c = CONFIG[status];
  return <Badge tone={c.tone}>{t(c.label, c.labelEn)}</Badge>;
}

export const APPLICATION_STATUS_LABEL = Object.fromEntries(
  Object.entries(CONFIG).map(([k, v]) => [k, v.label]),
) as Record<ApplicationStatus, string>;
