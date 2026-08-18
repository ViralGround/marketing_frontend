import type { HTMLAttributes, Ref } from "react";

/**
 * 디자인 시스템 표준 카드.
 * - radius: 2xl(16px). 큰 영역(Hero CTA)은 className 으로 rounded-3xl 오버라이드.
 * - padding 기본 p-5. 워크스페이스의 16/24px 리듬에 맞추고, 큰 편집 표면만 className 으로 확장.
 * - variant: flat(테두리만) / elevated(soft shadow) / highlight(보라 그라데이션 + 흰 텍스트)
 */

type Variant = "flat" | "elevated" | "highlight";

interface Props extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  ref?: Ref<HTMLDivElement>;
}

const VARIANT: Record<Variant, string> = {
  flat: "bg-surface border border-line",
  elevated: "bg-surface shadow-[0_12px_30px_rgba(15,15,18,0.08)]",
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
      className={`rounded-[14px] p-5 ${VARIANT[variant]} ${className}`}
      {...rest}
    />
  );
}
