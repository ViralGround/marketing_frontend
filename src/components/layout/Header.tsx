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
          Marketing Platform
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/contents" className="text-gray-600 hover:text-gray-900">
            Contents
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href={user?.role === "COMPANY" ? "/company/dashboard" : "/creator/dashboard"}
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/contents/new"
                className="text-gray-600 hover:text-gray-900"
              >
                New
              </Link>
              <span className="text-sm text-gray-500">
                {user?.name} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
