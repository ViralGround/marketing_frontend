"use client";

import { useState } from "react";
import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

type LoginTab = "CREATOR" | "COMPANY";

export default function LoginPage() {
  const [tab, setTab] = useState<LoginTab>("CREATOR");

  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111] p-8">
        {/* 탭 */}
        <div className="flex rounded-xl bg-gray-100 dark:bg-[#1a1a1a] p-1">
          <button
            onClick={() => setTab("CREATOR")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
              tab === "CREATOR"
                ? "bg-primary text-white shadow-sm"
                : "text-gray-500 hover:text-foreground"
            }`}
          >
            크리에이터
          </button>
          <button
            onClick={() => setTab("COMPANY")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
              tab === "COMPANY"
                ? "bg-primary text-white shadow-sm"
                : "text-gray-500 hover:text-foreground"
            }`}
          >
            기업
          </button>
        </div>

        <h1 className="text-center text-2xl font-bold text-foreground">
          {tab === "CREATOR" ? "크리에이터 로그인" : "기업 로그인"}
        </h1>

        <LoginForm />

        <div className="space-y-2 text-center text-sm text-gray-500">
          <p>
            계정이 없으신가요?{" "}
            <Link
              href={tab === "CREATOR" ? "/signup/creator" : "/signup/company"}
              className="text-primary underline"
            >
              {tab === "CREATOR" ? "크리에이터로 가입하기" : "기업으로 가입하기"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
