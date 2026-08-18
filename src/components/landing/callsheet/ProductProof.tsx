"use client";

import { ArrowRight, CircleOff, Search } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { ProductPreviewLabel, callStyles as styles } from "./CallSheetFrame";

export function DashboardProof({ audience }: { audience: "business" | "creator" }) {
  const { t } = useLang();
  const isBusiness = audience === "business";
  const tabs = isBusiness
    ? [t("운영", "Operations"), t("지원·파이프라인", "Applications & pipeline"), t("일정", "Schedule")]
    : [t("할 일", "To do"), t("성과", "Performance"), t("탐색", "Discover"), t("정산", "Settlement")];
  const rows = isBusiness
    ? [
        { title: t("캠페인 브리프 작성", "Create a campaign brief"), meta: t("목표·보상·모집 조건을 단계별로 설정", "Set goals, reward and conditions step by step"), status: t("다음 작업", "Next") },
        { title: t("지원자와 콘텐츠 확인", "Review applicants and content"), meta: t("주의가 필요한 진행 상태부터 확인", "Start with work that needs attention"), status: t("운영", "Operate") },
        { title: t("브랜드 공개 정보 점검", "Review public brand details"), meta: t("크리에이터에게 보이는 정보를 관리", "Manage what creators see"), status: t("설정", "Profile") },
      ]
    : [
        { title: t("선정된 캠페인 가이드 확인", "Review an approved campaign guide"), meta: t("제출 기한과 제작 요구사항을 한 번에", "See the deadline and requirements together"), status: t("제작 준비", "Ready") },
        { title: t("수정 요청 반영", "Address requested changes"), meta: t("검수 의견과 이전 제출본을 같은 흐름에서", "Keep feedback and submission history together"), status: t("수정 필요", "Changes") },
        { title: t("새 캠페인 탐색", "Discover a new campaign"), meta: t("브랜드·보상·마감 조건부터 비교", "Compare brand, reward and deadline first"), status: t("탐색", "Browse") },
      ];

  return (
    <div className={styles.dashboardProof} aria-label={t(`${isBusiness ? "브랜드" : "크리에이터"} 대시보드 제품 화면 예시`, `${isBusiness ? "Brand" : "Creator"} dashboard product preview`)}>
      <header className={styles.proofTopbar}>
        <span className={styles.proofMark}>VG</span>
        <span>{isBusiness ? t("브랜드 운영 데스크", "Brand operations desk") : t("크리에이터 워크 데스크", "Creator work desk")}</span>
        <ProductPreviewLabel />
      </header>
      <div className={styles.proofMetricStrip} aria-hidden="true">
        {(isBusiness
          ? [t("전체 캠페인", "Campaigns"), t("모집 중", "Recruiting"), t("누적 지원", "Applications"), t("결제·정산", "Payments")]
          : [t("진행 작업", "Active work"), t("검수 대기", "In review"), t("완료", "Completed"), t("결제·정산", "Payments")]
        ).map((label, index) => (
          <span key={label}><small>{label}</small><strong>{index === 3 ? "OFF" : "—"}</strong></span>
        ))}
      </div>
      <div className={styles.proofTabs} aria-label={t("제품 화면 탭 예시", "Product preview tabs")}>
        {tabs.map((tab, index) => (
          <span key={tab} aria-current={index === 0 ? "page" : undefined}>{tab}</span>
        ))}
      </div>
      <div className={styles.proofWorkspace}>
        <div className={styles.proofPanel}>
          <header><strong>{t("다음 작업", "Next actions")}</strong><span>01 / 03</span></header>
          <div className={styles.proofRows}>
            {rows.map((row) => (
              <div className={styles.proofRow} key={row.title}>
                <span><strong>{row.title}</strong><small>{row.meta}</small></span>
                <span className={styles.proofStatus}>{row.status}</span>
                <ArrowRight aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
        <div className={styles.proofSide}>
          <span className={styles.proofSearch}><Search aria-hidden="true" /><span>{t("작업 검색", "Search work")}</span></span>
          <div className={styles.proofNotice}>
            <CircleOff aria-hidden="true" />
            <span><strong>{t("결제·정산 비활성", "Payments disabled")}</strong><small>{t("PG 연결 전까지 송금 기능을 제공하지 않습니다.", "Transfers remain unavailable until the gateway is connected.")}</small></span>
          </div>
          <div className={styles.proofSchedule} aria-hidden="true">
            <span>08.18</span><i /><b>{t("가이드 확인", "Guide review")}</b>
            <span>08.21</span><i /><b>{t("초안 제출", "Draft due")}</b>
            <span>08.26</span><i /><b>{t("게시 일정", "Publish")}</b>
          </div>
        </div>
      </div>
    </div>
  );
}
