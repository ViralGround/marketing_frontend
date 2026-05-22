"use client";

import Badge from "@/components/ui/Badge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const testimonials = [
  {
    name: "김*진",
    role: "대학생 · 3개월 활동",
    income: "월 28만원",
    text: "학교 다니면서 틈틈이 촬영했는데 용돈이 생겨서 좋아요. 폰으로만 찍어도 되니까 부담 없이 시작했고, 인스타 팔로워도 덩달아 늘었어요.",
    avatar: "SJ",
  },
  {
    name: "이*호",
    role: "직장인 · 4개월 활동",
    income: "월 35만원",
    text: "퇴근 후 1~2시간 투자해서 꾸준히 올리고 있어요. 본업에 지장 없이 부업으로 딱이고, 브랜드 협업 이력이 쌓이니까 제 채널도 성장하고 있습니다.",
    avatar: "JH",
  },
  {
    name: "박*지",
    role: "프리랜서 · 7개월 활동",
    income: "월 52만원",
    text: "처음엔 부업으로 시작했는데, 여기서 쌓은 콘텐츠 경험으로 개인 채널 구독자가 2,000명 넘었어요. 수익과 성장을 동시에 얻고 있습니다.",
    avatar: "MJ",
  },
];

export default function TestimonialsSection() {
  const ref = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="bg-surface py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
          실제 크리에이터들의 이야기
        </h2>
        <p className="mt-4 text-center text-muted">
          수익도 채널 성장도, Viral Ground에서 함께하고 있습니다
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-line bg-section-alt p-7 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              {/* 수입 배지 */}
              <Badge className="mb-4 px-3 py-1 text-sm font-semibold">
                {t.income}
              </Badge>
              <p className="text-sm text-muted leading-relaxed">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-faint">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
