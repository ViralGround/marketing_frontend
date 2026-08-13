"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import { useLang } from "@/lib/i18n";

const subscribeToHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function ThemeToggle() {
  const { theme, toggle, syncFromDocument } = useThemeStore();
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot,
  );
  const { t } = useLang();

  useEffect(() => {
    // pre-hydration 스크립트가 이미 <html.dark> 를 세팅했으니 store 도 거기에 맞춘다.
    syncFromDocument();
  }, [syncFromDocument]);

  // SSR 단계에서는 아이콘 미스매치를 피하려고 비워둔다.
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label={t("테마 전환", "Toggle theme")}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line-strong bg-transparent"
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? t("라이트모드로 전환", "Switch to light mode") : t("다크모드로 전환", "Switch to dark mode")}
      title={isDark ? t("라이트모드로 전환", "Switch to light mode") : t("다크모드로 전환", "Switch to dark mode")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line-strong bg-transparent text-muted hover:bg-surface-muted transition-colors"
    >
      {isDark ? (
        // sun
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        // moon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
