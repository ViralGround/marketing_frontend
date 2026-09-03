"use client";

import { useRef, useState } from "react";
import { Play, Eye, Heart } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLang } from "@/lib/i18n";

/**
 * 결과 쇼케이스 — 실제 크리에이터 릴스(#results, "See Results" 도착점).
 * 영상은 mp4 를 받아 public/reels 에서 직접 재생(인스타 chrome 없이 사이트 내 인라인 재생).
 * 썸네일(poster)·mp4 는 public/reels 에 저장. likes 는 공개 스냅샷, views 는 사용자 제공 값.
 */
type Reel = { code: string; handle: string; viewsKo: string; viewsEn: string; likes: string };

const REELS: Reel[] = [
  { code: "DVpoahthmdk", handle: "min.__.ai", viewsKo: "485.4만", viewsEn: "4.9M", likes: "91,400" },
  { code: "DXhE_vZkorg", handle: "woong2.study", viewsKo: "33.3만", viewsEn: "333K", likes: "2,494" },
];

function ReelCard({ reel, t }: { reel: Reel; t: (ko: string, en: string) => string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    setPlaying(true);
    videoRef.current?.play();
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[9/16] bg-black">
        <video
          ref={videoRef}
          src={`/reels/${reel.code}.mp4`}
          poster={`/reels/${reel.code}.jpg`}
          className="h-full w-full object-cover"
          playsInline
          preload="none"
          controls={playing}
          onPlay={() => setPlaying(true)}
          onEnded={() => setPlaying(false)}
        />
        {/* 기본 상태: 커버 + 커스텀 재생 버튼. 클릭 시 인라인 재생(인스타 이동 없음). */}
        {!playing && (
          <button
            type="button"
            onClick={play}
            aria-label={t("영상 재생", "Play video")}
            className="group absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/10"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform duration-300 group-hover:scale-110">
              <Play className="h-6 w-6 translate-x-0.5 text-primary" fill="currentColor" />
            </span>
          </button>
        )}
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-foreground">@{reel.handle}</span>
          <a
            href={`https://www.instagram.com/${reel.handle}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full border border-line-strong px-3 py-1.5 text-xs font-medium text-content-soft transition-colors hover:border-primary/40 hover:text-primary"
          >
            {t("프로필 보기", "View profile")}
          </a>
        </div>
        <div className="mt-2.5 flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5" title={t("조회수", "Views")}>
            <Eye className="h-4 w-4 text-primary" strokeWidth={2.2} />
            <span className="font-semibold text-foreground">{t(reel.viewsKo, reel.viewsEn)}</span>
          </span>
          <span className="flex items-center gap-1.5" title={t("좋아요", "Likes")}>
            <Heart className="h-4 w-4 text-primary" strokeWidth={2.2} fill="currentColor" />
            <span className="font-semibold text-foreground">{reel.likes}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ResultsShowcaseSection() {
  const ref = useScrollAnimation<HTMLDivElement>();
  const { t } = useLang();

  return (
    <section id="results" className="scroll-mt-20 bg-background py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
          {t("실제 크리에이터들의 성과", "Real results from our creators")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted">
          {t(
            "팔로워 없이 시작해 조회수로 증명한 실제 릴스예요.",
            "Real reels from creators who started with no followers and let the views speak.",
          )}
        </p>

        <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
          {REELS.map((r) => (
            <ReelCard key={r.code} reel={r} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
