// 랜딩(공개) 페이지 경로 SSOT.
// - Header.tsx 내부에서 토글·CTA 표시 여부를 분기할 때
// - ConditionalFooter 가 자체 landing/Footer 와 layout/Footer 중첩 방지를 위해 layout 푸터를 숨길 때
// 둘 다 사용된다. 새 랜딩 페이지 추가 시 여기만 갱신.
const LANDING_PATHS = ["/", "/business"] as const;

export function isLandingPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (LANDING_PATHS as readonly string[]).includes(pathname);
}
