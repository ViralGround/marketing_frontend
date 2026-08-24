"use client";

/*
THESIS: 크리에이터 랜딩은 설득문이 아니라 원서 그 자체다. 방문자는 문서를 내려 읽으며 조건을 확인하고 서명란에서 지원한다. 콜시트 5씬 반복을 거부한다.
OWN-WORLD: 서류 지면(#f2efe6) 위 한 장의 시트(#fffdf7), 잉크 #131118, 마크 보라 #7331e0. 좌측 조항 번호 열, 점선 기입란, 도장 스탬프, 마지막은 검정 서명 블록. 필름·씬 레일·고정 스트립 없음.
STORY: "무엇을 하는 일인지 → 무엇이 필요한지 → 작업 범위와 검수 방식 → 지원 후 어떤 상태를 지나는지"를 조항 순서로 읽고 제출한다.
FIRST VIEWPORT: 문서 머리(APPLICATION / 지원서) + 접수중 스탬프 + 리드 문단. 히어로 이미지 없음.
FORM: 구조 후보 ④ 지원서 그 자체 (surface roll 77be1d7b, dealt 4·2·3, 4 리드).
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
*/

import { ArrowRight, ArrowUpRight, Check, CircleOff } from "lucide-react";
import Link from "next/link";
import GroundTopbar from "@/components/landing/onevideo/GroundTopbar";
import GroundFooter from "@/components/landing/onevideo/GroundFooter";
import { useLang } from "@/lib/i18n";
import { trackEvent } from "@/lib/gtag";
import styles from "./Apply.module.css";

const FRAMES = [
  { src: "/reels/DVpoahthmdk.jpg", label: "HOOK" },
  { src: "/reels/DXhE_vZkorg.jpg", label: "VOICE" },
  { src: "/reels/DTpu_g6D3O1.jpg", label: "CUT" },
];

