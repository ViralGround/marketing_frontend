"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLang } from "@/lib/i18n";

const TIMELINE = [
  { whenKo: "1주차", whenEn: "Week 1", titleKo: "가입 · 첫 매칭", titleEn: "Join & first match", descKo: "승인 후 첫 캠페인에 매칭돼요.", descEn: "Get approved and matched to your first campaign." },
  { whenKo: "2~3주차", whenEn: "Weeks 2-3", titleKo: "첫 업로드 · 첫 정산", titleEn: "First post & first payout", descKo: "첫 영상을 올리고 기본급을 받아요.", descEn: "Post your first video and earn your base pay." },
  { whenKo: "1개월차", whenEn: "Month 1", titleKo: "루틴 · 성과급", titleEn: "Routine & bonuses", descKo: "꾸준한 업로드로 조회수 성과급이 붙어요.", descEn: "Steady uploads start earning view bonuses." },
  { whenKo: "2개월차+", whenEn: "Month 2+", titleKo: "안정적 부업 수익", titleEn: "Steady side income", descKo: "여러 캠페인을 병행하며 수익이 쌓여요.", descEn: "Run multiple campaigns and stack your income." },
];

export default function ProgramTimelineSection() {
  const ref = useScrollAnimation<HTMLDivElement>();
  const { t } = useLang();

  return (
    <section className="bg-section-alt py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
          {t("시작부터 안정적 수익까지", "From day one to steady income")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted">
          {t("당신의 두 달 여정은 이렇게 흘러가요.", "Here is how your first two months unfold.")}
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {TIMELINE.map((m) => (
            <div key={m.whenEn} className="rounded-2xl border border-line bg-surface p-6">
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {t(m.whenKo, m.whenEn)}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-foreground">{t(m.titleKo, m.titleEn)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(m.descKo, m.descEn)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
