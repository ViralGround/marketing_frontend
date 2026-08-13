"use client";

import CompanySignupForm from "@/components/auth/CompanySignupForm";
import { useLang } from "@/lib/i18n";
import AuthSurface from "@/components/auth/AuthSurface";

export default function CompanySignupPage() {
  const { t } = useLang();

  return (
    <AuthSurface wide title={t("브랜드 베타 신청", "Brand beta application")} description={t("계정과 사업자 정보를 확인한 뒤 운영팀이 베타 참여 결과를 안내합니다.", "Our team reviews your account and business details before confirming beta access.")}>
        <CompanySignupForm />
    </AuthSurface>
  );
}
