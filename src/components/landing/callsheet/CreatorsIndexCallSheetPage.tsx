"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Search, X } from "lucide-react";
import api from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { trackEvent } from "@/lib/gtag";
import {
  CallActionButton,
  CallActionLink,
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

interface PublicCreator {
  id: number;
  name: string;
  joinedAt: string;
  completedCampaigns: number;
  reviewCount: number;
  averageRating: number;
  totalViews: number;
  averageViews: number;
}

const SECTIONS: CallSceneDefinition[] = [
  { id: "creators-call", label: "공개 크리에이터", tone: "paper" },
  { id: "creators-roster", label: "공개 명단", tone: "ink" },
  { id: "creators-desk", label: "브랜드 데스크", tone: "violet" },
  { id: "creators-read", label: "기록 읽기", tone: "paper" },
  { id: "creators-start", label: "캠페인 시작", tone: "ink" },
];

const FILMS = [
  { src: "/reels/DVpoahthmdk.jpg", alt: "크리에이터 콘텐츠 예시", label: "THE VOICE" },
  { src: "/reels/DTpu_g6D3O1.jpg", alt: "제품 숏폼 콘텐츠 예시", label: "THE CRAFT" },
  { src: "/reels/DXhE_vZkorg.jpg", alt: "캠페인 숏폼 콘텐츠 예시", label: "THE CUT" },
];

function CreatorState({ title, description, action, loading = false }: { title: ReactNode; description: ReactNode; action?: ReactNode; loading?: boolean }) {
  return (
    <div className={styles.campaignState} aria-live={loading ? "polite" : undefined}>
      {loading ? <span className={styles.stateLoader} aria-hidden="true" /> : null}
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export default function CreatorsIndexCallSheetPage() {
  const { t, lang } = useLang();
  const [creators, setCreators] = useState<PublicCreator[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");

  const loadCreators = useCallback(() => {
    api.get<{ creators: PublicCreator[] }>("/landing/creators")
      .then((response) => {
        setCreators(response.data.creators);
        setLoadError(false);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => { loadCreators(); }, [loadCreators]);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleCreators = useMemo(
    () => normalizedQuery ? creators.filter((creator) => creator.name.toLocaleLowerCase().includes(normalizedQuery)) : creators,
    [creators, normalizedQuery],
  );
  const rosterStatus = loaded && !loadError ? t(`${creators.length}명 표시`, `${creators.length} shown`) : t("확인 중", "Checking");
  const dateLocale = lang === "en" ? "en-US" : "ko-KR";

  return (
    <CallSheetFrame
      sections={SECTIONS}
      filmFrames={FILMS}
      pageName={t("크리에이터", "Creators")}
      dock={<><CallDockLink href="#creators-roster">{t("공개 명단 보기", "See the public roster")}</CallDockLink><CallDockLink href="/business" secondary aria-label={t("브랜드 캠페인 문의", "Start a brand campaign")}><ArrowUpRight aria-hidden="true" /></CallDockLink></>}
    >
      <CallHero
        id="creators-call"
        pageCode="PUBLIC CREATOR ROSTER / OPT-IN ONLY"
        lines={["FIND", "A", "VOICE."]}
        description={<><strong>{t("팔로워보다 먼저, 작업 기록을 봅니다.", "See the work record before the follower count.")}</strong><span>{t("공개에 동의한 크리에이터의 완료 캠페인과 브랜드 리뷰를 현재 응답 범위 안에서 확인하세요.", "Review completed campaigns and brand feedback for creators who opted in, within the current response set.")}</span></>}
        actions={<><CallActionLink href="#creators-roster">{t("공개 명단 보기", "See the public roster")}</CallActionLink><CallActionLink href="/business" tone="secondary" onClick={() => trackEvent("cta_click", { location: "creators_hero", target: "business" })}>{t("브랜드 캠페인 문의", "Start a brand campaign")}</CallActionLink></>}
        document={<CallSheetDocument title={t("크리에이터 공개 콜시트", "Public creator call sheet")} status={rosterStatus} fields={[
          { label: "SCOPE", value: t("공개 동의 프로필", "Opt-in profiles") },
          { label: "RECORD", value: t("완료 캠페인·브랜드 리뷰", "Campaigns and reviews") },
          { label: "DATA", value: t("캠페인 기록 기준", "Campaign-recorded data") },
          { label: "CONTACT", value: t("브랜드 상담 후 연결", "Connect after consultation") },
        ]} footer={t("표시 인원은 전체 크리에이터 수가 아니라 현재 공개 API 응답 범위입니다.", "The count describes this public API response, not every creator on the platform.")} />}
      />

      <CallScene id="creators-roster" tone="ink" className={styles.campaignScene}>
        <div className={styles.sceneInnerWide}>
          <CallReveal><CallSceneHeading title={t("지금 공개된", "Now on the")} accent={t("크리에이터 명단.", "public roster.")} description={t("검색은 아래에 표시된 이름 안에서만 작동합니다. 프로필을 선택하면 공개된 작업 기록을 더 자세히 볼 수 있습니다.", "Search is scoped to the names shown below. Select a profile to inspect its public work record.")} /></CallReveal>

          {!loaded ? (
            <CreatorState loading title={t("공개 명단을 불러오는 중입니다", "Loading the public roster")} description={t("공개에 동의한 프로필을 확인하고 있습니다.", "Checking profiles that opted in to public display.")} />
          ) : loadError ? (
            <div role="alert"><CreatorState title={t("공개 명단을 불러오지 못했습니다", "The public roster couldn't be loaded")} description={t("연결 상태를 확인한 뒤 다시 시도해 주세요.", "Check your connection and try again.")} action={<CallActionButton tone="light" onClick={() => { setLoaded(false); setLoadError(false); loadCreators(); }}>{t("다시 불러오기", "Try again")}</CallActionButton>} /></div>
          ) : creators.length === 0 ? (
            <CreatorState title={t("공개 준비 중인 프로필이 있어요", "Public profiles are being prepared")} description={t("브랜드 상담을 남기면 캠페인에 맞는 크리에이터 탐색 범위를 함께 정리합니다.", "Start a brand consultation and we'll shape the creator search around your campaign.")} action={<CallActionLink tone="light" href="/business">{t("브랜드 상담하기", "Start a consultation")}</CallActionLink>} />
          ) : (
            <div className={styles.campaignBrowser}>
              <div className={styles.campaignToolbar}>
                <label className={styles.campaignSearch}>
                  <Search aria-hidden="true" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("현재 표시된 크리에이터 검색", "Search the creators shown")} aria-label={t("현재 표시된 크리에이터 검색", "Search currently shown creators")} />
                  {query ? <button type="button" onClick={() => setQuery("")} aria-label={t("검색어 지우기", "Clear search")}><X aria-hidden="true" /></button> : null}
                </label>
                <span aria-live="polite">{t(`공개 명단 ${visibleCreators.length}/${creators.length}명`, `Public roster ${visibleCreators.length}/${creators.length}`)}</span>
              </div>

              {visibleCreators.length === 0 ? (
                <CreatorState title={t("검색 결과가 없습니다", "No creators match")} description={t("이름을 다르게 입력해 보세요.", "Try another name.")} action={<CallActionButton tone="light" onClick={() => setQuery("")}>{t("검색 초기화", "Clear search")}</CallActionButton>} />
              ) : (
                <ol className={styles.creatorRows}>
                  {visibleCreators.map((creator, index) => (
                    <li key={creator.id}>
                      <Link href={`/creators/${creator.id}`} onClick={() => trackEvent("cta_click", { location: "creators_roster", target: creator.id })}>
                        <span className={styles.creatorNo}>{String(index + 1).padStart(2, "0")}</span>
                        <span className={styles.creatorAvatar} aria-hidden="true">{creator.name.trim().charAt(0).toLocaleUpperCase()}</span>
                        <span className={styles.creatorName}><small>{t("공개 크리에이터", "PUBLIC CREATOR")}</small><strong>{creator.name}</strong></span>
                        <span className={styles.creatorFacts}>
                          <span><small>{t("완료 캠페인", "Completed")}</small><strong>{t(`${creator.completedCampaigns}건`, `${creator.completedCampaigns}`)}</strong></span>
                          <span><small>{t("브랜드 리뷰", "Brand reviews")}</small><strong>{creator.reviewCount > 0 ? `${creator.averageRating.toFixed(1)} / ${creator.reviewCount}` : t("기록 없음", "No record")}</strong></span>
                        </span>
                        <span className={styles.creatorJoined}><small>{t("합류", "Joined")}</small><strong>{new Intl.DateTimeFormat(dateLocale, { year: "numeric", month: "2-digit" }).format(new Date(creator.joinedAt))}</strong></span>
                        <ArrowRight className={styles.creatorArrow} aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>
      </CallScene>

      <CallScene id="creators-desk" tone="violet" className={styles.proofScene}>
        <div className={styles.sceneInnerWide}>
          <CallReveal><CallSceneHeading title={t("찾은 다음은", "After discovery,")} accent={t("운영 흐름으로.", "move into operations.")} description={t("공개 명단은 탐색의 시작입니다. 실제 지원자와 콘텐츠는 브랜드 데스크의 운영·지원 파이프라인·일정 흐름에서 관리합니다.", "The public roster starts discovery. Real applicants and content move through operations, application pipeline and schedule in the brand workspace.")} /></CallReveal>
          <CallReveal className={styles.proofReveal}><DashboardProof audience="business" /></CallReveal>
        </div>
        <span className={styles.sceneGhost} aria-hidden="true">THE DESK</span>
      </CallScene>

      <CallScene id="creators-read" tone="paper" className={styles.boundaryScene}>
        <div className={styles.sceneInnerSplit}>
          <CallReveal><CallSceneHeading title={t("숫자는 맥락과", "Read the numbers")} accent={t("같이 읽습니다.", "with their context.")} description={t("공개 프로필은 과장된 랭킹이 아니라, 동의된 작업 기록을 캠페인 판단에 필요한 순서로 보여줍니다.", "Public profiles present consented work records in decision order, not as an inflated leaderboard.")} /></CallReveal>
          <CallReveal><CallRuleList items={[
            { code: "01", title: t("완료 경험", "Completed work"), body: t("실제로 완료된 캠페인 수로 협업 경험을 확인합니다.", "Use completed campaigns to understand collaboration experience."), meta: t("기록", "RECORD") },
            { code: "02", title: t("브랜드 리뷰", "Brand feedback"), body: t("리뷰 수와 평점을 함께 보고 표본의 크기를 놓치지 않습니다.", "Read rating together with review count so sample size stays visible."), meta: t("맥락", "CONTEXT") },
            { code: "03", title: t("상세 프로필", "Profile detail"), body: t("공개된 작업 기록을 본 뒤 캠페인과의 적합성을 판단합니다.", "Inspect the public work record before judging campaign fit."), meta: t("적합성", "FIT") },
            { code: "04", title: t("운영 연결", "Operational handoff"), body: t("실제 모집과 선정은 캠페인 지원·파이프라인 안에서 진행합니다.", "Recruiting and selection happen in the campaign application pipeline."), meta: t("운영", "OPERATE") },
          ]} /></CallReveal>
        </div>
      </CallScene>

      <CallScene id="creators-start" tone="ink" className={styles.finalScene}>
        <div className={styles.finalInner}>
          <CallReveal>
            <h2>{t("찾을 사람보다,", "Start with the brief,")}<span>{t("먼저 좋은 브리프.", "then find the voice.")}</span></h2>
            <p>{t("제품과 목표, 한 편의 역할부터 정리하면 캠페인에 맞는 크리에이터 탐색과 운영 범위를 함께 설계할 수 있습니다.", "Define the product, goal and role of the film first, then shape creator discovery and operations around the campaign.")}</p>
            <div className={styles.finalActions}><CallActionLink href="/business" tone="light">{t("브랜드 캠페인 문의", "Start a brand campaign")}</CallActionLink><CallActionLink href="/creator" tone="secondary">{t("크리에이터로 참여", "Join as a creator")}</CallActionLink></div>
          </CallReveal>
          <span className={styles.finalMark} aria-hidden="true">VG</span>
        </div>
      </CallScene>
    </CallSheetFrame>
  );
}
