"use client";

/**
 * 공개 크리에이터 풀 — 한국어 정보 중심.
 * 브랜드에는 "실제로 뛰는 크리에이터가 있다"는 증거,
 * 크리에이터에는 "완료 실적이 브랜드에 노출되는 프로필"이라는 동기를 준다.
 * 모든 수치는 실제 정산(SETTLED) 기준 — 헤드라인에서 그 사실을 먼저 말한다.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import api from "@/lib/api";
import GroundTopbar from "@/components/landing/onevideo/GroundTopbar";
import GroundFooter from "@/components/landing/onevideo/GroundFooter";
import { useLang } from "@/lib/i18n";
import { trackEvent } from "@/lib/gtag";

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

function formatViews(views: number, locale: string): string {
  if (views >= 100_000_000) return `${(views / 100_000_000).toFixed(1)}억`;
  if (views >= 10_000) return `${(views / 10_000).toFixed(views >= 1_000_000 ? 0 : 1)}만`;
  return views.toLocaleString(locale);
}

export default function CreatorsPage() {
  const { t, lang } = useLang();
  const locale = lang === "en" ? "en-US" : "ko-KR";
  const [creators, setCreators] = useState<PublicCreator[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const loadCreators = useCallback(() => {
    api
      .get<{ creators: PublicCreator[] }>("/landing/creators")
      .then((res) => {
        setCreators(res.data.creators);
        setLoadError(false);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    loadCreators();
  }, [loadCreators]);

  return (
    <div className="bg-paper text-ink">
      <GroundTopbar />

      {/* 무엇을 보는 페이지인지부터 말한다 — eyebrow 칩 삭제, h1 명사구·한글 행간 1.2 */}
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-32 md:pt-40">
        <h1 className="text-[clamp(30px,5vw,56px)] font-black leading-[1.2] tracking-[-0.035em]">
          {t("지금 활동 중인", "Creators active")}
          <br />
          <span className="text-violet">{t("크리에이터", "right now")}</span>
        </h1>
        <p className="mt-5 max-w-xl text-[18px] font-medium leading-relaxed text-ink/75">
          {t(
            "공개에 동의한 프로필의 완료 이력과 캠페인에 기록된 성과 지표를 보여드립니다.",
            "See consented public profiles, completed work, and performance metrics recorded for their campaigns.",
          )}
        </p>
      </section>

      {/* 목록 — 이름(본문 폰트) + 실적 라벨을 명시 */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        {!loaded ? (
          <p className="border-t-2 border-ink py-10 text-[15px] text-ink/60">
            {t("불러오는 중...", "Loading...")}
          </p>
        ) : loadError ? (
          <div role="alert" className="border-y-2 border-ink bg-white px-6 py-8">
            <h2 className="text-[22px] font-extrabold">
              {t("크리에이터 목록을 불러오지 못했습니다", "Creators couldn't be loaded")}
            </h2>
            <p className="mt-2 text-[15px] text-ink/65">
              {t("연결 상태를 확인한 뒤 다시 시도해 주세요.", "Check your connection and try again.")}
            </p>
            <button
              type="button"
              onClick={() => {
                setLoaded(false);
                setLoadError(false);
                loadCreators();
              }}
              className="mt-5 min-h-[48px] rounded-full bg-violet px-6 text-[15px] font-bold text-white"
            >
              {t("다시 불러오기", "Try again")}
            </button>
          </div>
        ) : creators.length === 0 ? (
          <div className="rounded-2xl border-2 border-ink bg-white p-8">
            <h2 className="text-[22px] font-extrabold">
              {t("첫 완주 크리에이터를 준비하고 있어요", "Our first completed creators are on the way")}
            </h2>
            <p className="mt-2 text-[15px] text-ink/65">
              {t(
                "지금 지원하면 이 목록의 첫 줄에 이름이 올라갑니다.",
                "Apply now and your name takes the first line of this list.",
              )}
            </p>
            <Link
              href="/creator"
              className="mt-6 inline-flex min-h-[52px] items-center rounded-full bg-violet px-7 text-[15px] font-bold text-white transition-transform hover:-translate-y-1"
            >
              {t("크리에이터 지원하기", "Become a creator")}
            </Link>
          </div>
        ) : (
          <>
            {/* 열 이름 — 표가 무슨 숫자인지 먼저 알려준다 */}
            <div className="hidden grid-cols-[52px_1fr_140px_140px_120px] gap-6 border-b-2 border-ink pb-3 text-[12px] font-bold uppercase tracking-[0.08em] text-ink/60 md:grid">
              <span>No.</span>
              <span>{t("크리에이터", "Creator")}</span>
              <span className="text-right">{t("완료 캠페인", "Completed")}</span>
              <span className="text-right">{t("누적 조회수", "Total views")}</span>
              <span className="text-right">{t("평점", "Rating")}</span>
            </div>

            <ol>
              {creators.map((creator, index) => (
                <li key={creator.id}>
                  <Link
                    href={`/creators/${creator.id}`}
                    onClick={() =>
                      trackEvent("cta_click", { location: "creators_list", target: creator.id })
                    }
                    className="group grid grid-cols-[36px_1fr_auto] items-center gap-4 border-b border-ink/25 py-5 transition-transform duration-300 hover:translate-x-3 md:grid-cols-[52px_1fr_140px_140px_120px] md:gap-6"
                  >
                    <span className="font-display text-[12px] text-violet">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span>
                      <strong className="block text-[clamp(18px,1.8vw,22px)] font-extrabold tracking-[-0.02em] group-hover:text-violet">
                        {creator.name}
                      </strong>
                      <small className="mt-0.5 block text-[12px] font-medium text-ink/65 md:hidden">
                        {t(
                          `완료 ${creator.completedCampaigns}건 · 누적 ${formatViews(creator.totalViews, locale)} 조회`,
                          `${creator.completedCampaigns} done · ${creator.totalViews.toLocaleString(locale)} views`,
                        )}
                      </small>
                    </span>

                    {/* 숫자 열은 tabular-nums 로 자릿수 정렬 (craft-floor: numerals in tabular data) */}
                    <span className="hidden text-right text-[15px] font-bold tabular-nums md:block">
                      {t(`${creator.completedCampaigns}건`, `${creator.completedCampaigns}`)}
                    </span>
                    <span className="hidden text-right font-display text-[18px] tracking-[-0.02em] tabular-nums md:block">
                      {formatViews(creator.totalViews, locale)}
                    </span>
                    <span className="hidden text-right text-[15px] font-bold tabular-nums md:block">
                      {creator.reviewCount > 0 ? (
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-violet" fill="currentColor" aria-hidden="true" />
                          {creator.averageRating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-ink/45">-</span>
                      )}
                    </span>

                    <ArrowRight
                      className="h-4 w-4 text-violet md:hidden"
                      aria-hidden="true"
                      strokeWidth={2.5}
                    />
                  </Link>
                </li>
              ))}
            </ol>

            <p className="mt-4 text-[15px] font-medium text-ink/60">
              {t(
                "이름을 누르면 완료 이력·리뷰가 있는 공개 포트폴리오로 이동합니다.",
                "Tap a name to open the public portfolio with full history and reviews.",
              )}
            </p>
          </>
        )}
      </section>

      {/* 다음 행동 — 양쪽 모두. 종결 섹션 여백 한 단계 크게 */}
      <section className="bg-ink py-24 text-white md:py-32">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-[clamp(28px,4.2vw,48px)] font-black leading-tight tracking-[-0.03em]">
            {t("이 크리에이터들과 함께하거나,", "Work with these creators —")}
            <br />
            {t("다음 줄에 이름을 올리세요", "or take the next line yourself")}
          </h2>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/business"
              onClick={() => trackEvent("cta_click", { location: "creators_bottom", target: "business" })}
              className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-violet px-8 text-[15px] font-bold text-white transition-transform hover:-translate-y-1"
            >
              {t("브랜드 캠페인 문의", "Start a campaign")}
            </Link>
            <Link
              href="/creator"
              onClick={() => trackEvent("cta_click", { location: "creators_bottom", target: "creator" })}
              className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-white px-8 text-[15px] font-bold text-ink transition-transform hover:-translate-y-1"
            >
              {t("크리에이터 지원하기", "Become a creator")}
            </Link>
          </div>
        </div>
      </section>

      <GroundFooter />
    </div>
  );
}
