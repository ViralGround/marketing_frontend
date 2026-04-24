"use client";

import { useRef, useState } from "react";
import api from "@/lib/api";

const ALLOWED_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const MAX_SIZE_BYTES = 500 * 1024 * 1024; // 500MB

interface Props {
  applicationId: number;
  onUploaded: () => void;
  onCancel: () => void;
}

interface PresignedUpload {
  fileKey: string;
  uploadUrl: string;
  downloadUrl: string;
  expiresAt: string;
}

export default function VideoUploader({ applicationId, onUploaded, onCancel }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSet = (candidate: File | null | undefined) => {
    setError("");
    if (!candidate) {
      setFile(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(candidate.type)) {
      setError("지원하지 않는 영상 형식입니다. mp4, mov, webm 파일만 업로드할 수 있어요.");
      return;
    }
    if (candidate.size > MAX_SIZE_BYTES) {
      setError("파일이 너무 큽니다. 최대 500MB 까지 업로드 가능합니다.");
      return;
    }
    setFile(candidate);
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

  const handleSubmit = async () => {
    if (!file) return;
    setError("");
    setLoading(true);
    setProgress(0);
    try {
      const presignRes = await api.post<PresignedUpload>("/files/presign-upload", {
        contentType: file.type,
        sizeBytes: file.size,
      });
      const { fileKey, uploadUrl } = presignRes.data;

      await putWithProgress(uploadUrl, file);

      await api.post(`/me/applications/${applicationId}/submit`, {
        videoFileKey: fileKey,
        videoContentType: file.type,
        videoSizeBytes: file.size,
      });
      onUploaded();
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string } } }).response;
      const msg = res?.data?.message || (err as { message?: string }).message || "업로드에 실패했습니다";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} B`;
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          validateAndSet(e.dataTransfer.files[0]);
        }}
        onClick={() => !loading && inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition ${
          dragging ? "border-gray-900 bg-gray-50" : "border-gray-300 hover:border-gray-400"
        } ${loading ? "pointer-events-none opacity-60" : ""}`}
      >
        {file ? (
          <div>
            <p className="text-sm font-semibold text-gray-900">{file.name}</p>
            <p className="mt-1 text-xs text-gray-500">
              {formatSize(file.size)} · {file.type}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600">영상 파일을 끌어다 놓거나 클릭해서 선택해주세요</p>
            <p className="mt-1 text-xs text-gray-400">mp4, mov, webm · 최대 500MB</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        hidden
        onChange={(e) => validateAndSet(e.target.files?.[0])}
      />

      {loading && (
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-gray-500">
            <span>업로드 중</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded bg-gray-100">
            <div
              className="h-full bg-gray-900 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!file || loading}
          className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? "업로드 중..." : "업로드 후 제출"}
        </button>
      </div>
    </div>
  );
}
