"use client";

import { FileText, Lightbulb, Video, MessageCircle, Upload } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface Step {
  num: string;
  title: string;
  desc: string;
  icon: LucideIcon;
}

const steps: Step[] = [
  {
    num: "01",
    title: "가이드라인 전달",
    desc: "캠페인별 영상 형식, 메시지, 필수 노출 요소를 정리해 전달드립니다.",
    icon: FileText,
  },
  {
    num: "02",
    title: "벤치마크 콘텐츠 제공",
    desc: "참고할 만한 레퍼런스 영상을 함께 제공해 제작 방향을 잡아드립니다.",
    icon: Lightbulb,
  },
  {
    num: "03",
    title: "크리에이터 영상 제작",
    desc: "스마트폰과 무료로 지원되는 제작/편집 툴로 가이드대로 촬영합니다.",
    icon: Video,
  },
  {
    num: "04",
    title: "피드백 & 컨펌",
    desc: "초안을 공유하면 1차 피드백을 드리고, 함께 다듬어 최종 컨펌합니다.",
    icon: MessageCircle,
  },
  {
    num: "05",
    title: "최종 업로드",
    desc: "업로드 즉시 제작지원금이 확정되고, 조회수에 따라 성과급이 추가 지급됩니다.",
    icon: Upload,
  },
];

export default function HowItWorksSection() {
  const ref = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="bg-surface py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
          콘텐츠 제작 프로세스
        </h2>
        <p className="mt-4 text-center text-muted">
          가이드라인 전달부터 업로드까지, 5단계로 진행됩니다
        </p>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, i) => (
            <div key={s.num} className="relative text-center">
              {/* 연결 점선 (데스크톱 5열에서만) */}
              {i < steps.length - 1 && (
                <div className="absolute top-12 left-[60%] hidden w-[80%] border-t-2 border-dashed border-primary/20 lg:block" />
              )}
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-primary-bg text-primary transition-transform duration-300 hover:scale-110">
                <s.icon className="h-10 w-10" strokeWidth={1.75} />
              </div>
              <span className="mt-4 inline-block text-xs font-bold tracking-widest text-primary uppercase">
                Step {s.num}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-foreground">
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
