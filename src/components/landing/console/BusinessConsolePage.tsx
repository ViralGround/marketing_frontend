"use client";

/*
 * /business — 관제 콘솔 (direction contract, code-led · seed 77be1d7b 사용자 확정 배치)
 *
 * THESIS: 맡긴 캠페인이 "돌아가는 게 보인다"를 관제 콘솔 그 자체로 증명한다.
 *   콜시트 씬 스크롤(구형)과 SaaS 피처 카드 그리드를 거부한다.
 * OWN-WORLD: 잉크 하우징 전면 다크(공개 페이지 중 유일) · 페이퍼 판독 텍스트 ·
 *   바이올렛 활성 신호 · 상태 램프(다크 위 초록/앰버) · 시스템 모노는 실측 데이터 전용.
 * STORY: 오퍼 → 관제 월(화면 증거, SAMPLE) → 채널 스위처(네 번의 결정) →
 *   콘솔 규정(범위·비포함·OFF) → 상담 회선.
 * FIRST VIEWPORT: 콘솔 레일(램프+KST 클록) 아래 좌측 WATCH IT / RUN. 디스플레이와
 *   상담 액션 키, 우측 파이프라인 신호 체인 모니터(펄스 순환 = 시그니처 모션).
 * FINISH: unreviewed and undocumented is unfinished; this build ends with the
 *   finish review, the verdict, and DESIGN.md
 *
 * 보존 계약: trackEvent 위치 business_hero / business_mobile_dock / business_final,
 * ConsultationModal 동작, 진실 제약(수치 — · 결제 OFF · SAMPLE 라벨) 전부 유지.
 */

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowUpRight, Check, CircleOff, Minus } from "lucide-react";
import ConsultationModal from "@/components/landing/business/ConsultationModal";
import GroundTopbar from "@/components/landing/onevideo/GroundTopbar";
import GroundFooter from "@/components/landing/onevideo/GroundFooter";
import { useLang } from "@/lib/i18n";
import { trackEvent } from "@/lib/gtag";
import styles from "./Console.module.css";

