"use client";

import type { ButtonHTMLAttributes, Ref } from "react";

/**
 * 디자인 시스템 표준 버튼.
 * - 라운드는 항상 full (토스 톤)
 * - variant: primary(채움) / secondary(아웃라인) / ghost(투명)
 * - size: sm / md / lg
 * - 클래스 합성 시 추가 className 은 마지막에 와서 utility override 가능
 */

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary-dark hover:shadow disabled:bg-primary",
  secondary:
    "border border-line-strong bg-surface text-foreground hover:border-primary/40 hover:text-primary",
  ghost:
    "text-content-soft hover:text-foreground hover:bg-surface-muted",
};

const SIZE: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-sm md:text-base",
  lg: "px-8 py-3.5 text-base md:text-lg",
};

const BASE =
  "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/30";

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ref,
  ...rest
}: Props) {
  return (
    <button
      ref={ref}
      className={`${BASE} ${VARIANT[variant]} ${SIZE[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    />
  );
}
