"use client";

/**
 * 캠페인 데스크 상호작용 데모 — /campaigns 의 설명 축.
 *
 * 브랜드 운영 데스크와 크리에이터 작업 데스크가 하나의 캠페인을 두고 실제로
 * 주고받는 순서를 그대로 보여준다. 화면 이름·버튼 문구·상태 라벨은 제품에서
 * 실제로 쓰는 값(ApplicationStatusBadge / 지원자 큐 / VideoUploader / MetricForm)을
 * 그대로 옮겼고, 수치는 만들어내지 않는다(em dash). 결제·정산은 OFF 로만 표기한다.
 *
 * 상호작용 자체가 제품의 탭 모델(WorkspaceTabs)과 같은 규칙을 따른다:
 * role=tablist, 좌우 방향키·Home·End 이동, 선택된 단계만 패널 노출.
 */

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowRight, Minus } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { trackEvent } from "@/lib/gtag";
import { ProductPreviewLabel, callStyles as styles } from "./CallSheetFrame";

type BadgeTone = "wait" | "go" | "check" | "off";

interface DeskRow {
  title: string;
  meta: string;
  badge?: string;
  tone?: BadgeTone;
}

interface DeskScreenData {
  desk: string;
  path: ReactNode;
  rows: DeskRow[];
  actions?: Array<{ label: string; variant: "primary" | "quiet" }>;
}

interface DeskStep {
  id: string;
  no: string;
  ko: string;
  en: string;
  actor: "brand" | "creator" | "none";
  handoff: string;
  brand: DeskScreenData;
  creator: DeskScreenData;
  from?: string;
  to: string;
  note: ReactNode;
}

