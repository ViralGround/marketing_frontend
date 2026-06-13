"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import InteractiveDots from "@/components/landing/InteractiveDots";
import ConsultationModal from "./ConsultationModal";
import { useLang } from "@/lib/i18n";
import { trackEvent } from "@/lib/gtag";

export default function BusinessHeroSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const { t } = useLang();

  return (
    <section className="relative overflow-hidden bg-[#f3f2fb] pt-28 pb-20 dark:bg-[#0d0a1c] md:pt-36 md:pb-28">
      {/* 커서에 반응하는 인터랙티브 도트 그리드(canvas) — 크리에이터 히어로와 동일 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage: "radial-gradient(ellipse 85% 70% at 50% 35%, black, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 85% 70% at 50% 35%, black, transparent 80%)",
        }}
      >
        <InteractiveDots className="block h-full w-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
              {t("인플루언서 마케팅,", "Influencer marketing")}
              <br />
              <span className="text-primary">{t("성과가 필요하다면", "that delivers results")}</span>
              <br />
              <span className="text-primary">Viral Ground</span>
              {t(" 가", "")}
              <br />
              {t("답입니다.", "is the answer.")}
            </h1>

            <p className="mt-6 max-w-xl text-lg text-muted md:text-xl">
              {t(
                "엄청난 성과를 보여주지 못하는 마케팅 회사와는 더 이상 일하지 마세요.",
                "Stop working with agencies that can't show real results.",
              )}
              <br className="hidden md:block" />
              {t("저희는 ", "We deliver ")}
              <b className="text-foreground">{t("첫 달 안에 확실한 성과", "clear results within the first month")}</b>
              {t("가 나옵니다.", ".")}
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-start lg:justify-start">
              <Button
                size="lg"
                onClick={() => {
                  trackEvent("cta_click", { location: "business_hero", target: "consultation" });
                  setModalOpen(true);
                }}
                className="bg-foreground text-background hover:bg-foreground/90 hover:shadow-lg hover:-translate-y-0.5"
              >
                {t("가벼운 상담신청", "Request a consultation")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  trackEvent("cta_click", { location: "business_hero", target: "brochure" });
                  setModalOpen(true);
                }}
              >
                {t("소개서 받기", "Get the brochure")}
              </Button>
            </div>

            <p className="mt-6 text-sm text-faint">
              {t(
                "가입비 없음 · 캠페인 등록은 무료 · 결제는 캠페인 단위 예치금",
                "No signup fee · Free campaign listing · Pay per-campaign deposit",
              )}
            </p>
          </div>

          {/* 우측 메트릭 카드 — 직전 캠페인 실측 성과 강조 */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-foreground to-foreground/80 p-8 text-background shadow-xl">
              <p className="text-base font-bold tracking-tight text-background md:text-lg">
                {t("직전 캠페인 · 최대 ROAS", "Latest campaign · Max ROAS")}
              </p>
              <p className="mt-3 text-7xl font-black tracking-tight md:text-8xl lg:text-9xl">
                924<span className="text-3xl align-top">%</span>
              </p>
              <p className="mt-4 text-sm text-background/70">
                {t("광고비 대비 매출 ÷ 광고비 × 100", "Revenue ÷ ad spend × 100")}
              </p>
              <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-primary/30 blur-2xl" />
            </div>

            <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
              <p className="text-sm font-semibold text-muted">{t("CPV (조회수당 비용)", "CPV (cost per view)")}</p>
              <p className="mt-2 text-5xl font-black tracking-tight text-primary md:text-6xl">
                {t("4.16", "₩4.16")}<span className="text-xl font-bold text-muted">{t("원", "")}</span>
              </p>
              <p className="mt-3 text-xs text-faint">
                {t("일반 캠페인 10~30원 대비 최대 7배 효율", "Up to 7× more efficient than the usual ₩10–30")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConsultationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
}
