"use client";

import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";
import { useLang } from "@/lib/i18n";
import AuthSurface from "@/components/auth/AuthSurface";

export default function CompanyLoginPage() {
  const { t } = useLang();

  return (
    <AuthSurface title={t("브랜드 로그인", "Brand log in")} description={t("캠페인과 크리에이터 협업을 이어가세요.", "Continue your campaigns and creator work.")}>
        <Suspense fallback={<div className="h-40" />}>
          <LoginForm />
        </Suspense>

        <div className="space-y-2 text-center text-sm text-muted">
          <p>
            {t("계정이 없으신가요?", "Don't have an account?")}{" "}
            <Link href="/signup/company" className="text-primary underline">
              {t("브랜드로 가입하기", "Sign up as a Brand")}
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
    </AuthSurface>
  );
}
