"use client";

/**
 * 공개 캠페인 목록 — 한국어 정보 중심.
 * "지금 지원할 수 있는 일이 있다"를 가입 전에 보여주는 크리에이터 전환 페이지.
 * 데이터는 랜딩 공개 API(/landing/featured-campaigns)를 사용한다.
 *
 * 2026-08-13 AI-tells audit: 동일 크기 SaaS 카드 그리드(자체 디자인 시스템 §0 금지 패턴,
 * nested-cards·identical-grid·centered 동시 발화)를 /creators 와 같은
 * 시안4 룰드 리스트 문법으로 재작성. 3건뿐인 데이터가 빈 그리드가 아니라
 * 큐레이션된 목록으로 읽히게 한다.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import api from "@/lib/api";
import type { FeaturedCampaign } from "@/types/landing";
import CompanyInfoModal from "@/components/landing/CompanyInfoModal";
import GroundTopbar from "@/components/landing/onevideo/GroundTopbar";
import GroundFooter from "@/components/landing/onevideo/GroundFooter";
import { useLang } from "@/lib/i18n";
import { trackEvent } from "@/lib/gtag";

interface ModalState {
  open: boolean;
  campaign: FeaturedCampaign | null;
  seq: number;
}

/** 마감까지 남은 '달력 일수'. deadline 이 없으면 상시모집으로 표기. */
function deadlineLabel(deadline: string | null, t: (ko: string, en: string) => string): string {
  if (!deadline) return t("상시모집", "Always open");
  const end = new Date(deadline);
  end.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "D-day";
  return `D-${days}`;
}

