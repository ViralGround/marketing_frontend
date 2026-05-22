"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface Summary {
  totalCampaigns: number;
  pendingDeposit: number;
  depositConfirming: number;
  funded: number;
  closed: number;
}

export default function CompanyDashboardPage() {
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
      <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">대시보드</h1>
      <p className="mt-2 text-sm text-muted">캠페인 현황과 예치금 상태를 확인하세요.</p>

      {loading ? (
        <p className="mt-8 text-muted">불러오는 중...</p>
      ) : summary ? (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          <SummaryCard label="전체 캠페인" value={summary.totalCampaigns} />
          <SummaryCard label="입금 대기" value={summary.pendingDeposit} />
          <SummaryCard label="입금 확인중" value={summary.depositConfirming} />
          <SummaryCard label="모집중" value={summary.funded} />
          <SummaryCard label="종료" value={summary.closed} />
        </div>
      ) : (
        <p className="mt-8 text-muted">데이터를 불러오지 못했습니다.</p>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/company/campaigns/new">
          <Button>새 캠페인 등록</Button>
        </Link>
        <Link href="/company/campaigns">
          <Button variant="secondary">내 캠페인 보기</Button>
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
