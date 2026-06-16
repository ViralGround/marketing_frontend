/**
 * Calendly 팝업 위젯 헬퍼.
 *
 * - 최초 호출 시 위젯 스크립트/CSS 를 1회 주입하고, 이후 팝업을 띄운다.
 *   (랜딩에서만 호출되므로 대시보드 등 다른 페이지엔 스크립트가 실리지 않는다.)
 * - 이벤트 URL 은 `NEXT_PUBLIC_CALENDLY_URL` 로 덮어쓸 수 있고, 미설정 시 코드의 기본 URL 을 쓴다.
 * - 스크립트 차단/실패 시 새 탭으로 폴백한다.
 */

const SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";
const CSS_HREF = "https://assets.calendly.com/assets/external/widget.css";

// 실제 Calendly 이벤트 URL. .env(NEXT_PUBLIC_CALENDLY_URL)로 덮어쓸 수 있으나,
// 배포 환경에서 환경변수 누락 시에도 동작하도록 공개 URL 을 기본값으로 둔다.
export const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ?? "https://calendly.com/aqua4595/30min";

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
    };
  }
}

let injecting: Promise<void> | null = null;

function ensureWidget(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Calendly) return Promise.resolve();
  if (injecting) return injecting;

  injecting = new Promise<void>((resolve, reject) => {
    if (!document.querySelector(`link[href="${CSS_HREF}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = CSS_HREF;
      document.head.appendChild(link);
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing && window.Calendly) {
      resolve();
      return;
    }

    const script = existing ?? document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("Calendly 스크립트 로드 실패")));
    if (!existing) document.body.appendChild(script);
  });

  return injecting;
}

/** Calendly 예약 팝업을 띄운다. 실패 시 새 탭으로 폴백. */
export async function openCalendly(url: string = CALENDLY_URL): Promise<void> {
  try {
    await ensureWidget();
    window.Calendly?.initPopupWidget({ url });
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
