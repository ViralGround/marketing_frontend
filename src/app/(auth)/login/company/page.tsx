"use client";

import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";
import { useLang } from "@/lib/i18n";

export default function CompanyLoginPage() {
  const { t } = useLang();

  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-line bg-surface p-8">
        <h1 className="text-center text-2xl font-bold text-foreground">
          {t("기업 로그인", "Company log in")}
        </h1>

        <Suspense fallback={<div className="h-40" />}>
          <LoginForm />
        </Suspense>

        <div className="space-y-2 text-center text-sm text-muted">
          <p>
            {t("계정이 없으신가요?", "Don't have an account?")}{" "}
            <Link href="/signup/company" className="text-primary underline">
              {t("기업으로 가입하기", "Sign up as a Company")}
            </Link>
          </p>
          <p>
            <Link
              href="/login/creator"
              className="text-faint hover:text-primary underline-offset-4 hover:underline"
            >
              {t("크리에이터이신가요? 크리에이터 로그인 →", "Are you a creator? Creator log in →")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
