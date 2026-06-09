"use client";

import CompanySignupForm from "@/components/auth/CompanySignupForm";
import { useLang } from "@/lib/i18n";

export default function CompanySignupPage() {
  const { t } = useLang();

  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center py-12">
      <div className="w-full max-w-md space-y-6 rounded border border-line bg-surface p-8">
        <h1 className="text-center text-2xl font-bold text-foreground">
          {t("기업 회원가입", "Company sign up")}
        </h1>
        <CompanySignupForm />
      </div>
    </div>
  );
}
