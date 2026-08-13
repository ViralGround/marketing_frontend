"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import AlertModal from "@/components/ui/AlertModal";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { useLang } from "@/lib/i18n";

type MemberStatus = "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN";

interface MemberItem {
  id: number;
  email: string;
  name: string;
  status: MemberStatus;
  createdAt: string;
  instagramId: string | null;
}

interface Stats {
  total: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  withdrawnCount: number;
  todayCount: number;
  weekCount: number;
}

interface MembersResponse {
  members: MemberItem[];
  stats: Stats;
}

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN";

const STATUS_TONE: Record<MemberStatus, "warning" | "success" | "error" | "neutral"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
  WITHDRAWN: "neutral",
};

const STATUS_LABEL: Record<MemberStatus, { ko: string; en: string }> = {
  PENDING: { ko: "대기", en: "Pending" },
  APPROVED: { ko: "승인", en: "Approved" },
  REJECTED: { ko: "거절", en: "Rejected" },
  WITHDRAWN: { ko: "탈퇴", en: "Withdrawn" },
};

function requestMembers(statusFilter: StatusFilter, search: string, signal?: AbortSignal) {
  const params = new URLSearchParams();
  if (statusFilter !== "ALL") params.set("status", statusFilter);
  if (search) params.set("search", search);

  return api.get<MembersResponse>(`/admin/members?${params.toString()}`, { signal });
}

export default function AdminMembersPage() {
  const { t } = useLang();
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const refreshMembers = async () => {
    setLoading(true);
    try {
      const response = await requestMembers(statusFilter, search);
      setMembers(response.data.members);
      setStats(response.data.stats);
    } catch {
      setErrorMessage(t("회원 목록을 불러오지 못했습니다.", "Failed to load members."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    requestMembers(statusFilter, search, controller.signal)
      .then((response) => {
        if (!active) return;
        setMembers(response.data.members);
        setStats(response.data.stats);
      })
      .catch(() => {
        if (!active) return;
        setErrorMessage(t("회원 목록을 불러오지 못했습니다.", "Failed to load members."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [search, statusFilter, t]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const nextSearch = searchInput.trim();
    if (nextSearch === search) return;
    setLoading(true);
    setSearch(nextSearch);
  };

  const handleStatus = async (id: number, status: "APPROVED" | "REJECTED", name: string) => {
    const label = status === "APPROVED" ? t("승인", "approve") : t("거절", "reject");
    if (
      !confirm(t(`"${name}" 회원을 ${label}하시겠습니까?`, `${label} member "${name}"?`))
    )
      return;
    try {
      await api.patch(`/admin/members/${id}/status`, { status });
      await refreshMembers();
    } catch {
      setErrorMessage(t(`${label}에 실패했습니다`, `Failed to ${label}`));
    }
  };

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground">
        {t("크리에이터 관리", "Creator management")}
      </h1>

      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          <Card className="p-4 md:p-5">
            <p className="text-xs font-medium text-muted">{t("전체", "All")}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {stats.total}
              {t("명", "")}
            </p>
          </Card>
          <Card className="border-warning/30 bg-warning/5 p-4 md:p-5">
            <p className="text-xs font-medium text-warning">{t("승인 대기", "Pending approval")}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-warning">
              {stats.pendingCount}
              {t("명", "")}
            </p>
          </Card>
          <Card className="p-4 md:p-5">
            <p className="text-xs font-medium text-muted">{t("승인 완료", "Approved")}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {stats.approvedCount}
              {t("명", "")}
            </p>
          </Card>
          <Card className="p-4 md:p-5">
            <p className="text-xs font-medium text-muted">{t("거절", "Rejected")}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {stats.rejectedCount}
              {t("명", "")}
            </p>
          </Card>
          <Card className="p-4 md:p-5">
            <p className="text-xs font-medium text-muted">{t("탈퇴", "Withdrawn")}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {stats.withdrawnCount}
              {t("명", "")}
            </p>
          </Card>
          <Card className="p-4 md:p-5">
            <p className="text-xs font-medium text-muted">{t("오늘 가입", "Joined today")}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {stats.todayCount}
              {t("명", "")}
            </p>
          </Card>
          <Card className="p-4 md:p-5">
            <p className="text-xs font-medium text-muted">{t("이번 주 가입", "Joined this week")}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {stats.weekCount}
              {t("명", "")}
            </p>
          </Card>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {(["ALL", "PENDING", "APPROVED", "REJECTED", "WITHDRAWN"] as StatusFilter[]).map((s) => {
            const active = statusFilter === s;
            const label =
              s === "ALL"
                ? t("전체", "All")
                : s === "PENDING"
                  ? `${t("대기", "Pending")}${stats ? ` (${stats.pendingCount})` : ""}`
                  : s === "APPROVED"
                    ? t("승인", "Approved")
                    : s === "REJECTED"
                      ? t("거절", "Rejected")
                      : t("탈퇴", "Withdrawn");
            return (
              <button
                key={s}
                onClick={() => {
                  if (s === statusFilter) return;
                  setLoading(true);
                  setStatusFilter(s);
                }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-white"
                    : "border border-line text-content-soft hover:border-primary/40 hover:text-primary"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("이름 또는 이메일 검색", "Search by name or email")}
            className="w-56"
          />
          <Button type="submit" size="sm">
            {t("검색", "Search")}
          </Button>
        </form>
      </div>

      <AlertModal
        open={!!errorMessage}
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />

      {loading ? (
        <p className="text-muted">{t("불러오는 중...", "Loading...")}</p>
      ) : members.length === 0 ? (
        <Card className="bg-surface-muted py-12 text-center text-muted">
          {t("검색 결과가 없습니다.", "No results found.")}
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">{t("이름", "Name")}</th>
                  <th className="px-5 py-3 font-medium">{t("이메일", "Email")}</th>
                  <th className="px-5 py-3 font-medium">{t("상태", "Status")}</th>
                  <th className="px-5 py-3 font-medium">{t("인스타그램", "Instagram")}</th>
                  <th className="px-5 py-3 font-medium">{t("가입일", "Joined")}</th>
                  <th className="px-5 py-3 font-medium">{t("관리", "Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {members.map((m) => (
                  <tr key={m.id} className="transition-colors hover:bg-surface-muted">
                    <td className="px-5 py-3 font-medium text-foreground">
                      <Link href={`/admin/members/${m.id}`} className="hover:text-primary">
                        {m.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-content-soft">{m.email}</td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_TONE[m.status]}>
                        {t(STATUS_LABEL[m.status].ko, STATUS_LABEL[m.status].en)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-content-soft">
                      {m.instagramId ? `@${m.instagramId}` : "-"}
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {new Date(m.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-3">
                        {m.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleStatus(m.id, "APPROVED", m.name)}
                              className="text-xs font-medium text-success hover:underline"
                            >
                              {t("승인", "Approve")}
                            </button>
                            <button
                              onClick={() => handleStatus(m.id, "REJECTED", m.name)}
                              className="text-xs font-medium text-error hover:underline"
                            >
                              {t("거절", "Reject")}
                            </button>
                          </>
                        )}
                        <Link
                          href={`/admin/members/${m.id}`}
                          className="text-xs font-medium text-muted hover:text-foreground"
                        >
                          {t("상세", "Details")}
                        </Link>
                      </div>
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
