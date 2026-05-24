"use client";

import { GraduationCap, Briefcase, Home, Sparkles, Users, Smartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface Persona {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const personas: Persona[] = [
  {
    icon: GraduationCap,
    title: "용돈이 필요한 학생",
    desc: "수업이나 시험 사이 자투리 시간에 촬영 가능. 본업이 학업이라도 무리 없이 병행할 수 있어요.",
  },
  {
    icon: Briefcase,
    title: "퇴근 후 부업이 필요한 직장인",
    desc: "퇴근 후 하루 1~2시간이면 충분. 정해진 출근 시간 없이 본업과 안정적으로 병행됩니다.",
  },
  {
    icon: Home,
    title: "집에서 가볍게 수익을 원하는 분",
    desc: "외부 활동 없이 집에서 촬영부터 업로드까지 가능합니다. 스마트폰 한 대면 시작할 수 있어요.",
  },
  {
    icon: Sparkles,
    title: "크리에이터를 꿈꾸는 입문자",
    desc: "가이드라인과 벤치마크 영상을 제공받으며 자연스럽게 콘텐츠 감각을 키울 수 있습니다.",
  },
  {
    icon: Users,
    title: "구독자가 적은 인플루언서",
    desc: "팔로워 수와 관계없이 지원 가능. 협업 콘텐츠로 본인 채널도 함께 성장합니다.",
  },
  {
    icon: Smartphone,
    title: "장비와 편집이 부담스러운 분",
    desc: "AI 제작 툴과 편집 툴 비용은 Viral Ground가 전액 부담. 별도 장비도 필요 없습니다.",
  },
];

export default function AudienceSection() {
  const ref = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="bg-surface py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
          이런 분께 추천합니다
        </h2>
        <p className="mt-4 text-center text-muted">
          구독자 0명, 편집 경험 0년이어도 시작할 수 있도록 설계되었습니다
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {personas.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group flex gap-4 rounded-2xl border border-line bg-section-alt p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                <Icon className="h-6 w-6" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm text-muted leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
