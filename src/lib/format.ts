import type { Lang } from "./i18n";

/** 소수 1자리로 반올림하되 `.0` 은 떼어낸다. (4517000/10000 → "451.7", 30000/10000 → "3") */
function oneDecimal(x: number): string {
  return (Math.round(x * 10) / 10).toString();
}

/**
 * 큰 수를 짧게 표기. 차트 축·KPI 카드처럼 공간이 좁은 곳에서 사용.
 * - ko: 억/만 단위 (451.7만, 1.2억). 1만 미만은 천 단위 콤마.
 * - en: Intl compact (451.7K, 1.2M).
 */
export function compactNumber(n: number, lang: Lang): string {
  if (lang === "en") {
    return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
  }
  if (n >= 100_000_000) return `${oneDecimal(n / 100_000_000)}억`;
  if (n >= 10_000) return `${oneDecimal(n / 10_000)}만`;
  return n.toLocaleString("ko-KR");
}

/** 천 단위 콤마가 들어간 정확한 수. 표처럼 정밀도가 필요한 곳에서 사용. */
export function exactNumber(n: number, lang: Lang): string {
  return n.toLocaleString(lang === "en" ? "en-US" : "ko-KR");
}

/** 비율(0~1)을 백분율 문자열로. (0.1123 → "11.2%") */
export function percent(fraction: number): string {
  return `${(fraction * 100).toFixed(1)}%`;
}
