"use client";

import { useAuthStore } from "@/store/useAuthStore";

export default function CreatorDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        크리에이터 대시보드
      </h1>
      <p className="mb-8 text-gray-500">환영합니다, {user?.name}님</p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded border border-gray-200 p-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            포트폴리오
          </h2>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-500">등록된 작업물</p>
        </div>
        <div className="rounded border border-gray-200 p-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            기회
          </h2>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-500">참여 가능한 캠페인</p>
        </div>
        <div className="rounded border border-gray-200 p-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            협업
          </h2>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-500">진행 중인 협업</p>
        </div>
      </div>
    </div>
  );
}
