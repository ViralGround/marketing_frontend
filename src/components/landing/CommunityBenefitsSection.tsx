"use client";

import { Wallet, Zap, Users } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLang } from "@/lib/i18n";

const BENEFITS = [
  {
    icon: Wallet,
    titleKo: "제작비 전액 지원",
    titleEn: "Production fully covered",
    descKo: "촬영·편집 도구 비용을 Viral Ground가 부담해요. 폰 하나면 충분합니다.",
    descEn: "Viral Ground covers your filming and editing tools. Your phone is enough.",
  },
  {
    icon: Zap,
    titleKo: "업로드 즉시 기본급",
    titleEn: "Base pay on upload",
    descKo: "영상 한 편을 올리면 기본급이 바로 지급돼요. 조회수가 오르면 성과급까지.",
    descEn: "Post one video and your base reward is paid right away — bonuses follow the views.",
  },
  {
    icon: Users,
    titleKo: "함께 크는 커뮤니티",
    titleEn: "A community that grows with you",
    descKo: "같은 목표의 크리에이터들과 노하우를 나누며 성장해요.",
    descEn: "Grow alongside creators chasing the same goal and share what works.",
  },
];

export default function CommunityBenefitsSection() {
  const ref = useScrollAnimation<HTMLDivElement>();
  const { t } = useLang();

  return (
    <section className="bg-background py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
          {t("혼자가 아니라, 같이 합니다", "You are not doing this alone")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted">
          {t(
            "시작부터 정산까지, Viral Ground가 함께해요.",
            "From your first post to payout, Viral Ground is with you.",
          )}
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.titleEn}
                className="rounded-2xl border border-line bg-surface p-6"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {t(b.titleKo, b.titleEn)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t(b.descKo, b.descEn)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
