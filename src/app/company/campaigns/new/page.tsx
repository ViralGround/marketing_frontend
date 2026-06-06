"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ImageUploader from "@/components/ui/ImageUploader";
import Input from "@/components/ui/Input";

const TEXTAREA_CLASS =
  "block w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-foreground placeholder-faint transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

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

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        캠페인 등록
      </h1>
      <p className="mt-2 text-sm text-muted">
        등록 후 예치금을 입금하면 크리에이터에게 공개됩니다.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="rounded-xl border border-error/30 bg-error/5 p-3 text-sm text-error">
            {error}
          </div>
        )}

        <section className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-content-soft">
              캠페인 제목
            </label>
            <Input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <label htmlFor="brandName" className="block text-sm font-medium text-content-soft">
              브랜드명
            </label>
            <Input
              id="brandName"
              type="text"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="mt-1.5"
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
              className={`${TEXTAREA_CLASS} mt-1.5`}
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
              className={`${TEXTAREA_CLASS} mt-1.5`}
              placeholder="예: 제품 노출 3초 이상, 릴스 15초 이상 등"
            />
          </div>
        </section>

        <section className="space-y-5 border-t border-line pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            보상 · 모집
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="rewardAmount"
                className="block text-sm font-medium text-content-soft"
              >
                1인당 보상 (원)
              </label>
              <Input
                id="rewardAmount"
                type="number"
                min={0}
                required
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <label
                htmlFor="maxParticipants"
                className="block text-sm font-medium text-content-soft"
              >
                모집 인원
              </label>
              <Input
                id="maxParticipants"
                type="number"
                min={1}
                required
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
          <Card className="bg-surface-muted p-5">
            <p className="text-xs font-medium text-muted">예치 필요 금액 (총 예산)</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {totalBudget.toLocaleString()}원
            </p>
            <p className="mt-2 text-xs text-muted">
              등록 직후 캠페인은 <span className="font-semibold text-warning">입금 대기</span>{" "}
              상태가 되며, 예치금 입금 확인 후 모집이 시작됩니다.
            </p>
          </Card>
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-content-soft">
              모집 마감일 <span className="text-faint">(선택)</span>
            </label>
            <Input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-content-soft">
              썸네일 <span className="text-faint">(선택)</span>
            </label>
            <ImageUploader previewUrl={null} onChange={setThumbnailFileKey} aspect={16 / 9} />
          </div>
        </section>

        <Button type="submit" disabled={loading} fullWidth>
          {loading ? "등록 중..." : "캠페인 등록"}
        </Button>
      </form>
    </div>
  );
}
