"use client";

import type { ReactNode } from "react";
import {
  ArrowRight, BadgeCheck, Camera, Check, Heart, MessageCircle,
  MoreHorizontal, Music, Plus, Send, TrendingUp, Wifi,
} from "lucide-react";
import BookACallButton from "./BookACallButton";
import InteractiveDots from "./InteractiveDots";
import { InstagramGlyph } from "./decor";
import { useLang } from "@/lib/i18n";
import { trackEvent } from "@/lib/gtag";

/**
 * 크리에이터 랜딩 히어로 — 텍스트 + 릴스 폰을 같은 행에 나란히, 둘을 한 덩어리로 페이지 중앙 배치.
 * 폰은 실제 인스타 릴스 UI 재현. 라이트·다크 모드 모두 대응. 카피·CTA·데이터는 기존 그대로.
 */
export default function HeroSection() {
  const { t } = useLang();

  const seeResults = () => {
    trackEvent("cta_click", { location: "hero", target: "see_results" });
    document.querySelector("#results")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-[#f3f2fb] pt-28 pb-24 dark:bg-[#0d0a1c] md:pt-32 md:pb-28">
      {/* 커서에 반응하는 인터랙티브 도트 그리드(canvas) — 가장자리 페이드 마스크 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage: "radial-gradient(ellipse 85% 70% at 50% 35%, black, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 85% 70% at 50% 35%, black, transparent 80%)",
        }}
      >
        <InteractiveDots className="block h-full w-full" />
      </div>

      {/* 텍스트 + 폰을 같은 행에 나란히, 묶음을 중앙 정렬(justify-center) */}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center justify-center gap-14 px-6 lg:flex-row lg:gap-32">
        {/* 좌: 카피 + CTA */}
        <div className="max-w-xl text-center lg:text-left">
          <span className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm dark:border-violet-400/30 dark:bg-violet-400/10 dark:text-violet-200">
            <span className="inline-block h-2 w-2 rounded-full bg-violet-500" />
            {t("업로드 1편 = 기본급 2만원 즉시 지급", "₩20,000 per upload, paid instantly")}
          </span>

          <h1 className="animate-fade-in-up mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-6xl">
            {t("폰 하나로 시작하는", "The high-paying side hustle")}
            <br />
            <span className="text-violet-600 dark:text-violet-400">{t("고수익 부업", "you run from your phone")}</span>
          </h1>

          <p
            className="animate-fade-in-up mx-auto mt-6 max-w-xl text-lg text-muted md:text-xl lg:mx-0"
            style={{ animationDelay: "0.12s" }}
          >
            {t("팔로워도 경험도 필요 없어요.", "No followers or experience needed.")}
            <br className="hidden sm:block" />
            {t(
              "업로드만 해도 기본급 2만원, 조회수에 따라 최대 250만원.",
              "Get ₩20,000 base per upload, up to ₩2.5M by views.",
            )}
          </p>

          <div
            className="animate-fade-in-up mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
            style={{ animationDelay: "0.24s" }}
          >
            <BookACallButton
              location="hero"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-600/30 sm:w-auto"
            >
              {t("무료 상담 예약", "Book a Call")}
              <ArrowRight className="h-5 w-5" strokeWidth={2.2} />
            </BookACallButton>
            <button
              type="button"
              onClick={seeResults}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-7 py-3.5 text-base font-semibold text-neutral-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-neutral-50 dark:border-white/15 dark:bg-white/5 dark:text-neutral-100 dark:hover:border-white/25 dark:hover:bg-white/10 sm:w-auto"
            >
              {t("성과 보기", "See Results")}
              <ArrowRight className="h-5 w-5" strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* 우: 릴스 폰 + 조회수/정산 카드 */}
        <div className="relative w-[230px] shrink-0">
          <Phone t={t} />
          <EngagementCard className="absolute -right-8 top-14 z-30 hidden animate-float sm:flex" />
          <PayoutCard t={t} className="absolute -left-10 bottom-20 z-30 hidden animate-float sm:block" />
        </div>
      </div>
    </section>
  );
}

