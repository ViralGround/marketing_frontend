"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import AlertModal from "@/components/ui/AlertModal";
import ImageUploader from "@/components/ui/ImageUploader";

export interface CampaignFormInitial {
  id?: number;
  title?: string;
  description?: string;
  brandName?: string;
  rewardAmount?: number;
  thumbnailUrl?: string | null;
  requirements?: string | null;
  deadline?: string | null;
  maxParticipants?: number;
}

export default function CampaignForm({
  mode,
  initial,
  onSuccess,
}: {
  mode: "create" | "edit";
  initial?: CampaignFormInitial;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [brandName, setBrandName] = useState(initial?.brandName ?? "");
  const [rewardAmount, setRewardAmount] = useState(
    initial?.rewardAmount?.toString() ?? "30000",
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(initial?.thumbnailUrl ?? null);
  const [thumbnailIntent, setThumbnailIntent] = useState<
    { changed: false } | { changed: true; fileKey: string | null }
  >({ changed: false });
  const [requirements, setRequirements] = useState(initial?.requirements ?? "");
  const [deadline, setDeadline] = useState(
    initial?.deadline ? initial.deadline.slice(0, 10) : "",
  );
  const [maxParticipants, setMaxParticipants] = useState(
    initial?.maxParticipants?.toString() ?? "10",
  );
  const [immediatelyOpen, setImmediatelyOpen] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const reward = Number(rewardAmount);
    const maxP = Number(maxParticipants);

    if (!title.trim()) return setWarning("캠페인 제목을 입력해주세요");
    if (!brandName.trim()) return setWarning("브랜드명을 입력해주세요");
    if (!description.trim()) return setWarning("설명을 입력해주세요");
    if (!Number.isInteger(reward) || reward < 0) {
      return setWarning("보상 금액은 0 이상의 정수여야 합니다");
    }
    if (!Number.isInteger(maxP) || maxP < 1) {
      return setWarning("최대 참여자 수는 1 이상의 정수여야 합니다");
    }

    setLoading(true);

    const payload: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim(),
      brandName: brandName.trim(),
      rewardAmount: reward,
      requirements: requirements.trim() || null,
      deadline: deadline ? `${deadline}T00:00:00` : null,
      maxParticipants: maxP,
    };
    if (mode === "create") {
      payload.thumbnailFileKey = thumbnailIntent.changed ? thumbnailIntent.fileKey : null;
    } else if (thumbnailIntent.changed) {
      payload.thumbnailFileKey = thumbnailIntent.fileKey ?? "";
    }

    try {
      if (mode === "create") {
        payload.immediatelyOpen = immediatelyOpen;
        const { data } = await api.post("/admin/campaigns", payload);
        router.push(`/admin/campaigns/${data.id}`);
      } else if (initial?.id) {
        await api.put(`/admin/campaigns/${initial.id}`, payload);
        if (onSuccess) onSuccess();
        else router.push(`/admin/campaigns/${initial.id}`);
      }
    } catch (err: unknown) {
      const msg =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(msg || "저장에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-content-soft">
          캠페인 제목
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 신제품 바디워시 리뷰 영상"
          className="mt-1 block w-full rounded border border-line-strong px-3 py-2 text-foreground placeholder-faint focus:border-gray-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="brandName" className="block text-sm font-medium text-content-soft">
          브랜드명
        </label>
        <input
          id="brandName"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          placeholder="예: ABC 코스메틱"
          className="mt-1 block w-full rounded border border-line-strong px-3 py-2 text-foreground placeholder-faint focus:border-gray-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-content-soft">
          설명
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="캠페인 상세 설명"
          className="mt-1 block w-full rounded border border-line-strong px-3 py-2 text-foreground placeholder-faint focus:border-gray-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="requirements" className="block text-sm font-medium text-content-soft">
          요구사항/가이드라인 <span className="text-faint">(선택)</span>
        </label>
        <textarea
          id="requirements"
          rows={3}
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="예: 30초 이상 세로형 영상, 얼굴 공개 필요, 지정 해시태그 포함"
          className="mt-1 block w-full rounded border border-line-strong px-3 py-2 text-foreground placeholder-faint focus:border-gray-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="rewardAmount" className="block text-sm font-medium text-content-soft">
            보상 금액 (원)
          </label>
          <input
            id="rewardAmount"
            type="number"
            min={0}
            value={rewardAmount}
            onChange={(e) => setRewardAmount(e.target.value)}
            className="mt-1 block w-full rounded border border-line-strong px-3 py-2 text-foreground focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="maxParticipants" className="block text-sm font-medium text-content-soft">
            최대 참여자 수
          </label>
          <input
            id="maxParticipants"
            type="number"
            min={1}
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)}
            className="mt-1 block w-full rounded border border-line-strong px-3 py-2 text-foreground focus:border-gray-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="deadline" className="block text-sm font-medium text-content-soft">
          마감일 <span className="text-faint">(선택)</span>
        </label>
        <input
          id="deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="mt-1 block w-full rounded border border-line-strong px-3 py-2 text-foreground focus:border-gray-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-content-soft">
          썸네일 <span className="text-faint">(선택)</span>
        </label>
        <ImageUploader
          previewUrl={previewUrl}
          onChange={(fileKey) => {
            setThumbnailIntent({ changed: true, fileKey });
            setPreviewUrl(null);
          }}
        />
      </div>

      {mode === "create" && (
        <div className="rounded border border-line bg-surface-muted p-3">
          <label className="flex items-start gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              checked={immediatelyOpen}
              onChange={(e) => setImmediatelyOpen(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium">바로 모집 시작</span>
              <span className="text-muted"> (예치금 완료 상태로 생성)</span>
            </span>
          </label>
          {!immediatelyOpen && (
            <p className="mt-2 pl-6 text-xs text-amber-700">
              예치금 대기 상태로 생성됩니다. 이후 상세 페이지에서 &quot;예치금 입금완료 처리&quot;를
              눌러야 크리에이터에게 노출됩니다.
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? "저장 중..." : mode === "create" ? "캠페인 생성" : "수정 저장"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded border border-line-strong px-4 py-2 text-sm text-content-soft hover:bg-surface-muted"
        >
          취소
        </button>
      </div>

      <AlertModal
        open={!!warning}
        title="입력값을 확인해주세요"
        message={warning}
        onClose={() => setWarning("")}
      />
    </form>
  );
}
