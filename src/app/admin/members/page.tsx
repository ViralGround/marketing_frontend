"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import AlertModal from "@/components/ui/AlertModal";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

type MemberStatus = "PENDING" | "APPROVED" | "REJECTED";

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
  todayCount: number;
  weekCount: number;
}

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

const STATUS_TONE: Record<MemberStatus, "warning" | "success" | "error"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
};

const STATUS_LABEL: Record<MemberStatus, string> = {
  PENDING: "대기",
  APPROVED: "승인",
  REJECTED: "거절",
};

export default function AdminMembersPage() {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchMembers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (search) params.set("search", search);

    api
      .get(`/admin/members?${params.toString()}`)
      .then((res) => {
        setMembers(res.data.members);
        setStats(res.data.stats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" 회원을 삭제하시겠습니까? 관련된 모든 데이터가 함께 삭제됩니다.`))
      return;
    try {
      await api.delete(`/admin/members/${id}`);
      fetchMembers();
    } catch {
      setErrorMessage("삭제에 실패했습니다");
    }
  };

  const handleStatus = async (id: number, status: "APPROVED" | "REJECTED", name: string) => {
    const label = status === "APPROVED" ? "승인" : "거절";
    if (!confirm(`"${name}" 회원을 ${label}하시겠습니까?`)) return;
    try {
      await api.patch(`/admin/members/${id}/status`, { status });
      fetchMembers();
    } catch {
      setErrorMessage(`${label}에 실패했습니다`);
    }
  };

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground">크리에이터 관리</h1>

      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Card className="p-4 md:p-5">
            <p className="text-xs font-medium text-muted">전체</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{stats.total}명</p>
          </Card>
          <Card className="border-warning/30 bg-warning/5 p-4 md:p-5">
            <p className="text-xs font-medium text-warning">승인 대기</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-warning">
              {stats.pendingCount}명
            </p>
          </Card>
          <Card className="p-4 md:p-5">
            <p className="text-xs font-medium text-muted">승인 완료</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {stats.approvedCount}명
            </p>
          </Card>
          <Card className="p-4 md:p-5">
            <p className="text-xs font-medium text-muted">거절</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {stats.rejectedCount}명
            </p>
          </Card>
          <Card className="p-4 md:p-5">
            <p className="text-xs font-medium text-muted">오늘 가입</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {stats.todayCount}명
            </p>
          </Card>
          <Card className="p-4 md:p-5">
            <p className="text-xs font-medium text-muted">이번 주 가입</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {stats.weekCount}명
            </p>
          </Card>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as StatusFilter[]).map((s) => {
            const active = statusFilter === s;
            const label =
              s === "ALL"
                ? "전체"
                : s === "PENDING"
                  ? `대기${stats ? ` (${stats.pendingCount})` : ""}`
                  : s === "APPROVED"
                    ? "승인"
                    : "거절";
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
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
            placeholder="이름 또는 이메일 검색"
            className="w-56"
          />
          <Button type="submit" size="sm">
            검색
          </Button>
        </form>
      </div>

      <AlertModal
        open={!!errorMessage}
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />

      {loading ? (
        <p className="text-muted">불러오는 중...</p>
      ) : members.length === 0 ? (
        <Card className="bg-surface-muted py-12 text-center text-muted">
          검색 결과가 없습니다.
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">이름</th>
                  <th className="px-5 py-3 font-medium">이메일</th>
                  <th className="px-5 py-3 font-medium">상태</th>
                  <th className="px-5 py-3 font-medium">인스타그램</th>
                  <th className="px-5 py-3 font-medium">가입일</th>
                  <th className="px-5 py-3 font-medium">관리</th>
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
                      <Badge tone={STATUS_TONE[m.status]}>{STATUS_LABEL[m.status]}</Badge>
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
                              승인
                            </button>
                            <button
                              onClick={() => handleStatus(m.id, "REJECTED", m.name)}
                              className="text-xs font-medium text-error hover:underline"
                            >
                              거절
                            </button>
                          </>
                        )}
                        <Link
                          href={`/admin/members/${m.id}`}
                          className="text-xs font-medium text-muted hover:text-foreground"
                        >
                          상세
                        </Link>
                        <button
                          onClick={() => handleDelete(m.id, m.name)}
                          className="text-xs font-medium text-error/80 hover:text-error hover:underline"
                        >
                          삭제
                        </button>
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
