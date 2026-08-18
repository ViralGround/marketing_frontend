/**
 * "이 브라우저에 세션이 있었을 수 있다"는 로컬 힌트.
 *
 * 세션 쿠키는 HttpOnly라 JS로 존재를 확인할 수 없다. 힌트가 없으면 익명 방문으로
 * 간주해 공개 페이지의 부트스트랩 프로브(csrf→me→refresh 3연타)를 통째로 건너뛴다.
 * 힌트는 편의용일 뿐 권한과 무관하다 — 실제 인증은 언제나 서버 쿠키가 결정하고,
 * 보호 경로는 AuthGuard가 따로 검증한다. 어긋나면(힌트 없음+쿠키 유효) 로그인
 * 상태 표시가 늦게 나타나는 정도가 최악이다.
 */

const KEY = "vg-session-hint";

export function setSessionHint(): void {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    // 저장 불가(사파리 프라이빗 등)면 힌트 없이 동작 — 프로브가 늘어날 뿐 기능은 동일.
  }
}

export function clearSessionHint(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // 무시
  }
}

export function hasSessionHint(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
