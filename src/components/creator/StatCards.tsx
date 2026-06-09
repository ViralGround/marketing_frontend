"use client";

import Card from "@/components/ui/Card";
import { useLang } from "@/lib/i18n";

interface StatCardsProps {
  totalEarned: number;
  completedCount: number;
  activeCount: number;
}

export default function StatCards({
  totalEarned,
  completedCount,
  activeCount,
}: StatCardsProps) {
  const { t } = useLang();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <p className="text-sm font-medium text-muted">{t("총 수익", "Total earnings")}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          ₩{totalEarned.toLocaleString("ko-KR")}
        </p>
        <p className="mt-1.5 text-xs text-faint">{t("정산 완료된 캠페인 기준", "Based on paid-out campaigns")}</p>
      </Card>
      <Card>
        <p className="text-sm font-medium text-muted">{t("완료 캠페인", "Completed campaigns")}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          {completedCount}{t("건", "")}
        </p>
        <p className="mt-1.5 text-xs text-faint">{t("정산까지 마친 캠페인", "Campaigns fully paid out")}</p>
      </Card>
      <Card>
        <p className="text-sm font-medium text-muted">{t("진행 중", "In progress")}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          {activeCount}{t("건", "")}
        </p>
        <p className="mt-1.5 text-xs text-faint">{t("대기·참여·제출 중", "Pending, participating, or submitted")}</p>
      </Card>
    </div>
  );
}
