import type { HTMLAttributes, Ref } from "react";

/**
 * 디자인 시스템 표준 카드.
 * - radius: 2xl(16px). 큰 영역(Hero CTA)은 className 으로 rounded-3xl 오버라이드.
 * - padding 기본 p-6 md:p-8 (토스 톤의 여유 있는 여백). 작게 쓰려면 className 으로 조정.
 * - variant: flat(테두리만) / elevated(soft shadow) / highlight(보라 그라데이션 + 흰 텍스트)
 */

type Variant = "flat" | "elevated" | "highlight";

interface Props extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  ref?: Ref<HTMLDivElement>;
}

const VARIANT: Record<Variant, string> = {
  // 킷 카드 스펙: 16px 라운드(기본 rounded-2xl 유지) + 은은한 확산 그림자
  flat: "bg-surface border border-line shadow-[0_8px_24px_rgba(0,0,0,0.06)]",
  elevated: "bg-surface border border-line/60 shadow-[0_12px_32px_rgba(0,0,0,0.08)]",
  highlight: "bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg",
};

export default function Card({
  variant = "flat",
  className = "",
  ref,
  ...rest
}: Props) {
  return (
    <div
      ref={ref}
      className={`rounded-2xl p-6 md:p-8 ${VARIANT[variant]} ${className}`}
      {...rest}
    />
  );
}
