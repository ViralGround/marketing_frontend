"use client";

import { useState } from "react";
import api from "@/lib/api";

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

      <label htmlFor="metric-url" className="mt-4 block text-sm text-gray-700">
        게시물 URL (선택, http/https)
      </label>
      <input
        id="metric-url"
        type="url"
        value={externalUrl}
        onChange={(e) => setExternalUrl(e.target.value)}
        placeholder="https://www.instagram.com/p/..."
        className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none"
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

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
          onClick={submit}
          disabled={loading}
          className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? "저장 중..." : "저장"}
        </button>
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
      <label className="block text-sm text-gray-700">{label}</label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none"
      />
    </div>
  );
}
