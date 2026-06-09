"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import AlertModal from "@/components/ui/AlertModal";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useLang } from "@/lib/i18n";

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

const EDITING_TOOL_LABEL: Record<string, { ko: string; en: string }> = {
  CAPCUT: { ko: "캡컷", en: "CapCut" },
  PREMIERE: { ko: "프리미어 프로", en: "Premiere Pro" },
  FINAL_CUT: { ko: "파이널 컷", en: "Final Cut" },
  VN: { ko: "VN", en: "VN" },
  OTHER: { ko: "기타", en: "Other" },
  NONE: { ko: "편집 경험 없음", en: "No editing experience" },
};

const GENDER_LABEL: Record<string, { ko: string; en: string }> = {
  MALE: { ko: "남성", en: "Male" },
  FEMALE: { ko: "여성", en: "Female" },
  OTHER: { ko: "기타", en: "Other" },
};

const STATUS_TONE: Record<MemberStatus, "warning" | "success" | "error"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
};

const STATUS_LABEL: Record<MemberStatus, { ko: string; en: string }> = {
  PENDING: { ko: "승인 대기", en: "Pending approval" },
  APPROVED: { ko: "승인", en: "Approved" },
  REJECTED: { ko: "거절", en: "Rejected" },
};

export default function AdminMemberDetailPage() {
  const { t } = useLang();
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
      status === "APPROVED"
        ? t("승인", "approve")
        : status === "REJECTED"
          ? t("거절", "reject")
          : t("대기 상태로 변경", "revert to pending");
    if (
      !confirm(
        t(`"${member?.name}" 회원을 ${label}하시겠습니까?`, `${label} member "${member?.name}"?`),
      )
    )
      return;
    try {
      await api.patch(`/admin/members/${id}/status`, { status });
      setMember((prev) => (prev ? { ...prev, status } : null));
    } catch {
      setErrorMessage(t(`${label}에 실패했습니다`, `Failed to ${label}`));
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        t(
          `"${member?.name}" 회원을 삭제하시겠습니까? 관련된 모든 데이터가 삭제됩니다.`,
          `Delete member "${member?.name}"? All related data will be deleted.`,
        ),
      )
    )
      return;
    try {
      await api.delete(`/admin/members/${id}`);
      router.push("/admin/members");
    } catch {
      setErrorMessage(t("삭제에 실패했습니다", "Failed to delete"));
    }
  };

  if (loading || !member) {
    return <p className="text-muted">{t("불러오는 중...", "Loading...")}</p>;
  }

  return (
    <div>
      <button
        onClick={() => router.push("/admin/members")}
        className="mb-6 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        &larr; {t("회원 목록으로", "Back to member list")}
      </button>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{member.name}</h1>
          <Badge tone={STATUS_TONE[member.status]}>
            {t(STATUS_LABEL[member.status].ko, STATUS_LABEL[member.status].en)}
          </Badge>
        </div>
        <Button variant="secondary" size="sm" onClick={handleDelete}>
          {t("회원 삭제", "Delete member")}
        </Button>
      </div>

      {/* 기본 정보 */}
      <Card className="mb-6">
        <h2 className="mb-5 text-lg font-semibold text-foreground">{t("기본 정보", "Basic info")}</h2>
        <dl className="grid grid-cols-2 gap-5 text-sm">
          <div>
            <dt className="text-xs font-medium text-muted">{t("이메일", "Email")}</dt>
            <dd className="mt-1 text-foreground">{member.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted">{t("가입일", "Joined")}</dt>
            <dd className="mt-1 text-foreground">
              {new Date(member.createdAt).toLocaleString("ko-KR")}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted">{t("캠페인 지원", "Applications")}</dt>
            <dd className="mt-1 text-foreground">
              {member.applicationCount}
              {t("건", "")}
            </dd>
          </div>
        </dl>
      </Card>

      {/* 승인 관리 */}
      <Card className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          {t("승인 관리", "Approval management")}
        </h2>
        <p className="mb-5 flex items-center gap-2 text-sm text-muted">
          {t("현재 상태:", "Current status:")}
          <Badge tone={STATUS_TONE[member.status]}>
            {t(STATUS_LABEL[member.status].ko, STATUS_LABEL[member.status].en)}
          </Badge>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => handleStatusChange("APPROVED")}
            disabled={member.status === "APPROVED"}
          >
            {t("승인", "Approve")}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleStatusChange("REJECTED")}
            disabled={member.status === "REJECTED"}
          >
            {t("거절", "Reject")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleStatusChange("PENDING")}
            disabled={member.status === "PENDING"}
          >
            {t("대기로 되돌리기", "Revert to pending")}
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
          <h2 className="mb-5 text-lg font-semibold text-foreground">
            {t("설문 응답", "Survey responses")}
          </h2>
          <dl className="grid grid-cols-2 gap-5 text-sm">
            <div>
              <dt className="text-xs font-medium text-muted">{t("성별", "Gender")}</dt>
              <dd className="mt-1 text-foreground">
                {member.creatorProfile.gender
                  ? t(
                      GENDER_LABEL[member.creatorProfile.gender].ko,
                      GENDER_LABEL[member.creatorProfile.gender].en,
                    )
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">{t("나이", "Age")}</dt>
              <dd className="mt-1 text-foreground">
                {member.creatorProfile.age ?? "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">
                {t("주 사용 편집 툴", "Primary editing tool")}
              </dt>
              <dd className="mt-1 text-foreground">
                {member.creatorProfile.editingTool
                  ? t(
                      EDITING_TOOL_LABEL[member.creatorProfile.editingTool].ko,
                      EDITING_TOOL_LABEL[member.creatorProfile.editingTool].en,
                    )
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">{t("얼굴 공개", "Face exposure")}</dt>
              <dd className="mt-1 text-foreground">
                {member.creatorProfile.faceExposure
                  ? t("가능", "Yes")
                  : t("불가능", "No")}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">{t("인스타그램", "Instagram")}</dt>
              <dd className="mt-1 text-foreground">
                {member.creatorProfile.instagramId
                  ? `@${member.creatorProfile.instagramId}`
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">{t("틱톡", "TikTok")}</dt>
              <dd className="mt-1 text-foreground">
                {member.creatorProfile.tiktokId
                  ? `@${member.creatorProfile.tiktokId}`
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">{t("유튜브", "YouTube")}</dt>
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
