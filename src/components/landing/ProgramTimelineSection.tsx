"use client";

import { Check } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLang } from "@/lib/i18n";

// 각 단계에서 '운영팀이 직접 해주는 것'을 강조 — 혼자 두지 않고 2달간 함께 키운다.
const TIMELINE = [
  {
    whenKo: "1주차", whenEn: "Week 1",
    titleKo: "가입 · 첫 매칭", titleEn: "Join & first match",
    descKo: "성향을 보고 첫 캠페인을 직접 붙여드려요.", descEn: "We read your style and match your first campaign for you.",
    pointsKo: ["간단 심사 후 승인", "성향 맞춤 첫 캠페인 직접 매칭", "포맷·기획 가이드 전달"],
    pointsEn: ["Quick review, then approval", "We match a fitting first campaign", "Formats & planning guides handed over"],
  },
  {
    whenKo: "2~3주차", whenEn: "Weeks 2-3",
    titleKo: "첫 업로드 · 첫 정산", titleEn: "First post & first payout",
    descKo: "첫 영상을 같이 다듬어 올리고, 바로 정산해드려요.", descEn: "We refine your first video together, then pay you right away.",
    pointsKo: ["검증된 포맷으로 첫 영상 제작", "초안 1:1 피드백으로 완성도 ↑", "업로드 즉시 기본급 입금"],
    pointsEn: ["Make your first video from proven formats", "1:1 feedback sharpens the draft", "Base pay deposited the moment you post"],
  },
  {
    whenKo: "1개월차", whenEn: "Month 1",
    titleKo: "루틴 · 성과급", titleEn: "Routine & bonuses",
    descKo: "업로드 루틴이 자리잡도록 옆에서 코칭해요.", descEn: "We coach you until an upload routine sticks.",
    pointsKo: ["주간 업로드 루틴 코칭", "잘 된 포맷 데이터 공유", "조회수에 따라 성과급 추가"],
    pointsEn: ["Weekly upload-routine coaching", "We share what formats performed", "View-based bonuses stack on top"],
  },
  {
    whenKo: "2개월차+", whenEn: "Month 2+",
    titleKo: "안정적 부업 수익", titleEn: "Steady side income",
    descKo: "여러 캠페인으로 수익을 안정화시켜드려요.", descEn: "We stabilize your income across multiple campaigns.",
    pointsKo: ["여러 캠페인 동시 매칭", "본업·학업과 병행 페이스 설계", "월 단위 수익 누적·안정화"],
    pointsEn: ["Several campaigns matched at once", "A pace designed around work or school", "Monthly income stacks and stabilizes"],
  },
];

export default function ProgramTimelineSection() {
  const ref = useScrollAnimation<HTMLDivElement>();
  const { t, lang } = useLang();

  return (
    <section className="bg-background py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-3xl px-6">
        <span className="mx-auto flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          {t("운영팀과 함께하는 2개월", "Two months, hands-on with our team")}
        </span>
        <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t("무명 크리에이터에서 ", "From nobody to ")}
          <span className="text-primary">{t("유명 크리에이터로", "a known creator")}</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted">
          {t(
            "감으로 혼자 하지 않아요. 2달 동안 운영팀이 매칭·기획·피드백·정산까지 단계마다 함께합니다.",
            "No guessing alone. For two months our team is with you at every step — matching, planning, feedback, and payouts.",
          )}
        </p>

        <ol className="relative mx-auto mt-14 max-w-xl space-y-10 before:absolute before:bottom-3 before:left-[10px] before:top-3 before:w-0.5 before:rounded-full before:bg-line">
          {TIMELINE.map((m) => (
            <li key={m.whenEn} className="relative pl-10">
              <span className="absolute left-0 top-0.5 h-[22px] w-[22px] rounded-full border-[3px] border-primary bg-background" />
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {t(m.whenKo, m.whenEn)}
              </span>
              <h3 className="mt-2.5 text-lg font-bold text-foreground">{t(m.titleKo, m.titleEn)}</h3>
              <p className="mt-1.5 leading-relaxed text-muted">{t(m.descKo, m.descEn)}</p>
              <ul className="mt-3 space-y-2">
                {(lang === "en" ? m.pointsEn : m.pointsKo).map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-foreground/80">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
