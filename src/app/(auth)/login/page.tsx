"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import AuthSurface from "@/components/auth/AuthSurface";

export default function LoginPage() {
  const { t } = useLang();

  return (
    <AuthSurface title={t("로그인", "Log in")} description={t("사용할 워크스페이스를 선택하세요.", "Choose the workspace you use.")}>
        <div className="space-y-3">
          <Link
            href="/login/creator"
            className="group flex min-h-20 flex-col justify-center gap-1 border-y-2 border-ink px-2 py-4 transition-[padding] hover:pl-5 hover:text-violet"
          >
            <span className="text-base font-semibold text-foreground">
              {t("크리에이터 로그인", "Creator log in")}
            </span>
            <span className="text-sm text-muted">
              {t("캠페인에 지원하고 콘텐츠를 제작합니다", "Apply to campaigns and create content")}
            </span>
          </Link>
          <Link
            href="/login/company"
            className="group flex min-h-20 flex-col justify-center gap-1 border-b-2 border-ink px-2 py-4 transition-[padding] hover:pl-5 hover:text-violet"
          >
            <span className="text-base font-semibold text-foreground">
              {t("브랜드 로그인", "Brand log in")}
            </span>
            <span className="text-sm text-muted">
              {t("캠페인을 등록하고 크리에이터를 모집합니다", "Post campaigns and recruit creators")}
            </span>
          </Link>
        </div>

        <p className="mt-7 text-center text-xs text-muted">
          {t("계정이 없으신가요?", "Don't have an account?")}{" "}
          <Link href="/signup" className="text-foreground underline">
            {t("가입하기", "Sign up")}
          </Link>
        </p>
    </AuthSurface>
  );
}
