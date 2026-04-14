"use client";

import { useAuthStore } from "@/store/useAuthStore";

export default function CompanyDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        기업 대시보드
      </h1>
      <p className="mb-8 text-gray-500">환영합니다, {user?.name}님</p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded border border-gray-200 p-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            캠페인
          </h2>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-500">진행 중인 캠페인</p>
        </div>
        <div className="rounded border border-gray-200 p-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            크리에이터
          </h2>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-500">연결된 크리에이터</p>
        </div>
        <div className="rounded border border-gray-200 p-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            콘텐츠
          </h2>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-500">게시된 콘텐츠</p>
        </div>
      </div>
    </div>
  );
}
