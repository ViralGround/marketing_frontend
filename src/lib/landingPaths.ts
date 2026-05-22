// 랜딩(공개) 페이지 경로 SSOT. 자체 LandingHeader/Footer 를 사용하므로
// layout 의 기본 헤더/푸터를 같이 렌더하면 겹친다. 새 랜딩 페이지 추가 시 여기만 갱신.
const LANDING_PATHS = ["/", "/business"] as const;

export function isLandingPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (LANDING_PATHS as readonly string[]).includes(pathname);
}
