"use client";

import { useEffect, useRef, useState } from "react";
import {
  clampOffset,
  coverBaseScale,
  MAX_OUTPUT_WIDTH,
  outputSize,
  renderCropToWebp,
  viewportToCropRect,
} from "@/lib/image";

const MIN_SOURCE_WIDTH = 800;
const MAX_ZOOM = 3;

interface Props {
  /** 크롭할 원본 이미지의 ObjectURL */
  src: string;
  /** 출력 비율 (예: 16/9) */
  aspect: number;
  onApply: (blob: Blob) => void;
  onCancel: () => void;
}

/**
 * 고정 비율 크롭 모달. 이미지를 프레임에 cover 로 채우고, 드래그(이동)와
 * 슬라이더(확대)로 노출 영역을 정한 뒤 webp 로 잘라 onApply 한다.
 */
export default function ImageCropModal({ src, aspect, onApply, onCancel }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const drag = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);

  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [frame, setFrame] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // 프레임 실제 가로폭 측정(반응형). 높이는 비율로 고정.
  useEffect(() => {
    const measure = () => {
      const el = frameRef.current;
      if (!el) return;
      const w = el.clientWidth;
      setFrame({ w, h: w / aspect });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [aspect]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const base = nat && frame.w ? coverBaseScale(nat.w, nat.h, frame.w, frame.h) : 0;
  const scale = base * zoom;
  const dispW = nat ? nat.w * scale : 0;
  const dispH = nat ? nat.h * scale : 0;
  // 표시·적용 모두 아래 파생 clamp 값을 쓰므로 zoom/리사이즈로 범위가 바뀌어도
  // 별도 정규화 없이 항상 cover 범위 안에 머문다. (offset state 는 raw 로 보관)
  const x = clampOffset(offset.x, dispW, frame.w);
  const y = clampOffset(offset.y, dispH, frame.h);

  const onImgLoad = () => {
    const el = imgRef.current;
    if (!el) return;
    setNat({ w: el.naturalWidth, h: el.naturalHeight });
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, ox: x, oy: y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    setOffset({
      x: clampOffset(drag.current.ox + dx, dispW, frame.w),
      y: clampOffset(drag.current.oy + dy, dispH, frame.h),
    });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    drag.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* capture 미보유 시 무시 */
    }
  };

  const apply = async () => {
    const el = imgRef.current;
    if (!el || !nat || !frame.w) return;
    setBusy(true);
    setErr("");
    try {
      const crop = viewportToCropRect(scale, x, y, frame.w, frame.h);
      const out = outputSize(crop.sw, aspect, MAX_OUTPUT_WIDTH);
      const blob = await renderCropToWebp(el, crop, out.width, out.height);
      onApply(blob);
    } catch (e) {
      setErr((e as Error).message || "이미지 처리에 실패했습니다");
      setBusy(false);
    }
  };

  const lowRes = nat ? nat.w < MIN_SOURCE_WIDTH : false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-xl bg-surface p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-1 text-base font-semibold text-foreground">썸네일 영역 선택</h3>
        <p className="mb-3 text-xs text-muted">
          드래그로 위치를 옮기고, 슬라이더로 확대해 노출할 16:9 영역을 맞춰주세요.
        </p>

        <div
          ref={frameRef}
          className="relative w-full touch-none select-none overflow-hidden rounded-lg bg-black/80"
          style={{ height: frame.h || undefined, aspectRatio: frame.h ? undefined : String(aspect) }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={src}
            alt="크롭할 이미지"
            onLoad={onImgLoad}
            draggable={false}
            className="absolute max-w-none cursor-move"
            style={{ width: dispW || undefined, height: dispH || undefined, left: x, top: y }}
          />
          <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-white/30" />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-muted">확대</span>
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            disabled={!nat}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1"
          />
        </div>

        {lowRes && (
          <p className="mt-2 text-xs text-amber-600">
            원본 해상도가 낮아 확대 시 흐릿할 수 있어요. 가로 {MIN_SOURCE_WIDTH}px 이상 이미지를 권장합니다.
          </p>
        )}
        {err && <p className="mt-2 text-xs text-red-600">{err}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded px-4 py-2 text-sm text-content-soft hover:bg-surface-muted disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={apply}
            disabled={busy || !nat}
            className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {busy ? "처리 중…" : "적용"}
          </button>
        </div>
      </div>
    </div>
  );
}