function DeskScreen({ data, active, side }: { data: DeskScreenData; active: boolean; side: string }) {
  return (
    <article className={styles.deskScreen} data-active={active} aria-label={`${data.desk} — ${side}`}>
      <header className={styles.deskScreenHead}>
        <span className={styles.proofMark}>VG</span>
        <span>{data.desk}</span>
        <ProductPreviewLabel>SAMPLE STATE</ProductPreviewLabel>
      </header>
      <p className={styles.deskScreenPath}>{data.path}</p>
      <ul className={styles.deskRows}>
        {data.rows.map((row) => (
          <li key={row.title}>
            <span>
              <strong>{row.title}</strong>
              <small>{row.meta}</small>
            </span>
            {row.badge ? (
              <span className={styles.deskBadge} data-tone={row.tone ?? "off"}>
                {row.badge}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      {data.actions?.length ? (
        <div className={styles.deskActions} aria-hidden="true">
          {data.actions.map((action) => (
            <span key={action.label} data-variant={action.variant}>
              {action.label}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export default function CampaignDeskDemo() {
  const { t } = useLang();
  const [activeId, setActiveId] = useState("apply");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const steps: DeskStep[] = [
    {
      id: "apply",
      no: "01",
      ko: t("지원", "Apply"),
      en: "APPLY",
      actor: "creator",
      handoff: t("지원서", "APPLICATION"),
      creator: {
        desk: t("크리에이터 작업 데스크", "Creator work desk"),
        path: <>{t("탐색", "Discover")} · <b>{t("캠페인 상세", "Campaign detail")}</b></>,
        rows: [
          { title: t("이 캠페인에 지원", "Apply to this campaign"), meta: t("보상·마감·지원 현황을 확인한 뒤 지원합니다.", "Check reward, deadline and slots before applying.") },
          { title: t("지원 메시지 (선택)", "Application message (optional)"), meta: t("어떤 스타일의 영상을 만들 계획인지 간단히 적습니다.", "Briefly describe the video you plan to make.") },
        ],
        actions: [{ label: t("지원 제출", "Submit application"), variant: "primary" }],
      },
      brand: {
        desk: t("브랜드 운영 데스크", "Brand operations desk"),
        path: <>{t("캠페인 상세", "Campaign detail")} · <b>{t("지원자 큐", "Applicant queue")}</b></>,
        rows: [
          { title: t("새 지원 접수", "New application"), meta: t("지원자 큐에 행이 추가됩니다.", "A row lands in the applicant queue."), badge: t("지원 대기", "Pending"), tone: "wait" },
          { title: t("지원자 수", "Applicants"), meta: t("캠페인 핵심 정보 지표에 반영됩니다.", "Counted in the campaign metric strip."), badge: "—", tone: "off" },
        ],
      },
      to: t("지원 대기", "Pending"),
      note: (
        <>
          {t("지원 메시지는 선택입니다. 브랜드가 검토해 선정하면 그때부터 제작을 시작합니다.", "The message is optional. Production starts only after the brand reviews and selects you.")}
        </>
      ),
    },
    {
      id: "select",
      no: "02",
      ko: t("선정", "Select"),
      en: "SELECT",
      actor: "brand",
      handoff: t("선정 결과", "DECISION"),
      brand: {
        desk: t("브랜드 운영 데스크", "Brand operations desk"),
        path: <>{t("지원자 큐", "Applicant queue")} · <b>{t("지원자 시트", "Applicant sheet")}</b></>,
        rows: [
          { title: t("지원 메시지 확인", "Read the message"), meta: t("메시지가 없으면 '작성된 메시지가 없습니다'로 표시됩니다.", "Shows an explicit empty line when no message was written.") },
          { title: t("선정 또는 탈락", "Select or reject"), meta: t("결정은 지원 상태로 기록됩니다.", "The decision is recorded as the application status.") },
        ],
        actions: [
          { label: t("선정", "Select"), variant: "primary" },
          { label: t("탈락", "Reject"), variant: "quiet" },
        ],
      },
      creator: {
        desk: t("크리에이터 작업 데스크", "Creator work desk"),
        path: <>{t("MY WORK", "My work")} · <b>{t("지원·콘텐츠", "Applications")}</b></>,
        rows: [
          { title: t("상태 갱신", "Status updates"), meta: t("할 일 탭에 제작 준비가 나타납니다.", "Production readiness appears in the to-do tab."), badge: t("참여 승인", "Approved"), tone: "go" },
          { title: t("제작 가이드 확인", "Open the guide"), meta: t("제출 기한과 요구사항을 한 화면에서 봅니다.", "Deadline and requirements in one place.") },
        ],
      },
      from: t("지원 대기", "Pending"),
      to: t("참여 승인", "Approved"),
      note: (
        <>
          {t("탈락은 ", "A rejection is recorded as ")}
          <b>{t("미선정", "not selected")}</b>
          {t("으로 남고, 선정은 크리에이터의 할 일로 바로 이어집니다.", " and a selection moves straight into the creator's to-do list.")}
        </>
      ),
    },
    {
      id: "submit",
      no: "03",
      ko: t("제출", "Submit"),
      en: "SUBMIT",
      actor: "creator",
      handoff: t("제출본", "CUT"),
      creator: {
        desk: t("크리에이터 작업 데스크", "Creator work desk"),
        path: <>{t("MY WORK", "My work")} · <b>{t("영상 업로드", "Video upload")}</b></>,
        rows: [
          { title: t("영상 업로드", "Upload the video"), meta: t("mp4, mov, webm · 최대 500MB", "mp4, mov, webm · up to 500MB") },
          { title: t("업로드 후 제출", "Upload, then submit"), meta: t("제출할 때마다 회차가 쌓입니다.", "Each submission is kept as a numbered take.") },
        ],
        actions: [
          { label: t("업로드 후 제출", "Upload and submit"), variant: "primary" },
          { label: t("취소", "Cancel"), variant: "quiet" },
        ],
      },
      brand: {
        desk: t("브랜드 운영 데스크", "Brand operations desk"),
        path: <>{t("지원자 시트", "Applicant sheet")} · <b>{t("제출 콘텐츠", "Submitted content")}</b></>,
        rows: [
          { title: t("제출 영상 검토", "Review the cut"), meta: t("제출 회차와 함께 영상을 확인합니다.", "Watch the cut with its take number."), badge: t("제출 완료", "Submitted"), tone: "check" },
          { title: t("제출 이력", "Submission history"), meta: t("재제출 횟수까지 그대로 남습니다.", "Resubmission count stays on the record."), badge: "—", tone: "off" },
        ],
      },
      from: t("참여 승인", "Approved"),
      to: t("제출 완료", "Submitted"),
      note: (
        <>
          {t("같은 상태를 크리에이터 데스크에서는 ", "The creator desk labels the same state ")}
          <b>{t("검수 중", "in review")}</b>
          {t("으로 읽습니다. 브랜드가 확인할 때까지 다음 단계는 열리지 않습니다.", ". Nothing advances until the brand reviews it.")}
        </>
      ),
    },
    {
      id: "review",
      no: "04",
      ko: t("검수", "Review"),
      en: "REVIEW",
      actor: "brand",
      handoff: t("수정 요청", "NOTES"),
      brand: {
        desk: t("브랜드 운영 데스크", "Brand operations desk"),
        path: <>{t("지원자 시트", "Applicant sheet")} · <b>{t("검수", "Review")}</b></>,
        rows: [
          { title: t("수정 요청 사유", "Change request"), meta: t("무엇을 어떻게 고칠지 사유를 남겨야 전달됩니다.", "A written reason is required before it is sent."), badge: t("수정 요청", "Changes"), tone: "wait" },
          { title: t("최종 거절", "Final rejection"), meta: t("거절도 이력으로 남습니다.", "Rejections stay on the record too.") },
        ],
        actions: [
          { label: t("수정 요청 보내기", "Send request"), variant: "primary" },
          { label: t("거절", "Reject"), variant: "quiet" },
        ],
      },
      creator: {
        desk: t("크리에이터 작업 데스크", "Creator work desk"),
        path: <>{t("MY WORK", "My work")} · <b>{t("수정 요청", "Change request")}</b></>,
        rows: [
          { title: t("요청 사유 확인", "Read the reason"), meta: t("지원 행에 사유가 함께 표시됩니다.", "The reason sits on the application row."), badge: t("수정 요청", "Changes"), tone: "wait" },
          { title: t("재제출", "Resubmit"), meta: t("다시 제출하면 검수가 이어집니다.", "Resubmitting sends it back to review.") },
        ],
        actions: [{ label: t("재제출", "Resubmit"), variant: "primary" }],
      },
      from: t("제출 완료", "Submitted"),
      to: t("수정 요청 → 재제출", "Changes → resubmit"),
      note: (
        <>
          <b>{t("승인·정산 버튼은 아직 없습니다.", "There is no approve or settle button yet.")}</b>{" "}
          {t("검수 단계에서 기록되는 것은 수정 요청과 거절뿐이고, 승인·정산은 결제 연결 이후에 열립니다.", "Review records only change requests and rejections; approval and settlement open after payments are connected.")}
        </>
      ),
    },
    {
      id: "record",
      no: "05",
      ko: t("성과 기록", "Record"),
      en: "RECORD",
      actor: "creator",
      handoff: t("성과 기록", "METRICS"),
      creator: {
        desk: t("크리에이터 작업 데스크", "Creator work desk"),
        path: <>{t("PERFORMANCE", "Performance")} · <b>{t("성과 입력", "Enter metrics")}</b></>,
        rows: [
          { title: t("조회수 · 좋아요 · 댓글", "Views · likes · comments"), meta: t("게시물의 실제 수치를 직접 입력합니다.", "The creator types the real numbers from the post.") },
          { title: t("게시물 URL (선택)", "Post URL (optional)"), meta: t("http/https 링크만 저장됩니다.", "Only http/https links are stored.") },
        ],
        actions: [{ label: t("성과 입력", "Save metrics"), variant: "primary" }],
      },
      brand: {
        desk: t("브랜드 운영 데스크", "Brand operations desk"),
        path: <>{t("캠페인", "Campaign")} · <b>{t("성과 리포트", "Performance report")}</b></>,
        rows: [
          { title: t("크리에이터별 기록", "Per-creator records"), meta: t("조회·좋아요·댓글·기록일이 행으로 남습니다.", "Views, likes, comments and the recorded date."), badge: "—", tone: "off" },
          { title: t("합계 지표", "Totals"), meta: t("입력된 값만 합산합니다.", "Only entered values are summed.") },
        ],
      },
      from: t("게시", "Published"),
      to: t("성과 기록", "Recorded"),
      note: (
        <>
          {t("성과는 추정치가 아니라 ", "Performance is not an estimate — it is ")}
          <b>{t("크리에이터가 입력한 실제 수치", "the number the creator entered")}</b>
          {t("입니다. 입력 전에는 미입력으로 남습니다.", ". Before that it stays marked as not entered.")}
        </>
      ),
    },
    {
      id: "settle",
      no: "06",
      ko: t("정산", "Settle"),
      en: "SETTLE",
      actor: "none",
      handoff: "OFF",
      brand: {
        desk: t("브랜드 운영 데스크", "Brand operations desk"),
        path: <>{t("캠페인 상세", "Campaign detail")} · <b>{t("결제·정산", "Payments")}</b></>,
        rows: [
          { title: t("결제·정산", "Payments"), meta: t("PG 연결 전까지 비활성입니다.", "Disabled until the gateway is connected."), badge: "OFF", tone: "off" },
          { title: t("송금 안내 없음", "No transfer instructions"), meta: t("화면의 예산을 어떤 계좌로도 송금하지 마세요.", "Never transfer the shown budget to any account.") },
        ],
      },
      creator: {
        desk: t("크리에이터 작업 데스크", "Creator work desk"),
        path: <>{t("작업 데스크", "Work desk")} · <b>{t("정산", "Settlement")}</b></>,
        rows: [
          { title: t("정산 현황", "Settlement status"), meta: t("완료 처리된 기록만 합산해 보여줍니다.", "Only completed records are summed."), badge: "—", tone: "off" },
          { title: t("지급 방식·일정", "Method and schedule"), meta: t("참여 확정 시 운영팀이 개별 안내합니다.", "Shared individually when participation is confirmed.") },
        ],
      },
      to: t("기능 준비 중", "In preparation"),
      note: (
        <>
          {t("관리형 베타에서는 결제·정산이 ", "In the managed beta, payments and settlement are ")}
          <b>{t("비활성", "disabled")}</b>
          {t("입니다. 운영 계약과 PG 연결이 끝난 뒤 검증된 절차를 별도로 안내합니다.", ". A verified procedure is announced once the operating contract and gateway are in place.")}
        </>
      ),
    },
  ];

  const activeIndex = Math.max(0, steps.findIndex((step) => step.id === activeId));
  const step = steps[activeIndex];

  const selectStep = (index: number) => {
    const next = steps[(index + steps.length) % steps.length];
    setActiveId(next.id);
    tabRefs.current[(index + steps.length) % steps.length]?.focus();
    trackEvent("campaign_desk_step", { location: "campaigns_desk", target: next.id });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectStep(activeIndex + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectStep(activeIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectStep(0);
    } else if (event.key === "End") {
      event.preventDefault();
      selectStep(steps.length - 1);
    }
  };

  const direction = step.actor === "brand" ? "right" : step.actor === "creator" ? "left" : "none";

  return (
    <div className={styles.deskDemo}>
      <div
        role="tablist"
        aria-label={t("캠페인 진행 단계", "Campaign stages")}
        className={styles.deskSteps}
        onKeyDown={onKeyDown}
      >
        {steps.map((item, index) => (
          <button
            key={item.id}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`desk-tab-${item.id}`}
            aria-controls={`desk-panel-${item.id}`}
            aria-selected={item.id === activeId}
            tabIndex={item.id === activeId ? 0 : -1}
            onClick={() => {
              setActiveId(item.id);
              trackEvent("campaign_desk_step", { location: "campaigns_desk", target: item.id });
            }}
          >
            <span className={styles.deskStepNo}>{item.no}</span>
            <strong>{item.ko}</strong>
            <small>{item.en}</small>
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`desk-panel-${step.id}`}
        aria-labelledby={`desk-tab-${step.id}`}
        tabIndex={0}
        className={styles.deskPanel}
      >
        <div className={styles.deskScreens}>
          <DeskScreen data={step.brand} active={step.actor === "brand"} side={t("브랜드", "Brand")} />
          <span className={styles.deskFlowMark} data-dir={direction} aria-hidden="true">
            {direction === "none" ? <Minus /> : <ArrowRight />}
            <span>{step.handoff}</span>
          </span>
          <DeskScreen data={step.creator} active={step.actor === "creator"} side={t("크리에이터", "Creator")} />
        </div>

        <div className={styles.deskTransition}>
          <p className={styles.deskStateFlow}>
            <small>{t("지원 상태", "Application status")}</small>
            {step.from ? (
              <>
                <span className={styles.deskBadge} data-tone="off">{step.from}</span>
                <ArrowRight aria-hidden="true" />
              </>
            ) : null}
            <span className={styles.deskBadge} data-tone={step.actor === "none" ? "off" : "check"}>{step.to}</span>
          </p>
          <p className={styles.deskNote}>{step.note}</p>
        </div>
      </div>

      <p className={styles.deskCaption}>
        {t(
          "위 화면은 실제 대시보드의 구성과 문구를 옮긴 예시입니다. 수치는 표시하지 않습니다.",
          "The screens above mirror the real dashboard structure and copy. No metrics are shown.",
        )}
      </p>
    </div>
  );
}
