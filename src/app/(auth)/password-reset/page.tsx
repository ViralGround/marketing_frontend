"use client";

import AuthSurface from "@/components/auth/AuthSurface";
import PasswordResetFlow from "@/components/auth/PasswordResetFlow";
import { useLang } from "@/lib/i18n";

export default function PasswordResetPage() {
  const { t } = useLang();

  return (
    <AuthSurface
      title={t("비밀번호 재설정", "Reset password")}
      description={t(
        "가입한 이메일로 6자리 코드를 보내드려요. 코드 확인 후 새 비밀번호를 설정하면 기존 로그인은 모두 종료됩니다.",
        "We'll email you a 6-digit code. After confirming it and setting a new password, all existing sessions are signed out.",
      )}
    >
      <PasswordResetFlow />
    </AuthSurface>
  );
}
