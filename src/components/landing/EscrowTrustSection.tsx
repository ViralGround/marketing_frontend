"use client";

import { ShieldCheck, Lock, RotateCcw } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLang } from "@/lib/i18n";

/**
 * 결제·정산 공개 원칙. 실제 PG/지급 수단이 활성화되기 전에는 에스크로로 표현하지 않는다.
 * 관리형 베타의 계약·지급 방법은 캠페인별로 운영팀이 별도 안내한다.
 */
export default function EscrowTrustSection({ audience }: { audience: "creator" | "business" }) {
  const ref = useScrollAnimation<HTMLDivElement>();
  const { t } = useLang();
  const forCreator = audience === "creator";

  const steps = forCreator
    ? [
        {
          icon: Lock,
          title: t("조건을 먼저 확인", "Terms before work"),
          body: t(
            "보상 범위·확정 조건·지급 예정일은 지원 전에 캠페인별로 공개합니다. 동의한 조건만 작업에 적용됩니다.",
            "Reward scope, confirmation rules, and expected payout dates are shown before you apply. Only the terms you accept apply.",
          ),
        },
        {
          icon: ShieldCheck,
          title: t("상태를 기록", "Recorded status"),
          body: t(
            "제출·검수·지급 상태를 캠페인 흐름에 기록합니다. 실제 지급 수단과 일정은 베타 참여 시 운영팀이 안내합니다.",
            "Submission, review, and payout status are recorded in the campaign flow. Our team explains the live payment method and schedule during beta onboarding.",
          ),
        },
        {
          icon: RotateCcw,
          title: t("운영팀이 함께 확인", "Reviewed with our team"),
          body: t(
            "지급 지연이나 검수 이견이 생기면 운영팀이 계약과 캠페인 기록을 기준으로 확인합니다. 지원 채널은 참여 확정 시 안내합니다.",
            "If a payout is delayed or a review is disputed, our team checks the contract and campaign record. Support details are shared when participation is confirmed.",
          ),
        },
      ]
    : [
        {
          icon: Lock,
          title: t("집행 조건을 먼저 합의", "Agree before spending"),
          body: t(
            "콘텐츠 범위·검수 기준·지급 일정과 취소 조건을 캠페인 시작 전에 문서로 확정합니다.",
            "Content scope, review criteria, payout schedule, and cancellation terms are documented before the campaign starts.",
          ),
        },
        {
          icon: ShieldCheck,
          title: t("작업 단위로 상태 확인", "Track each deliverable"),
          body: t(
            "제출·검수·게시·지급 상태를 작업별로 확인합니다. 지급 기능이 활성화되기 전 베타 결제 방법은 상담 시 별도 안내합니다.",
            "Track submission, review, publishing, and payout status per deliverable. Until live payment is activated, the beta payment method is explained during consultation.",
          ),
        },
        {
          icon: RotateCcw,
          title: t("변경·취소 기준을 문서화", "Document changes and cancellation"),
          body: t(
            "변경·중단·환급 여부는 사전에 합의한 계약 조건에 따릅니다. 자동 환불이나 에스크로를 준비 완료로 표시하지 않습니다.",
            "Changes, cancellations, and refunds follow the agreed contract. We do not present automated refunds or escrow as live before activation.",
          ),
        },
      ];

  return (
    // 보조 섹션 — 여백 한 단계 낮춤(0.75 램프). kicker 는 삭제(craft-floor ban),
    // "베타 결제·정산" 맥락은 아래 본문 문단이 이미 말한다.
    <section className="bg-paper py-12 text-ink md:py-[72px]">
      <div ref={ref} className="mx-auto max-w-6xl px-6">
        <h2 className="text-[clamp(26px,3.6vw,44px)] font-black leading-tight tracking-[-0.03em]">
          {forCreator ? (
            <>
              {t("조건을 먼저 확인하고,", "Know the terms first —")}
              <br />
              <span className="text-violet">{t("그다음에 제작합니다", "then start creating")}</span>
            </>
          ) : (
            <>
              {t("결제 기능은 준비 중,", "Payments are in preparation —")}
              <br />
              <span className="text-violet">{t("베타는 직접 안내합니다", "beta is guided directly")}</span>
            </>
          )}
        </h2>
        <p className="mt-5 max-w-xl text-[18px] font-medium leading-relaxed tracking-[-0.02em] text-ink/75">
          {forCreator
            ? t(
                "정식 결제·정산 기능이 활성화되기 전까지 실제 지급 방법과 일정은 캠페인별로 명확히 안내합니다.",
                "Until live payment and payout features are activated, the actual method and schedule are explained clearly for each campaign.",
              )
            : t(
                "정식 결제·정산 기능은 구현·검증 중입니다. 관리형 베타의 청구·지급·취소 조건은 상담과 계약 단계에서 확정합니다.",
                "Live payment and payout features are being implemented and verified. Billing, payout, and cancellation terms for the managed beta are confirmed during consultation and contracting.",
              )}
        </p>

        {/* 01/02/03 번호 삭제 — 세 항목은 병렬 원칙이지 순서가 아니다 (numbered-section-labels) */}
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border-2 border-ink bg-ink sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="bg-paper p-6 md:p-8">
              <step.icon className="h-6 w-6 text-violet" strokeWidth={2} />
              <h3 className="mt-5 text-[18px] font-extrabold tracking-[-0.02em]">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink/70">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
