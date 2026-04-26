"use client";

import Link from "next/link";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function BottomCTA() {
  const ref = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="bg-surface py-20 md:py-28">
      <div
        ref={ref}
        className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-primary to-primary-dark px-8 py-16 text-center md:px-16 md:py-20"
      >
        <h2 className="text-3xl font-bold text-white md:text-4xl">
          지금 시작하면,
          <br />
          첫 영상으로 3만원을 받을 수 있어요
        </h2>
        <p className="mt-4 text-lg text-white/80">
          180명 이상의 크리에이터가 이미 함께하고 있습니다
        </p>
        <Link
          href="/signup/creator"
          className="mt-8 inline-block rounded-xl bg-surface px-10 py-4 text-lg font-semibold text-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
        >
          무료로 시작하기
        </Link>

        <p className="mt-6 text-sm">
          <Link
            href="/signup/company"
            className="text-white/80 hover:text-white underline-offset-4 hover:underline transition-colors"
          >
            기업 담당자이신가요? 캠페인 등록하러 가기 →
          </Link>
        </p>
      </div>
    </section>
  );
}
