"use client";

import { useSyncExternalStore } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import Link from "next/link";
import { useLang } from "@/lib/i18n";

const CONSENT_KEY = "vg_analytics_consent";
const CONSENT_EVENT = "vg:analytics-consent-changed";
type AnalyticsConsent = "accepted" | "declined" | null;

function readConsent(): AnalyticsConsent {
  const stored = window.localStorage.getItem(CONSENT_KEY);
  return stored === "accepted" || stored === "declined" ? stored : null;
}

function subscribeConsent(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === CONSENT_KEY) callback();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(CONSENT_EVENT, callback);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CONSENT_EVENT, callback);
  };
}

export default function ConsentAnalytics({ gaId }: { gaId?: string }) {
  const { t } = useLang();
  const consent = useSyncExternalStore(subscribeConsent, readConsent, () => null);

  const choose = (value: "accepted" | "declined") => {
    window.localStorage.setItem(CONSENT_KEY, value);
    window.dispatchEvent(new Event(CONSENT_EVENT));
    if (value === "declined") {
      const names = document.cookie
        .split(";")
        .map((part) => part.split("=")[0]?.trim())
        .filter((name) => name === "_ga" || name?.startsWith("_ga_"));
      names.forEach((name) => {
        document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
      });
    }
  };

  return (
    <>
      {gaId && consent === "accepted" && <GoogleAnalytics gaId={gaId} />}
      {gaId && consent === null && (
        <aside
          className="fixed inset-x-4 bottom-[calc(76px+env(safe-area-inset-bottom))] z-[200] mx-auto max-w-3xl border-2 border-ink bg-paper p-4 text-ink shadow-[0_18px_60px_rgba(10,9,11,0.18)] md:bottom-4 md:flex md:items-center md:gap-6"
          role="region"
          aria-label={t("분석 쿠키 선택", "Analytics cookie choice")}
        >
          <p className="flex-1 text-sm font-semibold leading-relaxed">
            {t(
              "Google Analytics 이용 통계는 동의한 경우에만 수집합니다. 거절해도 모든 기능을 이용할 수 있습니다.",
              "Google Analytics statistics are collected only with your consent. Everything works even if you decline.",
            )}{" "}
            <Link href="/privacy" className="underline underline-offset-4">{t("개인정보처리방침", "Privacy Policy")}</Link>
          </p>
          <div className="mt-4 flex gap-2 md:mt-0">
            <button className="min-h-11 border-2 border-ink px-4 text-sm font-black" type="button" onClick={() => choose("declined")}>
              {t("거절", "Decline")}
            </button>
            <button className="min-h-11 bg-violet px-4 text-sm font-black text-white" type="button" onClick={() => choose("accepted")}>
              {t("동의", "Accept")}
            </button>
          </div>
        </aside>
      )}
      {gaId && consent !== null && (
        <button
          type="button"
          onClick={() => {
            window.localStorage.removeItem(CONSENT_KEY);
            window.dispatchEvent(new Event(CONSENT_EVENT));
          }}
          className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] left-3 z-[59] min-h-11 border border-ink/35 bg-paper/95 px-3 text-xs font-bold text-ink shadow-sm backdrop-blur md:bottom-3"
        >
          {t("분석 쿠키 설정", "Cookie settings")}
        </button>
      )}
    </>
  );
}
