"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const pains = [
  {
    emoji: "😩",
    title: "부업 하고 싶은데 뭘 해야 할지 모르겠어요",
    desc: "수많은 부업 정보 속에서 나에게 맞는 걸 찾기 어렵죠.",
  },
  {
    emoji: "📱",
    title: "크리에이터가 되고 싶은데 시작이 막막해요",
    desc: "장비도 없고, 편집도 못 하고, 구독자도 0인 상태.",
  },
  {
    emoji: "💸",
    title: "시간 투자 대비 수익이 불확실해요",
    desc: "몇 달을 해봐야 수익이 나올지 감이 안 잡히죠.",
  },
];

export default function PainPointSection() {
  const ref = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="bg-section-alt py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
          이런 고민, 해본 적 있나요?
        </h2>
        <p className="mt-4 text-center text-muted">
          Viral Ground가 그 고민을 해결해 드립니다
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pains.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-line bg-surface p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <span className="text-4xl">{p.emoji}</span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {p.title}
              </h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
