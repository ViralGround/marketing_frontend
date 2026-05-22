"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { removeTokens } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    removeTokens();
    logout();
    router.push("/login");
  };

  return (
    <AuthGuard>
      <div className="flex min-h-[calc(100vh-65px)]">
        <aside className="w-56 border-r border-line bg-surface-muted p-5">
          <h2 className="mb-6 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
            기업 센터
          </h2>
          <nav className="space-y-1">
            <Link
              href="/company/dashboard"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-content-soft transition-colors hover:bg-surface hover:text-foreground"
            >
              대시보드
            </Link>
            <Link
              href="/company/campaigns"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-content-soft transition-colors hover:bg-surface hover:text-foreground"
            >
              내 캠페인
            </Link>
            <Link
              href="/company/campaigns/new"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-content-soft transition-colors hover:bg-surface hover:text-foreground"
            >
              캠페인 등록
            </Link>
          </nav>
          <div className="mt-8 border-t border-line pt-4">
            <button
              onClick={handleLogout}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-error"
            >
              로그아웃
            </button>
          </div>
        </aside>
        <div className="flex-1 p-8 md:p-10">{children}</div>
      </div>
    </AuthGuard>
  );
}
