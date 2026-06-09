"use client";

import { LayoutTemplate, Smartphone, MessagesSquare, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLang } from "@/lib/i18n";

interface Step {
  num: string;
  titleKo: string;
  titleEn: string;
  descKo: string;
  descEn: string;
  icon: LucideIcon;
}

// 우리가 실제로 제공하는 지원(가이드·레퍼런스·제작툴·피드백·즉시 정산)에만 근거. 과장 금지.
const STEPS: Step[] = [
  {
    num: "01",
    icon: LayoutTemplate,
    titleKo: "검증된 포맷으로 시작",
    titleEn: "Start from proven formats",
    descKo: "맨땅에서 짜내지 않아요. 캠페인마다 잘 되는 영상 형식과 참고 레퍼런스를 드려서, 따라 만들기만 하면 됩니다.",
    descEn: "No starting from scratch. Each campaign comes with formats that work and reference videos to follow.",
  },
  {
    num: "02",
    icon: Smartphone,
    titleKo: "폰 하나로 빠르게 제작",
    titleEn: "Shoot fast with just your phone",
    descKo: "스마트폰과 무료로 지원되는 제작·편집 툴이면 충분해요. 한 편에 목매지 않고 여러 편을 가볍게 찍습니다.",
    descEn: "Your phone plus the free editing tools we provide is enough — shoot several videos lightly, not betting on one.",
  },
  {
    num: "03",
    icon: MessagesSquare,
    titleKo: "피드백으로 다듬기",
    titleEn: "Refine with feedback",
    descKo: "초안에 1차 피드백을 받아 더 잘 될 영상으로 다듬은 뒤 올려요. 혼자 감으로 하지 않습니다.",
    descEn: "Get first-round feedback on your draft and sharpen it before posting — you never just guess alone.",
  },
  {
    num: "04",
    icon: TrendingUp,
    titleKo: "조회수가 곧 수익",
    titleEn: "Views become income",
    descKo: "업로드 즉시 기본급, 조회수가 오르면 성과급이 붙어요. 반응 좋은 포맷을 반복하며 수익을 키웁니다.",
    descEn: "Base pay lands the moment you post, and bonuses follow the views. Repeat what works and grow your income.",
  },
];

export default function HowItWorksSection() {
  const ref = useScrollAnimation<HTMLDivElement>();
  const { t } = useLang();

  return (
    <section className="bg-section-alt py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
          {t("경험이 없어도 조회수가 나는 이유", "Why beginners still get views")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted">
          {t(
            "맨땅에서 시작하지 않아요. 검증된 포맷과 피드백으로 함께 만듭니다.",
            "You don't start from zero — proven formats and feedback get you there.",
          )}
        </p>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.num} className="relative text-center">
              {/* 연결 점선 (데스크톱에서만) */}
              {i < STEPS.length - 1 && (
                <div className="absolute top-12 left-[62%] hidden w-[76%] border-t-2 border-dashed border-primary/20 lg:block" />
              )}
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-primary-bg text-primary transition-transform duration-300 hover:scale-110">
                <s.icon className="h-10 w-10" strokeWidth={1.75} />
              </div>
              <span className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-primary">
                Step {s.num}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-foreground">{t(s.titleKo, s.titleEn)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(s.descKo, s.descEn)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
