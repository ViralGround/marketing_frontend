import type { InputHTMLAttributes, Ref } from "react";

/**
 * 디자인 시스템 표준 텍스트 input.
 * - 라운드 lg(8px). border + focus ring(primary/20) 의 토스 톤.
 * - placeholder 는 faint, 본문은 foreground.
 * - textarea 는 별도 컴포넌트 없이 동일 className 패턴을 따른다 (Phase 3 에서 정리).
 */

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
}

const BASE =
  "block w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-foreground placeholder-faint transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed";

export default function Input({ className = "", ref, ...rest }: Props) {
  return <input ref={ref} className={`${BASE} ${className}`} {...rest} />;
}
