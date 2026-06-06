// 캠페인 썸네일 등 고정 비율 이미지 크롭을 위한 계산·렌더 유틸.
// 크롭 프레임(뷰포트) + 확대/이동 상태를 원본 픽셀 크롭 영역으로 환산하고,
// 그 영역을 지정 비율의 webp 로 렌더한다. 좌표 계산은 순수 함수로 분리해
// 캔버스(DOM) 의존은 renderCropToWebp 한 곳뿐이다.

export interface CropRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

/** 크롭 출력 가로 상한. 이보다 큰 영역은 이 폭으로 리샘플한다. */
export const MAX_OUTPUT_WIDTH = 1600;

/** 이미지를 뷰포트에 cover 시키는 최소 배율. 이 배율부터 zoom(>=1) 을 곱한다. */
export function coverBaseScale(natW: number, natH: number, vW: number, vH: number): number {
  return Math.max(vW / natW, vH / natH);
}

/**
 * 이미지가 항상 뷰포트를 덮도록 이동 오프셋을 제한한다.
 * 표시 이미지 크기 기준으로 [viewport - display, 0] 범위로 clamp.
 */
export function clampOffset(offset: number, displaySize: number, viewportSize: number): number {
  const min = viewportSize - displaySize; // 0 이하
  if (offset > 0) return 0;
  if (offset < min) return min;
  return offset;
}

/**
 * 뷰포트에 보이는 영역(0..vW, 0..vH)을 원본 픽셀 좌표의 크롭 영역으로 역변환.
 * scale 은 (원본 -> 표시) 배율 = coverBaseScale * zoom,
 * (ox, oy) 는 뷰포트 좌상단 기준 이미지 좌상단 위치(px, 보통 0 이하).
 */
export function viewportToCropRect(
  scale: number,
  ox: number,
  oy: number,
  vW: number,
  vH: number,
): CropRect {
  return {
    sx: -ox / scale,
    sy: -oy / scale,
    sw: vW / scale,
    sh: vH / scale,
  };
}

/** 크롭 영역 너비를 상한으로 클램프해 업스케일을 막은 출력 해상도(비율 aspect 고정). */
export function outputSize(
  cropWidth: number,
  aspect: number,
  maxWidth: number = MAX_OUTPUT_WIDTH,
): { width: number; height: number } {
  const width = Math.max(1, Math.round(Math.min(maxWidth, cropWidth)));
  const height = Math.max(1, Math.round(width / aspect));
  return { width, height };
}

/** 크롭 영역을 지정 크기의 webp Blob 으로 렌더. (캔버스 의존) */
export async function renderCropToWebp(
  image: HTMLImageElement,
  crop: CropRect,
  outWidth: number,
  outHeight: number,
  quality = 0.85,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = outWidth;
  canvas.height = outHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("이미지를 처리할 수 없습니다 (canvas 미지원)");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, outWidth, outHeight);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("이미지 변환에 실패했습니다"))),
      "image/webp",
      quality,
    );
  });
}
