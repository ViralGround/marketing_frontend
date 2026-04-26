"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { removeTokens } from "@/lib/auth";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/types";
import ThemeToggle from "@/components/ui/ThemeToggle";

const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: "관리자",
  COMPANY: "기업",
  CREATOR: "크리에이터",
};

const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: "/admin/members",
  COMPANY: "/company/dashboard",
  CREATOR: "/creator/home",
};

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    removeTokens();
    logout();
    router.push("/login");
  };

  const logoHref = isAuthenticated && user ? ROLE_HOME[user.role] : "/";

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href={logoHref} className="text-xl font-bold text-primary">
          Viral Ground
        </Link>
        <nav className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              {user.role === "CREATOR" && (
                <Link
                  href="/creator/mypage"
                  className="text-muted hover:text-primary"
                >
                  마이페이지
                </Link>
              )}
              {user.role === "COMPANY" && (
                <Link
                  href="/company/dashboard"
                  className="text-muted hover:text-primary"
                >
                  마이페이지
                </Link>
              )}
              {user.role === "ADMIN" && (
                <>
                  <Link
                    href="/admin/dashboard"
                    className="text-muted hover:text-primary"
                  >
                    대시보드
                  </Link>
                  <Link
                    href="/admin/members"
                    className="text-muted hover:text-primary"
                  >
                    회원 관리
                  </Link>
                </>
              )}
              <span className="text-sm text-muted">
                {user.name} ({ROLE_LABEL[user.role]})
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-700"
              >
                로그아웃
              </button>
              <ThemeToggle />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark"
              >
                로그인
              </Link>
              <ThemeToggle />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
