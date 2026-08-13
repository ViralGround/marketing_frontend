/**
 * Calendly 팝업 위젯 헬퍼.
 *
 * - 최초 호출 시 위젯 스크립트/CSS 를 1회 주입하고, 이후 팝업을 띄운다.
 *   (랜딩에서만 호출되므로 대시보드 등 다른 페이지엔 스크립트가 실리지 않는다.)
 * - 이벤트 URL은 회사 소유 `NEXT_PUBLIC_CALENDLY_URL`만 사용한다. 운영 빌드는 미설정을 거부한다.
 * - 스크립트 차단/실패 시 새 탭으로 폴백한다.
 */

const SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";
const CSS_HREF = "https://assets.calendly.com/assets/external/widget.css";

// 개인 계정 URL을 소스에 고정하지 않는다. 운영자가 회사 소유 이벤트 URL을 명시해야만
// 외부 위젯을 로드한다.
export const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL?.trim() ?? "";

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
  if (!url) return;
  try {
    await ensureWidget();
    window.Calendly?.initPopupWidget({ url });
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
