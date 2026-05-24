"use client";

import { Clock, Smartphone, Zap, Target, TrendingUp, Handshake } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const features: Feature[] = [
  {
    icon: Clock,
    title: "자유로운 시간",
    desc: "출퇴근 없이 원하는 시간에, 원하는 장소에서 촬영하세요. 본업과 병행할 수 있도록 설계되었습니다.",
  },
  {
    icon: Smartphone,
    title: "장비 필요 없음",
    desc: "비싼 카메라나 조명은 필요 없습니다. 스마트폰 하나면 충분합니다. 편집도 저희가 도와드려요.",
  },
  {
    icon: Zap,
    title: "빠른 정산",
    desc: "마지막 영상 업로드 후 14일 안에 수익이 정산됩니다. 기다림 없이 투명하게 확인할 수 있습니다.",
  },
  {
    icon: Target,
    title: "맞춤 캠페인 매칭",
    desc: "당신의 관심사와 스타일에 맞는 브랜드 캠페인을 자동으로 매칭해 드립니다.",
  },
  {
    icon: TrendingUp,
    title: "내 채널도 함께 성장",
    desc: "브랜드 협업 콘텐츠를 내 SNS에도 활용할 수 있어요. 활동하면서 자연스럽게 인플루언서로 성장할 수 있습니다.",
  },
  {
    icon: Handshake,
    title: "안정적인 수입",
    desc: "일회성이 아닌 지속적인 캠페인 기회를 제공합니다. 꾸준히 활동하면 수입도 꾸준히 올라갑니다.",
  },
];

export default function FeaturesSection() {
  const ref = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="bg-section-alt py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
          왜 Viral Ground인가요?
        </h2>
        <p className="mt-4 text-center text-muted">
          크리에이터를 위해 설계된 플랫폼
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-line bg-surface p-7 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1"
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
