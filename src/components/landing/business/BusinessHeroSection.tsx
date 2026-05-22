"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import ConsultationModal from "./ConsultationModal";

export default function BusinessHeroSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-bg via-background to-background pt-28 pb-20 md:pt-36 md:pb-28">
      <div className="absolute top-20 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
              인플루언서 마케팅,
              <br />
              <span className="text-primary">성과가 필요하다면</span>
              <br />
              Viral Ground 가 답입니다.
            </h1>

            <p className="mt-6 max-w-xl text-lg text-muted md:text-xl">
              엄청난 성과를 보여주지 못하는 마케팅 회사와는 더 이상 일하지 마세요.
              <br className="hidden md:block" />
              저희는 <b className="text-foreground">첫 달 안에 확실한 성과</b>가 나옵니다.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-start lg:justify-start">
              <Button
                size="lg"
                onClick={() => setModalOpen(true)}
                className="bg-foreground text-background hover:bg-foreground/90 hover:shadow-lg hover:-translate-y-0.5"
              >
                가벼운 상담신청
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setModalOpen(true)}
              >
                소개서 받기
              </Button>
            </div>

            <p className="mt-6 text-sm text-faint">
              가입비 없음 · 캠페인 등록은 무료 · 결제는 캠페인 단위 예치금
            </p>
          </div>

          {/* 우측 메트릭 카드 — 직전 캠페인 실측 성과 강조 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 row-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-foreground to-foreground/80 p-8 text-background shadow-xl">
              <p className="text-base font-bold tracking-tight text-background md:text-lg">
                직전 캠페인 · 최대 ROAS
              </p>
              <p className="mt-3 text-7xl font-black tracking-tight md:text-8xl lg:text-9xl">
                924<span className="text-3xl align-top">%</span>
              </p>
              <p className="mt-4 text-sm text-background/70">
                광고비 대비 매출 ÷ 광고비 × 100
              </p>
              <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-primary/30 blur-2xl" />
            </div>

            <div className="rounded-2xl bg-surface p-5 shadow-md border border-line">
              <p className="text-sm font-semibold text-muted">CPV (조회수당 비용)</p>
              <p className="mt-2 text-4xl font-black text-primary md:text-5xl">
                4.16<span className="text-lg font-bold text-muted">원</span>
              </p>
              <p className="mt-2 text-[11px] text-faint">
                일반 캠페인 10~30원
              </p>
            </div>

            <div className="rounded-2xl bg-primary p-5 text-white shadow-md">
              <p className="text-sm font-semibold text-white/90">예치금 보호</p>
              <p className="mt-2 text-4xl font-black md:text-5xl">100%</p>
              <p className="mt-2 text-[11px] text-white/70">에스크로 기반</p>
            </div>
          </div>
        </div>
      </div>

      <ConsultationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
}
