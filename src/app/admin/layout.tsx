"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { removeTokens } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function AdminLayout({
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
      <aside className="w-56 border-r border-line bg-surface-muted p-4">
        <h2 className="mb-6 text-lg font-bold text-foreground">관리자</h2>
        <nav className="space-y-2">
          <Link
            href="/admin/members"
            className="block rounded px-3 py-2 text-sm text-content-soft hover:bg-gray-200"
          >
            회원 관리
          </Link>
          <Link
            href="/admin/campaigns"
            className="block rounded px-3 py-2 text-sm text-content-soft hover:bg-gray-200"
          >
            캠페인 관리
          </Link>
          <Link
            href="/admin/escrow"
            className="block rounded px-3 py-2 text-sm text-content-soft hover:bg-gray-200"
          >
            예치금 확인
          </Link>
        </nav>
        <div className="mt-8 border-t border-line pt-4">
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700"
          >
            로그아웃
          </button>
        </div>
      </aside>
      <div className="flex-1 p-8">{children}</div>
    </div>
    </AuthGuard>
  );
}
