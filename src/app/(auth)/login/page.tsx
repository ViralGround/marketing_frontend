import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111] p-8">
        <h1 className="text-center text-2xl font-bold text-foreground">
          크리에이터 로그인
        </h1>

        <Suspense fallback={<div className="h-40" />}>
          <LoginForm />
        </Suspense>

        <div className="space-y-2 text-center text-sm text-gray-500">
          <p>
            계정이 없으신가요?{" "}
            <Link href="/signup/creator" className="text-primary underline">
              크리에이터로 가입하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
