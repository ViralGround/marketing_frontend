"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

type MemberStatus = "PENDING" | "APPROVED" | "REJECTED";

interface MemberDetail {
  id: number;
  email: string;
  name: string;
  role: "COMPANY" | "CREATOR";
  status: MemberStatus;
  createdAt: string;
  updatedAt: string;
  contentCount: number;
  creatorProfile: {
    canEdit: boolean;
    editingSkill: "HIGH" | "MEDIUM" | "LOW";
    editingTool: "CAPCUT" | "PREMIERE" | "FINAL_CUT" | "VN" | "OTHER" | "NONE" | null;
    gender: "MALE" | "FEMALE" | "OTHER" | null;
    age: number | null;
    faceExposure: boolean;
    instagramId: string | null;
    tiktokId: string | null;
    youtubeId: string | null;
    profileImage: string | null;
  } | null;
}

const EDITING_TOOL_LABEL: Record<string, string> = {
  CAPCUT: "캡컷",
  PREMIERE: "프리미어 프로",
  FINAL_CUT: "파이널 컷",
  VN: "VN",
  OTHER: "기타",
  NONE: "편집 경험 없음",
};

const GENDER_LABEL: Record<string, string> = {
  MALE: "남성",
  FEMALE: "여성",
  OTHER: "기타",
};

export default function AdminMemberDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMember = () => {
    api
      .get(`/admin/members/${id}`)
      .then((res) => setMember(res.data))
      .catch(() => router.push("/admin/members"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMember();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRoleChange = async (newRole: "COMPANY" | "CREATOR") => {
    if (!confirm(`역할을 "${newRole === "COMPANY" ? "기업" : "크리에이터"}"(으)로 변경하시겠습니까?`))
      return;
    try {
      await api.put(`/admin/members/${id}`, { role: newRole });
      setMember((prev) => (prev ? { ...prev, role: newRole } : null));
    } catch {
      alert("역할 변경에 실패했습니다");
    }
  };

  const handleStatusChange = async (status: "APPROVED" | "REJECTED" | "PENDING") => {
    const label =
      status === "APPROVED" ? "승인" : status === "REJECTED" ? "거절" : "대기 상태로 변경";
    if (!confirm(`"${member?.name}" 회원을 ${label}하시겠습니까?`)) return;
    try {
      await api.patch(`/admin/members/${id}/status`, { status });
      setMember((prev) => (prev ? { ...prev, status } : null));
    } catch {
      alert(`${label}에 실패했습니다`);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`"${member?.name}" 회원을 삭제하시겠습니까? 관련된 모든 데이터가 삭제됩니다.`))
      return;
    try {
      await api.delete(`/admin/members/${id}`);
      router.push("/admin/members");
    } catch {
      alert("삭제에 실패했습니다");
    }
  };

  if (loading || !member) {
    return <p className="text-gray-500">불러오는 중...</p>;
  }

  const statusLabel = (s: MemberStatus) =>
    s === "PENDING" ? "승인 대기" : s === "APPROVED" ? "승인" : "거절";
  const statusClass = (s: MemberStatus) =>
    s === "PENDING"
      ? "bg-yellow-100 text-yellow-800"
      : s === "APPROVED"
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700";

  return (
    <div>
      <button
        onClick={() => router.push("/admin/members")}
        className="mb-4 text-sm text-gray-500 hover:text-gray-900"
      >
        &larr; 회원 목록으로
      </button>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
          <span className={`rounded px-2 py-0.5 text-xs ${statusClass(member.status)}`}>
            {statusLabel(member.status)}
          </span>
        </div>
        <button
          onClick={handleDelete}
          className="rounded border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          회원 삭제
        </button>
      </div>

      {/* 기본 정보 */}
      <div className="mb-6 rounded border border-gray-200 p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">기본 정보</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">이메일</dt>
            <dd className="mt-1 text-gray-900">{member.email}</dd>
          </div>
          <div>
            <dt className="text-gray-500">역할</dt>
            <dd className="mt-1">
              <span
                className={`rounded px-2 py-0.5 text-xs ${
                  member.role === "COMPANY"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {member.role === "COMPANY" ? "기업" : "크리에이터"}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">가입일</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(member.createdAt).toLocaleString("ko-KR")}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">작성한 콘텐츠</dt>
            <dd className="mt-1 text-gray-900">{member.contentCount}건</dd>
          </div>
        </dl>
      </div>

      {/* 승인 관리 */}
      {member.role === "CREATOR" && (
        <div className="mb-6 rounded border border-gray-200 p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">승인 관리</h2>
          <p className="mb-4 text-sm text-gray-500">
            현재 상태:{" "}
            <span className={`rounded px-2 py-0.5 text-xs ${statusClass(member.status)}`}>
              {statusLabel(member.status)}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStatusChange("APPROVED")}
              disabled={member.status === "APPROVED"}
              className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              승인
            </button>
            <button
              onClick={() => handleStatusChange("REJECTED")}
              disabled={member.status === "REJECTED"}
              className="rounded border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              거절
            </button>
            <button
              onClick={() => handleStatusChange("PENDING")}
              disabled={member.status === "PENDING"}
              className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              대기로 되돌리기
            </button>
          </div>
        </div>
      )}

      {/* 크리에이터 프로필 / 설문 응답 */}
      {member.creatorProfile && (
        <div className="mb-6 rounded border border-gray-200 p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">설문 응답</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">성별</dt>
              <dd className="mt-1 text-gray-900">
                {member.creatorProfile.gender
                  ? GENDER_LABEL[member.creatorProfile.gender]
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">나이</dt>
              <dd className="mt-1 text-gray-900">
                {member.creatorProfile.age ?? "-"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">주 사용 편집 툴</dt>
              <dd className="mt-1 text-gray-900">
                {member.creatorProfile.editingTool
                  ? EDITING_TOOL_LABEL[member.creatorProfile.editingTool]
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">얼굴 공개</dt>
              <dd className="mt-1 text-gray-900">
                {member.creatorProfile.faceExposure ? "가능" : "불가능"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">인스타그램</dt>
              <dd className="mt-1 text-gray-900">
                {member.creatorProfile.instagramId
                  ? `@${member.creatorProfile.instagramId}`
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">틱톡</dt>
              <dd className="mt-1 text-gray-900">
                {member.creatorProfile.tiktokId
                  ? `@${member.creatorProfile.tiktokId}`
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">유튜브</dt>
              <dd className="mt-1 text-gray-900">
                {member.creatorProfile.youtubeId
                  ? `@${member.creatorProfile.youtubeId}`
                  : "-"}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* 역할 변경 */}
      <div className="rounded border border-gray-200 p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">역할 변경</h2>
        <div className="flex gap-3">
          <button
            onClick={() => handleRoleChange("COMPANY")}
            disabled={member.role === "COMPANY"}
            className={`rounded px-4 py-2 text-sm ${
              member.role === "COMPANY"
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            기업으로 변경
          </button>
          <button
            onClick={() => handleRoleChange("CREATOR")}
            disabled={member.role === "CREATOR"}
            className={`rounded px-4 py-2 text-sm ${
              member.role === "CREATOR"
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            크리에이터로 변경
          </button>
        </div>
      </div>
    </div>
  );
}
