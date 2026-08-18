"use client";

/**
 * 시안4 — 원 비디오 그라운드 (확정 디자인) 공통 관문 랜딩.
 *
 * 하나의 아이폰 프레임(필름)이 스크롤 진행도에 따라 커지고, 이동하고,
 * 마지막 릴 섹션에 도킹되는 "스크롤 필름" 구조. 원본 시안의 스크립트를
 * React 생명주기로 옮겼고, 개발용 시안 전환·녹화 패널은 제거했다.
 *
 * 역할 분기(설득 계층)는 이 페이지가 아니라 CTA 가 맡는다:
 *  - 브랜드 캠페인 문의 → /business
 *  - 크리에이터 지원   → /creator
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import GroundTopbar from "./GroundTopbar";
import GroundFooter from "./GroundFooter";
import { trackEvent } from "@/lib/gtag";
import "./onevideo.css";

interface Reel {
  src: string;
  poster: string;
  stamp: string;
  name: string;
  caption: string;
  views: string;
}

const REELS: Reel[] = [
  {
    src: "/reels/DTpu_g6D3O1.mp4",
    poster: "/reels/DTpu_g6D3O1.jpg",
    stamp: "product film",
    name: "Product",
    caption: "제품을 한 장면으로 설명하는 포맷 샘플",
    views: "SAMPLE",
  },
  {
    src: "/reels/DVpoahthmdk.mp4",
    poster: "/reels/DVpoahthmdk.jpg",
    stamp: "review film",
    name: "Review",
    caption: "사용 경험을 짧고 솔직하게 전하는 포맷 샘플",
    views: "SAMPLE",
  },
  {
    src: "/reels/DXhE_vZkorg.mp4",
    poster: "/reels/DXhE_vZkorg.jpg",
    stamp: "routine film",
    name: "Routine",
    caption: "일상 속 제품 사용을 보여주는 포맷 샘플",
    views: "SAMPLE",
  },
];

/* 스크롤 진행도별 필름(폰) 키프레임 — p: 진행도, x/y: vw·vh 중심, w/h: 크기, r: 라운드 비율 */
const DESKTOP_FRAMES = [
  { p: 0.0, x: 50, y: 51, w: 14, h: 48, r: 11, rot: 0, sat: 1.04, overlay: 0.08 },
  { p: 0.12, x: 50, y: 51, w: 17, h: 57, r: 10, rot: 0, sat: 1.08, overlay: 0.1 },
  { p: 0.23, x: 50, y: 50, w: 27, h: 90, r: 8, rot: 0, sat: 1.12, overlay: 0.14 },
  { p: 0.31, x: 50, y: 50, w: 30, h: 96, r: 7, rot: 0, sat: 1.18, overlay: 0.18 },
  { p: 0.41, x: 50, y: 50, w: 30, h: 96, r: 7, rot: 0, sat: 1.12, overlay: 0.16 },
  { p: 0.51, x: 50, y: 50, w: 21, h: 80, r: 9, rot: 0, sat: 0.92, overlay: 0.08 },
  { p: 0.64, x: 50, y: 50, w: 21, h: 80, r: 9, rot: 0, sat: 1.02, overlay: 0.08 },
  { p: 0.72, x: 78, y: 50, w: 22, h: 84, r: 8, rot: 1.5, sat: 1.08, overlay: 0.1 },
  { p: 0.83, x: 78, y: 50, w: 22, h: 84, r: 8, rot: -1, sat: 1.12, overlay: 0.11 },
  { p: 0.91, x: 50, y: 50, w: 22, h: 82, r: 10, rot: 0, sat: 1.08, overlay: 0.16 },
  { p: 1.0, x: 50, y: 50, w: 20, h: 72, r: 12, rot: 0, sat: 0.9, overlay: 0.22 },
];

