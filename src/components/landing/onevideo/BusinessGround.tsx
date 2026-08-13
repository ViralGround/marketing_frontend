"use client";

/**
 * 브랜드 설득 랜딩 — 관문(/)과 같은 "스크롤 필름" 리듬으로 재구축.
 *
 * 관문의 씬 문법(onevideo.css의 .vg4)을 그대로 재사용한다:
 *  씬1 hero(페이퍼)    — 한국어 헤드라인 + 관리형 베타 스티커
 *  씬2 manifesto(다크) — 제품 브리프에서 크리에이터 영상까지
 *  씬3 proof(페이퍼)   — 왜 다른가: REAL / LIVE / SAFE 룰드 리스트
 *  씬4 flow(바이올렛)  — 3장면 프로세스, 스크롤 따라 현재 단계 하이라이트
 *  이어서 크리에이터 풀 링크 + 베타 결제·정산 안내 → 씬5 final(다크) 상담 CTA
 * 다크 씬이 상단에 오면 wrapper 에 on-dark 를 붙여 topbar 색이 뒤집힌다(관문과 동일).
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import GroundTopbar from "./GroundTopbar";
import GroundFooter from "./GroundFooter";
import EscrowTrustSection from "@/components/landing/EscrowTrustSection";
import ConsultationModal from "@/components/landing/business/ConsultationModal";
import { useLang } from "@/lib/i18n";
import { trackEvent } from "@/lib/gtag";
import "./onevideo.css";
import "./business-ground.css";

export default function BusinessGround() {
  const { t } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLElement>(null);
  const darkRefs = useRef<(HTMLElement | null)[]>([]);
  const [consultOpen, setConsultOpen] = useState(false);

  const openConsult = (location: string) => {
    trackEvent("cta_click", { location, target: "consultation" });
    setConsultOpen(true);
  };

  /* 관문과 같은 스크롤 리듬: 다크 씬 위에서 topbar 반전 + 플로우 단계 하이라이트 */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      flowRef.current?.querySelector("[data-flow-step]")?.classList.add("is-current");
      return;
    }

    let ticking = false;

    const update = () => {
      const probe = 90; // topbar 가 걸치는 높이

      const onDark = darkRefs.current.some((el) => {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top < probe && rect.bottom > probe;
      });
      root.classList.toggle("on-dark", onDark);

      if (flowRef.current) {
        const rect = flowRef.current.getBoundingClientRect();
        const travel = Math.max(rect.height - window.innerHeight, 1);
        const progress = Math.min(Math.max(-rect.top / travel, 0), 1);
        const steps = flowRef.current.querySelectorAll("[data-flow-step]");
        const active = Math.min(steps.length - 1, Math.floor(progress * steps.length));
        steps.forEach((step, index) => step.classList.toggle("is-current", index === active));
      }

      ticking = false;
    };

    const requestUpdate = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  /* 카피 리빌 — 관문과 동일. 기본은 보이는 상태(anim-armed 필요),
     threshold 를 낮춰 큰 문단이 영영 숨겨지는 경우를 막는다. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = root.querySelectorAll(".reveal");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    root.classList.add("anim-armed");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="vg4 biz">
      <GroundTopbar />

      <div>
        {/* 씬 1 — 무엇을 해주는 곳인가 */}
        <section className="scene hero" aria-labelledby="biz-hero-title">
          <div className="scene-sticky">
            {/* oversized-h1: 3행 완전 문장(86px) → 2행 명사구(64px 상한) */}
            <h1 className="biz-hero-title" id="biz-hero-title">
              {t("AI 제품을 이해하는 크리에이터,", "Creators who get your AI product,")}
              <br />
              <span className="accent">{t("한 편의 영상으로.", "in one film.")}</span>
            </h1>

            <span className="biz-sticker" aria-hidden="true">
              <small>{t("운영팀과 함께", "With our team")}</small>
              <b>MANAGED BETA</b>
            </span>

            <p className="hero-copy reveal">
              <span className="copy-line">{t("브리프와 크리에이터 검토부터", "From briefs and creator review")}</span>
              <span className="copy-line">
                <strong>{t("콘텐츠 검수와 게시까지,", "to content review and publishing,")}</strong>
              </span>
              <span className="copy-line">
                <strong>{t("한 흐름으로 운영합니다.", "run it in one guided flow.")}</strong>
              </span>
            </p>

            <div className="biz-hero-actions">
              <button type="button" onClick={() => openConsult("business_hero")}>
                {t("브랜드 베타 문의", "Ask about brand beta")}
              </button>
              <Link href="/creators">{t("크리에이터 둘러보기", "Browse creators")}</Link>
            </div>

            <span className="scroll-cue" aria-hidden="true">
              <i />
              scroll for process
            </span>
          </div>
        </section>

        {/* 씬 2 — 운영 원칙 (다크) */}
        <section
          ref={(el) => {
            darkRefs.current[0] = el;
          }}
          className="scene manifesto"
          aria-labelledby="biz-numbers-title"
        >
          <div className="scene-sticky">
            {/* kicker(manifesto-tag) 삭제 — 헤드라인이 스스로 말하게 (craft-floor ban) */}
            <h2 className="manifesto-title" id="biz-numbers-title">
              <span>BRIEF FIRST.</span>
              <span>FILM NEXT.</span>
            </h2>

            <span className="spread-sticker ko" aria-hidden="true">
              {t("함께 설계합니다", "Built together")}
            </span>

            <p className="manifesto-korean reveal">
              <span className="copy-line">{t("제품의 강점과 금지 표현을 먼저 정리하고,", "We define the product, message, and guardrails first,")}</span>
              <span className="copy-line">{t("AI 제품 적합도가 맞는 크리에이터를", "then review creators for genuine AI-product fit")}</span>
              <span className="copy-line">{t("운영팀과 함께 검토합니다.", "with the ViralGround team.")}</span>
            </p>
          </div>
        </section>

        {/* 씬 3 — 왜 다른가 (페이퍼) */}
        <section className="scene proof" aria-labelledby="biz-diff-title">
          <div className="scene-sticky">
            <div className="ghost-type proof-ghost" aria-hidden="true">
              <span>REAL</span>
              <span>UGC</span>
            </div>

            <div className="proof-left front-copy">
              <h2 id="biz-diff-title">
                <span className="copy-line">{t("제품을 직접 써보고,", "Use the product first.")}</span>
                <em className="copy-line">{t("자기 언어로 만들고,", "Translate it honestly.")}</em>
                <span className="copy-line">{t("과정과 결과를", "Keep the process")}</span>
                <em className="copy-line">{t("기록합니다.", "and outcome visible.")}</em>
              </h2>
            </div>

            <div className="proof-right front-copy">
              <p>
                <span className="copy-line">{t("크리에이터가 제품을 자기 언어로 설명하고,", "Creators explain the product in their own voice,")}</span>
                <span className="copy-line">{t("운영팀이 브리프와 표현을 함께 확인하며,", "our team checks the brief and claims,")}</span>
                <span className="copy-line">{t("게시 후 합의한 지표를 기록합니다.", "and records the agreed metrics after publishing.")}</span>
              </p>
              <ul className="reward-lines" aria-label={t("바이럴그라운드의 다른 점", "What makes us different")}>
                <li>
                  <span>{t("AI 제품 경험과 콘텐츠 스타일 검토", "AI-product experience and content-fit review")}</span>
                  <b>FIT</b>
                </li>
                <li>
                  <span>{t("게시 전 브리프·표현·일정 확인", "Brief, claims, and timeline review before publishing")}</span>
                  <b>REVIEW</b>
                </li>
                <li>
                  <span>{t("합의한 지표 기준의 캠페인 리포트", "Campaign report based on agreed metrics")}</span>
                  <b>REPORT</b>
                </li>
              </ul>
            </div>

            <span className="proof-stamp">
              guided
              <br />
              beta
              <br />
              ops
            </span>
          </div>
        </section>

        {/* 씬 4 — 어떻게 진행되나 (바이올렛) */}
        <section ref={flowRef} className="scene flow" aria-labelledby="biz-flow-title">
          <div className="scene-sticky">
            <div className="flow-copy front-copy">
              <h2 id="biz-flow-title">
                <span className="copy-line">{t("문의부터", "From brief")}</span>
                <span className="copy-line">{t("리포트까지", "to report,")}</span>
                <span className="copy-line">{t("세 장면으로.", "in three scenes.")}</span>
              </h2>

              <ol className="flow-steps">
                <li data-flow-step>
                  <span className="no">01</span>
                  <strong>Brief</strong>
                  <small>{t("제품과 목표를 알려주시면 매니저가 캠페인을 설계합니다", "Share your product and goal — we design the campaign")}</small>
                </li>
                <li data-flow-step>
                  <span className="no">02</span>
                  <strong>Create</strong>
                  <small>{t("승인한 크리에이터들이 각자의 스타일로 영상을 올립니다", "Approved creators film and post in their own style")}</small>
                </li>
                <li data-flow-step>
                  <span className="no">03</span>
                  <strong>Report</strong>
                  <small>{t("합의한 지표를 확인하고 캠페인 리포트로 정리합니다", "Review the agreed metrics and close with a campaign report")}</small>
                </li>
              </ol>
            </div>

            {/* final CTA 의 "Make it count." 와 중복되던 문구 — 섹션 내용을 받는 문구로 교체 */}
            <div className="flow-hand" aria-hidden="true">
              Brief to
              <br />
              report.
            </div>
          </div>
        </section>

        {/* 크리에이터 풀 + 베타 결제·정산 안내 — 페이퍼 흐름 구간 */}
        <section className="bg-paper px-6 py-20 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-2xl uppercase tracking-[-0.035em] text-ink">
              {t("크리에이터 풀", "Ground crew")}
            </h2>
            <Link
              href="/creators"
              onClick={() => trackEvent("cta_click", { location: "business_landing", target: "creators" })}
              className="ground-link mt-5"
            >
              <span>
                <strong>{t("지금 활동 중인 크리에이터 보기", "Meet the creators on the ground")}</strong>
                <small>
                  {t(
                    "공개에 동의한 크리에이터 프로필과 완료 이력을 확인하세요.",
                    "Review creator profiles and completed work shared with consent.",
                  )}
                </small>
              </span>
              <ArrowRight className="arrow" aria-hidden="true" strokeWidth={2.5} />
            </Link>
          </div>
        </section>

        <EscrowTrustSection audience="business" />

        {/* 씬 5 — 마지막 행동 (다크) */}
        <section
          ref={(el) => {
            darkRefs.current[1] = el;
          }}
          className="scene final"
          aria-labelledby="biz-final-title"
        >
          <div className="scene-sticky">
            <div className="ghost-type final-ghost" aria-hidden="true">
              VIRALGROUND
            </div>

            <div className="final-copy">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="final-brand-mark" src="/viral-ground-logo.png" alt="Viral Ground" />
              <h2 id="biz-final-title">
                Make it<span>count.</span>
              </h2>
              <p>
                <span className="copy-line">{t("제품과 목표만 알려주세요.", "Just tell us your product and goal.")}</span>
                <span className="copy-line">{t("가능한 운영 범위와 리포트 기준을", "We'll outline the workable scope")}</span>
                <span className="copy-line">{t("먼저 정리해드립니다.", "and reporting criteria first.")}</span>
              </p>
              <div className="cta-row">
                <button type="button" className="cta violet" onClick={() => openConsult("business_final")}>
                  {t("캠페인 상담 신청", "Request a consultation")}
                </button>
                <Link
                  className="cta"
                  href="/signup/company"
                  onClick={() => trackEvent("cta_click", { location: "business_final", target: "signup_company" })}
                >
                  {t("브랜드 베타 신청", "Apply to brand beta")}
                </Link>
              </div>
            </div>

            <div className="footer-note">
              <span>ViralGround © 2026</span>
              <span>AI SaaS / Managed beta / Creator film</span>
              <span>Seoul, Korea</span>
            </div>
          </div>
        </section>
      </div>

      <GroundFooter />

      <ConsultationModal open={consultOpen} onClose={() => setConsultOpen(false)} />
    </div>
  );
}
