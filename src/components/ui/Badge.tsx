import type { HTMLAttributes } from "react";

/**
 * 디자인 시스템 표준 배지·칩.
 * - tone 으로 색을 정한다. 본문 텍스트 색으로 status 색 남발 금지.
 * - 라운드는 항상 full.
 * - 안에 점·아이콘 넣을 때는 children 으로.
 */

type Tone = "primary" | "success" | "warning" | "error" | "info" | "neutral";

interface Props extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const TONE: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error:   "bg-error/10 text-error",
  info:    "bg-info/10 text-info",
  neutral: "bg-surface-chip text-content-soft",
};

export default function Badge({
  tone = "primary",
  className = "",
  ...rest
}: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE[tone]} ${className}`}
      {...rest}
    />
  );
}
