"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

interface MemberDetail {
  id: number;
  email: string;
  name: string;
  role: "COMPANY" | "CREATOR";
  createdAt: string;
  updatedAt: string;
  contentCount: number;
  creatorProfile: {
    canEdit: boolean;
    editingSkill: "HIGH" | "MEDIUM" | "LOW";
    faceExposure: boolean;
    instagramId: string | null;
    profileImage: string | null;
  } | null;
}

export default function AdminMemberDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/admin/members/${id}`)
      .then((res) => setMember(res.data))
      .catch(() => router.push("/admin/members"))
      .finally(() => setLoading(false));
  }, [id, router]);

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

  const skillLabel = (skill: string) => {
    if (skill === "HIGH") return "상";
    if (skill === "MEDIUM") return "중";
    return "하";
  };

  return (
    <div>
      <button
        onClick={() => router.push("/admin/members")}
        className="mb-4 text-sm text-gray-500 hover:text-gray-900"
      >
        &larr; 회원 목록으로
      </button>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
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

      {/* 크리에이터 프로필 */}
      {member.creatorProfile && (
        <div className="mb-6 rounded border border-gray-200 p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            크리에이터 프로필
          </h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">편집 가능 여부</dt>
              <dd className="mt-1 text-gray-900">
                {member.creatorProfile.canEdit ? "예" : "아니요"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">편집 실력</dt>
              <dd className="mt-1 text-gray-900">
                {skillLabel(member.creatorProfile.editingSkill)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">얼굴 공개</dt>
              <dd className="mt-1 text-gray-900">
                {member.creatorProfile.faceExposure ? "예" : "아니요"}
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
