"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * 앱 전역 경량 다국어(KO/EN) 스토어.
 *
 * - 기본 한국어. 토글 선택은 쿠키(`lang`)로 1년 유지.
 * - Provider 불필요: 모듈 레벨 외부 스토어 + `useSyncExternalStore` 로 구독한다.
 *   서버 스냅샷은 항상 "ko" 라 SSR/hydration 불일치가 없다(EN 선택 사용자는
 *   hydration 직후 1회 전환 — 기본값이 ko 라 대다수에겐 깜빡임이 없다).
 * - `useEffect` + setState 패턴을 쓰지 않으므로 `react-hooks/set-state-in-effect` 룰에 안 걸린다.
 * - 앱 전체(랜딩·인증·크리에이터·기업·관리자)에서 사용. 기본 한국어, 토글로 영어 전환.
 *   단 법무 페이지(약관·개인정보 등) 본문은 기계번역 금지로 한국어 유지.
 */

export type Lang = "ko" | "en";

const COOKIE_NAME = "lang";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

const listeners = new Set<() => void>();

function readLangFromCookie(): Lang {
  if (typeof document === "undefined") return "ko";
  const match = document.cookie.match(/(?:^|;\s*)lang=(ko|en)/);
  return match?.[1] === "en" ? "en" : "ko";
}

function getServerSnapshot(): Lang {
  return "ko";
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/** 언어를 바꾸고 쿠키에 저장한 뒤 구독 컴포넌트를 모두 갱신한다. */
function setLang(next: Lang): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
  document.documentElement.lang = next;
  listeners.forEach((listener) => listener());
}

/**
 * 현재 언어와 번역 헬퍼를 반환한다.
 * `t(ko, en)` 는 키 사전 없이 컴포넌트에 양쪽 문구를 그대로 두는 방식 — 랜딩처럼
 * 문구가 컴포넌트에 흩어져 있는 경우 가장 가볍다.
 */
export function useLang() {
  const lang = useSyncExternalStore(subscribe, readLangFromCookie, getServerSnapshot);
  const t = useCallback((ko: string, en: string) => (lang === "en" ? en : ko), [lang]);
  return { lang, setLang, t };
}
