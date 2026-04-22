"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function ProfileSetupPage() {
  const router = useRouter();
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
      setError("편집 가능 여부를 선택해주세요");
      return;
    }
    if (!editingSkill) {
      setError("편집 실력을 선택해주세요");
      return;
    }
    if (faceExposure === null) {
      setError("얼굴 공개 여부를 선택해주세요");
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
      setError("프로필 저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded border border-gray-200 bg-white p-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">프로필 작성</h1>
          <p className="mt-1 text-sm text-gray-500">
            크리에이터 활동을 위한 정보를 입력해주세요
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              편집을 할 수 있나요?
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCanEdit(true)}
                className={`flex-1 rounded border px-4 py-2 text-sm transition-colors ${
                  canEdit === true
                    ? "border-primary bg-primary text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                예
              </button>
              <button
                type="button"
                onClick={() => setCanEdit(false)}
                className={`flex-1 rounded border px-4 py-2 text-sm transition-colors ${
                  canEdit === false
                    ? "border-primary bg-primary text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                아니요
              </button>
            </div>
          </div>

          {/* 편집 실력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              편집 실력은 어느 정도인가요?
            </label>
            <div className="flex gap-3">
              {[
                { value: "HIGH", label: "상" },
                { value: "MEDIUM", label: "중" },
                { value: "LOW", label: "하" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setEditingSkill(option.value)}
                  className={`flex-1 rounded border px-4 py-2 text-sm transition-colors ${
                    editingSkill === option.value
                      ? "border-primary bg-primary text-white"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 얼굴 공개 여부 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              얼굴이 공개되어도 상관없나요?
            </label>
            <p className="text-xs text-gray-400 mb-2">
              얼굴 공개가 더 쉽게 수익을 올릴 수 있습니다
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFaceExposure(true)}
                className={`flex-1 rounded border px-4 py-2 text-sm transition-colors ${
                  faceExposure === true
                    ? "border-primary bg-primary text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                예
              </button>
              <button
                type="button"
                onClick={() => setFaceExposure(false)}
                className={`flex-1 rounded border px-4 py-2 text-sm transition-colors ${
                  faceExposure === false
                    ? "border-primary bg-primary text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                아니요
              </button>
            </div>
          </div>

          {/* 인스타그램 */}
          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
              인스타그램 아이디 (선택)
            </label>
            <p className="text-xs text-gray-400 mb-1">
              이미 운영하고 있는 계정이 있다면 입력해주세요
            </p>
            <div className="flex items-center mt-1">
              <span className="text-sm text-gray-400 mr-1">@</span>
              <input
                id="instagram"
                type="text"
                value={instagramId}
                onChange={(e) => setInstagramId(e.target.value)}
                placeholder="instagram_id"
                className="block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 text-white font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
          >
            {loading ? "저장 중..." : "프로필 완성하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
