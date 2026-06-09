"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { trackEvent } from "@/lib/gtag";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="border-t border-line bg-surface py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div>
            <Link href="/" className="text-lg font-bold text-primary">
              Viral Ground
            </Link>
            <p className="mt-1 text-sm text-faint">
              {t("크리에이터와 브랜드를 연결하는 마케팅 플랫폼", "Connecting creators and brands.")}
            </p>
          </div>
          <nav className="flex gap-6 text-sm text-muted">
            <Link
              href="/login"
              onClick={() => trackEvent("cta_click", { location: "footer", target: "login" })}
              className="transition-colors hover:text-primary"
            >
              {t("로그인", "Log in")}
            </Link>
            <Link
              href="/signup/creator"
              onClick={() =>
                trackEvent("cta_click", { location: "footer", target: "signup_creator" })
              }
              className="transition-colors hover:text-primary"
            >
              {t("크리에이터 가입", "Become a creator")}
            </Link>
            <Link
              href="/contents"
              onClick={() => trackEvent("cta_click", { location: "footer", target: "contents" })}
              className="transition-colors hover:text-primary"
            >
              {t("콘텐츠", "Content")}
            </Link>
          </nav>
        </div>
        <div className="mt-8 border-t border-line pt-6 text-center text-xs text-faint">
          &copy; {new Date().getFullYear()} Viral Ground. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
