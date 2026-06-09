"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useLang } from "@/lib/i18n";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { t } = useLang();
  const [canEdit, setCanEdit] = useState<boolean | null>(null);
  const [editingSkill, setEditingSkill] = useState<string>("");
  const [faceExposure, setFaceExposure] = useState<boolean | null>(null);
  const [instagramId, setInstagramId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (canEdit === null) {
      setError(t("편집 가능 여부를 선택해주세요", "Please select whether you can edit"));
      return;
    }
    if (!editingSkill) {
      setError(t("편집 실력을 선택해주세요", "Please select your editing skill level"));
      return;
    }
    if (faceExposure === null) {
      setError(t("얼굴 공개 여부를 선택해주세요", "Please select whether you can show your face"));
      return;
    }

    setLoading(true);
    try {
      await api.post("/profile", {
        canEdit,
        editingSkill,
        faceExposure,
        profileImage: null,
        instagramId: instagramId || null,
      });
      router.push("/creator/home");
    } catch {
      setError(t("프로필 저장에 실패했습니다. 다시 시도해주세요.", "Failed to save your profile. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={() => router.push("/creator/mypage")}
          className="mb-4 text-sm text-muted hover:text-foreground"
        >
          &larr; {t("마이페이지로", "Back to my page")}
        </button>
        <div className="space-y-6 rounded border border-line bg-surface p-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("프로필 작성", "Set up your profile")}</h1>
          <p className="mt-1 text-sm text-muted">
            {t("크리에이터 활동을 위한 정보를 입력해주세요", "Enter the information needed to start creating.")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* 편집 가능 여부 */}
          <div>
            <label className="block text-sm font-medium text-content-soft mb-2">
              {t("편집을 할 수 있나요?", "Can you edit videos?")}
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCanEdit(true)}
                className={`flex-1 rounded border px-4 py-2 text-sm transition-colors ${
                  canEdit === true
                    ? "border-primary bg-primary text-white"
                    : "border-line-strong text-content-soft hover:bg-surface-muted"
                }`}
              >
                {t("예", "Yes")}
              </button>
              <button
                type="button"
                onClick={() => setCanEdit(false)}
                className={`flex-1 rounded border px-4 py-2 text-sm transition-colors ${
                  canEdit === false
                    ? "border-primary bg-primary text-white"
                    : "border-line-strong text-content-soft hover:bg-surface-muted"
                }`}
              >
                {t("아니요", "No")}
              </button>
            </div>
          </div>

          {/* 편집 실력 */}
          <div>
            <label className="block text-sm font-medium text-content-soft mb-2">
              {t("편집 실력은 어느 정도인가요?", "How would you rate your editing skill?")}
            </label>
            <div className="flex gap-3">
              {[
                { value: "HIGH", label: "상", labelEn: "High" },
                { value: "MEDIUM", label: "중", labelEn: "Medium" },
                { value: "LOW", label: "하", labelEn: "Low" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setEditingSkill(option.value)}
                  className={`flex-1 rounded border px-4 py-2 text-sm transition-colors ${
                    editingSkill === option.value
                      ? "border-primary bg-primary text-white"
                      : "border-line-strong text-content-soft hover:bg-surface-muted"
                  }`}
                >
                  {t(option.label, option.labelEn)}
                </button>
              ))}
            </div>
          </div>

          {/* 얼굴 공개 여부 */}
          <div>
            <label className="block text-sm font-medium text-content-soft mb-1">
              {t("얼굴이 공개되어도 상관없나요?", "Are you okay with showing your face?")}
            </label>
            <p className="text-xs text-faint mb-2">
              {t("얼굴 공개가 더 쉽게 수익을 올릴 수 있습니다", "Showing your face makes it easier to earn.")}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFaceExposure(true)}
                className={`flex-1 rounded border px-4 py-2 text-sm transition-colors ${
                  faceExposure === true
                    ? "border-primary bg-primary text-white"
                    : "border-line-strong text-content-soft hover:bg-surface-muted"
                }`}
              >
                {t("예", "Yes")}
              </button>
              <button
                type="button"
                onClick={() => setFaceExposure(false)}
                className={`flex-1 rounded border px-4 py-2 text-sm transition-colors ${
                  faceExposure === false
                    ? "border-primary bg-primary text-white"
                    : "border-line-strong text-content-soft hover:bg-surface-muted"
                }`}
              >
                {t("아니요", "No")}
              </button>
            </div>
          </div>

          {/* 인스타그램 */}
          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-content-soft">
              {t("인스타그램 아이디 (선택)", "Instagram handle (optional)")}
            </label>
            <p className="text-xs text-faint mb-1">
              {t("이미 운영하고 있는 계정이 있다면 입력해주세요", "Enter an account you already run, if any.")}
            </p>
            <div className="flex items-center mt-1">
              <span className="text-sm text-faint mr-1">@</span>
              <input
                id="instagram"
                type="text"
                value={instagramId}
                onChange={(e) => setInstagramId(e.target.value)}
                placeholder="instagram_id"
                className="block w-full rounded border border-line-strong px-3 py-2 text-foreground placeholder-faint focus:border-gray-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 text-white font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
          >
            {loading ? t("저장 중...", "Saving...") : t("프로필 완성하기", "Complete profile")}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}
