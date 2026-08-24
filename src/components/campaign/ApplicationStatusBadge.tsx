"use client";

import Badge from "@/components/ui/Badge";
import { useLang } from "@/lib/i18n";
import { FEATURE_PAYMENTS_ENABLED } from "@/lib/featureFlags";

type ApplicationStatus =
  | "PENDING"
  | "WITHDRAWN"
  | "APPROVED"
  | "REJECTED"
  | "SUBMITTED"
  | "CHANGES_REQUESTED"
  | "COMPLETED"
  | "SETTLED";

type Tone = "primary" | "success" | "warning" | "error" | "info" | "neutral";

const CONFIG: Record<ApplicationStatus, { label: string; labelEn: string; tone: Tone }> = {
  PENDING: { label: "지원 대기", labelEn: "Pending", tone: "warning" },
  WITHDRAWN: { label: "지원자 탈퇴", labelEn: "Creator withdrawn", tone: "neutral" },
  APPROVED: { label: "참여 승인", labelEn: "Approved", tone: "success" },
  REJECTED: { label: "거절", labelEn: "Rejected", tone: "error" },
  SUBMITTED: { label: "제출 완료", labelEn: "Submitted", tone: "info" },
  CHANGES_REQUESTED: { label: "수정 요청", labelEn: "Changes requested", tone: "warning" },
  COMPLETED: { label: "작업 완료", labelEn: "Completed", tone: "primary" },
  SETTLED: FEATURE_PAYMENTS_ENABLED
    ? { label: "정산 완료", labelEn: "Settled", tone: "primary" }
    : { label: "작업 완료", labelEn: "Completed", tone: "primary" },
};

export default function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const { t } = useLang();
  const c = CONFIG[status];
  return <Badge tone={c.tone}>{t(c.label, c.labelEn)}</Badge>;
}
