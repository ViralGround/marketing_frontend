"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";

export default function LoginPage() {
  const { t } = useLang();

  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center py-12">
      <div className="w-full max-w-md space-y-6 rounded border border-line bg-surface p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-foreground">{t("로그인", "Log in")}</h1>
          <p className="text-sm text-muted">{t("로그인 유형을 선택해주세요", "Please choose a login type")}</p>
        </div>

        <div className="space-y-3">
          <Link
            href="/login/creator"
            className="flex flex-col gap-1 rounded-lg border border-line-strong px-5 py-4 hover:border-gray-900"
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
            className="flex flex-col gap-1 rounded-lg border border-line-strong px-5 py-4 hover:border-gray-900"
          >
            <span className="text-base font-semibold text-foreground">
              {t("기업 로그인", "Company log in")}
            </span>
            <span className="text-sm text-muted">
              {t("캠페인을 등록하고 크리에이터를 모집합니다", "Post campaigns and recruit creators")}
            </span>
          </Link>
        </div>

        <p className="text-center text-xs text-muted">
          {t("계정이 없으신가요?", "Don't have an account?")}{" "}
          <Link href="/signup" className="text-foreground underline">
            {t("가입하기", "Sign up")}
          </Link>
        </p>
      </div>
    </div>
  );
}
