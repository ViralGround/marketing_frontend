"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import ImageUploader from "@/components/ui/ImageUploader";

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [brandName, setBrandName] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [thumbnailFileKey, setThumbnailFileKey] = useState<string | null>(null);
  const [requirements, setRequirements] = useState("");
  const [deadline, setDeadline] = useState("");

  const totalBudget = useMemo(() => {
    const r = Number(rewardAmount);
    const m = Number(maxParticipants);
    if (!Number.isFinite(r) || !Number.isInteger(m) || r < 0 || m < 1) return 0;
    return r * m;
  }, [rewardAmount, maxParticipants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post<{ id: number }>("/company/campaigns", {
        title,
        description,
        brandName,
        rewardAmount: Number(rewardAmount),
        maxParticipants: Number(maxParticipants),
        thumbnailFileKey,
        requirements: requirements.trim() || null,
        deadline: deadline || null,
      });
      router.push(`/company/campaigns/${data.id}`);
    } catch (err: unknown) {
      const response =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
          : undefined;
      setError(response?.data?.message ?? "캠페인 등록에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "mt-1 block w-full rounded border border-line-strong px-3 py-2 text-foreground placeholder-faint focus:border-gray-500 focus:outline-none";

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">캠페인 등록</h1>
      <p className="mt-1 text-sm text-muted">
        등록 후 예치금을 입금하면 크리에이터에게 공개됩니다.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {error && (
          <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <section className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-content-soft">
              캠페인 제목
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="brandName" className="block text-sm font-medium text-content-soft">
              브랜드명
            </label>
            <input
              id="brandName"
              type="text"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-content-soft">
              캠페인 설명
            </label>
            <textarea
              id="description"
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-content-soft">
              제출 요구사항 <span className="text-faint">(선택)</span>
            </label>
            <textarea
              id="requirements"
              rows={4}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className={inputCls}
              placeholder="예: 제품 노출 3초 이상, 릴스 15초 이상 등"
            />
          </div>
        </section>

        <section className="space-y-4 border-t border-line pt-6">
          <h2 className="text-sm font-semibold text-muted">보상 · 모집</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="rewardAmount" className="block text-sm font-medium text-content-soft">
                1인당 보상 (원)
              </label>
              <input
                id="rewardAmount"
                type="number"
                min={0}
                required
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-content-soft">
                모집 인원
              </label>
              <input
                id="maxParticipants"
                type="number"
                min={1}
                required
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <div className="rounded-lg border border-line bg-surface-muted p-4">
            <p className="text-xs text-muted">예치 필요 금액 (총 예산)</p>
            <p className="mt-1 text-xl font-bold text-foreground">
              {totalBudget.toLocaleString()}원
            </p>
            <p className="mt-2 text-xs text-muted">
              등록 직후 캠페인은 <span className="font-semibold">입금 대기</span> 상태가 되며, 예치금 입금 확인 후 모집이 시작됩니다.
            </p>
          </div>
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-content-soft">
              모집 마감일 <span className="text-faint">(선택)</span>
            </label>
            <input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-content-soft">
              썸네일 <span className="text-faint">(선택)</span>
            </label>
            <ImageUploader
              previewUrl={null}
              onChange={setThumbnailFileKey}
            />
          </div>
        </section>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary py-2.5 font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? "등록 중..." : "캠페인 등록"}
        </button>
      </form>
    </div>
  );
}
