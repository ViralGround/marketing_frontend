"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";

/**
 * /profile/* (크리에이터 온보딩) 보호 레이아웃.
 * 이전에는 어떤 가드에도 속하지 않아 비로그인 접근 시 영구 오류 패널이 노출됐다.
 * 미들웨어 matcher(/profile/:path*)와 protectedPaths의 "/profile" 등록과 한 세트.
 */
export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard requiredRole="CREATOR">{children}</AuthGuard>;
}
