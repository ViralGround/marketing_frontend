"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";

export default function CreatorHomePage() {
  const { user } = useAuthStore();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-10">
        <p className="text-sm text-gray-500">환영합니다</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          {user?.name ?? "크리에이터"} 님, 오늘도 좋은 콘텐츠를 만들어봐요.
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          href="/creator/dashboard"
          className="group rounded-xl border border-gray-200 p-6 transition hover:border-gray-400 hover:shadow-sm"
        >
          <h2 className="mb-1 text-lg font-semibold text-gray-900">내 대시보드</h2>
          <p className="text-sm text-gray-500">포트폴리오·협업 현황 한눈에 보기</p>
          <p className="mt-4 text-sm text-primary group-hover:underline">
            바로 가기 →
          </p>
        </Link>

        <Link
          href="/profile/setup"
          className="group rounded-xl border border-gray-200 p-6 transition hover:border-gray-400 hover:shadow-sm"
        >
          <h2 className="mb-1 text-lg font-semibold text-gray-900">프로필 관리</h2>
          <p className="text-sm text-gray-500">활동 정보와 채널 링크 업데이트</p>
          <p className="mt-4 text-sm text-primary group-hover:underline">
            수정하기 →
          </p>
        </Link>

        <Link
          href="/contents/new"
          className="group rounded-xl border border-gray-200 p-6 transition hover:border-gray-400 hover:shadow-sm"
        >
          <h2 className="mb-1 text-lg font-semibold text-gray-900">콘텐츠 올리기</h2>
          <p className="text-sm text-gray-500">새 작업물 업로드 및 공유</p>
          <p className="mt-4 text-sm text-primary group-hover:underline">
            작성하기 →
          </p>
        </Link>
      </div>

      <div className="mt-10 rounded-xl border border-dashed border-gray-300 p-10 text-center">
        <p className="text-gray-500">참여 가능한 캠페인이 곧 공개됩니다.</p>
      </div>
    </div>
  );
}