const MOBILE_FRAMES = [
  { p: 0.0, x: 50, y: 51, w: 50, h: 43, r: 13, rot: 0, sat: 1.04, overlay: 0.08 },
  { p: 0.13, x: 50, y: 48, w: 56, h: 50, r: 11, rot: 0, sat: 1.08, overlay: 0.1 },
  { p: 0.23, x: 50, y: 50, w: 86, h: 88, r: 9, rot: 0, sat: 1.12, overlay: 0.14 },
  { p: 0.31, x: 50, y: 50, w: 92, h: 94, r: 8, rot: 0, sat: 1.18, overlay: 0.18 },
  { p: 0.41, x: 50, y: 50, w: 92, h: 94, r: 8, rot: 0, sat: 1.12, overlay: 0.16 },
  { p: 0.51, x: 50, y: 50, w: 72, h: 68, r: 11, rot: 0, sat: 0.94, overlay: 0.08 },
  { p: 0.64, x: 50, y: 50, w: 72, h: 68, r: 11, rot: 0, sat: 1.02, overlay: 0.08 },
  { p: 0.72, x: 91, y: 56, w: 68, h: 72, r: 10, rot: 1, sat: 1.08, overlay: 0.1 },
  { p: 0.83, x: 91, y: 56, w: 68, h: 72, r: 10, rot: -1, sat: 1.12, overlay: 0.11 },
  { p: 0.91, x: 50, y: 50, w: 64, h: 72, r: 12, rot: 0, sat: 1.08, overlay: 0.16 },
  { p: 1.0, x: 50, y: 48, w: 60, h: 68, r: 13, rot: 0, sat: 0.9, overlay: 0.22 },
];

/* 마지막 릴 섹션에서 폰이 도킹되는 자리 */
const DESKTOP_DOCK = { p: 0, x: 29, y: 50, w: 22, h: 78, r: 12, rot: 0, sat: 1.06, overlay: 0.09 };
const MOBILE_DOCK = { p: 0, x: 50, y: 25, w: 60, h: 41, r: 13, rot: 0, sat: 1.06, overlay: 0.09 };

type Frame = (typeof DESKTOP_FRAMES)[number];

const FRAME_KEYS = ["x", "y", "w", "h", "r", "rot", "sat", "overlay"] as const;

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;
const easeOut = (value: number) => 1 - Math.pow(1 - clamp(value), 3);
const smooth = (value: number) => {
  const amount = clamp(value);
  return amount * amount * (3 - 2 * amount);
};

const mixFrames = (from: Frame, to: Frame, amount: number): Frame => {
  const frame = { ...from };
  FRAME_KEYS.forEach((key) => {
    frame[key] = mix(from[key], to[key], amount);
  });
  return frame;
};

const getFrame = (progress: number, frames: Frame[]): Frame => {
  let before = frames[0];
  let after = frames[frames.length - 1];
  for (let index = 0; index < frames.length - 1; index += 1) {
    if (progress >= frames[index].p && progress <= frames[index + 1].p) {
      before = frames[index];
      after = frames[index + 1];
      break;
    }
  }
  const span = Math.max(after.p - before.p, 0.0001);
  const amount = easeOut((progress - before.p) / span);
  return mixFrames(before, after, amount);
};

