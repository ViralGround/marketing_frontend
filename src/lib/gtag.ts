import { sendGAEvent } from "@next/third-parties/google";
import type { UserRole } from "@/types";

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

type GtagParamValue = string | number | boolean | null | undefined;
export type GtagParams = Record<string, GtagParamValue>;

/**
 * GA4 이벤트 전송. ID 미설정 시 no-op.
 * 이메일·전화번호 등 PII 는 절대 params 에 담지 말 것 — Google TOS 위반.
 */
export function trackEvent(name: string, params: GtagParams = {}): void {
  if (!GA_ID) return;
  sendGAEvent("event", name, params);
}

/**
 * 로그인된 사용자의 user_id 와 role 을 GA4 에 연결.
 * - user_id 는 GA4 Users 보고서에서 디바이스 간 합산에 사용.
 * - role 은 user_properties 로 등록해 보고서에서 세그먼트 필터 가능.
 */
export function setGaUser(userId: number | string, role?: UserRole): void {
  if (!GA_ID) return;
  sendGAEvent("config", GA_ID, { user_id: String(userId) });
  if (role) sendGAEvent("set", "user_properties", { role });
}

/** 로그아웃 시 user_id 와 user_properties 해제. */
export function clearGaUser(): void {
  if (!GA_ID) return;
  sendGAEvent("config", GA_ID, { user_id: null });
  sendGAEvent("set", "user_properties", { role: null });
}
