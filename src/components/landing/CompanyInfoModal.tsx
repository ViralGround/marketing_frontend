"use client";

import { useEffect, useId, useState } from "react";
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
import { useLang } from "@/lib/i18n";
import type { CompanyPublic, FeaturedCampaign } from "@/types/landing";
import { useDialogA11y } from "@/hooks/useDialogA11y";

interface Props {
  open: boolean;
  /** 클릭한 대표 캠페인. null 이면 모달 미표시. */
  campaign: FeaturedCampaign | null;
  onClose: () => void;
}

function rewardText(amount: number): string {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

function safePublicUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function deadlineText(deadline: string | null, t: (ko: string, en: string) => string): string {
  if (!deadline) return t("상시모집", "Always open");
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
      <span className="text-sm font-semibold text-foreground tabular-nums">{value}</span>
    </div>
  );
}

export default function CompanyInfoModal({ open, campaign, onClose }: Props) {
  const { t } = useLang();
  const titleId = useId();
  const dialogRef = useDialogA11y<HTMLDivElement>(open, onClose);
  const companyMemberId = campaign?.companyMemberId ?? null;
  const [company, setCompany] = useState<CompanyPublic | null>(null);
  // 모달은 key 로 리마운트되므로 mount 시점의 companyMemberId 로 초기 로딩 여부를 정한다.
  const [loading, setLoading] = useState(companyMemberId != null);
  const [error, setError] = useState(false);

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
  const homepage = safePublicUrl(company?.homepage);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
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
                alt={`${title} ${t("썸네일", "thumbnail")}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-faint">
                {t("이미지 없음", "No image")}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("닫기", "Close")}
            className="absolute right-3 top-3 rounded-full bg-black/40 p-1.5 text-white transition-colors hover:bg-black/60"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
          <div className="absolute -bottom-9 left-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-primary/10 text-primary">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={`${title} ${t("로고", "logo")}`} className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-8 w-8" strokeWidth={2} />
            )}
          </div>
        </div>

        {/* 본문 */}
        <div className="px-7 pb-8 pt-14">
          <h2 id={titleId} className="mt-1 text-2xl font-bold text-foreground">{title}</h2>

          {loading ? (
            <p className="mt-6 text-sm text-muted">{t("불러오는 중...", "Loading...")}</p>
          ) : error ? (
            <p role="alert" className="mt-6 text-sm text-error">
              {t("회사 정보를 불러오지 못했습니다.", "Couldn't load company info.")}
            </p>
          ) : (
            <>
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                {/* 왼쪽: 회사 소개 */}
                <div className="space-y-5 md:col-span-2">
                  {introduction ? (
                    <div>
                      <h3 className="mb-2 text-base font-semibold text-foreground">
                        {t("회사 소개", "About the company")}
                      </h3>
                      <p className="text-sm leading-relaxed text-content-soft whitespace-pre-line">
                        {introduction}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted">
                      {t("등록된 회사 소개가 없습니다.", "No company introduction yet.")}
                    </p>
                  )}

                  {(company?.industry || homepage) && (
                    <div className="space-y-2">
                      {company?.industry && (
                        <div className="flex items-center gap-2 text-sm text-content-soft">
                          <Tag className="h-4 w-4 flex-shrink-0 text-muted" strokeWidth={2} />
                          <span>{company.industry}</span>
                        </div>
                      )}
                      {homepage && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-4 w-4 flex-shrink-0 text-muted" strokeWidth={2} />
                          <a
                            href={homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate font-medium text-primary hover:underline"
                          >
                            {homepage}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 오른쪽: 캠페인 정보 — 모달(카드) 안의 카드 대신 룰드 행 (nested-cards 해소) */}
                <div>
                  <h3 className="mb-2 text-base font-semibold text-foreground">
                    {t("캠페인 정보", "Campaign info")}
                  </h3>
                  <div className="divide-y divide-line border-y border-line [&>div]:py-2.5">
                    <InfoRow
                      icon={Coins}
                      label={t("기본급", "Base pay")}
                      value={rewardText(campaign.rewardAmount)}
                    />
                    <InfoRow
                      icon={Users}
                      label={t("모집 인원", "Slots")}
                      value={t(`${campaign.maxParticipants}명`, `${campaign.maxParticipants}`)}
                    />
                    <InfoRow
                      icon={UserCheck}
                      label={t("현재 지원", "Applied")}
                      value={t(`${campaign.applicationCount}명`, `${campaign.applicationCount}`)}
                    />
                    <InfoRow
                      icon={CalendarClock}
                      label={t("남은 기간", "Time left")}
                      value={deadlineText(campaign.deadline, t)}
                    />
                  </div>
                </div>
              </div>

              {/* 진행 중 캠페인 (회원 기업 회사만 — admin 직접 생성 캠페인은 생략) */}
              {company && (
                <div className="mt-6">
                  <h3 className="mb-2 text-base font-semibold text-foreground">
                    {t("진행 중인 캠페인", "Active campaigns")}
                  </h3>
                  {company.openCampaigns.length > 0 ? (
                    /* 박스-안-박스 대신 룰드 리스트 (nested-cards 해소) */
                    <ul className="divide-y divide-line border-y border-line">
                      {company.openCampaigns.map((c) => (
                        <li
                          key={c.id}
                          className="flex items-center justify-between gap-3 py-3"
                        >
                          <span className="truncate text-sm font-medium text-foreground">
                            {c.title}
                          </span>
                          <span className="flex flex-shrink-0 items-center gap-2 text-xs tabular-nums">
                            <span className="font-semibold text-primary">
                              {rewardText(c.rewardAmount)}
                            </span>
                            <span className="text-muted">{deadlineText(c.deadline, t)}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted">
                      {t("현재 진행 중인 캠페인이 없습니다.", "No active campaigns right now.")}
                    </p>
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
