"use client";

import { HelpCircle, Sparkles, LineChart } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface Pain {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const pains: Pain[] = [
  {
    icon: HelpCircle,
    title: "부업 하고 싶은데 뭘 해야 할지 모르겠어요",
    desc: "수많은 부업 정보 속에서 나에게 맞는 걸 찾기 어렵죠.",
  },
  {
    icon: Sparkles,
    title: "장비도, 편집 실력도, 구독자도 없어요",
    desc: "시작할 엄두가 안 나죠. 툴, 편집, 가이드라인 전부 저희가 제공합니다.",
  },
  {
    icon: LineChart,
    title: "시간 투자 대비 수익이 불확실해요",
    desc: "Viral Ground는 업로드만 해도 기본급, 조회수가 나오면 성과급까지 보장합니다.",
  },
];

export default function PainPointSection() {
  const ref = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="bg-section-alt py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
          이런 고민 해본 적 있나요?
        </h2>
        <p className="mt-4 text-center text-muted">
          Viral Ground가 그 고민을 해결해 드립니다
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pains.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-line bg-surface p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" strokeWidth={2} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
