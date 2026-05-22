"use client";

import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import ConsultationModal from "./ConsultationModal";

export default function BusinessBottomCTA() {
  const ref = useScrollAnimation<HTMLDivElement>();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="bg-section-alt py-20 md:py-28">
      <div
        ref={ref}
        className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-primary to-primary-dark px-8 py-16 text-center md:px-16 md:py-20"
      >
        <h2 className="text-3xl font-bold text-white md:text-4xl">
          첫 달 안에 확실한 성과,
          <br />
          숫자로 보여드립니다
        </h2>
        <p className="mt-4 text-lg text-white/80">
          1영업일 이내 회신 · 가벼운 상담부터 시작해보세요
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center rounded-full bg-surface px-10 py-4 text-lg font-semibold text-primary shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          >
            가벼운 상담신청
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center rounded-full border border-white/40 px-10 py-4 text-lg font-medium text-white transition-colors hover:bg-white/10"
          >
            소개서 받기
          </button>
        </div>
      </div>

      <ConsultationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
}
