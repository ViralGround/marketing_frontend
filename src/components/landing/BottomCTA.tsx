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
          영상 만들고, 돈 받자.
          <br />
          지금 바로 시작하세요
        </h2>
        <p className="mt-4 text-lg text-white/80">
          가입비 무료, 첫 영상부터 기본급 2만원, 조회수에 따라 최대 250만원
        </p>
        <Link
          href="/signup/creator"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-surface px-10 py-4 text-lg font-semibold text-primary shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
        >
          무료로 시작하기
        </Link>
      </div>
    </section>
  );
}
