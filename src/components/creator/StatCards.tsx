"use client";

import { useLang } from "@/lib/i18n";
import { MetricStrip } from "@/components/workspace/WorkspacePrimitives";
import { FEATURE_PAYMENTS_ENABLED } from "@/lib/featureFlags";

interface StatCardsProps {
  totalEarned?: number;
  completedCount: number;
  activeCount: number;
}

export default function StatCards({
  totalEarned,
  completedCount,
  activeCount,
}: StatCardsProps) {
  const { t } = useLang();
  return <MetricStrip label={t("작업 핵심 지표", "Work key metrics")} items={[
    ...(FEATURE_PAYMENTS_ENABLED ? [{ label: t("총 정산 기록", "Total settled"), value: totalEarned != null ? `₩${totalEarned.toLocaleString("ko-KR")}` : "—", hint: t("정산 완료 기준", "Settled campaigns") }] : []),
    { label: t("완료 캠페인", "Completed"), value: `${completedCount}${t("건", "")}`, hint: t("완료 처리된 작업", "Completed work") },
    { label: t("진행 중", "In progress"), value: `${activeCount}${t("건", "")}`, hint: t("참여·제출 중", "Active or submitted"), tone: "accent" },
  ]} />;
}
