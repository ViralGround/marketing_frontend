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
      <p className="text-3xl font-bold text-primary md:text-4xl">
        <span ref={ref}>0</span>
        {suffix}
      </p>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="border-y border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
        <StatItem value={50} suffix="+" label="활동 크리에이터" />
        <StatItem value={48} suffix="만원" label="평균 월 수입" />
        <StatItem value={1200} suffix="만원+" label="누적 지급액" />
        <StatItem value={10} suffix="+" label="협업 브랜드" />
      </div>
    </section>
  );
}
