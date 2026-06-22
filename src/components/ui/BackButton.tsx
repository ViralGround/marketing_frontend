"use client";

import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n";

/**
 * 상세·하위(한 뎁스) 페이지 좌상단 뒤로가기 버튼.
 * - `href` 를 주면 그 경로로 이동(부모 목록 등), 없으면 브라우저 뒤로(`router.back()`).
 * - 기존 인라인 뒤로가기 스타일(`&larr; 라벨`)과 동일하게 통일.
 */
interface Props {
  href?: string;
  labelKo?: string;
  labelEn?: string;
  className?: string;
}

export default function BackButton({ href, labelKo, labelEn, className = "" }: Props) {
  const router = useRouter();
  const { t } = useLang();
  const label = labelKo && labelEn ? t(labelKo, labelEn) : t("뒤로", "Back");

  return (
    <button
      type="button"
      onClick={() => (href ? router.push(href) : router.back())}
      className={`mb-6 text-sm font-medium text-muted transition-colors hover:text-foreground ${className}`}
    >
      &larr; {label}
    </button>
  );
}
