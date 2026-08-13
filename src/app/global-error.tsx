"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { error_boundary: "global" },
    });
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f6f5f1",
          color: "#0a090b",
          fontFamily:
            'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <main
          style={{
            width: "min(560px, calc(100% - 40px))",
            border: "1px solid rgba(10, 9, 11, 0.18)",
            borderRadius: 24,
            padding: "clamp(32px, 8vw, 64px)",
            background: "#ffffff",
            boxShadow: "0 24px 80px rgba(10, 9, 11, 0.08)",
          }}
        >
          <p
            style={{
              margin: "0 0 14px",
              color: "#7c3aed",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.12em",
            }}
          >
            VIRAL GROUND
          </p>
          <h1
            style={{
              margin: 0,
              fontFamily: '"Archivo Black", "Arial Black", sans-serif',
              fontSize: "clamp(32px, 8vw, 52px)",
              lineHeight: 1.04,
              letterSpacing: "-0.04em",
            }}
          >
            잠시 연결이
            <br />
            끊겼어요.
          </h1>
          <p
            style={{
              margin: "22px 0 30px",
              color: "#56515c",
              fontSize: 16,
              lineHeight: 1.7,
              wordBreak: "keep-all",
            }}
          >
            오류는 안전하게 기록했습니다. 잠시 후 다시 시도해 주세요.
          </p>
          <button
            type="button"
            onClick={unstable_retry}
            style={{
              minHeight: 48,
              border: 0,
              borderRadius: 999,
              padding: "0 24px",
              background: "#7c3aed",
              color: "#ffffff",
              font: "inherit",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            다시 시도하기
          </button>
        </main>
      </body>
    </html>
  );
}
