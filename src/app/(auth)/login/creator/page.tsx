import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export default function CreatorLoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-line bg-surface p-8">
        <h1 className="text-center text-2xl font-bold text-foreground">
          크리에이터 로그인
        </h1>

        <Suspense fallback={<div className="h-40" />}>
          <LoginForm />
        </Suspense>

        <div className="space-y-2 text-center text-sm text-muted">
          <p>
            계정이 없으신가요?{" "}
            <Link href="/signup/creator" className="text-primary underline">
              크리에이터로 가입하기
            </Link>
          </p>
          <p>
            <Link
              href="/login/company"
              className="text-faint hover:text-primary underline-offset-4 hover:underline"
            >
              기업 담당자이신가요? 기업 로그인 →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
