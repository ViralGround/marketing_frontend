"use client";

import CreatorSignupForm from "@/components/auth/CreatorSignupForm";
import { useLang } from "@/lib/i18n";
import AuthSurface from "@/components/auth/AuthSurface";

export default function CreatorSignupPage() {
  const { t } = useLang();

  return (
    <AuthSurface wide title={t("크리에이터 베타 지원", "Creator beta application")} description={t("약 5분이 걸립니다. 계정 정보, 제작 경험, 공개 범위를 순서대로 입력해 주세요.", "Allow about five minutes. Complete account details, creation experience, and consent in order.")}>
        <CreatorSignupForm />
    </AuthSurface>
  );
}
