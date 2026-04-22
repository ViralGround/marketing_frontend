"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { removeTokens } from "@/lib/auth";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/types";

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
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
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
                  className="text-gray-600 dark:text-gray-400 hover:text-primary"
                >
                  마이페이지
                </Link>
              )}
              {user.role === "COMPANY" && (
                <Link
                  href="/company/dashboard"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary"
                >
                  마이페이지
                </Link>
              )}
              {user.role === "ADMIN" && (
                <Link
                  href="/admin/members"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary"
                >
                  관리자
                </Link>
              )}
              <span className="text-sm text-gray-500">
                {user.name} ({ROLE_LABEL[user.role]})
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-700"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
