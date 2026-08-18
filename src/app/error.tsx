"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import Link from "next/link";

/**
 * 라우트 레벨 오류 경계 — 이전에는 global-error만 있어 화면 전체가 교체됐다.
 * 레이아웃(헤더·푸터)을 유지한 채 본문만 오류 카드로 대체한다.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { error_boundary: "route" },
    });
  }, [error]);

  return (
    <main className="grid min-h-[calc(100svh-65px)] place-items-center bg-paper px-5 py-16 text-ink">
      <div className="w-full max-w-[560px] rounded-3xl border border-ink/20 bg-white p-8 shadow-[0_24px_80px_rgba(10,9,11,0.08)] sm:p-12">
        <p className="mb-3 text-[13px] font-extrabold tracking-[0.12em] text-violet">VIRAL GROUND</p>
        <h1 className="font-display text-[clamp(32px,8vw,52px)] leading-[1.04] tracking-[-0.04em]">
          화면을 여는 중
          <br />
          문제가 생겼어요.
        </h1>
        <p className="mb-8 mt-5 text-base leading-relaxed text-ink/60" style={{ wordBreak: "keep-all" }}>
          오류는 안전하게 기록했습니다. 다시 시도해도 반복되면 잠시 후에 들러주세요.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-12 cursor-pointer items-center rounded-full border-0 bg-violet px-6 font-extrabold text-white"
          >
            다시 시도하기
          </button>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center rounded-full border-2 border-ink px-6 font-extrabold text-ink"
          >
            홈으로 가기
          </Link>
        </div>
      </div>
    </main>
  );
}
