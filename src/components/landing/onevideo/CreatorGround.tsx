"use client";

/**
 * 크리에이터 설득 랜딩 — 한국어 정보 중심 재디자인.
 *
 * 설계 의도: 방문자가 스크롤만 해도 아래 다섯 질문에 순서대로 답이 되게 한다.
 *  1) 뭘 주는 곳인가  → AI 제품과 맞는 관리형 크리에이터 베타
 *  2) 무엇을 확인하나 → 조건·제품 적합도·성과 기록 원칙
 *  3) 어떻게 하는가   → 3단계 (지원 → 제작·업로드 → 정산)
 *  4) 믿어도 되는가   → 베타 결제·정산 안내 + FAQ
 *  5) 뭘 하면 되는가  → 지원하기 CTA (히어로·하단 반복)
 * 시안4 무드(페이퍼·잉크·바이올렛·룰드 라인)는 유지하되, 영문 디스플레이는
 * 숫자와 작은 라벨에만 쓰고 메시지는 전부 한국어가 말한다.
 */

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import GroundTopbar from "./GroundTopbar";
import GroundFooter from "./GroundFooter";
import EscrowTrustSection from "@/components/landing/EscrowTrustSection";
import BookACallButton from "@/components/landing/BookACallButton";
import { useLang } from "@/lib/i18n";
import { trackEvent } from "@/lib/gtag";