export default function PublicCampaignsPage() {
  const { t } = useLang();
  const [campaigns, setCampaigns] = useState<FeaturedCampaign[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [modal, setModal] = useState<ModalState>({ open: false, campaign: null, seq: 0 });

  const loadCampaigns = useCallback(() => {
    api
      .get("/landing/featured-campaigns")
      .then((res) => {
        setCampaigns(res.data.campaigns);
        setLoadError(false);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const openModal = (c: FeaturedCampaign) =>
    setModal((m) => ({ open: true, campaign: c, seq: m.seq + 1 }));
  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  return (
    <div className="bg-paper text-ink">
      <GroundTopbar />

      {/* 무엇을 보는 페이지인지부터 말한다 — eyebrow 칩 삭제, h1 명사구·한글 행간 1.2 */}
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-32 md:pt-40">
        <h1 className="text-[clamp(30px,5vw,56px)] font-black leading-[1.2] tracking-[-0.035em]">
          {t("지금 열려 있는", "Campaigns open")}
          <br />
          <span className="text-violet">{t("캠페인", "right now")}</span>
        </h1>
        <p className="mt-5 max-w-xl text-[18px] font-medium leading-relaxed text-ink/75">
          {t(
            "로그인 없이 먼저 둘러보세요. 베타 가입이 승인되면 캠페인별 조건을 확인하고 지원할 수 있습니다.",
            "Browse without logging in. Once your beta application is approved, review each campaign's terms and apply.",
          )}
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        {!loaded ? (
          <p className="border-t-2 border-ink py-10 text-[15px] text-ink/60">
            {t("불러오는 중...", "Loading...")}
          </p>
        ) : loadError ? (
          <div role="alert" className="border-y-2 border-ink bg-white px-6 py-8">
            <h2 className="text-[22px] font-extrabold">
              {t("캠페인을 불러오지 못했습니다", "Campaigns couldn't be loaded")}
            </h2>
            <p className="mt-2 text-[15px] text-ink/65">
              {t("연결 상태를 확인한 뒤 다시 시도해 주세요.", "Check your connection and try again.")}
            </p>
            <button
              type="button"
              onClick={() => {
                setLoaded(false);
                setLoadError(false);
                loadCampaigns();
              }}
              className="mt-5 min-h-[48px] rounded-full bg-violet px-6 text-[15px] font-bold text-white"
            >
              {t("다시 불러오기", "Try again")}
            </button>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="rounded-2xl border-2 border-ink bg-white p-8">
            <h2 className="text-[22px] font-extrabold">
              {t("다음 캠페인을 준비 중이에요", "The next campaigns are on the way")}
            </h2>
            <p className="mt-2 text-[15px] text-ink/65">
              {t(
                "미리 가입해두면 새 캠페인이 열릴 때 가장 먼저 알림을 받습니다.",
                "Sign up now and you'll be the first to hear when new campaigns open.",
              )}
            </p>
            <Link
              href="/signup/creator"
              className="mt-6 inline-flex min-h-[52px] items-center rounded-full bg-violet px-7 text-[15px] font-bold text-white transition-transform hover:-translate-y-1"
            >
              {t("미리 가입하기", "Sign up early")}
            </Link>
          </div>
        ) : (
          <>
            {/* 열 이름 — 표가 무슨 숫자인지 먼저 알려준다 (/creators 와 같은 룰드 리스트 문법) */}
            <div className="hidden grid-cols-[1fr_150px_110px_150px] gap-6 border-b-2 border-ink pb-3 text-[12px] font-bold uppercase tracking-[0.08em] text-ink/60 md:grid">
              <span>{t("캠페인", "Campaign")}</span>
              <span className="text-right">{t("기본 보상", "Base reward")}</span>
              <span className="text-right">{t("마감", "Deadline")}</span>
              <span className="text-right">{t("모집 · 지원", "Slots · applied")}</span>
            </div>

            <ol>
              {campaigns.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => {
                      trackEvent("cta_click", { location: "campaigns_list", target: c.id });
                      openModal(c);
                    }}
                    className="group grid w-full grid-cols-[1fr_auto] items-center gap-4 border-b border-ink/25 py-5 text-left transition-transform duration-300 hover:translate-x-3 md:grid-cols-[1fr_150px_110px_150px] md:gap-6"
                  >
                    <span>
                      <small className="block text-[12px] font-bold uppercase tracking-[0.04em] text-ink/60">
                        {c.brandName}
                      </small>
                      <strong className="mt-0.5 block text-[clamp(18px,1.8vw,22px)] font-extrabold tracking-[-0.02em] group-hover:text-violet">
                        {c.title}
                      </strong>
                      <small className="mt-0.5 block text-[12px] font-medium text-ink/65 md:hidden">
                        {t(
                          `${deadlineLabel(c.deadline, t)} · 모집 ${c.maxParticipants} · 지원 ${c.applicationCount}`,
                          `${deadlineLabel(c.deadline, t)} · ${c.maxParticipants} slots · ${c.applicationCount} applied`,
                        )}
                      </small>
                    </span>

                    {/* 숫자 열은 tabular-nums 로 자릿수 정렬 */}
                    <span className="hidden text-right font-display text-[18px] tracking-[-0.02em] text-violet tabular-nums md:block">
                      ₩{c.rewardAmount.toLocaleString("ko-KR")}
                    </span>
                    <span className="hidden text-right text-[15px] font-bold tabular-nums md:block">
                      {deadlineLabel(c.deadline, t)}
                    </span>
                    <span className="hidden text-right text-[15px] font-bold tabular-nums md:block">
                      {t(
                        `${c.maxParticipants}명 · ${c.applicationCount}명`,
                        `${c.maxParticipants} · ${c.applicationCount}`,
                      )}
                    </span>

                    <ArrowRight
                      className="h-4 w-4 text-violet md:hidden"
                      aria-hidden="true"
                      strokeWidth={2.5}
                    />
                  </button>
                </li>
              ))}
            </ol>

            <p className="mt-4 text-[15px] font-medium text-ink/60">
              {t(
                "캠페인을 누르면 진행 브랜드의 소개와 모집 조건을 확인할 수 있습니다.",
                "Tap a campaign to see the brand behind it and the recruiting terms.",
              )}
            </p>
          </>
        )}
      </section>

      {/* 다음 행동 — 종결 섹션 여백 한 단계 크게 */}
      <section className="bg-ink py-24 text-white md:py-32">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-[clamp(28px,4.2vw,48px)] font-black leading-tight tracking-[-0.03em]">
            {t("마음에 드는 캠페인이 있다면,", "Found a campaign you like?")}
            <br />
            {t("지금 바로 시작하세요", "Start right now")}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[18px] font-medium leading-relaxed text-white/75">
            {t(
              "캠페인별 작업 범위·보상·지급 조건을 지원 전에 확인하세요.",
              "Review each campaign's scope, reward, and payout terms before applying.",
            )}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup/creator"
              onClick={() =>
                trackEvent("cta_click", { location: "campaigns_bottom", target: "signup_creator" })
              }
              className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-violet px-8 text-[15px] font-bold text-white transition-transform hover:-translate-y-1"
            >
              {t("크리에이터 지원하기", "Apply as a creator")}
            </Link>
            <Link
              href="/business"
              onClick={() =>
                trackEvent("cta_click", { location: "campaigns_bottom", target: "business" })
              }
              className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-white px-8 text-[15px] font-bold text-ink transition-transform hover:-translate-y-1"
            >
              {t("브랜드로 캠페인 열기", "Open a campaign as a brand")}
            </Link>
          </div>
        </div>
      </section>

      <GroundFooter />

      <CompanyInfoModal
        key={modal.seq}
        open={modal.open}
        campaign={modal.campaign}
        onClose={closeModal}
      />
    </div>
  );
}
