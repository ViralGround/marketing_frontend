"use client";

import { useEffect, useRef } from "react";

/**
 * 커서에 반응하는 인터랙티브 도트 그리드(canvas).
 * 커서가 가까우면 점들이 밀려났다가 부드럽게 제자리로 돌아온다(lerp). 라이트/다크 색 자동.
 * Stitch(stitch.withgoogle.com) 히어로의 인터랙티브 배경 참고. prefers-reduced-motion 시 정적.
 */
export default function InteractiveDots({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SPACING = 24; // 점 간격(px)
    const DOT_R = 1.3; // 점 반지름
    const RADIUS = 120; // 커서 영향 반경
    const MAX_PUSH = 20; // 최대 밀림(px)
    const EASE = 0.12; // 복원/추종 속도

    let dots: { ox: number; oy: number; x: number; y: number }[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    const mouse = { x: -9999, y: -9999 };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      if (w === 0 || h === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      for (let y = SPACING / 2; y < h; y += SPACING) {
        for (let x = SPACING / 2; x < w; x += SPACING) {
          dots.push({ ox: x, oy: y, x, y });
        }
      }
    };

    const paint = () => {
      ctx.clearRect(0, 0, w, h);
      const dark = document.documentElement.classList.contains("dark");
      ctx.fillStyle = dark ? "rgba(150,130,235,0.42)" : "rgba(146,130,222,0.60)";
      ctx.beginPath();
      for (const d of dots) {
        const dx = d.ox - mouse.x;
        const dy = d.oy - mouse.y;
        const dist = Math.hypot(dx, dy) || 1;
        let tx = d.ox;
        let ty = d.oy;
        if (dist < RADIUS) {
          const push = (1 - dist / RADIUS) * MAX_PUSH;
          tx = d.ox + (dx / dist) * push;
          ty = d.oy + (dy / dist) * push;
        }
        d.x += (tx - d.x) * EASE;
        d.y += (ty - d.y) * EASE;
        ctx.moveTo(d.x + DOT_R, d.y);
        ctx.arc(d.x, d.y, DOT_R, 0, Math.PI * 2);
      }
      ctx.fill();
      raf = requestAnimationFrame(paint);
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    build();
    const ro = new ResizeObserver(() => build());
    ro.observe(canvas);

    if (reduced) {
      paintStatic();
    } else {
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseout", onLeave);
      raf = requestAnimationFrame(paint);
    }

    function paintStatic() {
      ctx.clearRect(0, 0, w, h);
      const dark = document.documentElement.classList.contains("dark");
      ctx.fillStyle = dark ? "rgba(150,130,235,0.42)" : "rgba(146,130,222,0.60)";
      ctx.beginPath();
      for (const d of dots) {
        ctx.moveTo(d.ox + DOT_R, d.oy);
        ctx.arc(d.ox, d.oy, DOT_R, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
