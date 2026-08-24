"use client";

/**
 * 페이지 고유 블록 — 각 공개 랜딩의 "주인공".
 *
 * 세 페이지가 같은 템플릿을 공유하던 구조(2026-08-15 critique 20/36)를 끊기 위해,
 * 페이지마다 그 페이지의 목표가 요구하는 블록을 따로 만든다.
 *  · ScopeSheet     — /business: 브랜드가 실제로 묻는 것(범위·비포함·확정 시점)
 *  · ConsultSteps   — /business: 상담이 어떻게 진행되는지(종결 씬)
 *
 * 상태 라벨과 화면 이름은 제품에서 쓰는 값을 그대로 옮긴다. 수치·기간·금액은
 * 확정된 사실이 아니면 쓰지 않는다(DESIGN.md 진실 제약).
 */

import { AlertTriangle, Check, Minus } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { callStyles as styles } from "./CallSheetFrame";

/* ── /business : 운영 범위 시트 ── */

export function ScopeSheet() {
  const { t } = useLang();

  const included = [
    t("캠페인 브리프 설계 — 제품 맥락·핵심 메시지·금지 표현 정리", "Brief design — product context, key message, restrictions"),
    t("지원자 검토와 선정 — 지원 메시지와 제작 방식을 함께 확인", "Applicant review — message and working style together"),
    t("초안 검수와 수정 요청 — 사유와 이력을 캠페인에 기록", "Draft review and change requests, recorded with reasons"),
    t("게시 일정 확인과 성과 기록 열람", "Publishing schedule and recorded performance"),
  ];

  const excluded = [
    t("플랫폼 내 계약·결제 — 현재 서비스 범위에 포함하지 않습니다", "Contracts and payments — not handled by the current platform service"),
    t("성과 보장 — 도달·전환 수치를 약속하지 않습니다", "Guaranteed results — no reach or conversion promises"),
    t("광고 매체 집행과 대행 — 캠페인 운영 범위 밖입니다", "Paid media buying — outside the campaign scope"),
  ];

  return (
    <div className={styles.scopeSheet}>
      <div className={styles.scopeCol}>
        <header>
          <strong>{t("운영에 포함", "In scope")}</strong>
          <span>INCLUDED</span>
        </header>
        <ul className={styles.scopeList}>
          {included.map((item) => (
            <li key={item}>
              <Check aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={`${styles.scopeCol} ${styles.scopeOut}`}>
        <header>
          <strong>{t("포함하지 않음", "Not in scope")}</strong>
          <span>EXCLUDED</span>
        </header>
        <ul className={styles.scopeList}>
          {excluded.map((item) => (
            <li key={item}>
              <Minus aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className={styles.scopeFoot}>
        <AlertTriangle aria-hidden="true" />
        <span>
          {t(
            "실제 운영 범위·기간·비용은 상담과 계약에서 확정합니다. 이 페이지의 어떤 항목도 견적이나 성과 약속이 아닙니다.",
            "Actual scope, timeline and cost are set in consultation and contracting. Nothing here is a quote or a performance promise.",
          )}
        </span>
      </p>
    </div>
  );
}

/* ── /business : 상담 절차 ── */

export function ConsultSteps() {
  const { t } = useLang();
  const steps = [
    {
      no: "01",
      title: t("제품과 목표 공유", "Share product and goal"),
      body: t("무엇을 알리고 싶은지, 어떤 반응을 기대하는지 알려주세요.", "Tell us what you want known and what response you expect."),
    },
    {
      no: "02",
      title: t("운영 범위 정리", "We define the scope"),
      body: t("가능한 범위와 조건, 진행 방식을 정리해 회신합니다.", "We reply with a workable scope, terms and how it would run."),
    },
    {
      no: "03",
      title: t("브리프 작성", "Write the brief"),
      body: t("합의된 조건으로 캠페인 브리프를 작성하고 시작합니다.", "The campaign brief is written on the agreed terms."),
    },
  ];

  return (
    <div className={styles.consultSteps}>
      {steps.map((step) => (
        <div key={step.no}>
          <b>{step.no}</b>
          <strong>{step.title}</strong>
          <small>{step.body}</small>
        </div>
      ))}
    </div>
  );
}
