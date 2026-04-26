import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export default function CompanyLoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-line bg-surface p-8">
        <h1 className="text-center text-2xl font-bold text-foreground">
          기업 로그인
        </h1>

        <Suspense fallback={<div className="h-40" />}>
          <LoginForm />
        </Suspense>

        <div className="space-y-2 text-center text-sm text-muted">
          <p>
            계정이 없으신가요?{" "}
            <Link href="/signup/company" className="text-primary underline">
              기업으로 가입하기
            </Link>
          </p>
          <p>
            <Link
              href="/login/creator"
              className="text-faint hover:text-primary underline-offset-4 hover:underline"
            >
              크리에이터이신가요? 크리에이터 로그인 →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
