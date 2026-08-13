"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import AuthSurface from "@/components/auth/AuthSurface";

export default function SignupPage() {
  const { t } = useLang();

  return (
    <AuthSurface title={t("베타 참여", "Join the beta")} description={t("브랜드와 크리에이터 중 참여할 역할을 선택하세요.", "Choose whether you're joining as a brand or creator.")}>
        <div className="space-y-3">
          <Link
            href="/signup/creator"
            className="flex min-h-20 flex-col justify-center gap-1 border-y-2 border-ink px-2 py-4 transition-[padding] hover:pl-5 hover:text-violet"
          >
            <span className="text-base font-semibold text-foreground">
              {t("크리에이터로 가입", "Sign up as a Creator")}
            </span>
            <span className="text-sm text-muted">
              {t("캠페인에 지원하고 콘텐츠를 제작합니다", "Apply to campaigns and create content")}
            </span>
          </Link>
          <Link
            href="/signup/company"
            className="flex min-h-20 flex-col justify-center gap-1 border-b-2 border-ink px-2 py-4 transition-[padding] hover:pl-5 hover:text-violet"
          >
            <span className="text-base font-semibold text-foreground">
              {t("브랜드로 가입", "Sign up as a Brand")}
            </span>
            <span className="text-sm text-muted">
              {t("캠페인을 등록하고 크리에이터를 모집합니다", "Post campaigns and recruit creators")}
            </span>
          </Link>
        </div>

        <p className="mt-7 text-center text-xs text-muted">
          {t("이미 계정이 있으신가요?", "Already have an account?")}{" "}
          <Link href="/login" className="text-foreground underline">
            {t("로그인", "Log in")}
          </Link>
        </p>
    </AuthSurface>
  );
}
