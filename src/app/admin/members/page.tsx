"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

type MemberStatus = "PENDING" | "APPROVED" | "REJECTED";

interface MemberItem {
  id: number;
  email: string;
  name: string;
  role: "COMPANY" | "CREATOR";
  status: MemberStatus;
  createdAt: string;
  instagramId: string | null;
}

interface Stats {
  total: number;
  companyCount: number;
  creatorCount: number;
  pendingCount: number;
  todayCount: number;
  weekCount: number;
  contentTotal: number;
  contentPublished: number;
  contentDraft: number;
}

type RoleFilter = "ALL" | "COMPANY" | "CREATOR";
type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export default function AdminMembersPage() {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchMembers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (roleFilter !== "ALL") params.set("role", roleFilter);
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
  }, [roleFilter, statusFilter, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" 회원을 삭제하시겠습니까? 관련된 모든 콘텐츠와 프로필도 함께 삭제됩니다.`))
      return;
    try {
      await api.delete(`/admin/members/${id}`);
      fetchMembers();
    } catch {
      alert("삭제에 실패했습니다");
    }
  };

  const handleStatus = async (id: number, status: "APPROVED" | "REJECTED", name: string) => {
    const label = status === "APPROVED" ? "승인" : "거절";
    if (!confirm(`"${name}" 회원을 ${label}하시겠습니까?`)) return;
    try {
      await api.patch(`/admin/members/${id}/status`, { status });
      fetchMembers();
    } catch {
      alert(`${label}에 실패했습니다`);
    }
  };

  const roleLabel = (role: string) =>
    role === "COMPANY" ? "기업" : "크리에이터";

  const statusLabel = (status: MemberStatus) =>
    status === "PENDING" ? "대기" : status === "APPROVED" ? "승인" : "거절";

  const statusClass = (status: MemberStatus) =>
    status === "PENDING"
      ? "bg-yellow-100 text-yellow-800"
      : status === "APPROVED"
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700";

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">회원 관리</h1>

      {/* 통계 카드 */}
      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded border border-gray-200 p-4">
            <p className="text-sm text-gray-500">전체 회원</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}명</p>
          </div>
          <div className="rounded border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-700">승인 대기</p>
            <p className="text-2xl font-bold text-yellow-800">
              {stats.pendingCount}명
            </p>
          </div>
          <div className="rounded border border-gray-200 p-4">
            <p className="text-sm text-gray-500">기업</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.companyCount}명
            </p>
          </div>
          <div className="rounded border border-gray-200 p-4">
            <p className="text-sm text-gray-500">크리에이터</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.creatorCount}명
            </p>
          </div>
          <div className="rounded border border-gray-200 p-4">
            <p className="text-sm text-gray-500">오늘 가입</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.todayCount}명
            </p>
          </div>
          <div className="rounded border border-gray-200 p-4">
            <p className="text-sm text-gray-500">이번 주 가입</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.weekCount}명
            </p>
          </div>
          <div className="rounded border border-gray-200 p-4">
            <p className="text-sm text-gray-500">전체 콘텐츠</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.contentTotal}건
            </p>
          </div>
          <div className="rounded border border-gray-200 p-4">
            <p className="text-sm text-gray-500">게시된 콘텐츠</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.contentPublished}건
            </p>
          </div>
        </div>
      )}

      {/* 상태 필터 */}
      <div className="mb-3 flex gap-1">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded px-3 py-1.5 text-sm ${
              statusFilter === s
                ? "bg-gray-900 text-white"
                : "border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s === "ALL"
              ? "전체 상태"
              : s === "PENDING"
                ? `대기${stats ? ` (${stats.pendingCount})` : ""}`
                : s === "APPROVED"
                  ? "승인"
                  : "거절"}
          </button>
        ))}
      </div>

      {/* 검색 + 역할 필터 */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {(["ALL", "COMPANY", "CREATOR"] as RoleFilter[]).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`rounded px-3 py-1.5 text-sm ${
                roleFilter === r
                  ? "bg-gray-900 text-white"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {r === "ALL" ? "전체 역할" : r === "COMPANY" ? "기업" : "크리에이터"}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="이름 또는 이메일 검색"
            className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700"
          >
            검색
          </button>
        </form>
      </div>

      {/* 회원 테이블 */}
      {loading ? (
        <p className="text-gray-500">불러오는 중...</p>
      ) : members.length === 0 ? (
        <p className="text-gray-500">검색 결과가 없습니다.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">이름</th>
                <th className="px-4 py-3">이메일</th>
                <th className="px-4 py-3">역할</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">인스타그램</th>
                <th className="px-4 py-3">가입일</th>
                <th className="px-4 py-3">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <Link
                      href={`/admin/members/${m.id}`}
                      className="hover:underline"
                    >
                      {m.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{m.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        m.role === "COMPANY"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {roleLabel(m.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs ${statusClass(m.status)}`}>
                      {statusLabel(m.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {m.instagramId ? `@${m.instagramId}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(m.createdAt).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {m.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleStatus(m.id, "APPROVED", m.name)}
                            className="text-xs text-green-600 hover:text-green-800"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => handleStatus(m.id, "REJECTED", m.name)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            거절
                          </button>
                        </>
                      )}
                      <Link
                        href={`/admin/members/${m.id}`}
                        className="text-xs text-gray-600 hover:text-gray-900"
                      >
                        상세
                      </Link>
                      <button
                        onClick={() => handleDelete(m.id, m.name)}
                        className="text-xs text-red-500 hover:text-red-700"
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
      )}
    </div>
  );
}
