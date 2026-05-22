"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import AlertModal from "@/components/ui/AlertModal";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

type MemberStatus = "PENDING" | "APPROVED" | "REJECTED";

interface MemberDetail {
  id: number;
  email: string;
  name: string;
  role: "CREATOR";
  status: MemberStatus;
  createdAt: string;
  updatedAt: string;
  applicationCount: number;
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

const STATUS_TONE: Record<MemberStatus, "warning" | "success" | "error"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
};

const STATUS_LABEL: Record<MemberStatus, string> = {
  PENDING: "승인 대기",
  APPROVED: "승인",
  REJECTED: "거절",
};

export default function AdminMemberDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleStatusChange = async (status: "APPROVED" | "REJECTED" | "PENDING") => {
    const label =
      status === "APPROVED" ? "승인" : status === "REJECTED" ? "거절" : "대기 상태로 변경";
    if (!confirm(`"${member?.name}" 회원을 ${label}하시겠습니까?`)) return;
    try {
      await api.patch(`/admin/members/${id}/status`, { status });
      setMember((prev) => (prev ? { ...prev, status } : null));
    } catch {
      setErrorMessage(`${label}에 실패했습니다`);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`"${member?.name}" 회원을 삭제하시겠습니까? 관련된 모든 데이터가 삭제됩니다.`))
      return;
    try {
      await api.delete(`/admin/members/${id}`);
      router.push("/admin/members");
    } catch {
      setErrorMessage("삭제에 실패했습니다");
    }
  };

  if (loading || !member) {
    return <p className="text-muted">불러오는 중...</p>;
  }

  return (
    <div>
      <button
        onClick={() => router.push("/admin/members")}
        className="mb-6 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        &larr; 회원 목록으로
      </button>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{member.name}</h1>
          <Badge tone={STATUS_TONE[member.status]}>{STATUS_LABEL[member.status]}</Badge>
        </div>
        <Button variant="secondary" size="sm" onClick={handleDelete}>
          회원 삭제
        </Button>
      </div>

      {/* 기본 정보 */}
      <Card className="mb-6">
        <h2 className="mb-5 text-lg font-semibold text-foreground">기본 정보</h2>
        <dl className="grid grid-cols-2 gap-5 text-sm">
          <div>
            <dt className="text-xs font-medium text-muted">이메일</dt>
            <dd className="mt-1 text-foreground">{member.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted">가입일</dt>
            <dd className="mt-1 text-foreground">
              {new Date(member.createdAt).toLocaleString("ko-KR")}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted">캠페인 지원</dt>
            <dd className="mt-1 text-foreground">{member.applicationCount}건</dd>
          </div>
        </dl>
      </Card>

      {/* 승인 관리 */}
      <Card className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">승인 관리</h2>
        <p className="mb-5 flex items-center gap-2 text-sm text-muted">
          현재 상태:
          <Badge tone={STATUS_TONE[member.status]}>{STATUS_LABEL[member.status]}</Badge>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => handleStatusChange("APPROVED")}
            disabled={member.status === "APPROVED"}
          >
            승인
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleStatusChange("REJECTED")}
            disabled={member.status === "REJECTED"}
          >
            거절
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleStatusChange("PENDING")}
            disabled={member.status === "PENDING"}
          >
            대기로 되돌리기
          </Button>
        </div>
      </Card>

      <AlertModal
        open={!!errorMessage}
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />

      {/* 크리에이터 프로필 / 설문 응답 */}
      {member.creatorProfile && (
        <Card className="mb-6">
          <h2 className="mb-5 text-lg font-semibold text-foreground">설문 응답</h2>
          <dl className="grid grid-cols-2 gap-5 text-sm">
            <div>
              <dt className="text-xs font-medium text-muted">성별</dt>
              <dd className="mt-1 text-foreground">
                {member.creatorProfile.gender
                  ? GENDER_LABEL[member.creatorProfile.gender]
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">나이</dt>
              <dd className="mt-1 text-foreground">
                {member.creatorProfile.age ?? "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">주 사용 편집 툴</dt>
              <dd className="mt-1 text-foreground">
                {member.creatorProfile.editingTool
                  ? EDITING_TOOL_LABEL[member.creatorProfile.editingTool]
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">얼굴 공개</dt>
              <dd className="mt-1 text-foreground">
                {member.creatorProfile.faceExposure ? "가능" : "불가능"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">인스타그램</dt>
              <dd className="mt-1 text-foreground">
                {member.creatorProfile.instagramId
                  ? `@${member.creatorProfile.instagramId}`
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">틱톡</dt>
              <dd className="mt-1 text-foreground">
                {member.creatorProfile.tiktokId
                  ? `@${member.creatorProfile.tiktokId}`
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">유튜브</dt>
              <dd className="mt-1 text-foreground">
                {member.creatorProfile.youtubeId
                  ? `@${member.creatorProfile.youtubeId}`
                  : "-"}
              </dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  );
}
