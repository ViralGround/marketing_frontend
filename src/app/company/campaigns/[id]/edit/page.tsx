"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

type CampaignStatus = "DRAFT" | "OPEN" | "CLOSED";
type EscrowStatus =
  | "NONE"
  | "PENDING_DEPOSIT"
  | "DEPOSIT_CONFIRMING"
  | "FUNDED"
  | "PARTIALLY_RELEASED"
  | "REFUNDED";

interface Detail {
  id: number;
  title: string;
  description: string;
  brandName: string;
  rewardAmount: number;
  totalBudget: number;
  maxParticipants: number;
  status: CampaignStatus;
  escrowStatus: EscrowStatus;
  deadline: string | null;
  requirements: string | null;
  thumbnailUrl: string | null;
  applicationCount: number;
}

export default function EditCampaignPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [brandName, setBrandName] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [deadline, setDeadline] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  useEffect(() => {
    if (!id) return;
    api
      .get<Detail>(`/company/campaigns/${id}`)
      .then((res) => {
        const d = res.data;
        setDetail(d);
        setTitle(d.title);
        setBrandName(d.brandName);
        setDescription(d.description);
        setRequirements(d.requirements ?? "");
        setRewardAmount(String(d.rewardAmount));
        setMaxParticipants(String(d.maxParticipants));
        setDeadline(d.deadline ? d.deadline.slice(0, 16) : "");
        setThumbnailUrl(d.thumbnailUrl ?? "");
      })
      .catch(() => setError("캠페인을 불러오지 못했습니다"))
      .finally(() => setLoading(false));
  }, [id]);

  const canEditBudget = useMemo(() => {
    if (!detail) return false;
    return (
      detail.escrowStatus === "PENDING_DEPOSIT" ||
      (detail.escrowStatus === "FUNDED" && detail.applicationCount === 0)
    );
  }, [detail]);

  const readOnly = useMemo(() => {
    if (!detail) return true;
    return (
      detail.escrowStatus === "DEPOSIT_CONFIRMING" ||
      detail.escrowStatus === "REFUNDED" ||
      detail.status === "CLOSED"
    );
  }, [detail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail) return;
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        title,
        brandName,
        description,
        requirements: requirements.trim() || null,
        thumbnailUrl: thumbnailUrl.trim() || null,
        deadline: deadline || null,
      };
      if (canEditBudget) {
        payload.rewardAmount = Number(rewardAmount);
        payload.maxParticipants = Number(maxParticipants);
      }
      await api.patch(`/company/campaigns/${detail.id}`, payload);
      router.push(`/company/campaigns/${detail.id}`);
    } catch (err: unknown) {
      const response =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
          : undefined;
      setError(response?.data?.message ?? "수정에 실패했습니다");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500";

  if (loading) return <p className="text-gray-500">불러오는 중...</p>;
  if (!detail) return <p className="text-red-600">{error || "데이터 없음"}</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">캠페인 수정</h1>
      {readOnly && (
        <div className="mt-4 rounded bg-amber-50 p-3 text-sm text-amber-800">
          현재 상태에서는 수정이 제한됩니다.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {error && (
          <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            캠페인 제목
          </label>
          <input
            id="title"
            type="text"
            required
            disabled={readOnly}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="brandName" className="block text-sm font-medium text-gray-700">
            브랜드명
          </label>
          <input
            id="brandName"
            type="text"
            required
            disabled={readOnly}
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            캠페인 설명
          </label>
          <textarea
            id="description"
            rows={5}
            required
            disabled={readOnly}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
            제출 요구사항 <span className="text-gray-400">(선택)</span>
          </label>
          <textarea
            id="requirements"
            rows={4}
            disabled={readOnly}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            className={inputCls}
          />
        </div>

        <section className="space-y-4 border-t border-gray-200 pt-6">
          <h2 className="text-sm font-semibold text-gray-500">보상 · 모집</h2>
          {!canEditBudget && (
            <p className="text-xs text-amber-700">
              지원자가 있거나 예치 완료 후에는 보상/모집 인원을 수정할 수 없습니다.
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="rewardAmount" className="block text-sm font-medium text-gray-700">
                1인당 보상 (원)
              </label>
              <input
                id="rewardAmount"
                type="number"
                min={0}
                required
                disabled={readOnly || !canEditBudget}
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">
                모집 인원
              </label>
              <input
                id="maxParticipants"
                type="number"
                min={1}
                required
                disabled={readOnly || !canEditBudget}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
              모집 마감일 <span className="text-gray-400">(선택)</span>
            </label>
            <input
              id="deadline"
              type="datetime-local"
              disabled={readOnly}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700">
              썸네일 URL <span className="text-gray-400">(선택)</span>
            </label>
            <input
              id="thumbnailUrl"
              type="url"
              disabled={readOnly}
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className={inputCls}
            />
          </div>
        </section>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || readOnly}
            className="flex-1 rounded-lg bg-primary py-2.5 font-medium text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/company/campaigns/${detail.id}`)}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