export default function CreatorApplyPage() {
  const { t } = useLang();

  return (
    <>
      <GroundTopbar />

      <div className={styles.doc}>
        <article className={styles.sheet}>
          <header className={styles.docHead}>
            <h1 className={styles.docTitle}>
              Creator
              <span>Application.</span>
            </h1>
            <div className={styles.docMeta}>
              <span className={styles.docStamp}>{t("접수 중", "OPEN")}</span>
              <span>VIRAL GROUND / MANAGED BETA</span>
              <span>FORM VG-CR / 2026</span>
            </div>
          </header>

          <p className={styles.docLead}>
            <b>{t("AI 제품을 직접 써보고, 내 언어로 설명하는 일입니다.", "Try an AI product, then explain it in your own voice.")}</b>{" "}
            {t(
              "아래 조항을 읽으면 지원 전에 알아야 할 것이 전부 끝납니다. 마지막 칸에서 지원하세요.",
              "Reading the clauses below covers everything you need before applying. Sign at the last field.",
            )}
          </p>

          <section className={styles.clause}>
            <span className={styles.clauseNo}>01</span>
            <div className={styles.clauseBody}>
              <h2 className={styles.clauseTitle}>{t("무엇을 만드나요", "What you make")}</h2>
              <p className={styles.clauseNote}>
                {t(
                  "제품을 이해한 뒤 만드는 숏폼 한 편입니다. 훅과 설명 방식은 크리에이터의 몫이고, 제품 사실과 금지 표현만 브리프로 받습니다.",
                  "One short-form film made after you understand the product. The hook and the explanation are yours; the brief only fixes product facts and restrictions.",
                )}
              </p>
              <div className={styles.frames}>
                {FRAMES.map((frame, index) => (
                  <figure key={frame.src}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={frame.src} alt={t(`숏폼 콘텐츠 예시 ${index + 1}`, `Short-form example ${index + 1}`)} loading="lazy" />
                    <figcaption>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <span>{frame.label}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.clause}>
            <span className={styles.clauseNo}>02</span>
            <div className={styles.clauseBody}>
              <h2 className={styles.clauseTitle}>{t("지원 자격", "Who can apply")}</h2>
              <ul className={styles.fields}>
                <li>
                  <Check aria-hidden="true" />
                  <span>
                    <b>{t("고정 팔로워 하한 없음", "No fixed follower minimum")}</b>
                    {t(" — 제품 적합도와 설명 방식을 함께 봅니다.", " — product fit and explanation style are reviewed together.")}
                  </span>
                </li>
                <li>
                  <Check aria-hidden="true" />
                  <span>
                    <b>{t("공개 계정", "A public account")}</b>
                    {t(" — 게시물이 공개로 확인될 수 있어야 합니다.", " — the published post must be publicly verifiable.")}
                  </span>
                </li>
                <li>
                  <Check aria-hidden="true" />
                  <span>
                    <b>{t("직접 제작", "You create it")}</b>
                    {t(" — 촬영·편집을 본인이 진행합니다.", " — you shoot and edit it yourself.")}
                  </span>
                </li>
              </ul>
            </div>
          </section>

          <section className={styles.clause}>
            <span className={styles.clauseNo}>03</span>
            <div className={styles.clauseBody}>
              <h2 className={styles.clauseTitle}>{t("작업 조건 — 범위와 일정", "Work terms — scope and timeline")}</h2>
              <dl>
                <div className={styles.entry}>
                  <dt>{t("범위", "Scope")}</dt>
                  <dd>{t("제품 사실·금지 표현·필수 결과물은 지원 전 캠페인 브리프에서 확인합니다.", "Product facts, restrictions, and required deliverables are shown in the campaign brief before you apply.")}</dd>
                </div>
                <div className={styles.entry}>
                  <dt>{t("일정", "Timeline")}</dt>
                  <dd>{t("선정 시 제작·제출 일정을 다시 확인한 뒤 참여가 확정됩니다.", "Production and submission dates are reconfirmed when you are selected.")}</dd>
                </div>
                <div className={styles.entry}>
                  <dt>{t("검수", "Review")}</dt>
                  <dd>{t("제출본의 수정 요청·재제출·최종 검수 결과가 같은 캠페인 이력에 남습니다.", "Change requests, resubmissions, and the final review result stay in one campaign history.")}</dd>
                </div>
              </dl>
              <p className={styles.notice}>
                <CircleOff aria-hidden="true" />
                <span>
                  {t(
                    "현재 베타는 매칭과 작업 관리만 제공합니다. 별도 계약이나 결제는 플랫폼에서 체결·처리하지 않습니다.",
                    "This beta provides matching and work management only. Separate contracts and payments are not executed or processed on the platform.",
                  )}
                </span>
              </p>
            </div>
          </section>

          <section className={styles.clause}>
            <span className={styles.clauseNo}>04</span>
            <div className={styles.clauseBody}>
              <h2 className={styles.clauseTitle}>{t("지원 후 지나가는 상태", "The states after you apply")}</h2>
              <p className={styles.clauseNote}>
                {t("아래 이름은 실제 화면에 그대로 표시되는 값입니다. 브랜드와 크리에이터가 같은 이름으로 봅니다.", "These are the labels the product actually shows — both sides read the same names.")}
              </p>
              <div className={styles.states}>
                <div>
                  <small>01</small>
                  <strong>{t("지원 대기", "Pending")}</strong>
                  <span>{t("지원 메시지는 선택입니다.", "The message is optional.")}</span>
                </div>
                <div>
                  <small>02</small>
                  <strong>{t("참여 승인", "Approved")}</strong>
                  <span>{t("선정되면 제작이 시작됩니다.", "Once selected, production starts.")}</span>
                </div>
                <div>
                  <small>03</small>
                  <strong>{t("제출 완료", "Submitted")}</strong>
                  <span>{t("제출할 때마다 회차가 기록됩니다.", "Each submission is a numbered take.")}</span>
                </div>
                <div>
                  <small>04</small>
                  <strong>{t("수정 요청", "Changes")}</strong>
                  <span>{t("사유와 함께 오고, 재제출로 이어집니다.", "Always with a reason; resubmit to continue.")}</span>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.signature} aria-labelledby="apply-sign">
            <div>
              <h2 id="apply-sign">{t("여기까지 읽었다면, 다음은 지원입니다.", "If you read this far, the next step is applying.")}</h2>
              <p>
                {t(
                  "프로필과 작업 스타일을 남기면 운영팀이 검토합니다. 승인 후 조건이 맞는 관리형 베타 캠페인을 확인할 수 있습니다.",
                  "Leave your profile and working style for review. Once approved, you can see managed beta campaigns that fit.",
                )}
              </p>
              <div className={styles.actions}>
                <Link
                  className={styles.submit}
                  href="/signup/creator"
                  onClick={() => trackEvent("cta_click", { location: "creator_final", target: "signup_creator" })}
                >
                  {t("지원서 제출", "Submit application")}
                  <ArrowRight aria-hidden="true" />
                </Link>
                <Link
                  className={styles.secondary}
                  href="/login/creator"
                  onClick={() => trackEvent("cta_click", { location: "creator_final", target: "login_creator" })}
                >
                  {t("이미 지원했다면 로그인", "Already applied? Log in")}
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              </div>
            </div>
            <div className={styles.signLine}>
              <span>{t("지원자 서명", "APPLICANT")}</span>
              <span className={styles.signRule} aria-hidden="true" />
              <span>{t("접수 후 운영팀 검토", "REVIEWED BY OPERATIONS")}</span>
              <span className={styles.signRule} aria-hidden="true" />
            </div>
          </section>

          <footer className={styles.docFoot}>
            <span>VIRAL GROUND / SEOUL</span>
            <span>{t("콘텐츠 예시 · 성과 데이터 아님", "CONTENT EXAMPLES / NOT PERFORMANCE DATA")}</span>
          </footer>
        </article>
      </div>

      <div className={styles.dock}>
        <Link href="/signup/creator" onClick={() => trackEvent("cta_click", { location: "creator_mobile_dock", target: "signup_creator" })}>
          {t("지원서 제출", "Submit application")}
        </Link>
        <Link
          href="/login/creator"
          aria-label={t("크리에이터 로그인", "Creator log in")}
          onClick={() => trackEvent("cta_click", { location: "creator_mobile_dock", target: "login_creator" })}
        >
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>

      <GroundFooter />
    </>
  );
}
