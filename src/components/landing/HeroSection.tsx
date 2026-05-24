"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-bg via-background to-background pt-28 pb-20 md:pt-36 md:pb-28">
      {/* 배경 장식 */}
      <div className="absolute top-20 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 text-center">
        {/* 배지 */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary animate-fade-in">
          <span className="inline-block h-2 w-2 rounded-full bg-primary animate-[pulse_2s_infinite]" />
          업로드 1편 = 기본급 2만원 즉시 지급
        </div>

        {/* 헤드라인 */}
        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl animate-fade-in-up">
          영상 만들고
          <br />
          <span className="text-primary">돈 받자</span>
        </h1>

        {/* 서브카피 */}
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted md:text-xl animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          업로드만 해도 기본급, 조회수에 따라 최대 250만원.
          <br className="hidden md:block" />
          크리에이터로 참여하고 성과에 따라 보상받으세요.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <Link
            href="/signup/creator"
            className="inline-flex w-full items-center justify-center rounded-full bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 sm:w-auto"
          >
            지금 크리에이터로 시작하기
          </Link>
        </div>
      </div>
    </section>
  );
}
