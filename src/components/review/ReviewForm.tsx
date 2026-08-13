"use client";

import { useState } from "react";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import { useLang } from "@/lib/i18n";


interface Props {
  applicationId: number;
  onSubmitted: () => void;
  onCancel: () => void;
}

export default function ReviewForm({ applicationId, onSubmitted, onCancel }: Props) {
  const { t } = useLang();
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
        t("리뷰 등록에 실패했습니다", "Failed to submit the review");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-content-soft">{t("평점", "Rating")}</label>
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
            aria-label={t(`${n}점`, `${n} stars`)}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-sm font-medium text-muted">{t(`${rating}점`, `${rating} stars`)}</span>
      </div>

      <label
        htmlFor="review-comment"
        className="mt-5 block text-sm font-medium text-content-soft"
      >
        {t("코멘트", "Comment")} <span className="text-faint">{t("(선택)", "(optional)")}</span>
      </label>
      <Textarea
        id="review-comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        placeholder={t("협업 경험을 간단히 남겨주세요.", "Briefly share your collaboration experience.")}
        className="mt-1.5"
      />

      {error && <p className="mt-3 text-sm text-error">{error}</p>}

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
          {t("취소", "Cancel")}
        </Button>
        <Button size="sm" onClick={submit} disabled={loading}>
          {loading ? t("등록 중...", "Submitting...") : t("리뷰 등록", "Submit review")}
        </Button>
      </div>
    </div>
  );
}
