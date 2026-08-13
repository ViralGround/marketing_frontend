"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { useLang } from "@/lib/i18n";

type PendingEscrowStatus = "PENDING_DEPOSIT" | "DEPOSIT_CONFIRMING";

interface PendingCampaign {
  id: number;
  title: string;
  brandName: string;
  companyName: string;
  totalBudget: number;
  rewardAmount: number;
  maxParticipants: number;
  escrowStatus: PendingEscrowStatus;
  depositRequestedAt: string | null;
  createdAt: string;
}

export default function AdminEscrowPage() {
  const { t } = useLang();
  const [items, setItems] = useState<PendingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    api
      .get<{ campaigns: PendingCampaign[] }>("/admin/escrow/pending", {
        signal: controller.signal,
      })
      .then((res) => {
        if (!active) return;
        setItems(res.data.campaigns);
        setError("");
      })
      .catch(() => {
        if (!active) return;
        setError(t("예치 상태를 불러오지 못했습니다.", "Failed to load escrow status."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [t]);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        {t("예치 상태 조회", "Escrow status")}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {t(
          "캠페인별 예치 요청 상태를 조회합니다.",
          "Review the escrow request status for each campaign.",
        )}
      </p>

      <Card className="mt-6 border-warning/40 bg-warning/5">
        <p className="font-semibold text-foreground">
          {t("매니지드 베타 · 결제 기능 비활성", "Managed beta · payments disabled")}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-content-soft">
          {t(
            "현재 바이럴그라운드는 이 화면에서 송금하거나 입금을 수동 확정하지 않습니다. PG사·환불·정산 정책과 운영 승인이 확정된 뒤 검증된 결제 흐름만 별도로 활성화합니다.",
            "Viral Ground does not transfer funds or manually confirm deposits from this screen. A verified payment flow will be enabled only after the payment provider, refund and settlement policies, and operational approval are finalized.",
          )}
        </p>
      </Card>

      {loading ? (
        <p className="mt-8 text-muted">{t("불러오는 중...", "Loading...")}</p>
      ) : error ? (
        <p className="mt-8 text-error" role="alert">{error}</p>
      ) : items.length === 0 ? (
        <Card className="mt-8 border-dashed bg-surface-muted py-12 text-center text-muted">
          {t("예치 대기 중인 캠페인이 없습니다.", "No campaigns awaiting deposit.")}
        </Card>
      ) : (
        <Card className="mt-8 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">{t("캠페인", "Campaign")}</th>
                  <th className="px-5 py-3 font-medium">{t("브랜드", "Brand")}</th>
                  <th className="px-5 py-3 font-medium">{t("예치 금액", "Deposit amount")}</th>
                  <th className="px-5 py-3 font-medium">{t("상태", "Status")}</th>
                  <th className="px-5 py-3 font-medium">{t("요청 시각", "Requested")}</th>
                  <th className="px-5 py-3 font-medium">{t("운영 정책", "Operational policy")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-surface-muted">
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{c.title}</p>
                      <p className="text-xs text-muted">
                        {c.brandName} · {t("", "₩")}{c.rewardAmount.toLocaleString()}{t("원", "")} ×{" "}
                        {c.maxParticipants}{t("명", " people")}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-content-soft">{c.companyName}</td>
                    <td className="px-5 py-3 font-semibold text-foreground">
                      {t("", "₩")}{c.totalBudget.toLocaleString()}{t("원", "")}
                    </td>
                    <td className="px-5 py-3">
                      {c.escrowStatus === "DEPOSIT_CONFIRMING" ? (
                        <Badge tone="warning">{t("확인 대기", "Awaiting confirmation")}</Badge>
                      ) : (
                        <Badge tone="neutral">{t("브랜드 입금 신청 전", "Deposit not requested")}</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {c.depositRequestedAt
                        ? new Date(c.depositRequestedAt).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-faint">
                        {c.escrowStatus === "DEPOSIT_CONFIRMING"
                          ? t("조회 전용 · 수동 처리 안 함", "Read only · no manual action")
                          : t("결제 기능 비활성", "Payments disabled")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
