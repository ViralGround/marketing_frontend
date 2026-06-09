"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import ImageCropModal from "@/components/ui/ImageCropModal";
import { useLang } from "@/lib/i18n";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

interface PresignedUpload {
  fileKey: string;
  uploadUrl: string;
  downloadUrl: string;
  expiresAt: string;
}

interface Props {
  previewUrl: string | null;
  onChange: (fileKey: string | null) => void;
  disabled?: boolean;
  /** 지정 시 업로드 전 해당 비율(예: 16/9)로 크롭한다. 미지정 시 원본 그대로 업로드. */
  aspect?: number;
}

export default function ImageUploader({ previewUrl, onChange, disabled, aspect }: Props) {
  const { t } = useLang();
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  useEffect(() => {
    return () => {
      if (cropSrc) URL.revokeObjectURL(cropSrc);
    };
  }, [cropSrc]);

  const display = localPreview ?? previewUrl;

  const validate = (candidate: File): string | null => {
    if (!ALLOWED_TYPES.includes(candidate.type)) {
      return t(
        "지원하지 않는 이미지 형식입니다. jpg, png, webp 파일만 업로드할 수 있어요.",
        "Unsupported image format. Only jpg, png, and webp files can be uploaded.",
      );
    }
    if (candidate.size > MAX_SIZE_BYTES) {
      return t(
        "이미지가 너무 큽니다. 최대 10MB 까지 업로드 가능합니다.",
        "The image is too large. You can upload up to 10MB.",
      );
    }
    return null;
  };

  const putWithProgress = (url: string, payload: Blob) =>
    new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(t(`업로드 실패 (HTTP ${xhr.status})`, `Upload failed (HTTP ${xhr.status})`)));
      };
      xhr.onerror = () =>
        reject(new Error(t("네트워크 오류로 업로드에 실패했습니다", "Upload failed due to a network error")));
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", payload.type);
      xhr.send(payload);
    });

  // 크롭 결과(Blob) 또는 원본(File)을 presign -> PUT 으로 업로드한다.
  // previewObjectUrl 은 업로드 성공 시 미리보기로 채택하고, 실패 시 폐기한다.
  const upload = async (payload: Blob, previewObjectUrl: string) => {
    setError("");
    setLoading(true);
    setProgress(0);
    try {
      const { data } = await api.post<PresignedUpload>("/files/presign-upload/image", {
        contentType: payload.type,
        sizeBytes: payload.size,
      });
      await putWithProgress(data.uploadUrl, payload);

      if (localPreview) URL.revokeObjectURL(localPreview);
      setLocalPreview(previewObjectUrl);
      onChange(data.fileKey);
    } catch (err: unknown) {
      URL.revokeObjectURL(previewObjectUrl);
      const res = (err as { response?: { data?: { message?: string } } }).response;
      const msg =
        res?.data?.message ||
        (err as { message?: string }).message ||
        t("업로드에 실패했습니다", "Upload failed");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (candidate: File | null | undefined) => {
    setError("");
    if (!candidate) return;
    const v = validate(candidate);
    if (v) {
      setError(v);
      return;
    }
    if (aspect) {
      // 크롭 모달로 위임 — 적용 시 webp 로 변환해 업로드한다.
      if (cropSrc) URL.revokeObjectURL(cropSrc);
      setCropSrc(URL.createObjectURL(candidate));
      return;
    }
    void upload(candidate, URL.createObjectURL(candidate));
  };

  const handleCropApply = (blob: Blob) => {
    const src = cropSrc;
    setCropSrc(null);
    if (src) URL.revokeObjectURL(src);
    if (inputRef.current) inputRef.current.value = "";
    void upload(blob, URL.createObjectURL(blob));
  };

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemove = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    onChange(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const ratioLabel =
    !aspect
      ? null
      : Math.abs(aspect - 1) < 0.01
        ? t("정사각형(1:1)", "Square (1:1)")
        : Math.abs(aspect - 16 / 9) < 0.01
          ? "16:9"
          : `${aspect.toFixed(2)} : 1`;
  const hint = ratioLabel
    ? t(
        `jpg, png, webp · 최대 10MB · ${ratioLabel} 로 잘라 업로드`,
        `jpg, png, webp · up to 10MB · cropped to ${ratioLabel}`,
      )
    : t("jpg, png, webp · 최대 10MB", "jpg, png, webp · up to 10MB");

  return (
    <div>
      <div
        onDragOver={(e) => {
          if (disabled || loading) return;
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          if (disabled || loading) return;
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => !disabled && !loading && inputRef.current?.click()}
        className={`relative aspect-video w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition ${
          dragging ? "border-gray-900 bg-surface-muted" : "border-line-strong hover:border-gray-400"
        } ${disabled || loading ? "pointer-events-none opacity-60" : ""}`}
      >
        {display ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={display} alt={t("썸네일 미리보기", "Thumbnail preview")} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition hover:bg-black/30 hover:opacity-100">
              <span className="rounded bg-black/60 px-3 py-1 text-xs text-white">
                {t("다른 이미지로 교체", "Replace with another image")}
              </span>
            </div>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-surface-chip text-center">
            <p className="text-sm text-muted">{t("이미지를 끌어다 놓거나 클릭해서 선택해주세요", "Drag and drop an image or click to select")}</p>
            <p className="mt-1 text-xs text-faint">{hint}</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {loading && (
        <div className="mt-2">
          <div className="mb-1 flex justify-between text-xs text-muted">
            <span>{t("업로드 중", "Uploading")}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded bg-surface-chip">
            <div
              className="h-full bg-gray-900 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {display && !loading && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={disabled}
          className="mt-2 text-xs text-muted hover:text-red-600 disabled:opacity-50"
        >
          {t("썸네일 제거", "Remove thumbnail")}
        </button>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {aspect && cropSrc && (
        <ImageCropModal
          src={cropSrc}
          aspect={aspect}
          onApply={handleCropApply}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
