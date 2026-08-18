"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import primitives from "@/components/workspace/WorkspacePrimitives.module.css";

/**
 * 관리자도 브랜드·크리에이터와 같은 WorkspaceShell 크롬을 쓴다.
 * 이전에는 전역 Header 아래 자체 사이드바가 겹쳐 이중 크롬이었다.
 * 관리자 페이지들은 자체 스크롤 래퍼가 없어 레이아웃에서 .page 로 감싼다
 * (셸 콘텐츠 영역은 overflow:hidden — 스크롤은 .page 가 담당).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="ADMIN">
      <WorkspaceShell role="ADMIN">
        <div className={`${primitives.page} ${primitives.pageWide}`}>{children}</div>
      </WorkspaceShell>
    </AuthGuard>
  );
}
