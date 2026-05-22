"use client";

import { Users, ShieldCheck, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface Strength {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const strengths: Strength[] = [
  {
    icon: Users,
    title: "직원이 곧 인플루언서",
    desc: "마케터가 인플루언서가 아닌 채로 인플루언서 마케팅을 한다는 건 이치에 맞지 않습니다. 저희 팀은 실제로 채널을 운영해본 사람들로 구성되어 있어, 인스타에서 브랜드를 바이럴시키는 방법을 알고 있습니다.",
  },
  {
    icon: ShieldCheck,
    title: "사전 승인된 크리에이터 풀",
    desc: "관리자 검수를 거친 크리에이터만 캠페인에 매칭됩니다. 검증되지 않은 채널에 광고가 노출될 위험을 차단합니다.",
  },
  {
    icon: TrendingUp,
    title: "첫 달 안에 성과",
    desc: "‘성과를 보여주지 못하는 마케팅 회사’ 와는 일하지 마세요. 첫 캠페인부터 측정 가능한 KPI로 보고합니다.",
  },
];

export default function BusinessFeaturesSection() {
  const ref = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="bg-surface py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
          왜 Viral Ground 인가요?
        </h2>
        <p className="mt-4 text-center text-muted">
          ‘아는 사람이 하는 마케팅’의 결과는 다릅니다
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {strengths.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-line bg-section-alt p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
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
