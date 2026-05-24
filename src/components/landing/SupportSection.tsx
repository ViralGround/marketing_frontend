"use client";

import { Wallet, TrendingUp, Wrench, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface Support {
  icon: LucideIcon;
  title: string;
  amount: string;
  desc: string;
}

const supports: Support[] = [
  {
    icon: Wallet,
    title: "제작지원금",
    amount: "2만원 / 편",
    desc: "영상 1편 업로드(포스팅) 시 성과급과 별도로 지급합니다.",
  },
  {
    icon: TrendingUp,
    title: "성과급 지원",
    amount: "최대 250만원",
    desc: "조회수 구간별로 영상 1편당 성과급을 추가 지급합니다.",
  },
  {
    icon: Wrench,
    title: "AI 제작 툴과 편집 툴",
    amount: "전액 무료",
    desc: "AI 기반 콘텐츠 제작 툴과 영상 편집 툴 이용 비용을 Viral Ground가 전액 지원합니다.",
  },
  {
    icon: Send,
    title: "자동 DM 솔루션",
    amount: "전액 무료",
    desc: "마케팅 자동화 DM 툴 비용 또한 Viral Ground가 전액 지원합니다.",
  },
];

export default function SupportSection() {
  const ref = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="bg-surface py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
          크리에이터에게 드리는 지원 혜택
        </h2>
        <p className="mt-4 text-center text-muted">
          제작에 필요한 모든 비용은 Viral Ground가 부담합니다
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {supports.map(({ icon: Icon, title, amount, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-line bg-section-alt p-7 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                <Icon className="h-6 w-6" strokeWidth={2} />
              </div>
              <h3 className="mt-5 text-base font-semibold text-muted">
                {title}
              </h3>
              <p className="mt-1 text-2xl font-extrabold tracking-tight text-primary">
                {amount}
              </p>
              <p className="mt-3 text-sm text-muted leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
