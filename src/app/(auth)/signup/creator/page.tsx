"use client";

import CreatorSignupForm from "@/components/auth/CreatorSignupForm";
import { useLang } from "@/lib/i18n";

export default function CreatorSignupPage() {
  const { t } = useLang();

  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center py-12">
      <div className="w-full max-w-md space-y-6 rounded border border-line bg-surface p-8">
        <h1 className="text-center text-2xl font-bold text-foreground">
          {t("크리에이터 가입 신청", "Creator sign-up application")}
        </h1>
        <CreatorSignupForm />
      </div>
    </div>
  );
}
