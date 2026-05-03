"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";

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
}

export default function ImageUploader({ previewUrl, onChange, disabled }: Props) {
  const [localPreview, setLocalPreview] = useState<string | null>(null);
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

  const display = localPreview ?? previewUrl;

  const validate = (candidate: File): string | null => {
    if (!ALLOWED_TYPES.includes(candidate.type)) {
      return "지원하지 않는 이미지 형식입니다. jpg, png, webp 파일만 업로드할 수 있어요.";
    }
    if (candidate.size > MAX_SIZE_BYTES) {
      return "이미지가 너무 큽니다. 최대 10MB 까지 업로드 가능합니다.";
    }
    return null;
  };

  const putWithProgress = (url: string, payload: File) =>
    new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`업로드 실패 (HTTP ${xhr.status})`));
      };
      xhr.onerror = () => reject(new Error("네트워크 오류로 업로드에 실패했습니다"));
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", payload.type);
      xhr.send(payload);
    });

  const handleFile = async (candidate: File | null | undefined) => {
    setError("");
    if (!candidate) return;
    const v = validate(candidate);
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    setProgress(0);
    try {
      const { data } = await api.post<PresignedUpload>("/files/presign-upload/image", {
        contentType: candidate.type,
        sizeBytes: candidate.size,
      });
      await putWithProgress(data.uploadUrl, candidate);

      if (localPreview) URL.revokeObjectURL(localPreview);
      setLocalPreview(URL.createObjectURL(candidate));
      onChange(data.fileKey);
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string } } }).response;
      const msg = res?.data?.message || (err as { message?: string }).message || "업로드에 실패했습니다";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    onChange(null);
    setError("");
  };

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
            <img src={display} alt="썸네일 미리보기" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition hover:bg-black/30 hover:opacity-100">
              <span className="rounded bg-black/60 px-3 py-1 text-xs text-white">
                다른 이미지로 교체
              </span>
            </div>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-surface-chip text-center">
            <p className="text-sm text-muted">이미지를 끌어다 놓거나 클릭해서 선택해주세요</p>
            <p className="mt-1 text-xs text-faint">jpg, png, webp · 최대 10MB · 16:9 권장</p>
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
            <span>업로드 중</span>
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
          썸네일 제거
        </button>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
