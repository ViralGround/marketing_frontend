"use client";

import type { ReactNode } from "react";
import { Heart } from "lucide-react";

/**
 * 실제 인스타그램 글리프(카메라 아웃라인). lucide-react 에 브랜드 아이콘이 없어 직접 SVG 로 구현.
 * Stitch 디자인의 떠다니는 인스타 장식·릴스 칩에 사용. (틱톡은 제외 — 인스타 전용)
 */
export function InstagramGlyph({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5.5" ry="5.5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

/** 글로시 인스타 앱 아이콘 — IG 브랜드 그라데이션 + 상단 하이라이트로 3D 광택 느낌. */
export function IgBadge({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const box =
    size === "lg"
      ? "h-16 w-16 rounded-[1.35rem]"
      : size === "sm"
        ? "h-10 w-10 rounded-xl"
        : "h-12 w-12 rounded-2xl";
  const icon = size === "lg" ? "h-8 w-8" : size === "sm" ? "h-5 w-5" : "h-6 w-6";
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F9A03F] shadow-xl shadow-fuchsia-600/40 ring-1 ring-white/40 ${box}`}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent" />
      <InstagramGlyph className={`relative text-white drop-shadow ${icon}`} />
    </div>
  );
}

/** 글로시 하트 배지. */
export function HeartBadge({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-9 w-9 rounded-xl" : "h-12 w-12 rounded-2xl";
  const icon = size === "sm" ? "h-4 w-4" : "h-6 w-6";
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-rose-400 to-pink-600 shadow-xl shadow-pink-600/40 ring-1 ring-white/40 ${box}`}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent" />
      <Heart className={`relative text-white drop-shadow ${icon}`} fill="currentColor" />
    </div>
  );
}

/** 떠다니는 장식 래퍼 — 절대배치 + float. 데스크탑 전용·비상호작용. */
export function FloatingIcon({
  className = "",
  delay = 0,
  children,
}: {
  className?: string;
  delay?: number;
  children: ReactNode;
}) {
  return (
    <div className={`pointer-events-none absolute z-0 hidden lg:block ${className}`}>
      <div className="animate-float" style={{ animationDelay: `${delay}s` }}>
        {children}
      </div>
    </div>
  );
}

/** 흰 섹션 여백에 떠다니는 인스타/하트 장식 묶음(사진의 3D 플로팅 아이콘 재현). 섹션을 relative 로. */
export function SectionDecor({ variant = "a" }: { variant?: "a" | "b" | "c" }) {
  if (variant === "b") {
    return (
      <>
        <FloatingIcon className="right-[4%] top-[18%]" delay={0.6}>
          <IgBadge />
        </FloatingIcon>
        <FloatingIcon className="left-[5%] bottom-[14%] hidden xl:block" delay={1.3}>
          <HeartBadge size="sm" />
        </FloatingIcon>
      </>
    );
  }
  if (variant === "c") {
    return (
      <>
        <FloatingIcon className="left-[4%] top-[20%]" delay={0.3}>
          <IgBadge />
        </FloatingIcon>
        <FloatingIcon className="right-[5%] bottom-[16%]" delay={1.1}>
          <IgBadge size="sm" />
        </FloatingIcon>
      </>
    );
  }
  return (
    <>
      <FloatingIcon className="left-[5%] top-[16%]" delay={0.2}>
        <IgBadge />
      </FloatingIcon>
      <FloatingIcon className="right-[4%] top-[30%]" delay={1.0}>
        <IgBadge size="sm" />
      </FloatingIcon>
    </>
  );
}

/** 떠다니는 반투명 3D 큐브(사진 배경의 유리 큐브 재현). 히어로 배경 장식용. */
export function GlassCube({ className = "", delay = 0, size = 64, rotate = 12 }: { className?: string; delay?: number; size?: number; rotate?: number }) {
  return (
    <div className={`pointer-events-none absolute z-0 hidden lg:block ${className}`} style={{ width: size, height: size }}>
      <div
        className="h-full w-full animate-float rounded-2xl border border-white/25 bg-white/10 backdrop-blur-sm"
        style={{ animationDelay: `${delay}s`, transform: `rotate(${rotate}deg)` }}
      />
    </div>
  );
}