/** 조회수 카드 — 카드(테마 토큰) + 인스타 글리프 + 상승 표시. */
function EngagementCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-xl shadow-violet-950/10 dark:shadow-black/40 ${className}`}
      style={{ animationDelay: "0.6s" }}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F9A03F] text-white">
        <InstagramGlyph className="h-5 w-5" />
      </span>
      <div className="text-left">
        <p className="text-[11px] font-medium text-muted">조회수</p>
        <p className="text-lg font-extrabold leading-none text-foreground">412,800</p>
      </div>
      <span className="ml-1 inline-flex items-center gap-0.5 text-xs font-bold text-emerald-500 dark:text-emerald-400">
        <TrendingUp className="h-3.5 w-3.5" />
        38%
      </span>
    </div>
  );
}

/** 정산 카드 — 업로드당 즉시 지급(기본급+성과급)을 실제 UI처럼. */
function PayoutCard({ t, className = "" }: { t: (ko: string, en: string) => string; className?: string }) {
  return (
    <div
      className={`w-48 rounded-2xl border border-line bg-surface p-4 text-left shadow-xl shadow-violet-950/10 dark:shadow-black/40 ${className}`}
      style={{ animationDelay: "1.1s" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-muted">{t("이번 영상 정산", "This video's payout")}</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
          <Check className="h-3 w-3" strokeWidth={3} />
          {t("지급 완료", "Paid")}
        </span>
      </div>
      <p className="mt-1.5 text-2xl font-extrabold tracking-tight text-foreground">+₩214,000</p>
      <svg viewBox="0 0 160 36" className="mt-2 h-9 w-full text-violet-600 dark:text-violet-400" preserveAspectRatio="none" aria-hidden="true">
        <polyline
          points="0,30 26,26 52,28 78,18 104,20 130,10 160,4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="mt-1 text-[10px] text-muted">{t("기본급 2만 + 성과급", "Base ₩20K + bonus")}</p>
    </div>
  );
}

/** 인스타 릴스 폰 목업(틱톡 아님). 상태바·다이나믹아일랜드·릴스 UI 재현. 기기라 라이트/다크 공통. */
function Phone({ t }: { t: (ko: string, en: string) => string }) {
  return (
    <div className="relative w-[230px] -rotate-3">
      {/* 측면 버튼 */}
      <span className="absolute -left-[2px] top-[96px] h-7 w-[2px] rounded-l bg-neutral-700" />
      <span className="absolute -left-[2px] top-[132px] h-12 w-[2px] rounded-l bg-neutral-700" />
      <span className="absolute -right-[2px] top-[120px] h-16 w-[2px] rounded-r bg-neutral-700" />

      {/* 메탈 프레임 */}
      <div className="rounded-[2.7rem] border-[3px] border-neutral-800 bg-neutral-950 p-[5px] shadow-2xl shadow-violet-950/30 ring-1 ring-white/10">
        <div
          className="relative aspect-[9/19.5] overflow-hidden rounded-[2.35rem]"
          style={{ background: "linear-gradient(160deg, #fb923c 0%, #db2777 46%, #6d28d9 100%)" }}
        >
          {/* 스포트라이트 + 상하단 가독 그라데이션 */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(120% 60% at 50% 28%, rgba(255,255,255,0.22), transparent 60%)" }} />
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/35 to-transparent" />

          {/* 상태바 */}
          <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 pt-2 text-[10px] font-semibold text-white">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span className="flex items-end gap-[1.5px]">
                <i className="block h-[4px] w-[2px] rounded-[1px] bg-white" />
                <i className="block h-[6px] w-[2px] rounded-[1px] bg-white" />
                <i className="block h-[8px] w-[2px] rounded-[1px] bg-white" />
                <i className="block h-[10px] w-[2px] rounded-[1px] bg-white" />
              </span>
              <Wifi className="h-3 w-3" strokeWidth={2.5} />
              <span className="relative ml-0.5 flex h-[10px] w-[18px] items-center rounded-[3px] border border-white/80 px-[1.5px]">
                <span className="h-[5px] w-[12px] rounded-[1px] bg-white" />
                <span className="absolute -right-[3px] top-1/2 h-[4px] w-[2px] -translate-y-1/2 rounded-r bg-white/80" />
              </span>
            </span>
          </div>

          {/* 다이나믹 아일랜드 */}
          <div className="absolute left-1/2 top-2 z-40 flex h-[20px] w-[74px] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-2.5">
            <span className="h-[7px] w-[7px] rounded-full bg-neutral-800 ring-1 ring-neutral-600" />
          </div>

          {/* 릴스 상단바 */}
          <div className="absolute inset-x-0 top-9 z-20 flex items-center justify-between px-3.5 text-white">
            <span className="text-sm font-bold tracking-tight drop-shadow">Reels</span>
            <Camera className="h-5 w-5 drop-shadow" strokeWidth={2} />
          </div>

          {/* 우측 액션 레일 */}
          <div className="absolute bottom-16 right-2.5 z-20 flex flex-col items-center gap-3.5 text-white">
            <span className="relative mb-1">
              <span className="block h-7 w-7 rounded-full bg-gradient-to-br from-amber-300 to-rose-400 ring-2 ring-white" />
              <span className="absolute -bottom-1 left-1/2 flex h-3.5 w-3.5 -translate-x-1/2 items-center justify-center rounded-full bg-rose-500 ring-1 ring-white">
                <Plus className="h-2.5 w-2.5" strokeWidth={3.5} />
              </span>
            </span>
            <ReelAction icon={<Heart className="h-6 w-6 drop-shadow" fill="currentColor" />} label="38.4K" />
            <ReelAction icon={<MessageCircle className="h-6 w-6 drop-shadow" />} label="1,247" />
            <ReelAction icon={<Send className="h-6 w-6 drop-shadow" />} label="5.2K" />
            <MoreHorizontal className="h-5 w-5 drop-shadow" />
            <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-md bg-neutral-900/80 ring-1 ring-white/30">
              <span className="block h-4 w-4 animate-[spin_4s_linear_infinite] rounded-full bg-gradient-to-br from-fuchsia-400 to-violet-500" />
            </span>
          </div>

          {/* 하단 캡션 */}
          <div className="absolute bottom-4 left-3.5 right-14 z-20 text-white">
            <div className="flex items-center gap-1.5">
              <span className="block h-5 w-5 rounded-full bg-gradient-to-br from-amber-300 to-rose-400 ring-1 ring-white/70" />
              <span className="text-xs font-semibold drop-shadow">viral.ground</span>
              <BadgeCheck className="h-3.5 w-3.5 text-sky-300" fill="currentColor" />
              <span className="ml-1 rounded-md border border-white/60 px-1.5 py-[1px] text-[9px] font-semibold">
                {t("팔로우", "Follow")}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] leading-snug drop-shadow">
              {t("폰 하나로 시작한 부업 ", "Started a side hustle with just my phone ")}
              <span className="font-semibold">#부업 #릴스</span>
            </p>
            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-white/90">
              <Music className="h-3 w-3" strokeWidth={2.5} />
              <span className="drop-shadow">{t("원본 오디오 · viral.ground", "Original audio · viral.ground")}</span>
            </div>
          </div>

          {/* 진행바 */}
          <div className="absolute inset-x-0 bottom-0 z-20 h-[3px] bg-white/25">
            <div className="h-full w-2/5 bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReelAction({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="flex flex-col items-center gap-0.5">
      {icon}
      <span className="text-[10px] font-semibold drop-shadow">{label}</span>
    </span>
  );
}
