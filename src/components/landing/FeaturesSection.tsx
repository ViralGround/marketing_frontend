"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const features = [
  {
    icon: "⏰",
    title: "자유로운 시간",
    desc: "출퇴근 없이 원하는 시간에, 원하는 장소에서 촬영하세요. 본업과 병행할 수 있도록 설계되었습니다.",
  },
  {
    icon: "📱",
    title: "장비 필요 없음",
    desc: "비싼 카메라나 조명은 필요 없습니다. 스마트폰 하나면 충분합니다. 편집도 저희가 도와드려요.",
  },
  {
    icon: "⚡",
    title: "빠른 정산",
    desc: "영상 승인 후 빠르게 수익이 정산됩니다. 기다림 없이 투명하게 확인할 수 있습니다.",
  },
  {
    icon: "🎯",
    title: "맞춤 캠페인 매칭",
    desc: "당신의 관심사와 스타일에 맞는 브랜드 캠페인을 자동으로 매칭해 드립니다.",
  },
  {
    icon: "📈",
    title: "내 채널도 함께 성장",
    desc: "브랜드 협업 콘텐츠를 내 SNS에도 활용할 수 있어요. 활동하면서 자연스럽게 인플루언서로 성장할 수 있습니다.",
  },
  {
    icon: "🤝",
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
        <p className="mt-4 text-center text-gray-500 dark:text-gray-400">
          크리에이터를 위해 설계된 플랫폼
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111] p-7 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1"
            >
              <span className="inline-block text-3xl transition-transform duration-300 group-hover:scale-110">
                {f.icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
