"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
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
  const [actingId, setActingId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get<{ campaigns: PendingCampaign[] }>("/admin/escrow/pending")
      .then((res) => setItems(res.data.campaigns))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (id: number, kind: "confirm" | "reject") => {
    setActingId(id);
    try {
      await api.post(`/admin/campaigns/${id}/escrow/${kind}`);
      setToast(
        kind === "confirm"
          ? t("입금이 확인되었습니다", "Deposit confirmed")
          : t("반려되었습니다", "Rejected"),
      );
      load();
    } catch {
      setToast(t("처리에 실패했습니다", "Failed to process"));
    } finally {
      setActingId(null);
      setTimeout(() => setToast(""), 2500);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("예치금 입금 확인", "Confirm deposit")}</h1>
      <p className="mt-2 text-sm text-muted">
        {t(
          "브랜드가 입금을 신청한 캠페인을 검토하고, 아직 입금 신청 전인 캠페인의 현황도 함께 확인할 수 있습니다.",
          "Review campaigns where brands have requested a deposit, and check the status of campaigns that haven't requested one yet.",
        )}
      </p>

      {toast && (
        <div className="mt-5 rounded-xl border border-info/30 bg-info/5 p-3 text-sm text-info">
          {toast}
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-muted">{t("불러오는 중...", "Loading...")}</p>
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
                  <th className="px-5 py-3 font-medium">{t("작업", "Action")}</th>
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
                      {c.escrowStatus === "DEPOSIT_CONFIRMING" ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={actingId === c.id}
                            onClick={() => act(c.id, "confirm")}
                          >
                            {t("확인", "Confirm")}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={actingId === c.id}
                            onClick={() => act(c.id, "reject")}
                          >
                            {t("반려", "Reject")}
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-faint">{t("브랜드의 계좌이체 완료 대기 중", "Awaiting brand's bank transfer")}</span>
                      )}
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
