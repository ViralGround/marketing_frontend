"use client";

import { useState } from "react";
import api from "@/lib/api";
import Button from "@/components/ui/Button";

const TEXTAREA_CLASS =
  "block w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-foreground placeholder-faint transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

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
      <label className="block text-sm font-medium text-content-soft">평점</label>
      <div className="mt-1.5 flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`h-10 w-10 rounded-lg text-xl transition-colors ${
              n <= rating
                ? "bg-warning text-white"
                : "border border-line-strong text-faint hover:border-primary/40"
            }`}
            aria-label={`${n}점`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-sm font-medium text-muted">{rating}점</span>
      </div>

      <label
        htmlFor="review-comment"
        className="mt-5 block text-sm font-medium text-content-soft"
      >
        코멘트 <span className="text-faint">(선택)</span>
      </label>
      <textarea
        id="review-comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        placeholder="협업 경험을 간단히 남겨주세요."
        className={`${TEXTAREA_CLASS} mt-1.5`}
      />

      {error && <p className="mt-3 text-sm text-error">{error}</p>}

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
          취소
        </Button>
        <Button size="sm" onClick={submit} disabled={loading}>
          {loading ? "등록 중..." : "리뷰 등록"}
        </Button>
      </div>
    </div>
  );
}
