"use client";

/**
 * /business — 브랜드 설득 랜딩.
 *
 * 목표: 브랜드 의사결정자가 상담을 신청한다. 그래서 이 페이지의 주인공은
 * 필름이 아니라 **브랜드 운영 데스크(제품 화면)** 이고, 마지막 씬은 벽이 아니라
 * 상담 절차다. 필름 스트립은 히어로 한 씬에서만 브랜드 실로 남는다.
 *
 * 구성: 제안 → 운영 데스크(전폭 증거) → 운영 범위·비포함 → 네 번의 결정 → 상담 절차.
 * 분석 이벤트 위치(business_hero / business_mobile_dock / business_final)와
 * ConsultationModal 동작은 그대로 유지한다.
 */

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import ConsultationModal from "@/components/landing/business/ConsultationModal";
import { useLang } from "@/lib/i18n";
import { trackEvent } from "@/lib/gtag";
import {
  CallActionButton,
  CallActionLink,
  CallDockButton,
  CallDockLink,
  CallHero,
  CallReveal,
  CallRuleList,
  CallScene,
  CallSceneHeading,
  CallSheetDocument,
  CallSheetFrame,
  callStyles as styles,
  type CallSceneDefinition,
} from "./CallSheetFrame";
import { DashboardProof } from "./ProductProof";
import { ConsultSteps, ScopeSheet } from "./SceneBlocks";

const SECTIONS: CallSceneDefinition[] = [
  { id: "brand-call", label: "브랜드 제안", tone: "paper" },
  { id: "brand-desk", label: "운영 데스크", tone: "ink" },
  { id: "brand-scope", label: "운영 범위", tone: "paper" },
  { id: "brand-flow", label: "네 번의 결정", tone: "violet" },
  { id: "brand-start", label: "상담 절차", tone: "ink" },
];

const FILMS = [
  { src: "/reels/DTpu_g6D3O1.jpg", alt: "AI 제품 숏폼 콘텐츠 예시", label: "PRODUCT HOOK" },
  { src: "/reels/DVpoahthmdk.jpg", alt: "크리에이터 숏폼 콘텐츠 예시", label: "CREATOR CUT" },
  { src: "/reels/DXhE_vZkorg.jpg", alt: "게시용 숏폼 콘텐츠 예시", label: "FINAL FILM" },
];

