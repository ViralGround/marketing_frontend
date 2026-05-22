"use client";

import { useState } from "react";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Props {
  applicationId: number;
  initial?: {
    views: number;
    likes: number;
    comments: number;
    externalUrl: string | null;
  };
  onSaved: () => void;
  onCancel: () => void;
}

export default function MetricForm({ applicationId, initial, onSaved, onCancel }: Props) {
  const [views, setViews] = useState(initial?.views ?? 0);
  const [likes, setLikes] = useState(initial?.likes ?? 0);
  const [comments, setComments] = useState(initial?.comments ?? 0);
  const [externalUrl, setExternalUrl] = useState(initial?.externalUrl ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      await api.put(`/me/applications/${applicationId}/metrics`, {
        views,
        likes,
        comments,
        externalUrl: externalUrl.trim() || null,
      });
      onSaved();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        "저장에 실패했습니다";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <NumberField label="조회수" value={views} onChange={setViews} />
        <NumberField label="좋아요" value={likes} onChange={setLikes} />
        <NumberField label="댓글" value={comments} onChange={setComments} />
      </div>

      <label
        htmlFor="metric-url"
        className="mt-5 block text-sm font-medium text-content-soft"
      >
        게시물 URL <span className="text-faint">(선택, http/https)</span>
      </label>
      <Input
        id="metric-url"
        type="url"
        value={externalUrl}
        onChange={(e) => setExternalUrl(e.target.value)}
        placeholder="https://www.instagram.com/p/..."
        className="mt-1.5"
      />

      {error && <p className="mt-3 text-sm text-error">{error}</p>}

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
          취소
        </Button>
        <Button size="sm" onClick={submit} disabled={loading}>
          {loading ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-content-soft">{label}</label>
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="mt-1.5"
      />
    </div>
  );
}
