"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { removeTokens } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useLang } from "@/lib/i18n";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLang();
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
            {t("관리자", "Admin")}
          </h2>
          <nav className="space-y-1">
            <Link
              href="/admin/members"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-content-soft transition-colors hover:bg-surface hover:text-foreground"
            >
              {t("회원 관리", "Members")}
            </Link>
            <Link
              href="/admin/campaigns"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-content-soft transition-colors hover:bg-surface hover:text-foreground"
            >
              {t("캠페인 관리", "Campaigns")}
            </Link>
            <Link
              href="/admin/escrow"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-content-soft transition-colors hover:bg-surface hover:text-foreground"
            >
              {t("예치금 확인", "Deposits")}
            </Link>
            <Link
              href="/admin/contacts"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-content-soft transition-colors hover:bg-surface hover:text-foreground"
            >
              {t("상담 신청", "Consultation requests")}
            </Link>
          </nav>
          <div className="mt-8 border-t border-line pt-4">
            <button
              onClick={handleLogout}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-error"
            >
              {t("로그아웃", "Log out")}
            </button>
          </div>
        </aside>
        <div className="flex-1 p-8 md:p-10">{children}</div>
      </div>
    </AuthGuard>
  );
}
