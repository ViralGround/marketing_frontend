"use client";

import type { ButtonHTMLAttributes, Ref } from "react";

/**
 * VG UI System 표준 버튼 — 킷 "BUTTONS & CONTROLS" 시트 01 스펙.
 * - 크기: sm 32px / md 40px / lg 48px, 라운드 10px
 * - variant: primary(보라 채움) / secondary(보라 아웃라인) / ghost / destructive(삭제)
 * - loading: 스피너 + 비활성 (킷 Loading 상태)
 * - focus: 라벤더 3px 링
 */

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-dark active:bg-primary-dark disabled:bg-primary",
  secondary:
    "border border-primary/60 bg-surface text-primary hover:border-primary hover:bg-primary-bg active:bg-primary-bg",
  ghost:
    "text-content-soft hover:text-foreground hover:bg-surface-chip active:bg-surface-chip",
  destructive:
    "bg-error text-white hover:brightness-95 active:brightness-90 disabled:bg-error",
};

const SIZE: Record<Size, string> = {
  sm: "h-11 px-3.5 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-[15px]",
};

const BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-bg focus-visible:border-primary";

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  className = "",
  disabled,
  children,
  ref,
  ...rest
}: Props) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${BASE} ${VARIANT[variant]} ${SIZE[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80"
        />
      )}
      {children}
    </button>
  );
}
