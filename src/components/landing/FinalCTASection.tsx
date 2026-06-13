"use client";

import { ArrowRight } from "lucide-react";
import BookACallButton from "./BookACallButton";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLang } from "@/lib/i18n";

export default function FinalCTASection() {
  const ref = useScrollAnimation<HTMLDivElement>();
  const { t } = useLang();

  return (
    <section className="bg-surface py-20 md:py-28">
      <div
        ref={ref}
        className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-primary to-primary-dark px-8 py-16 text-center md:px-16 md:py-20"
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white">
          <span className="inline-block h-2 w-2 rounded-full bg-white animate-[pulse_2s_infinite]" />
          {t("지금 크리에이터 모집 중", "Now recruiting creators")}
        </span>

        <h2 className="mt-6 text-3xl font-bold leading-tight text-white md:text-4xl">
          {t("폰 하나로 시작하는 법, 알려드릴게요", "We'll show you how to get started")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">
          {t(
            "가입 전에, 무료 1:1 상담부터 편하게 받아보세요.",
            "Before signing up, just take a free 1:1 call — no rush.",
          )}
        </p>
        <BookACallButton
          location="bottom"
          className="mt-8 inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-10 py-4 text-lg font-semibold text-primary shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
        >
          {t("무료 상담 받기", "Book a Free Call")}
          <ArrowRight className="h-5 w-5" strokeWidth={2.2} />
        </BookACallButton>
        <p className="mt-4 text-sm text-white/70">
          {t("가입 없이 · 부담 없이 · 10분이면 충분", "No sign-up · No pressure · Just 10 minutes")}
        </p>
      </div>
    </section>
  );
}
