"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { removeTokens } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    removeTokens();
    logout();
    router.push("/login");
  };

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-primary">
          Viral Ground
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/contents" className="text-gray-600 dark:text-gray-400 hover:text-primary">
            콘텐츠
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href={user?.role === "ADMIN" ? "/admin/members" : "/creator/home"}
                className="text-gray-600 dark:text-gray-400 hover:text-primary"
              >
                {user?.role === "ADMIN" ? "관리자" : "홈"}
              </Link>
              {user?.role === "CREATOR" && (
                <Link
                  href="/creator/campaigns"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary"
                >
                  캠페인
                </Link>
              )}
              <span className="text-sm text-gray-500">
                {user?.name} ({user?.role === "ADMIN" ? "관리자" : "크리에이터"})
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