export default function OneVideoLanding() {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const reelsRef = useRef<HTMLElement>(null);
  const reelsPanelRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLElement>(null);
  const swapTimerRef = useRef(0);

  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [currentReel, setCurrentReel] = useState(0);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  /* 인트로는 0.45초 안에 끝나며 스크롤을 막지 않는다. 모션 감소 환경은 즉시 진입한다. */
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reduce = media.matches;
    const video = videoRef.current;
    if (reduce) {
      video?.pause();
    } else {
      video?.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }

    const raf = window.requestAnimationFrame(() => {
      setReducedMotion(reduce);
      if (reduce) setReady(true);
    });
    const timer = window.setTimeout(() => {
      setReady(true);
    }, reduce ? 0 : 450);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, []);

  /* 스크롤 루프: 필름 프레임 보간 + 도킹 + on-dark + 플로우 스텝 하이라이트 */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (reducedMotion) {
      root.classList.add("is-reduced-motion");
      root.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
      return;
    }

    let ticking = false;

    const update = () => {
      const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollRange > 0 ? clamp(window.scrollY / scrollRange) : 0;
      const isMobile = window.innerWidth <= 900;
      const frames = isMobile ? MOBILE_FRAMES : DESKTOP_FRAMES;

      /* 릴 섹션 앞까지가 원래의 필름 시퀀스 구간 */
      const reelsTop = reelsRef.current
        ? reelsRef.current.getBoundingClientRect().top
        : null;
      const filmRange =
        reelsTop === null
          ? Math.max(scrollRange, 1)
          : Math.max(reelsTop + window.scrollY - window.innerHeight, 1);
      const filmProgress = clamp(window.scrollY / filmRange);

      /* 마지막 CTA가 빠져나간 뒤에 폰이 플레이어 자리로 도킹된다 */
      const dockStart = window.innerHeight * 0.38;
      const dockTravel = Math.max(window.innerHeight * 0.58, 1);
      const dockProgress =
        reelsTop === null ? 0 : smooth((dockStart - reelsTop) / dockTravel);

      /* 모바일은 목록 위에 남은 만큼만 폰이 차지하도록 계산한다 */
      let dock = isMobile ? MOBILE_DOCK : DESKTOP_DOCK;
      if (isMobile && reelsPanelRef.current) {
        const viewportHeight = window.innerHeight;
        const topPad = viewportHeight * 0.045;
        const free = Math.max(
          viewportHeight - reelsPanelRef.current.offsetHeight - 86 - topPad,
          viewportHeight * 0.2,
        );
        dock = {
          ...MOBILE_DOCK,
          y: ((topPad + free / 2) / viewportHeight) * 100,
          h: Math.min((free / viewportHeight) * 100, 46),
        };
      }

      const frame = mixFrames(getFrame(filmProgress, frames), dock, dockProgress);
      const phoneAspect = 9 / 19.5;
      const exactPhoneWidth =
        (frame.h * window.innerHeight * phoneAspect) / window.innerWidth;
      const exactPhoneWidthPixels = (frame.h * window.innerHeight * phoneAspect) / 100;

      root.style.setProperty("--page-progress", progress.toFixed(4));
      root.style.setProperty("--dock", dockProgress.toFixed(4));
      root.style.setProperty("--film-x", frame.x.toFixed(3));
      root.style.setProperty("--film-y", frame.y.toFixed(3));
      root.style.setProperty("--film-w", exactPhoneWidth.toFixed(3));
      root.style.setProperty("--film-h", frame.h.toFixed(3));
      root.style.setProperty(
        "--film-radius",
        `${((exactPhoneWidthPixels * frame.r) / 100).toFixed(2)}px`,
      );
      root.style.setProperty("--film-rotate", `${frame.rot.toFixed(2)}deg`);
      root.style.setProperty("--film-saturation", frame.sat.toFixed(3));
      root.style.setProperty("--film-overlay", frame.overlay.toFixed(3));

      root.classList.toggle(
        "on-dark",
        (filmProgress > 0.19 && filmProgress < 0.46) || filmProgress > 0.84,
      );

      if (flowRef.current) {
        const flowRect = flowRef.current.getBoundingClientRect();
        const flowTravel = Math.max(flowRect.height - window.innerHeight, 1);
        const flowProgress = clamp(-flowRect.top / flowTravel);
        const steps = flowRef.current.querySelectorAll("[data-flow-step]");
        const activeStep = Math.min(
          steps.length - 1,
          Math.floor(flowProgress * steps.length),
        );
        steps.forEach((step, index) => {
          step.classList.toggle("is-current", index === activeStep);
        });
      }

      ticking = false;
    };

    const requestUpdate = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [reducedMotion]);

  /* 카피 리빌 — 기본은 보이는 상태(anim-armed 가 붙어야 숨김 시작).
     JS 실패 시에도 카피가 사라지지 않고, threshold 를 낮춰
     뷰포트보다 큰 문단이 영영 안 나타나는 경우를 막는다. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (reducedMotion) {
      root.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
      return;
    }
    root.classList.add("anim-armed");
    const items = root.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => () => window.clearTimeout(swapTimerRef.current), []);

  const swapReel = (index: number) => {
    if (index === currentReel) return;
    const screen = screenRef.current;
    const video = videoRef.current;
    if (!screen || !video) return;

    trackEvent("cta_click", { location: "landing_reels", target: REELS[index].stamp });
    if (reducedMotion) {
      setCurrentReel(index);
      video.src = REELS[index].src;
      video.poster = REELS[index].poster;
      video.load();
      setPlaying(false);
      return;
    }

    screen.classList.add("is-swapping");
    window.clearTimeout(swapTimerRef.current);
    swapTimerRef.current = window.setTimeout(() => {
      setCurrentReel(index);
      video.src = REELS[index].src;
      video.poster = REELS[index].poster;
      video.load();
      video.play().catch(() => undefined);
      setPlaying(true);
      screen.classList.remove("is-swapping");
    }, 260);
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted ? false : true;
    if (muted) video.play().catch(() => undefined);
    setMuted(!muted);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
    } else {
      video.play().catch(() => undefined);
    }
    setPlaying(!playing);
  };

  return (
    <div
      ref={rootRef}
      className={`vg4${ready ? " is-ready" : ""}${reducedMotion ? " is-reduced-motion" : ""}`}
    >
      <div className="intro" aria-hidden="true">
        <div className={`intro-top`}>
          <span>ViralGround / Seoul</span>
          <span>One Video Ground</span>
        </div>
        <div className="intro-word">
          <span>Play AI,</span>
          <span>
            Spread <em>Viral.</em>
          </span>
        </div>
        <div className="intro-track is-counting">
          <i />
        </div>
      </div>

      <GroundTopbar />

      <div className="page-rail" aria-hidden="true">
        <i />
      </div>

      <div
        className="film-shell"
        aria-label="아이폰 Pro 스타일 프레임에서 재생되는 바이럴그라운드 크리에이터 영상"
      >
        <span className="phone-button action" aria-hidden="true" />
        <span className="phone-button volume-up" aria-hidden="true" />
        <span className="phone-button volume-down" aria-hidden="true" />
        <span className="phone-button power" aria-hidden="true" />
        <span className="antenna-band left top" aria-hidden="true" />
        <span className="antenna-band left bottom" aria-hidden="true" />
        <span className="antenna-band right top" aria-hidden="true" />
        <span className="antenna-band right bottom" aria-hidden="true" />
        <div ref={screenRef} className="phone-screen">
          <video
            ref={videoRef}
            src={REELS[0].src}
            poster={REELS[0].poster}
            muted
            loop
            playsInline
            preload="metadata"
          />
          <span className="dynamic-island" aria-hidden="true" />
          <span className="home-indicator" aria-hidden="true" />
          <span className="film-stamp">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/viral-ground-mark-white.png" alt="" aria-hidden="true" />
            <span>{currentReel === 0 ? "real creator film" : REELS[currentReel].stamp}</span>
          </span>
        </div>
      </div>

      <div className="film-controls" aria-label="영상 제어">
        <button type="button" aria-pressed={!muted} onClick={toggleSound}>
          {muted ? "sound off" : "sound on"}
        </button>
        <button type="button" aria-pressed={!playing} onClick={togglePlay}>
          {playing ? "pause" : "play"}
        </button>
      </div>

      <nav className="mobile-sticky-actions" aria-label="베타 참여 바로가기">
        <Link href="/business">브랜드 베타</Link>
        <Link href="/creator">크리에이터 지원</Link>
      </nav>

      <div id="top">
        <section className="scene hero" aria-labelledby="hero-title">
          <div className="scene-sticky">
            <h1 className="hero-title" id="hero-title">
              <span>AI SaaS</span>
              <span>× Creators</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hero-word-logo" src="/viral-ground-logo.png" alt="Viral Ground" />
              <span className="hero-sticker" aria-hidden="true">
                Managed beta
                <br />
                Korea first
              </span>
            </h1>

            <p className="hero-copy reveal">
              <span className="copy-line">
                <strong>AI 제품을 제대로 이해하는 크리에이터</strong>와,
              </span>
              <span className="copy-line">
                <strong>브리프부터 게시·성과 확인까지</strong>를
              </span>
              <span className="copy-line">한 흐름에서 운영하세요.</span>
            </p>

            <div className="hero-actions" aria-label="베타 참여">
              <Link
                className="hero-action primary"
                href="/business"
                onClick={() => trackEvent("cta_click", { location: "landing_hero", target: "business" })}
              >
                브랜드 베타 문의
              </Link>
              <Link
                className="hero-action"
                href="/creator"
                onClick={() => trackEvent("cta_click", { location: "landing_hero", target: "creator" })}
              >
                크리에이터 지원
              </Link>
            </div>

            <span className="scroll-cue" aria-hidden="true">
              <i />
              scroll to spread
            </span>
          </div>
        </section>

        <section className="scene manifesto" id="story" aria-labelledby="manifesto-title">
          <div className="scene-sticky">
            <h2 className="manifesto-title" id="manifesto-title">
              <span>One video.</span>
              <span>Real reach.</span>
            </h2>

            <span className="spread-sticker" aria-hidden="true">
              Spread for real
            </span>

            <p className="manifesto-korean reveal">
              <span className="copy-line">광고처럼 말하지 않아도 됩니다.</span>
              <span className="copy-line">크리에이터의 언어로 만든 한 편이</span>
              <span className="copy-line">사람들의 피드에서 스스로 퍼집니다.</span>
            </p>
          </div>
        </section>

        <section className="scene proof" aria-labelledby="proof-title">
          <div className="scene-sticky">
            <div className="ghost-type proof-ghost" aria-hidden="true">
              <span>BRIEF</span>
              <span>→ FILM</span>
            </div>

            <div className="proof-left front-copy">
              <h2 id="proof-title">
                <span className="copy-line">제품을 이해하고</span>
                <em className="copy-line">자기 언어로</em>
                <span className="copy-line">직접 보여주는</span>
                <em className="copy-line">한 편의 설명.</em>
              </h2>
            </div>

            <div className="proof-right front-copy">
              <p>
                <span className="copy-line">지금은 운영팀이 함께하는 관리형 베타입니다.</span>
                <span className="copy-line">조건과 보상은 캠페인별로 먼저 공개하고,</span>
                <span className="copy-line">동의한 범위 안에서만 진행합니다.</span>
              </p>
              <ul className="reward-lines" aria-label="크리에이터 보상">
                <li>
                  <span>AI 제품 적합 크리에이터 검토</span>
                  <b>MATCH</b>
                </li>
                <li>
                  <span>범위·일정·보상 사전 공개</span>
                  <b>CLEAR</b>
                </li>
                <li>
                  <span>게시 후 성과 동기화</span>
                  <b>TRACK</b>
                </li>
              </ul>
            </div>

            <span className="proof-stamp">
                  brief
              <br />
                  becomes
              <br />
                  film
            </span>
          </div>
        </section>

        <section ref={flowRef} className="scene flow" aria-labelledby="flow-title">
          <div className="scene-sticky">
            <div className="flow-copy front-copy">
              <h2 id="flow-title">
                <span className="copy-line">복잡했던</span>
                <span className="copy-line">
                  크리에이터
                  <br className="mobile-break" />
                  마케팅을
                </span>
                <span className="copy-line">세 장면으로.</span>
              </h2>

              <ol className="flow-steps">
                <li data-flow-step>
                  <span className="no">01</span>
                  <strong>Brief</strong>
                  <small>제품과 목표, 필수 표현을 정리합니다</small>
                </li>
                <li data-flow-step>
                  <span className="no">02</span>
                  <strong>Match</strong>
                  <small>AI 제품 적합도와 제작 스타일을 함께 봅니다</small>
                </li>
                <li data-flow-step>
                  <span className="no">03</span>
                  <strong>Publish</strong>
                  <small>검수·게시 후 합의한 성과를 확인합니다</small>
                </li>
              </ol>
            </div>

            {/* "Make it ___" 템플릿 3연발 중 하나 — 섹션 내용("세 장면으로")을 받는 문구로 교체 */}
            <div className="flow-hand" aria-hidden="true">
              Three
              <br />
              scenes.
            </div>
          </div>
        </section>

        <section ref={reelsRef} className="scene reels" id="films" aria-labelledby="reels-title">
          <div className="scene-sticky">
            <div className="ghost-type reels-ghost" aria-hidden="true">
              Reels
            </div>

            <div ref={reelsPanelRef} className="reels-panel">
              <h2 className="reels-title" id="reels-title">
                <span>Pick</span>
                <span>a film.</span>
              </h2>

              <p className="reels-korean">
                <span className="copy-line">베타에서 활용할 수 있는 콘텐츠 포맷 예시입니다.</span>
                <span className="copy-line">표시된 영상은 성과 사례가 아닌 샘플입니다.</span>
              </p>

              <ul className="reel-lines" role="list">
                {REELS.map((reel, index) => (
                  <li key={reel.stamp}>
                    <button
                      className={`reel-line${index === currentReel ? " is-current" : ""}`}
                      type="button"
                      aria-pressed={index === currentReel}
                      onClick={() => swapReel(index)}
                    >
                      <span className="reel-thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={reel.poster} alt="" loading="lazy" />
                      </span>
                      <span className="reel-name">
                        <strong>{reel.name}</strong>
                        <small>{reel.caption}</small>
                      </span>
                      <span className="reel-views">
                        {reel.views}
                        <i>format</i>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <span className="reels-stamp" aria-hidden="true">
              tap
              <br />
              to
              <br />
              play
            </span>

            <div className="footer-note">
              <span>ViralGround © 2026</span>
              <span>AI SaaS / Creator film / Managed beta</span>
              <span>Seoul, Korea</span>
            </div>
          </div>
        </section>

        <section className="scene final" id="join" aria-labelledby="final-title">
          <div className="scene-sticky">
            <div className="ghost-type final-ghost" aria-hidden="true">
              VIRALGROUND
            </div>

            <div className="final-copy">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="final-brand-mark" src="/viral-ground-logo.png" alt="Viral Ground" />
              <h2 id="final-title">
                Make it<span>Viral.</span>
              </h2>
              <p>
                <span className="copy-line">AI 제품과 잘 맞는 한 편을 찾고 있다면,</span>
                <span className="copy-line">운영팀과 함께 베타부터 시작하세요.</span>
              </p>
              <div className="cta-row">
                <Link
                  className="cta violet"
                  href="/business"
                  onClick={() =>
                    trackEvent("cta_click", { location: "landing_final", target: "business" })
                  }
                >
                  브랜드 베타 문의
                </Link>
                <Link
                  className="cta"
                  href="/creator"
                  onClick={() =>
                    trackEvent("cta_click", { location: "landing_final", target: "creator" })
                  }
                >
                  크리에이터 지원
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 법적 링크·사업자 표기 — 이전에는 메인에만 푸터가 없어 약관·개인정보 링크가 0개였다 */}
      <GroundFooter />
    </div>
  );
}