/** 스크롤 리빌 — 한 번 보이면 유지. reduced-motion 은 CSS 에서 무효화. */
function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${styles.reveal} ${seen ? styles.revealIn : ""} ${className ?? ""}`}>
      {children}
    </div>
  );
}

/** KST 콘솔 클록 — 마운트 전에는 자리표시자라 hydration 안전. 장식용. */
function OpsClock() {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Seoul",
      }).format(new Date());
    const timer = setInterval(() => setTime(format()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className={styles.railClock} aria-hidden="true">
      KST {time}
    </span>
  );
}

export default function BusinessConsolePage() {
  const { t } = useLang();
  const [consultOpen, setConsultOpen] = useState(false);
  const [channel, setChannel] = useState(0);
  const channelRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const openConsult = (location: string) => {
    trackEvent("cta_click", { location, target: "consultation" });
    setConsultOpen(true);
  };

  const chain = [
    { code: "SIG 01", title: t("브리프 접수", "Brief intake"), state: "STANDBY" },
    { code: "SIG 02", title: t("크리에이터 매칭", "Creator matching"), state: "STANDBY" },
    { code: "SIG 03", title: t("제작·검수", "Production & review"), state: "STANDBY" },
    { code: "SIG 04", title: t("게시 확인", "Publish check"), state: "STANDBY" },
    { code: "SIG 05", title: t("운영 종료 확인", "Close the workflow"), state: "STANDBY" },
  ];

  const channels = [
    {
      code: "CH 01 — BRIEF",
      title: t("브리프 확정", "Confirm the brief"),
      desc: t(
        "제품 맥락·핵심 메시지·금지 표현·모집 조건을 정리합니다. 한 번 확정하면 이후 단계가 같은 문서를 참조합니다.",
        "Set product context, key message, restrictions and recruiting terms. Every later stage reads the same document.",
      ),
      brand: t("제품과 목표, 피해야 할 표현을 알려줍니다.", "You supply the product, the goal and what to avoid."),
      ops: t("운영팀이 브리프 문서로 정리해 확인을 요청합니다.", "The operations team drafts the brief and asks for sign-off."),
    },
    {
      code: "CH 02 — MATCH",
      title: t("크리에이터 선정", "Pick the creator"),
      desc: t(
        "지원 메시지와 작업 스타일을 함께 보고 고릅니다. 팔로워 수가 아니라 제품을 이해하는 사람인지 봅니다.",
        "Choose by reading the application message and working style together — product understanding over follower count.",
      ),
      brand: t("추려진 지원자 중에서 직접 선택합니다.", "You choose from the shortlisted applicants."),
      ops: t("지원자 검토 기준과 이력을 화면에 남깁니다.", "Review criteria and history stay on the screen."),
    },
    {
      code: "CH 03 — REVIEW",
      title: t("검수 승인", "Approve the draft"),
      desc: t(
        "초안과 수정 요청, 제출 이력이 한 흐름에 남습니다. 수정 사유는 캠페인에 기록됩니다.",
        "Drafts, change requests and submission history live in one flow, with reasons recorded on the campaign.",
      ),
      brand: t("초안을 보고 승인하거나 수정을 요청합니다.", "You approve the draft or request changes."),
      ops: t("요청 사유와 반영 상태를 기록으로 관리합니다.", "Reasons and their resolution are tracked as records."),
    },
    {
      code: "CH 04 — PUBLISH",
      title: t("게시 확인", "Confirm publishing"),
      desc: t(
        "게시 일정과 합의된 성과 입력 상태를 확인합니다. 성과 수치는 약속이 아니라 기록입니다.",
        "Track the publishing schedule and the agreed performance-entry status. Numbers are records, never promises.",
      ),
      brand: t("게시 결과와 기록을 확인합니다.", "You confirm the published film and its record."),
      ops: t("게시 확인과 성과 기록 절차를 운영합니다.", "Publishing checks and performance entry are operated for you."),
    },
  ];

  const onChannelKeys = (event: React.KeyboardEvent) => {
    const last = channels.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = channel === last ? 0 : channel + 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = channel === 0 ? last : channel - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    setChannel(next);
    channelRefs.current[next]?.focus();
  };

  const active = channels[channel];

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
    <>
      <GroundTopbar tone="dark" />
      <div className={styles.page}>
        {/* 콘솔 헤더 레일 — 이 페이지가 '운영실'임을 물성으로 선언 */}
        <div className={styles.rail} aria-hidden="true">
          <div className={styles.railInner}>
            <span className={styles.railName}>VG OPS ROOM</span>
            <span className={styles.railLamps}>
              <span><i className={`${styles.lamp} ${styles.lampViolet}`} />OPS</span>
              <span><i className={styles.lamp} />QUEUE</span>
              <span><i className={`${styles.lamp} ${styles.lampWarn}`} />SAMPLE<small> FEED</small></span>
              <span><i className={`${styles.lamp} ${styles.lampHollow}`} />PAY OFF</span>
            </span>
            <OpsClock />
          </div>
        </div>

        <div>
          {/* 씬 1 — 오퍼 + 신호 체인 모니터 */}
          <section className={styles.hero} id="console-call" aria-label={t("브랜드 제안", "Brand offer")}>
            <div className={styles.inner}>
              <div className={styles.heroGrid}>
                <div>
                  <h1 className={styles.display}>
                    <span>WATCH IT</span>
                    <span className={styles.displayAccent}>RUN.</span>
                  </h1>
                  <p className={styles.heroLede}>
                    <strong>{t("맡긴 뒤에도, 운영은 화면에 보입니다.", "After the handoff, the operation stays on screen.")}</strong>
                    <span>
                      {t(
                        "브리프·선정·검수·게시가 하나의 관제 흐름으로 이어지고, 브랜드는 네 번만 결정합니다. 나머지는 운영팀이 돌립니다.",
                        "Brief, selection, review and publishing run as one monitored flow. You make four decisions; the operations team runs the rest.",
                      )}
                    </span>
                  </p>
                  <div className={styles.heroActions}>
                    <button type="button" className={styles.key} onClick={() => openConsult("business_hero")}>
                      {t("브랜드 베타 문의", "Ask about brand beta")}
                      <ArrowUpRight aria-hidden="true" />
                    </button>
                    <a className={`${styles.key} ${styles.keyGhost}`} href="#console-rules">
                      {t("운영 규정 보기", "Read the operating rules")}
                    </a>
                  </div>
                </div>

                <div className={styles.monitor} role="img" aria-label={t("운영 파이프라인 신호 체인 예시 화면", "Sample operations pipeline monitor")}>
                  <div className={styles.monitorHead}>
                    <b>FEED 01</b>
                    <span>{t("운영 파이프라인", "Operations pipeline")}</span>
                    <span className={styles.monitorTag}>SAMPLE</span>
                  </div>
                  <div className={`${styles.chain} ${styles.chainPulse}`}>
                    {chain.map((row) => (
                      <div className={styles.chainRow} key={row.code}>
                        <i className={styles.chainNode} />
                        <span>
                          <span className={styles.chainCode}>{row.code}</span>
                          <strong>{row.title}</strong>
                        </span>
                        <span className={styles.chainState}>{row.state}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.monitorFoot}>
                    {t("예시 화면 — 실데이터 아님 · 실제 상태와 수치는 로그인 후 표시", "Sample screen — not live data · actual states and values appear after sign-in")}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 씬 2 — 관제 월: 실제 워크스페이스가 어떻게 보이는지 */}
          <section className={styles.scene} id="console-wall" aria-labelledby="wall-title">
            <div className={styles.inner}>
              <Reveal>
                <header className={styles.sceneHead}>
                  <h2 id="wall-title">
                    {t("맡긴 캠페인은", "A handed-off campaign")}
                    <em>{t("이 화면 위에 있습니다.", "lives on this screen.")}</em>
                  </h2>
                  <p>
                    {t(
                      "브랜드 워크스페이스는 다음 작업·지원 파이프라인·일정을 한 화면에서 전환합니다. 아래는 그 화면의 예시이고, 수치는 실데이터가 아니라서 비워 둡니다.",
                      "The brand workspace switches between next actions, the applicant pipeline and the schedule. Below is a sample of that screen — values stay blank because they are not live data.",
                    )}
                  </p>
                </header>
              </Reveal>

              <Reveal>
                <div className={styles.wall}>
                  <div className={`${styles.monitor} ${styles.queue}`}>
                    <div className={styles.monitorHead}>
                      <b>FEED 02</b>
                      <span>{t("다음 작업 큐", "Next-action queue")}</span>
                      <span className={styles.monitorTag}>SAMPLE</span>
                    </div>
                    <div className={styles.queueMetrics} aria-hidden="true">
                      <span><small>{t("전체 캠페인", "Campaigns")}</small><strong>—</strong></span>
                      <span><small>{t("모집 중", "Recruiting")}</small><strong>—</strong></span>
                      <span><small>{t("누적 지원", "Applications")}</small><strong>—</strong></span>
                      <span><small>{t("검수 대기", "In review")}</small><strong>—</strong></span>
                    </div>
                    <div className={styles.queueRows}>
                      <div className={styles.queueRow}>
                        <span>
                          <strong>{t("캠페인 브리프 작성", "Create a campaign brief")}</strong>
                          <small>{t("목표·작업 범위·모집 조건을 단계별로 설정", "Set goals, scope and conditions step by step")}</small>
                        </span>
                        <span className={`${styles.queueStatus} ${styles.queueStatusHot}`}>{t("다음 작업", "NEXT")}</span>
                      </div>
                      <div className={styles.queueRow}>
                        <span>
                          <strong>{t("지원자와 콘텐츠 확인", "Review applicants and content")}</strong>
                          <small>{t("주의가 필요한 진행 상태부터 확인", "Start with work that needs attention")}</small>
                        </span>
                        <span className={styles.queueStatus}>{t("운영", "OPERATE")}</span>
                      </div>
                      <div className={styles.queueRow}>
                        <span>
                          <strong>{t("브랜드 공개 정보 점검", "Review public brand details")}</strong>
                          <small>{t("크리에이터에게 보이는 정보를 관리", "Manage what creators see")}</small>
                        </span>
                        <span className={styles.queueStatus}>{t("설정", "PROFILE")}</span>
                      </div>
                    </div>
                    <div className={styles.monitorFoot}>
                      {t("예시 화면 — 로그인 후 동일한 구조의 실화면을 사용합니다", "Sample — the live screen shares this structure after sign-in")}
                    </div>
                  </div>

                  <div className={styles.wallSide}>
                    <div className={styles.monitor}>
                      <div className={styles.monitorHead}>
                        <b>FEED 03</b>
                        <span>{t("서비스 범위", "Service scope")}</span>
                      </div>
                      <div className={styles.payPanel}>
                        <CircleOff aria-hidden="true" />
                        <span>
                          <strong>{t("매칭·작업 관리 전용", "Matching and work management only")}</strong>
                          <small>
                            {t(
                              "플랫폼에서 계약·결제·송금을 처리하지 않습니다. 필요한 조건은 당사자가 별도 서면 계약으로 확인합니다.",
                              "The platform does not execute contracts, payments, or transfers. Any required terms are confirmed separately in writing by the parties.",
                            )}
                          </small>
                        </span>
                      </div>
                    </div>

                    <div className={styles.monitor}>
                      <div className={styles.monitorHead}>
                        <b>FEED 04</b>
                        <span>{t("일정", "Schedule")}</span>
                        <span className={styles.monitorTag}>SAMPLE</span>
                      </div>
                      <div className={styles.schedule} aria-hidden="true">
                        <div className={styles.scheduleRow}><span>D+00</span><b>{t("브리프 확정", "Brief confirmed")}</b></div>
                        <div className={styles.scheduleRow}><span>D+03</span><b>{t("크리에이터 선정", "Creator picked")}</b></div>
                        <div className={styles.scheduleRow}><span>D+10</span><b>{t("초안 제출", "Draft due")}</b></div>
                        <div className={styles.scheduleRow}><span>D+14</span><b>{t("게시 확인", "Publish check")}</b></div>
                      </div>
                      <div className={styles.monitorFoot}>
                        {t("상대 일정 예시 — 실제 일정은 브리프에서 확정", "Relative example — real dates are set in the brief")}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* 씬 3 — 채널 스위처: 브랜드가 내리는 네 번의 결정 */}
          <section className={styles.scene} id="console-channels" aria-labelledby="channel-title">
            <div className={styles.inner}>
              <Reveal>
                <header className={styles.sceneHead}>
                  <h2 id="channel-title">
                    {t("브랜드가 잡는 채널은", "You hold the switch")}
                    <em>{t("네 개뿐입니다.", "on four channels only.")}</em>
                  </h2>
                  <p>
                    {t(
                      "한 편이 나오기까지 브랜드가 결정하는 순간은 네 번입니다. 채널을 넘겨 보세요 — 각 결정에서 브랜드가 하는 일과 운영팀이 하는 일이 나뉩니다.",
                      "Four decisions produce one film. Switch the channels — each shows what you decide and what the operations team runs.",
                    )}
                  </p>
                </header>
              </Reveal>

              <Reveal>
                <div className={styles.channels}>
                  <div
                    className={styles.channelKeys}
                    role="tablist"
                    aria-label={t("네 번의 결정 채널", "Four decision channels")}
                    onKeyDown={onChannelKeys}
                  >
                    {channels.map((item, index) => (
                      <button
                        key={item.code}
                        ref={(node) => { channelRefs.current[index] = node; }}
                        type="button"
                        role="tab"
                        id={`channel-key-${index}`}
                        aria-selected={index === channel}
                        aria-controls="channel-screen"
                        tabIndex={index === channel ? 0 : -1}
                        className={`${styles.channelKey} ${index === channel ? styles.channelKeyActive : ""}`}
                        onClick={() => setChannel(index)}
                      >
                        <b>{`CH 0${index + 1}`}</b>
                        <span>{item.title}</span>
                        <i aria-hidden="true" />
                      </button>
                    ))}
                  </div>

                  <div
                    className={`${styles.monitor} ${styles.channelScreen}`}
                    id="channel-screen"
                    role="tabpanel"
                    aria-labelledby={`channel-key-${channel}`}
                  >
                    <div className={styles.monitorHead}>
                      <b>FEED 05</b>
                      <span>{t("결정 화면", "Decision screen")}</span>
                    </div>
                    <div className={styles.channelBody}>
                      <h3 className={styles.channelTitle}>
                        <b>{active.code}</b>
                        {active.title}
                      </h3>
                      <p className={styles.channelDesc}>{active.desc}</p>
                      <div className={styles.channelSplit}>
                        <div>
                          <b>{t("브랜드가 하는 일", "WHAT YOU DO")}</b>
                          <p>{active.brand}</p>
                        </div>
                        <div>
                          <b>{t("운영팀이 하는 일", "WHAT OPS RUNS")}</b>
                          <p>{active.ops}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* 씬 4 — 콘솔 규정: 범위와 비포함 */}
          <section className={styles.scene} id="console-rules" aria-labelledby="rules-title">
            <div className={styles.inner}>
              <Reveal>
                <header className={styles.sceneHead}>
                  <h2 id="rules-title">
                    {t("콘솔에 새겨 둔", "The operating rules,")}
                    <em>{t("운영 규정.", "etched on the console.")}</em>
                  </h2>
                  <p>
                    {t(
                      "결정에 필요한 건 약속이 아니라 경계입니다. 지금 제공하는 범위와 제공하지 않는 범위를 그대로 적습니다.",
                      "A decision needs boundaries, not promises. Here is exactly what is and is not included today.",
                    )}
                  </p>
                </header>
              </Reveal>

              <Reveal>
                <div className={styles.rules}>
                  <div className={styles.monitor}>
                    <div className={styles.monitorHead}>
                      <b>IN SCOPE</b>
                      <span>{t("운영에 포함", "What we run")}</span>
                    </div>
                    <div className={styles.ruleList}>
                      {included.map((item) => (
                        <div className={`${styles.ruleRow} ${styles.ruleIn}`} key={item}>
                          <Check aria-hidden="true" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.monitor}>
                    <div className={styles.monitorHead}>
                      <b>OUT OF SCOPE</b>
                      <span>{t("포함하지 않음", "Not included")}</span>
                    </div>
                    <div className={styles.ruleList}>
                      {excluded.map((item) => (
                        <div className={`${styles.ruleRow} ${styles.ruleOut}`} key={item}>
                          <Minus aria-hidden="true" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <p className={styles.rulesFoot}>
                  <AlertTriangle aria-hidden="true" />
                  <span>
                    {t(
                      "실제 운영 범위·기간·비용은 상담과 계약에서 확정합니다. 이 페이지의 어떤 항목도 견적이나 성과 약속이 아닙니다.",
                      "Actual scope, timeline and cost are set in consultation and contracting. Nothing here is a quote or a performance promise.",
                    )}
                  </span>
                </p>
              </Reveal>
            </div>
          </section>

          {/* 씬 5 — 상담 회선 */}
          <section className={styles.scene} id="console-uplink" aria-labelledby="uplink-title">
            <div className={styles.inner}>
              <div className={styles.uplink}>
                <Reveal>
                  <header className={styles.sceneHead}>
                    <h2 id="uplink-title">
                      {t("상담 회선은", "The consultation line")}
                      <em>{t("열려 있습니다.", "is open.")}</em>
                    </h2>
                    <p>
                      {t(
                        "제품과 목표만 알려주시면 됩니다. 준비된 자료가 없어도 상담할 수 있습니다.",
                        "Just tell us the product and the goal — no prepared materials required.",
                      )}
                    </p>
                  </header>
                  <div className={styles.uplinkActions}>
                    <button type="button" className={`${styles.key} ${styles.keyLight}`} onClick={() => openConsult("business_final")}>
                      {t("상담 신청하기", "Request a consultation")}
                      <ArrowUpRight aria-hidden="true" />
                    </button>
                    <a
                      className={`${styles.key} ${styles.keyGhost}`}
                      href="/signup/company"
                      onClick={() => trackEvent("cta_click", { location: "business_final", target: "signup_company" })}
                    >
                      {t("브랜드 계정 만들기", "Create a brand account")}
                    </a>
                  </div>
                </Reveal>

                <Reveal>
                  <div className={`${styles.monitor} ${styles.uplinkLog}`}>
                    <div className={styles.monitorHead}>
                      <b>UPLINK</b>
                      <span>{t("상담 절차", "How the consultation runs")}</span>
                    </div>
                    <div className={styles.logRow}>
                      <b>01</b>
                      <span>
                        <strong>{t("제품과 목표 공유", "Share product and goal")}</strong>
                        <small>{t("무엇을 알리고 싶은지, 어떤 반응을 기대하는지 알려주세요.", "Tell us what you want known and what response you expect.")}</small>
                      </span>
                    </div>
                    <div className={styles.logRow}>
                      <b>02</b>
                      <span>
                        <strong>{t("운영 범위 정리", "We define the scope")}</strong>
                        <small>{t("가능한 범위와 조건, 진행 방식을 정리해 회신합니다.", "We reply with a workable scope, terms and how it would run.")}</small>
                      </span>
                    </div>
                    <div className={styles.logRow}>
                      <b>03</b>
                      <span>
                        <strong>{t("브리프 작성", "Write the brief")}</strong>
                        <small>{t("합의된 조건으로 캠페인 브리프를 작성하고 시작합니다.", "The campaign brief is written on the agreed terms.")}</small>
                      </span>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>
        </div>

        <div className={styles.dock}>
          <button type="button" className={styles.dockMain} onClick={() => openConsult("business_mobile_dock")}>
            {t("브랜드 베타 문의", "Ask about brand beta")}
          </button>
          <a className={styles.dockSide} href="#console-wall" aria-label={t("운영 화면 보기", "See the workspace")}>
            <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>

      <GroundFooter />
      <ConsultationModal open={consultOpen} onClose={() => setConsultOpen(false)} />
    </>
  );
}