export default function CreatorGround() {
  const { t } = useLang();

  const rewards = [
    {
      value: "CLEAR",
      title: t("조건을 먼저 공개", "Terms shown first"),
      desc: t(
        "작업 범위·검수 기준·보상·지급 예정일을 지원 전에 캠페인별로 확인합니다.",
        "Review scope, approval criteria, reward, and expected payout date before applying.",
      ),
    },
    {
      value: "FIT",
      title: t("제품 적합도로 매칭", "Matched by product fit"),
      desc: t(
        "팔로워 숫자 하나보다 AI 제품 경험과 설명 방식, 콘텐츠 스타일을 함께 봅니다.",
        "We consider AI-product experience, explanation style, and content fit — not one follower number.",
      ),
    },
    {
      value: "TRACK",
      title: t("진행 상태를 기록", "Progress recorded"),
      desc: t(
        "지원·선정·제출·검수·게시·지급 상태를 한 캠페인 흐름에서 확인합니다.",
        "Follow application, selection, submission, review, publishing, and payout in one campaign flow.",
      ),
    },
  ];

  const steps = [
    {
      title: t("캠페인 지원", "Apply"),
      desc: t(
        "AI 제품 경험과 제작 스타일을 담아 베타 지원서를 작성합니다. 운영팀 검토 후 결과를 안내합니다.",
        "Apply to the beta with your AI-product experience and creation style. Our team reviews and follows up.",
      ),
    },
    {
      title: t("영상 제작 · 업로드", "Film & upload"),
      desc: t(
        "제품과 가이드를 받고, 내 스타일대로 촬영해서 내 계정에 올립니다.",
        "Get the product and brief, film it your way, post it on your own account.",
      ),
    },
    {
      title: t("게시 · 성과 확인", "Publish & review"),
      desc: t(
        "게시 후 캠페인에서 합의한 지표를 확인합니다. 지급 방식과 일정은 참여 확정 전에 안내합니다.",
        "After publishing, review the metrics agreed for the campaign. Payment method and timing are shared before participation is confirmed.",
      ),
    },
  ];

  const faqs = [
    {
      q: t("팔로워가 적어도 할 수 있나요?", "Can I join with a small following?"),
      a: t(
        "지원 자체에 고정 팔로워 하한은 두지 않습니다. 다만 캠페인별 제품 적합도와 콘텐츠 품질, 공개 계정 상태를 함께 검토합니다.",
        "There is no fixed follower minimum to apply. Product fit, content quality, and public account status are reviewed for each campaign.",
      ),
    },
    {
      q: t("보상은 언제 확인하나요?", "When do I see the reward?"),
      a: t(
        "보상 금액·확정 조건·지급 예정일은 캠페인에 지원하기 전에 공개합니다. 베타의 실제 지급 방법은 참여 확정 시 운영팀이 안내합니다.",
        "Reward amount, confirmation rules, and expected payout date are shown before you apply. Our team explains the live beta payment method when participation is confirmed.",
      ),
    },
    {
      q: t("성과급은 어떻게 계산되나요?", "How are view bonuses calculated?"),
      a: t(
        "성과형 보상이 있는 경우 지표의 출처·집계 기간·구간과 금액을 캠페인 상세에 먼저 표시합니다. 조건이 없는 캠페인에는 성과급을 약속하지 않습니다.",
        "When performance rewards apply, the metric source, measurement period, tiers, and amounts are shown in the campaign details. Campaigns without those terms do not promise a bonus.",
      ),
    },
    {
      q: t("수수료나 숨은 비용이 있나요?", "Any fees or hidden costs?"),
      a: t(
        "플랫폼 수수료·세금·기타 공제 여부는 캠페인 조건과 계약에서 항목별로 표시합니다. 확정 전에는 일률적인 0원이나 세율을 약속하지 않습니다.",
        "Platform fees, tax, and any deductions are itemized in the campaign terms and contract. We do not promise a universal zero fee or tax rate before confirmation.",
      ),
    },
  ];

  return (
    <div className="bg-paper text-ink">
      <GroundTopbar />

      {/* 1) 뭘 주는 곳인가 — 히어로가 곧 제안.
          eyebrow 칩 삭제(craft-floor ban) + h1 명사구·56px 상한(oversized-h1)·한글 행간 1.2 */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-32 md:pt-40">
        <h1 className="text-[clamp(30px,5vw,56px)] font-black leading-[1.2] tracking-[-0.035em]">
          {t("AI 제품을 자기 언어로 설명하는", "Creators who explain AI products")}
          <br />
          <span className="text-violet">{t("크리에이터", "in their own voice")}</span>
        </h1>

        <p className="mt-6 max-w-xl text-[18px] font-medium leading-relaxed text-ink/75">
          {t(
            "지금 그런 크리에이터를 찾고 있습니다. AI SaaS를 직접 써보고 핵심을 짧게 전할 수 있다면 지원하세요. 운영팀과 함께하는 관리형 베타입니다.",
            "We're recruiting now. Apply if you can try an AI SaaS product and explain its value clearly. ViralGround is currently a team-guided managed beta.",
          )}
        </p>

        {/* 5) 뭘 하면 되는가 — 첫 CTA */}
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            href="/signup/creator"
            onClick={() => trackEvent("cta_click", { location: "creator_hero", target: "signup_creator" })}
            className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-violet px-8 text-[15px] font-bold text-white transition-transform hover:-translate-y-1"
          >
            {t("크리에이터 베타 지원", "Apply to creator beta")}
          </Link>
          <BookACallButton
            location="creator_hero"
            className="inline-flex min-h-[56px] items-center justify-center rounded-full border-2 border-ink/80 px-8 text-[15px] font-bold text-ink transition-transform hover:-translate-y-1"
          >
            {t("무료 상담 예약", "Book a free call")}
          </BookACallButton>
        </div>

        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[15px] font-semibold text-ink/65">
          <li className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-violet" /> {t("캠페인별 조건 사전 공개", "Campaign terms shown first")}</li>
          <li className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-violet" /> {t("운영팀 검토·지원", "Team review and support")}</li>
          <li className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-violet" /> {t("고정 팔로워 하한 없음", "No fixed follower minimum")}</li>
        </ul>
      </section>

      {/* 2) 정확히 얼마인가 — 보상 카드. kicker 삭제, 라벨 정보는 h2 로 흡수 */}
      <section className="bg-violet-soft py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-[clamp(26px,3.6vw,44px)] font-black leading-tight tracking-[-0.03em]">
            {t("보상, 참여 전에 확인할 세 가지", "Reward: three things to know first")}
          </h2>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {rewards.map((reward) => (
              <div key={reward.title} className="rounded-2xl border-2 border-ink bg-paper p-7">
                <b className="font-display text-[clamp(30px,3vw,40px)] tracking-[-0.03em] text-violet">
                  {reward.value}
                </b>
                <h3 className="mt-3 text-[18px] font-extrabold tracking-[-0.02em]">{reward.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/70">{reward.desc}</p>
              </div>
            ))}
          </div>

          {/* 보라 배경 위 보조 텍스트는 회색 알파가 아니라 같은 hue 의 어두운 보라 (gray-on-color) */}
          <p className="mt-6 text-[15px] font-medium text-violet-ink">
            {t(
              "보상과 공제 항목은 모든 캠페인에 동일하지 않습니다. 실제 조건은 지원 버튼을 누르기 전에 캠페인 상세에서 확인할 수 있어야 합니다.",
              "Rewards and deductions are not identical across every campaign. Live terms must be visible in campaign details before you apply.",
            )}
          </p>
        </div>
      </section>

      {/* 3) 어떻게 하는가 — 3단계. kicker 삭제 */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <h2 className="text-[clamp(26px,3.6vw,44px)] font-black leading-tight tracking-[-0.03em]">
          {t("시작부터 정산까지, 3단계", "From start to payout in 3 steps")}
        </h2>

        <ol className="mt-10 border-t-2 border-ink">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="grid grid-cols-[48px_1fr] gap-4 border-b-2 border-ink py-6 md:grid-cols-[64px_260px_1fr] md:items-center md:gap-8"
            >
              <span className="font-display text-[15px] text-violet">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[clamp(22px,2vw,28px)] font-extrabold tracking-[-0.02em]">
                {step.title}
              </h3>
              <p className="col-start-2 text-[15px] leading-relaxed text-ink/70 md:col-start-3">
                {step.desc}
              </p>
            </li>
          ))}
        </ol>

        {/* 모집중 캠페인으로 연결 */}
        <Link
          href="/campaigns"
          onClick={() => trackEvent("cta_click", { location: "creator_landing", target: "campaigns" })}
          className="group mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-ink bg-white p-7 transition-colors hover:bg-violet hover:text-white"
        >
          <div>
            <h3 className="text-[22px] font-extrabold tracking-[-0.02em]">
              {t("지금 모집 중인 캠페인 보기", "See campaigns recruiting now")}
            </h3>
            <p className="mt-1 text-[15px] font-medium text-ink/60 group-hover:text-white/80">
              {t(
                "가입 전에 어떤 브랜드가 크리에이터를 찾고 있는지 먼저 확인하세요.",
                "Check which brands are looking for creators — before you sign up.",
              )}
            </p>
          </div>
          <ArrowRight className="h-7 w-7 shrink-0" aria-hidden="true" strokeWidth={2.5} />
        </Link>
      </section>

      {/* 4) 믿어도 되는가 — 결제·정산 공개 원칙 + FAQ */}
      <EscrowTrustSection audience="creator" />

      {/* FAQ — kicker 삭제. 보조 섹션이라 여백을 한 단계 줄여 위계 부여(0.75 램프) */}
      <section className="mx-auto max-w-6xl px-6 py-12 md:py-[72px]">
        <h2 className="text-[clamp(26px,3.6vw,44px)] font-black leading-tight tracking-[-0.03em]">
          {t("자주 묻는 질문", "Frequently asked questions")}
        </h2>
        <div className="mt-8 max-w-3xl border-t-2 border-ink">
          {faqs.map((faq) => (
            <details key={faq.q} className="group border-b-2 border-ink">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[18px] font-extrabold tracking-[-0.02em] transition-colors hover:text-violet [&::-webkit-details-marker]:hidden">
                {faq.q}
                <span
                  className="text-[22px] font-black text-violet transition-transform group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="pb-6 pr-10 text-[15px] leading-relaxed text-ink/75">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 5) 마지막 행동 유도 — 종결 섹션은 여백 한 단계 크게(0.75 램프 최상단) */}
      <section className="bg-ink py-24 text-white md:py-32">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-[clamp(30px,4.5vw,54px)] font-black leading-tight tracking-[-0.03em]">
            {t("다음 영상, 여기서 시작하세요", "Start your next video here")}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[18px] font-medium leading-relaxed text-white/75">
            {t(
              "지원부터 첫 정산까지, 운영팀이 단계마다 함께합니다.",
              "From application to your first payout, our team is with you at every step.",
            )}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup/creator"
              onClick={() => trackEvent("cta_click", { location: "creator_bottom", target: "signup_creator" })}
              className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-violet px-8 text-[15px] font-bold text-white transition-transform hover:-translate-y-1"
            >
              {t("크리에이터 베타 지원", "Apply to creator beta")}
            </Link>
            <Link
              href="/creators"
              onClick={() => trackEvent("cta_click", { location: "creator_bottom", target: "creators" })}
              className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-white px-8 text-[15px] font-bold text-ink transition-transform hover:-translate-y-1"
            >
              {t("활동 중인 크리에이터 보기", "See active creators")}
            </Link>
          </div>
        </div>
      </section>

      <GroundFooter />
    </div>
  );
}
