"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useLang } from "@/lib/i18n";

interface Summary {
  totalCampaigns: number;
  pendingDeposit: number;
  depositConfirming: number;
  funded: number;
  closed: number;
}

export default function CompanyDashboardPage() {
  const { t } = useLang();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Summary>("/company/dashboard")
      .then((res) => setSummary(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{t("대시보드", "Dashboard")}</h1>
      <p className="mt-2 text-sm text-muted">{t("캠페인 현황과 예치금 상태를 확인하세요.", "Check your campaign status and deposits.")}</p>

      {loading ? (
        <p className="mt-8 text-muted">{t("불러오는 중...", "Loading...")}</p>
      ) : summary ? (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          <SummaryCard label={t("전체 캠페인", "Total campaigns")} value={summary.totalCampaigns} />
          <SummaryCard label={t("입금 대기", "Pending deposit")} value={summary.pendingDeposit} />
          <SummaryCard label={t("입금 확인중", "Confirming deposit")} value={summary.depositConfirming} />
          <SummaryCard label={t("모집중", "Recruiting")} value={summary.funded} />
          <SummaryCard label={t("종료", "Closed")} value={summary.closed} />
        </div>
      ) : (
        <p className="mt-8 text-muted">{t("데이터를 불러오지 못했습니다.", "Failed to load data.")}</p>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/company/campaigns/new">
          <Button>{t("새 캠페인 등록", "Create campaign")}</Button>
        </Link>
        <Link href="/company/campaigns">
          <Button variant="secondary">{t("내 캠페인 보기", "View my campaigns")}</Button>
        </Link>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4 md:p-5">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
    </Card>
  );
}
