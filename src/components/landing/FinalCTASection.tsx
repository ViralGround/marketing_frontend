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
        <h2 className="text-3xl font-bold text-white md:text-4xl">
          {t("지금 무료 상담을 예약하세요", "Book your free consultation")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
          {t(
            "딱 맞는 시작 방법을 1:1로 안내해드려요. 부담 없이 신청만 하세요.",
            "Get a 1:1 walkthrough of the best way to start — no pressure, just book.",
          )}
        </p>
        <BookACallButton
          location="bottom"
          className="mt-8 inline-flex items-center justify-center gap-1.5 rounded-full bg-surface px-10 py-4 text-lg font-semibold text-primary shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
        >
          {t("무료 상담 예약", "Book a Call")}
          <ArrowRight className="h-5 w-5" strokeWidth={2.2} />
        </BookACallButton>
      </div>
    </section>
  );
}
