"use client";

import { useCountUp } from "@/hooks/useScrollAnimation";

function StatItem({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const ref = useCountUp(value);

  return (
    <div className="text-center">
      <p className="text-4xl font-black tracking-tight text-primary md:text-5xl">
        <span ref={ref}>0</span>
        <span className="text-2xl font-bold text-primary/70">{suffix}</span>
      </p>
      <p className="mt-2 text-sm text-muted">{label}</p>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="border-y border-line bg-surface py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
        <StatItem value={50} suffix="+" label="활동 크리에이터" />
        <StatItem value={48} suffix="만원" label="평균 월 수입" />
        <StatItem value={1200} suffix="만원+" label="누적 지급액" />
        <StatItem value={10} suffix="+" label="협업 브랜드" />
      </div>
    </section>
  );
}
