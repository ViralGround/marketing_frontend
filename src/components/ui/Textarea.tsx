import type { Ref, TextareaHTMLAttributes } from "react";

/**
 * VG UI System 표준 textarea — Input 과 같은 필드 문법(라운드 10px,
 * 보라 focus + 라벤더 링). 페이지마다 복붙되던 TEXTAREA_CLASS 를 대체한다.
 */

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: Ref<HTMLTextAreaElement>;
}

const BASE =
  "block w-full rounded-[10px] border border-line bg-surface px-3.5 py-3 text-sm max-[1023px]:text-base leading-relaxed text-foreground placeholder-faint transition-[border-color,box-shadow] duration-150 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-bg aria-invalid:border-error disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-muted";

export default function Textarea({ className = "", ref, ...rest }: Props) {
  return <textarea ref={ref} className={`${BASE} ${className}`} {...rest} />;
}
