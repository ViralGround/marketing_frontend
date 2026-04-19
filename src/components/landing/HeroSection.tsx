"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-bg via-white to-white dark:from-[#1a1025] dark:via-[#0a0a0a] dark:to-[#0a0a0a] pt-28 pb-20 md:pt-36 md:pb-28">
      {/* 배경 장식 */}
      <div className="absolute top-20 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 text-center">
        {/* 배지 */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary animate-fade-in">
          <span className="inline-block h-2 w-2 rounded-full bg-primary animate-[pulse_2s_infinite]" />
          첫 영상 업로드 시 3만원 즉시 지급
        </div>

        {/* 헤드라인 */}
        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl animate-fade-in-up">
          영상 하나로 시작하는
          <br />
          <span className="text-primary">나만의 부업</span>
        </h1>

        {/* 서브카피 */}
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500 dark:text-gray-400 md:text-xl animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          특별한 장비도, 경험도 필요 없습니다.
          <br className="hidden md:block" />
          수익을 얻으면서 나만의 인플루언서 채널까지 키워보세요.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <Link
            href="/signup/creator"
            className="w-full sm:w-auto rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            지금 크리에이터로 시작하기
          </Link>
        </div>

        {/* 부가 정보 */}
        <p className="mt-6 text-sm text-gray-400 dark:text-gray-500 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          가입비 무료 · 3분이면 가입 완료 · 언제든 그만둘 수 있어요
        </p>
      </div>
    </section>
  );
}
