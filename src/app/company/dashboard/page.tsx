"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

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
      <h1 className="text-2xl font-bold text-foreground">대시보드</h1>
      <p className="mt-1 text-sm text-muted">
        캠페인 현황과 예치금 상태를 확인하세요.
      </p>

      {loading ? (
        <p className="mt-6 text-muted">불러오는 중...</p>
      ) : summary ? (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
          <SummaryCard label="전체 캠페인" value={summary.totalCampaigns} />
          <SummaryCard label="입금 대기" value={summary.pendingDeposit} />
          <SummaryCard label="입금 확인중" value={summary.depositConfirming} />
          <SummaryCard label="모집중" value={summary.funded} />
          <SummaryCard label="종료" value={summary.closed} />
        </div>
      ) : (
        <p className="mt-6 text-muted">데이터를 불러오지 못했습니다.</p>
      )}

      <div className="mt-8 flex gap-3">
        <Link
          href="/company/campaigns/new"
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          새 캠페인 등록
        </Link>
        <Link
          href="/company/campaigns"
          className="rounded border border-line-strong px-4 py-2 text-sm font-medium text-content-soft hover:bg-surface-muted"
        >
          내 캠페인 보기
        </Link>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}
