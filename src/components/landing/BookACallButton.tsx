"use client";

import type { ReactNode } from "react";
import { openCalendly } from "@/lib/calendly";
import { trackEvent } from "@/lib/gtag";

/**
 * "Book a Call" 버튼 — 클릭 시 Calendly 예약 팝업을 띄운다.
 * 스타일은 호출부에서 className 으로 제어(헤더 소형 / 히어로 대형 / CTA 위 등).
 */
export default function BookACallButton({
  children,
  location,
  className = "",
  onClick,
}: {
  children: ReactNode;
  /** GA 이벤트 구분용 위치 라벨(header / hero / bottom 등) */
  location: string;
  className?: string;
  /** 팝업 열기 직전 추가 동작(예: 모바일 메뉴 닫기) */
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        trackEvent("cta_click", { location, target: "book_a_call" });
        openCalendly();
      }}
      className={className}
    >
      {children}
    </button>
  );
}
