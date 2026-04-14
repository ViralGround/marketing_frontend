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
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-gray-900">
          Viral Ground
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/contents" className="text-gray-600 hover:text-gray-900">
            콘텐츠
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href={user?.role === "COMPANY" ? "/company/dashboard" : "/creator/dashboard"}
                className="text-gray-600 hover:text-gray-900"
              >
                대시보드
              </Link>
              <Link
                href="/contents/new"
                className="text-gray-600 hover:text-gray-900"
              >
                새 글
              </Link>
              <span className="text-sm text-gray-500">
                {user?.name} ({user?.role === "COMPANY" ? "기업" : "크리에이터"})
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
              className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
