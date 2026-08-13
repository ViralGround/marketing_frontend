// 공개(시안4 chrome) 페이지 경로 SSOT.
// 이 경로들은 GroundTopbar·GroundFooter 를 스스로 그리므로
// 전역 Header(layout) 와 layout/Footer(ConditionalFooter) 를 모두 숨긴다.
// 새 공개 페이지 추가 시 여기만 갱신.
const LANDING_PATHS = ["/", "/business", "/creator", "/creators", "/campaigns"] as const;

export function isLandingPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (
    (LANDING_PATHS as readonly string[]).includes(pathname) ||
    pathname.startsWith("/creators/")
  );
}
