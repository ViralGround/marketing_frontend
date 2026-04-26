"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const steps = [
  {
    num: "01",
    title: "가입하기",
    desc: "이메일과 간단한 프로필만 입력하면 3분 안에 가입이 완료됩니다.",
    icon: "✍️",
  },
  {
    num: "02",
    title: "영상 촬영 & 업로드",
    desc: "브랜드가 요청한 주제로 스마트폰으로 영상을 촬영하고 올려주세요.",
    icon: "🎬",
  },
  {
    num: "03",
    title: "수익 수령",
    desc: "영상이 승인되면 빠르게 정산됩니다. 첫 영상은 3만원 즉시 지급!",
    icon: "💰",
  },
];

export default function HowItWorksSection() {
  const ref = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="bg-surface py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
          이렇게 간단해요
        </h2>
        <p className="mt-4 text-center text-muted">
          3단계면 수익이 시작됩니다
        </p>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.num} className="relative text-center">
              {/* 연결 점선 (데스크톱) */}
              {i < steps.length - 1 && (
                <div className="absolute top-12 left-[60%] hidden w-[80%] border-t-2 border-dashed border-primary/20 md:block" />
              )}
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-primary-bg text-4xl transition-transform duration-300 hover:scale-110">
                {s.icon}
              </div>
              <span className="mt-4 inline-block text-xs font-bold tracking-widest text-primary uppercase">
                Step {s.num}
              </span>
              <h3 className="mt-2 text-xl font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
