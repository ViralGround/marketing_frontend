"use client";

import { ArrowRight } from "lucide-react";
import BookACallButton from "./BookACallButton";
import { useLang } from "@/lib/i18n";
import { trackEvent } from "@/lib/gtag";

export default function HeroSection() {
  const { t } = useLang();

  const seeResults = () => {
    trackEvent("cta_click", { location: "hero", target: "see_results" });
    document.querySelector("#results")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-bg via-background to-background pt-28 pb-20 md:pt-36 md:pb-28">
      {/* 배경 장식 */}
      <div className="absolute top-20 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        {/* 배지 */}
        <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <span className="inline-block h-2 w-2 rounded-full bg-primary animate-[pulse_2s_infinite]" />
          {t("업로드 1편 = 기본급 2만원 즉시 지급", "₩20,000 per upload, paid instantly")}
        </div>

        {/* 헤드라인 */}
        <h1 className="animate-fade-in-up mx-auto text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
          {t("폰 하나로 시작하는", "The high-paying side hustle")}
          <br />
          <span className="text-primary">
            {t("고수익 부업", "you run from your phone")}
          </span>
        </h1>

        {/* 서브카피 */}
        <p
          className="animate-fade-in-up mx-auto mt-6 max-w-2xl text-lg text-muted md:text-xl"
          style={{ animationDelay: "0.15s" }}
        >
          {t("팔로워도 경험도 필요 없어요.", "No followers or experience needed.")}
          <br />
          {t(
            "업로드만 해도 기본급 2만원, 조회수에 따라 최대 250만원.",
            "Get ₩20,000 base per upload, up to ₩2.5M by views.",
          )}
        </p>

        {/* CTA */}
        <div
          className="animate-fade-in-up mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ animationDelay: "0.3s" }}
        >
          <BookACallButton
            location="hero"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 sm:w-auto"
          >
            {t("무료 상담 예약", "Book a Call")}
            <ArrowRight className="h-5 w-5" strokeWidth={2.2} />
          </BookACallButton>
          <button
            type="button"
            onClick={seeResults}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-line-strong bg-surface px-8 py-4 text-lg font-semibold text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary sm:w-auto"
          >
            {t("성과 보기", "See Results")}
            <ArrowRight className="h-5 w-5" strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </section>
  );
}
