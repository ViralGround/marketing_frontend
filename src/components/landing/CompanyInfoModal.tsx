"use client";

import { useEffect, useState } from "react";
import { X, Building2, Globe, Tag } from "lucide-react";
import api from "@/lib/api";
import type { CompanyPublic } from "@/types/landing";

interface Props {
  open: boolean;
  /** null 이면 회사 프로필이 없는 캠페인 — 브랜드명만 표시하고 조회는 생략. */
  companyMemberId: number | null;
  fallbackBrandName: string;
  onClose: () => void;
}

function rewardText(amount: number): string {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

function deadlineText(deadline: string | null): string {
  if (!deadline) return "상시모집";
  const end = new Date(deadline);
  end.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "D-day";
  return `D-${days}`;
}

export default function CompanyInfoModal({
  open,
  companyMemberId,
  fallbackBrandName,
  onClose,
}: Props) {
  const [company, setCompany] = useState<CompanyPublic | null>(null);
  // 모달은 key 로 리마운트되므로 mount 시점의 companyMemberId 로 초기 로딩 여부를 정한다.
  // (프로필 없는 캠페인은 조회를 건너뛰므로 처음부터 loading=false)
  const [loading, setLoading] = useState(companyMemberId != null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    // 회사 프로필이 없는 캠페인(companyMemberId=null)은 조회하지 않고 브랜드명만 표시.
    // 모달은 호출부에서 key 로 리마운트되므로 초기 state(company=null)가 그대로 fallback 이 된다.
    if (!open || companyMemberId == null) return;
    api
      .get(`/landing/companies/${companyMemberId}`)
      .then((res) => setCompany(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [open, companyMemberId]);

  if (!open) return null;

  const title = company?.companyName ?? fallbackBrandName;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
              {company?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={company.logoUrl}
                  alt={`${title} 로고`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 className="h-5 w-5" strokeWidth={2} />
              )}
            </div>
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-full p-1.5 text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-muted">불러오는 중...</p>
        ) : error ? (
          <p className="mt-6 text-sm text-muted">회사 정보를 불러오지 못했습니다.</p>
        ) : (
          <div className="mt-5 space-y-4">
            {/* 회사 소개글 */}
            {company?.introduction && (
              <p className="text-sm leading-relaxed text-content-soft whitespace-pre-line">
                {company.introduction}
              </p>
            )}

            {/* 회사 메타 (산업·홈페이지) */}
            {(company?.industry || company?.homepage) && (
              <div className="space-y-2">
                {company?.industry && (
                  <div className="flex items-center gap-2 text-sm text-content-soft">
                    <Tag className="h-4 w-4 flex-shrink-0 text-muted" strokeWidth={2} />
                    <span>{company.industry}</span>
                  </div>
                )}
                {company?.homepage && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 flex-shrink-0 text-muted" strokeWidth={2} />
                    <a
                      href={company.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate font-medium text-primary hover:underline"
                    >
                      {company.homepage}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* 진행 중 캠페인 */}
            <div>
              <p className="text-sm font-semibold text-foreground">진행 중인 캠페인</p>
              {company && company.openCampaigns.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {company.openCampaigns.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-muted px-4 py-3"
                    >
                      <span className="truncate text-sm font-medium text-foreground">{c.title}</span>
                      <span className="flex flex-shrink-0 items-center gap-2 text-xs">
                        <span className="font-semibold text-primary">{rewardText(c.rewardAmount)}</span>
                        <span className="text-muted">{deadlineText(c.deadline)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted">현재 진행 중인 캠페인이 없습니다.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
