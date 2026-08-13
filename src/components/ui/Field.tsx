import type { ReactNode } from "react";

/**
 * VG UI System 폼 필드 래퍼 — 킷 폼 스크린의 라벨 문법.
 * - label + 필수(보라 *) / 선택 표기
 * - hint(회색 안내) / error(레드 안내) — 킷 12 "안내 메시지 스타일"
 */
export default function Field({
  label,
  htmlFor,
  required = false,
  optionalLabel,
  hint,
  error,
  children,
}: {
  label: ReactNode;
  htmlFor?: string;
  required?: boolean;
  /** 선택 항목 표기 텍스트 (예: "(선택)") */
  optionalLabel?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-content-soft">
        {label}
        {required && (
          <span className="ml-0.5 text-primary" aria-hidden="true">
            *
          </span>
        )}
        {optionalLabel && <span className="ml-1 font-normal text-faint">{optionalLabel}</span>}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-error">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-faint">{hint}</p>
      )}
    </div>
  );
}
