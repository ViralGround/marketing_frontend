"use client";

import { useState } from "react";
import api from "@/lib/api";

interface Props {
  applicationId: number;
  onSubmitted: () => void;
  onCancel: () => void;
}

export default function ReviewForm({ applicationId, onSubmitted, onCancel }: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      await api.post(`/applications/${applicationId}/reviews`, { rating, comment });
      onSubmitted();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        "리뷰 등록에 실패했습니다";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm text-gray-700">평점</label>
      <div className="mt-1 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`h-9 w-9 rounded text-lg transition ${
              n <= rating
                ? "bg-yellow-400 text-white"
                : "border border-gray-300 text-gray-400 hover:bg-gray-50"
            }`}
            aria-label={`${n}점`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 self-center text-sm text-gray-600">{rating}점</span>
      </div>

      <label htmlFor="review-comment" className="mt-4 block text-sm text-gray-700">
        코멘트 (선택)
      </label>
      <textarea
        id="review-comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        placeholder="협업 경험을 간단히 남겨주세요."
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
          {loading ? "등록 중..." : "리뷰 등록"}
        </button>
      </div>
    </div>
  );
}
