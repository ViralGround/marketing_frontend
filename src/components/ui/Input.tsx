import type { InputHTMLAttributes, Ref } from "react";

/**
 * VG UI System 표준 텍스트 input — 킷 검색/폼 필드 스펙.
 * - 높이 44px, 라운드 10px
 * - focus: 보라 보더 + 라벤더 3px 링 (킷 Focus 상태)
 * - aria-invalid: 레드 보더 (킷 오류 상태) — 폼 검증에서 aria-invalid 를 지정
 */

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
}

const BASE =
  "block h-11 w-full rounded-[10px] border border-line bg-surface px-3.5 text-sm text-foreground placeholder-faint transition-[border-color,box-shadow] duration-150 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-bg aria-invalid:border-error aria-invalid:ring-error/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-muted";

export default function Input({ className = "", ref, ...rest }: Props) {
  return <input ref={ref} className={`${BASE} ${className}`} {...rest} />;
}
