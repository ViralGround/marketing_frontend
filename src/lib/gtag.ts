import { sendGAEvent } from "@next/third-parties/google";
import type { UserRole } from "@/types";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

type GtagParamValue = string | number | boolean | null | undefined;
type GtagParams = Record<string, GtagParamValue>;

function analyticsAllowed(): boolean {
  return typeof window !== "undefined" && window.localStorage.getItem("vg_analytics_consent") === "accepted";
}

/**
 * GA4 이벤트 전송. ID 미설정 시 no-op.
 * 이메일·전화번호 등 PII 는 절대 params 에 담지 말 것 — Google TOS 위반.
 */
export function trackEvent(name: string, params: GtagParams = {}): void {
  if (!GA_ID || !analyticsAllowed()) return;
  sendGAEvent("event", name, params);
}

/**
 * 동의한 사용자의 역할만 익명 속성으로 전송한다. 내부 member id는 보내지 않는다.
 */
export function setGaUser(_userId: number | string, role?: UserRole): void {
  if (!GA_ID || !analyticsAllowed()) return;
  if (role) sendGAEvent("set", "user_properties", { role });
}

/** 로그아웃 시 user_id 와 user_properties 해제. */
export function clearGaUser(): void {
  if (!GA_ID || !analyticsAllowed()) return;
  sendGAEvent("set", "user_properties", { role: null });
}