export default function BusinessCallSheetPage() {
  const { t } = useLang();
  const [consultOpen, setConsultOpen] = useState(false);

  const openConsult = (location: string) => {
    trackEvent("cta_click", { location, target: "consultation" });
    setConsultOpen(true);
  };

  return (
    <CallSheetFrame
      sections={SECTIONS}
      filmFrames={FILMS}
      pageName={t("브랜드", "Brands")}
      filmScenes={["brand-call"]}
      dock={
        <>
          <CallDockButton onClick={() => openConsult("business_mobile_dock")}>{t("브랜드 베타 문의", "Ask about brand beta")}</CallDockButton>
          <CallDockLink href="#brand-desk" secondary aria-label={t("운영 화면 보기", "See the workspace")}><ArrowUpRight aria-hidden="true" /></CallDockLink>
        </>
      }
    >
      <CallHero
        id="brand-call"
        pageCode="FOR BRANDS / MANAGED BETA"
        lines={["RUN", "THE", "CUT."]}
        description={
          <>
            <strong>{t("제품을 이해하는 크리에이터와, 한 편이 게시될 때까지.", "From a creator who understands the product to a film ready to publish.")}</strong>
            <span>{t("브리프·지원자·초안·게시 일정을 흩어놓지 않고 하나의 운영 흐름으로 관리합니다.", "Keep the brief, applicants, draft and publishing schedule in one operating flow.")}</span>
          </>
        }
        actions={
          <>
            <CallActionButton onClick={() => openConsult("business_hero")}>{t("브랜드 베타 문의", "Ask about brand beta")}</CallActionButton>
            <CallActionLink href="#brand-scope" tone="secondary">{t("운영 범위 보기", "See what we operate")}</CallActionLink>
          </>
        }
        document={
          <CallSheetDocument
            title={t("AI SaaS 캠페인 콜시트", "AI SaaS campaign call sheet")}
            status={t("관리형 베타", "MANAGED BETA")}
            fields={[
              { label: "PRODUCT", value: t("제품 이해부터", "Start with product context") },
              { label: "CREATOR", value: t("지원자 직접 검토", "Review every applicant") },
              { label: "DELIVERABLE", value: t("숏폼 한 편", "One short-form film") },
              { label: "PAYMENT", value: t("기능 준비 중 (OFF)", "In preparation (OFF)") },
            ]}
            footer={t("실제 운영 범위와 조건은 상담·계약에서 확정합니다.", "Scope and terms are confirmed during consultation and contracting.")}
          />
        }
      />

      {/* 주인공: 브랜드가 로그인 후 실제로 쓰는 화면. 전폭으로 둔다. */}
      <CallScene id="brand-desk" tone="ink" className={styles.proofScene}>
        <div className={styles.sceneInnerWide}>
          <CallReveal>
            <CallSceneHeading
              title={t("맡긴 뒤에도", "After the handoff,")}
              accent={t("운영은 보입니다.", "the work stays visible.")}
              description={t("브랜드 워크스페이스는 운영·지원 파이프라인·일정을 한 화면에서 전환합니다. 지원자 검토와 초안 검수도 이 흐름 안에서 이뤄집니다.", "The brand workspace switches between operations, applicant pipeline and schedule. Applicant review and draft approval happen inside the same flow.")}
            />
          </CallReveal>
          <CallReveal className={styles.proofReveal}><DashboardProof audience="business" /></CallReveal>
        </div>
      </CallScene>

      {/* 브랜드가 실제로 묻는 것: 무엇을 해주고, 무엇을 안 해주는가 */}
      <CallScene id="brand-scope" tone="paper" className={styles.boundaryScene}>
        <div className={styles.sceneInnerWide}>
          <CallReveal>
            <CallSceneHeading
              title={t("무엇을 맡고,", "What we run,")}
              accent={t("무엇을 맡지 않는지.", "and what we don't.")}
              description={t("결정에 필요한 건 약속이 아니라 경계입니다. 지금 제공하는 범위와 제공하지 않는 범위를 그대로 적습니다.", "A decision needs boundaries, not promises. Here is exactly what is and is not included today.")}
            />
          </CallReveal>
          <CallReveal><ScopeSheet /></CallReveal>
        </div>
      </CallScene>

      <CallScene id="brand-flow" tone="violet" className={styles.flowScene}>
        <div className={styles.sceneInnerSplit}>
          <CallReveal>
            <CallSceneHeading
              title={t("한 편이 나오는", "One film,")}
              accent={t("네 번의 결정.", "four decisions.")}
              description={t("단계가 바뀔 때마다 필요한 정보와 다음 행동만 남겨, 운영팀과 브랜드가 같은 장면을 봅니다.", "Each stage keeps only the information and next action both teams need.")}
            />
          </CallReveal>
          <CallReveal>
            <CallRuleList items={[
              { code: "01", title: "BRIEF", body: t("제품 맥락·핵심 메시지·금지 표현·모집 조건을 정리합니다.", "Set product context, key message, restrictions and recruiting terms."), meta: t("설계", "SET") },
              { code: "02", title: "MATCH", body: t("지원 메시지와 작업 스타일을 함께 보고 크리에이터를 고릅니다.", "Choose creators by reviewing both their message and working style."), meta: t("선정", "PICK") },
              { code: "03", title: "REVIEW", body: t("제출 이력과 수정 요청을 한 흐름에서 남깁니다.", "Keep submission history and change requests in one flow."), meta: t("검수", "CHECK") },
              { code: "04", title: "PUBLISH", body: t("게시 일정과 합의한 성과 입력 상태를 확인합니다.", "Track publishing and the agreed performance-entry status."), meta: t("기록", "LOG") },
            ]} />
          </CallReveal>
        </div>
      </CallScene>

      {/* 종결: 벽이 아니라 절차. 이탈 경로(크리에이터 쪽)는 두지 않는다. */}
      <CallScene id="brand-start" tone="ink" className={styles.finalScene}>
        <div className={styles.finalInner}>
          <CallReveal>
            <h2>{t("상담은", "The consultation")}<span>{t("이렇게 진행됩니다.", "runs like this.")}</span></h2>
            <p>{t("제품과 목표만 알려주시면 됩니다. 준비된 자료가 없어도 상담할 수 있습니다.", "Just tell us the product and the goal — no prepared materials required.")}</p>
            <ConsultSteps />
            <div className={styles.finalActions}>
              <CallActionButton tone="light" onClick={() => openConsult("business_final")}>{t("상담 신청하기", "Request a consultation")}</CallActionButton>
              <CallActionLink href="/signup/company" tone="secondary" onClick={() => trackEvent("cta_click", { location: "business_final", target: "signup_company" })}>{t("브랜드 계정 만들기", "Create a brand account")}</CallActionLink>
            </div>
          </CallReveal>
        </div>
      </CallScene>

      <ConsultationModal open={consultOpen} onClose={() => setConsultOpen(false)} />
    </CallSheetFrame>
  );
}
