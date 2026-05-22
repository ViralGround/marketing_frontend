"use client";

import { useRef, useState } from "react";
import api from "@/lib/api";
import Button from "@/components/ui/Button";

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
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging
            ? "border-primary bg-primary-bg"
            : "border-line-strong hover:border-primary/40 hover:bg-surface-muted"
        } ${loading ? "pointer-events-none opacity-60" : ""}`}
      >
        {file ? (
          <div>
            <p className="text-sm font-semibold text-foreground">{file.name}</p>
            <p className="mt-1 text-xs text-muted">
              {formatSize(file.size)} · {file.type}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted">영상 파일을 끌어다 놓거나 클릭해서 선택해주세요</p>
            <p className="mt-1 text-xs text-faint">mp4, mov, webm · 최대 500MB</p>
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
          <div className="mb-1.5 flex justify-between text-xs font-medium text-muted">
            <span>업로드 중</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-chip">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-error">{error}</p>}

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
          취소
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={!file || loading}>
          {loading ? "업로드 중..." : "업로드 후 제출"}
        </Button>
      </div>
    </div>
  );
}
