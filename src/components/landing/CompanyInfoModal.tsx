"use client";

import { useEffect, useState } from "react";
import {
  X,
  Building2,
  Globe,
  Tag,
  Coins,
  Users,
  UserCheck,
  CalendarClock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import api from "@/lib/api";
import type { CompanyPublic, FeaturedCampaign } from "@/types/landing";

interface Props {
  open: boolean;
  /** 클릭한 대표 캠페인. null 이면 모달 미표시. */
  campaign: FeaturedCampaign | null;
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

function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2 text-sm text-muted">
        <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

export default function CompanyInfoModal({ open, campaign, onClose }: Props) {
  const companyMemberId = campaign?.companyMemberId ?? null;
  const [company, setCompany] = useState<CompanyPublic | null>(null);
  // 모달은 key 로 리마운트되므로 mount 시점의 companyMemberId 로 초기 로딩 여부를 정한다.
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
    // 회원 기업이면 공개 프로필(소개·로고·진행 캠페인)을 조회. admin 직접 생성 캠페인은 생략.
    if (!open || companyMemberId == null) return;
    api
      .get(`/landing/companies/${companyMemberId}`)
      .then((res) => setCompany(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [open, companyMemberId]);

  if (!open || !campaign) return null;

  const title = company?.companyName ?? campaign.brandName;
  // 회원 기업이면 조회 결과를, admin 직접 생성 캠페인이면 캠페인의 브랜드 정보를 쓴다.
  const logoUrl = company?.logoUrl ?? campaign.logoUrl;
  const introduction = company?.introduction ?? campaign.brandIntroduction;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 썸네일 배너 + 로고 오버랩 + 닫기 */}
        <div className="relative">
          <div className="aspect-video w-full overflow-hidden rounded-t-2xl bg-surface-chip">
            {campaign.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={campaign.thumbnailUrl}
                alt={`${title} 썸네일`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-faint">
                이미지 없음
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute right-3 top-3 rounded-full bg-black/40 p-1.5 text-white transition-colors hover:bg-black/60"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
          <div className="absolute -bottom-9 left-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-primary/10 text-primary">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={`${title} 로고`} className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-8 w-8" strokeWidth={2} />
            )}
          </div>
        </div>

        {/* 본문 */}
        <div className="px-7 pb-8 pt-14">
          <h2 className="mt-1 text-2xl font-bold text-foreground">{title}</h2>

          {loading ? (
            <p className="mt-6 text-sm text-muted">불러오는 중...</p>
          ) : error ? (
            <p className="mt-6 text-sm text-muted">회사 정보를 불러오지 못했습니다.</p>
          ) : (
            <>
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                {/* 왼쪽: 회사 소개 */}
                <div className="space-y-5 md:col-span-2">
                  {introduction ? (
                    <div>
                      <h3 className="mb-2 text-base font-semibold text-foreground">회사 소개</h3>
                      <p className="text-sm leading-relaxed text-content-soft whitespace-pre-line">
                        {introduction}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted">등록된 회사 소개가 없습니다.</p>
                  )}

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
                </div>

                {/* 오른쪽: 캠페인 정보 */}
                <div>
                  <h3 className="mb-2 text-base font-semibold text-foreground">캠페인 정보</h3>
                  <div className="space-y-3 rounded-xl border border-line bg-surface-muted p-4">
                    <InfoRow icon={Coins} label="기본급" value={rewardText(campaign.rewardAmount)} />
                    <InfoRow icon={Users} label="모집 인원" value={`${campaign.maxParticipants}명`} />
                    <InfoRow
                      icon={UserCheck}
                      label="현재 지원"
                      value={`${campaign.applicationCount}명`}
                    />
                    <InfoRow
                      icon={CalendarClock}
                      label="남은 기간"
                      value={deadlineText(campaign.deadline)}
                    />
                  </div>
                </div>
              </div>

              {/* 진행 중 캠페인 (회원 기업 회사만 — admin 직접 생성 캠페인은 생략) */}
              {company && (
                <div className="mt-6">
                  <h3 className="mb-2 text-base font-semibold text-foreground">진행 중인 캠페인</h3>
                  {company.openCampaigns.length > 0 ? (
                    <ul className="space-y-2">
                      {company.openCampaigns.map((c) => (
                        <li
                          key={c.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-muted px-4 py-3"
                        >
                          <span className="truncate text-sm font-medium text-foreground">
                            {c.title}
                          </span>
                          <span className="flex flex-shrink-0 items-center gap-2 text-xs">
                            <span className="font-semibold text-primary">
                              {rewardText(c.rewardAmount)}
                            </span>
                            <span className="text-muted">{deadlineText(c.deadline)}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted">현재 진행 중인 캠페인이 없습니다.</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
