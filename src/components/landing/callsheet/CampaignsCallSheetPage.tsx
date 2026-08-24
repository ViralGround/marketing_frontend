"use client";

/**
 * /campaigns — 공개 캠페인 페이지.
 *
 * 축: "하나의 브리프가 두 데스크에서 어떻게 굴러가는가".
 * 공개 피드에서 조건을 고르는 순간부터 브랜드 운영 데스크와 크리에이터 작업
 * 데스크가 주고받는 실제 순서(지원 → 선정 → 제출 → 검수 → 성과 기록)를
 * 제품 화면 그대로 설명한다.
 *
 * 데이터 계약(재스킨 대상 아님): GET /landing/featured-campaigns, 로딩/오류
 * (role="alert")/빈/검색 무결과 4상태와 한국어 문구, 검색 필터, CompanyInfoModal,
 * trackEvent 위치(campaigns_hero · campaigns_list · campaigns_final).
 */

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import api from "@/lib/api";
import type { FeaturedCampaign } from "@/types/landing";
import CompanyInfoModal from "@/components/landing/CompanyInfoModal";
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
import CampaignDeskDemo from "./CampaignDeskDemo";

const SECTIONS: CallSceneDefinition[] = [
  { id: "campaign-call", label: "공개 캠페인", tone: "paper" },
  { id: "campaign-live", label: "선정 공개 피드", tone: "ink" },
  { id: "campaign-desk", label: "데스크 상호작용", tone: "paper" },
  { id: "campaign-flow", label: "기록 규칙", tone: "violet" },
  { id: "campaign-start", label: "지원 시작", tone: "ink" },
];

const FALLBACK_FILMS = [
  { src: "/reels/DXhE_vZkorg.jpg", alt: "공개 캠페인 콘텐츠 예시", label: "OPEN CALL" },
  { src: "/reels/DTpu_g6D3O1.jpg", alt: "제품 숏폼 콘텐츠 예시", label: "THE BRIEF" },
  { src: "/reels/DVpoahthmdk.jpg", alt: "크리에이터 숏폼 콘텐츠 예시", label: "THE CUT" },
];

interface ModalState {
  open: boolean;
  campaign: FeaturedCampaign | null;
  seq: number;
}

function deadlineLabel(deadline: string | null, t: (ko: string, en: string) => string): string {
  if (!deadline) return t("상시모집", "Always open");
  const end = new Date(deadline);
  end.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((end.getTime() - today.getTime()) / 86_400_000);
  if (days <= 0) return "D-day";
  return `D-${days}`;
}

function CampaignState({ title, description, action, loading = false }: { title: ReactNode; description: ReactNode; action?: ReactNode; loading?: boolean }) {
  return (
    <div className={styles.campaignState} aria-live={loading ? "polite" : undefined}>
      {loading ? <span className={styles.stateLoader} aria-hidden="true" /> : null}
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export default function CampaignsCallSheetPage() {
  const { t } = useLang();
  const [campaigns, setCampaigns] = useState<FeaturedCampaign[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<ModalState>({ open: false, campaign: null, seq: 0 });

  const loadCampaigns = useCallback(() => {
    api.get("/landing/featured-campaigns")
      .then((response) => { setCampaigns(response.data.campaigns); setLoadError(false); })
      .catch(() => setLoadError(true))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleCampaigns = useMemo(
    () => normalizedQuery ? campaigns.filter((campaign) => `${campaign.brandName} ${campaign.title}`.toLocaleLowerCase().includes(normalizedQuery)) : campaigns,
    [campaigns, normalizedQuery],
  );

  const filmFrames = useMemo(() => {
    const liveFrames = campaigns.filter((campaign) => Boolean(campaign.thumbnailUrl)).slice(0, 3).map((campaign) => ({
      src: campaign.thumbnailUrl as string,
      alt: `${campaign.brandName} ${campaign.title} ${t("캠페인 썸네일", "campaign thumbnail")}`,
      label: campaign.brandName.toLocaleUpperCase(),
    }));
    return liveFrames.length === 3 ? liveFrames : FALLBACK_FILMS;
  }, [campaigns, t]);

  const openModal = (campaign: FeaturedCampaign) => setModal((current) => ({ open: true, campaign, seq: current.seq + 1 }));
  const feedCount = loaded && !loadError ? t(`${campaigns.length}건 표시`, `${campaigns.length} shown`) : t("확인 중", "Checking");

  return (
    <CallSheetFrame
      sections={SECTIONS}
      filmFrames={filmFrames}
      pageName={t("캠페인", "Campaigns")}
      filmScenes={["campaign-call"]}
      dock={
        <>
          <CallDockLink href="/signup/creator" onClick={() => trackEvent("cta_click", { location: "campaigns_mobile_dock", target: "signup_creator" })}>{t("크리에이터 지원", "Apply as a creator")}</CallDockLink>
          <CallDockLink href="#campaign-live" secondary aria-label={t("선정 피드 보기", "See the curated feed")}>
            <ArrowUpRight aria-hidden="true" />
          </CallDockLink>
        </>
      }
    >
      <CallHero
        id="campaign-call"
        pageCode="ONE BRIEF / TWO DESKS / NO LOGIN"
        lines={["DESK", "TO", "DESK."]}
        description={
          <>
            <strong>{t("고르는 건 여기서, 굴러가는 건 데스크에서.", "You pick it here; it runs on the desks.")}</strong>
            <span>{t("공개 피드에서 조건을 확인하고 지원하면, 브랜드 운영 데스크와 크리에이터 작업 데스크가 같은 캠페인을 단계별로 주고받습니다.", "Review the terms in the public feed and apply — from there the brand desk and the creator desk hand the campaign back and forth, stage by stage.")}</span>
          </>
        }
        actions={
          <>
            <CallActionLink href="#campaign-live" onClick={() => trackEvent("cta_click", { location: "campaigns_hero", target: "campaigns_list" })}>
              {t("선정 피드 보기", "See the curated feed")}
            </CallActionLink>
            <CallActionLink href="#campaign-desk" tone="secondary">
              {t("데스크 흐름 보기", "See the desk flow")}
            </CallActionLink>
          </>
        }
        document={
          <CallSheetDocument
            title={t("공개 캠페인 콜시트", "Public campaign call sheet")}
            status={feedCount}
            fields={[
              { label: "SCOPE", value: t("선정 공개 피드", "Curated public feed") },
              { label: "ACCESS", value: t("로그인 없이 열람", "Browse without login") },
              { label: "DESKS", value: t("브랜드 · 크리에이터", "Brand · creator") },
              { label: "REVIEW", value: t("수정 요청 · 최종 검수", "Changes · final review") },
            ]}
            footer={t("표시 건수는 전체 모집 수가 아니라 현재 API 응답 범위입니다.", "The count describes this API response, not every open campaign.")}
          />
        }
      />

      <CallScene id="campaign-live" tone="ink" className={styles.campaignScene}>
        <div className={styles.sceneInnerWide}>
          <CallReveal>
            <CallSceneHeading
              title={t("지금 표시된", "Now showing in")}
              accent={t("선정 공개 피드.", "the curated feed.")}
              description={t("검색은 아래에 표시된 캠페인 안에서만 작동합니다. 행을 선택하면 브랜드 소개와 모집 조건을 확인할 수 있습니다.", "Search is scoped to the campaigns shown below. Select a row for brand details and recruiting terms.")}
            />
          </CallReveal>

          {!loaded ? (
            <CampaignState loading title={t("캠페인을 불러오는 중입니다", "Loading campaigns")} description={t("선정 공개 피드의 모집 정보를 확인하고 있습니다.", "Checking the curated public campaign feed.")} />
          ) : loadError ? (
            <div role="alert"><CampaignState title={t("캠페인을 불러오지 못했습니다", "Campaigns couldn't be loaded")} description={t("연결 상태를 확인한 뒤 다시 시도해 주세요.", "Check your connection and try again.")} action={<CallActionButton tone="light" onClick={() => { setLoaded(false); setLoadError(false); loadCampaigns(); }}>{t("다시 불러오기", "Try again")}</CallActionButton>} /></div>
          ) : campaigns.length === 0 ? (
            <CampaignState title={t("다음 캠페인을 준비 중이에요", "The next campaigns are on the way")} description={t("미리 가입해두면 새 캠페인이 공개될 때 확인할 수 있습니다.", "Join the beta now so you can check new campaigns when they are exposed.")} action={<CallActionLink tone="light" href="/signup/creator">{t("미리 가입하기", "Sign up early")}</CallActionLink>} />
          ) : (
            <div className={styles.campaignBrowser}>
              <div className={styles.campaignToolbar}>
                <label className={styles.campaignSearch}>
                  <Search aria-hidden="true" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("표시된 브랜드 또는 캠페인 검색", "Search the campaigns shown")} aria-label={t("현재 표시된 캠페인 검색", "Search currently shown campaigns")} />
                  {query ? <button type="button" onClick={() => setQuery("")} aria-label={t("검색어 지우기", "Clear search")}><X aria-hidden="true" /></button> : null}
                </label>
                <span aria-live="polite">{t(`선정 피드 ${visibleCampaigns.length}/${campaigns.length}건`, `Curated feed ${visibleCampaigns.length}/${campaigns.length}`)}</span>
              </div>

              {visibleCampaigns.length === 0 ? (
                <CampaignState title={t("검색 결과가 없습니다", "No campaigns match")} description={t("브랜드명이나 캠페인 제목을 다르게 입력해 보세요.", "Try another brand or campaign title.")} action={<CallActionButton tone="light" onClick={() => setQuery("")}>{t("검색 초기화", "Clear search")}</CallActionButton>} />
              ) : (
                <ol className={styles.campaignRows}>
                  {visibleCampaigns.map((campaign, index) => (
                    <li key={campaign.id}><button type="button" onClick={() => { trackEvent("cta_click", { location: "campaigns_list", target: campaign.id }); openModal(campaign); }}>
                      <span className={styles.campaignNo}>{String(index + 1).padStart(2, "0")}</span>
                      <span className={styles.campaignThumb}>
                        {campaign.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={campaign.thumbnailUrl} alt="" loading="lazy" />
                        ) : (
                          <span aria-hidden="true">{campaign.brandName.trim().charAt(0).toUpperCase() || "VG"}</span>
                        )}
                      </span>
                      <span className={styles.campaignName}><small>{campaign.brandName}</small><strong>{campaign.title}</strong></span>
                      <span className={styles.campaignTerms}><small>{t("작업 범위", "Work scope")}</small><strong>{t("공개 브리프", "Public brief")}</strong></span>
                      <span className={styles.campaignTerms}><small>{t("모집 / 지원", "Slots / applied")}</small><strong>{campaign.maxParticipants} / {campaign.applicationCount}</strong></span>
                      <span className={styles.campaignDeadline}>{deadlineLabel(campaign.deadline, t)}</span>
                      <ArrowUpRight className={styles.campaignArrow} aria-hidden="true" />
                    </button></li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>
      </CallScene>

      <CallScene id="campaign-desk" tone="paper" className={styles.proofScene}>
        <div className={styles.sceneInnerWide}>
          <CallReveal>
            <CallSceneHeading
              title={t("지원 버튼을 누르면", "Press apply, and")}
              accent={t("두 데스크가 움직입니다.", "two desks start moving.")}
              description={t("단계를 눌러 브랜드 운영 데스크와 크리에이터 작업 데스크가 무엇을 주고받는지 확인하세요. 화면 이름과 버튼, 상태 라벨은 실제 제품과 같습니다.", "Select a stage to see what the brand desk and the creator desk hand over. Screen names, buttons and status labels match the real product.")}
            />
          </CallReveal>
          <CallReveal>
            <CampaignDeskDemo />
          </CallReveal>
        </div>
      </CallScene>

      <CallScene id="campaign-flow" tone="violet" className={styles.flowScene}>
        <div className={styles.sceneInnerSplit}>
          <CallReveal>
            <CallSceneHeading
              title={t("무엇이 남고,", "What is recorded,")}
              accent={t("무엇이 아직 없는지.", "and what is not here yet.")}
              description={t("데스크가 주고받는 동안 남는 기록과, 지금 제공하지 않는 기능을 그대로 적어둡니다.", "The record each handover leaves — and the capability we do not offer yet, stated plainly.")}
            />
          </CallReveal>
          <CallReveal>
            <CallRuleList
              items={[
                { code: "01", title: t("조건은 지원 전에", "Terms up front"), body: t("작업 범위·모집 인원·마감은 지원 전에 공개된 값 그대로 캠페인 상세에 남습니다.", "Scope, slots, and deadline stay exactly as published before you apply."), meta: t("공개", "OPEN") },
                { code: "02", title: t("수정 요청은 사유와 함께", "Change requests carry a reason"), body: t("무엇을 어떻게 고칠지 적어야 전달되고, 요청 사유는 지원 행에 그대로 남습니다.", "A written reason is required, and it stays on the application row."), meta: t("기록", "LOG") },
                { code: "03", title: t("제출 이력은 회차로", "Every take is kept"), body: t("재제출할 때마다 회차와 검토 의견이 이력에 쌓입니다.", "Each resubmission adds a numbered take and its review note."), meta: t("이력", "TAKES") },
                { code: "04", title: t("성과는 입력값만", "Only entered metrics"), body: t("조회·좋아요·댓글은 크리에이터가 입력한 실제 수치이며, 입력 전에는 미입력으로 둡니다.", "Views, likes and comments are creator-entered values; before that they read as not entered."), meta: t("실측", "REAL") },
                { code: "05", title: t("완료 기준은 검수 기록으로", "Completion follows the review record"), body: t("수정 요청·재제출·최종 검수 결과를 같은 캠페인 이력에서 확인합니다.", "Change requests, resubmissions, and the final review result stay in one campaign history."), meta: t("검수", "REVIEW") },
              ]}
            />
          </CallReveal>
        </div>
      </CallScene>

      <CallScene id="campaign-start" tone="ink" className={styles.finalScene}>
        <div className={styles.finalInner}>
          <CallReveal>
            <h2>{t("조건을 보고,", "Read the terms,")}<span>{t("맞는 한 편만.", "pick the right cut.")}</span></h2>
            <p>{t("지원 전에 작업 범위·일정·검수 기준을 확인하세요. 브랜드는 상담에서 운영 범위를 먼저 정할 수 있습니다.", "Review scope, timeline, and review criteria before applying. Brands can define the operating scope during consultation.")}</p>
            <div className={styles.finalActions}>
              <CallActionLink href="/signup/creator" tone="light" onClick={() => trackEvent("cta_click", { location: "campaigns_final", target: "signup_creator" })}>{t("크리에이터 지원", "Apply as a creator")}</CallActionLink>
              <CallActionLink href="/business" tone="secondary" onClick={() => trackEvent("cta_click", { location: "campaigns_final", target: "business" })}>{t("브랜드 캠페인 문의", "Brand campaign inquiry")}</CallActionLink>
            </div>
          </CallReveal>
          <span className={styles.finalMark} aria-hidden="true">VG</span>
        </div>
      </CallScene>

      <CompanyInfoModal key={modal.seq} open={modal.open} campaign={modal.campaign} onClose={() => setModal((current) => ({ ...current, open: false }))} />
    </CallSheetFrame>
  );
}
