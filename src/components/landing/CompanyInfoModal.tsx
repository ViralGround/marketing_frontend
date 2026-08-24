"use client";

import { useEffect, useId, useState } from "react";
import { X } from "lucide-react";
import api from "@/lib/api";
import { useLang } from "@/lib/i18n";
import type { CompanyPublic, FeaturedCampaign } from "@/types/landing";
import { useDialogA11y } from "@/hooks/useDialogA11y";
import {
  GroundActionLink,
  groundStyles,
} from "@/components/landing/ground/PublicGround";

interface Props {
  open: boolean;
  campaign: FeaturedCampaign | null;
  onClose: () => void;
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

export default function CompanyInfoModal({ open, campaign, onClose }: Props) {
  const { t } = useLang();
  const titleId = useId();
  const dialogRef = useDialogA11y<HTMLDivElement>(open, onClose);
  const companyMemberId = campaign?.companyMemberId ?? null;
  const [company, setCompany] = useState<CompanyPublic | null>(null);
  const [loading, setLoading] = useState(companyMemberId != null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open || companyMemberId == null) return;
    api
      .get(`/landing/companies/${companyMemberId}`)
      .then((response) => {
        setCompany(response.data);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [open, companyMemberId]);

  if (!open || !campaign) return null;

  const title = company?.companyName ?? campaign.brandName;
  const logoUrl = company?.logoUrl ?? campaign.logoUrl;
  const introduction = company?.introduction ?? campaign.brandIntroduction;
  const homepage = safePublicUrl(company?.homepage);

  return (
    <div className={groundStyles.sheetBackdrop} onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={groundStyles.sheet}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={groundStyles.sheetHeader}>
          <div>
            <h2 id={titleId}>{campaign.title}</h2>
            <p>{title} / {t("공개 모집 정보", "Public recruiting details")}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t("닫기", "Close")} className={groundStyles.sheetClose}>
            <X aria-hidden="true" />
          </button>
        </header>

        <div className={groundStyles.sheetBody}>
          <div className={groundStyles.sheetCover}>
            {campaign.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={campaign.thumbnailUrl} alt={`${campaign.title} ${t("썸네일", "thumbnail")}`} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={groundStyles.sheetCoverEmpty} src="/workspace-art/hero-smoke.webp" alt="" aria-hidden="true" loading="lazy" />
            )}
            <div className={groundStyles.sheetBrandMark}>
              <span className={groundStyles.sheetLogo}>
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt={`${title} ${t("로고", "logo")}`} />
                ) : (
                  title.trim().charAt(0).toUpperCase() || "VG"
                )}
              </span>
              <span>
                <strong>{title}</strong>
                <small>{t("모집 브랜드", "Recruiting brand")}</small>
              </span>
            </div>
          </div>

          <div className={groundStyles.sheetContent}>
            {loading ? (
              <p className={groundStyles.sheetLead} aria-live="polite">
                {t("브랜드 공개 정보를 불러오는 중입니다.", "Loading public brand information.")}
              </p>
            ) : error ? (
              <p role="alert" className={groundStyles.sheetError}>
                {t("브랜드 소개만 불러오지 못했습니다. 캠페인 모집 정보는 아래에서 확인할 수 있습니다.", "Only the brand profile couldn't be loaded. Campaign recruiting details remain available below.")}
              </p>
            ) : (
              <p className={groundStyles.sheetLead}>
                {introduction || t("등록된 브랜드 소개가 없습니다.", "No brand introduction is available yet.")}
              </p>
            )}

            {(company?.industry || homepage) && (
              <div className={groundStyles.sheetSection}>
                <h3>{t("브랜드 정보", "Brand information")}</h3>
                <dl className={groundStyles.sheetInfoList}>
                  {company?.industry && (
                    <div className={groundStyles.sheetInfoRow}>
                      <dt>{t("업종", "Industry")}</dt>
                      <dd>{company.industry}</dd>
                    </div>
                  )}
                  {homepage && (
                    <div className={groundStyles.sheetInfoRow}>
                      <dt>{t("홈페이지", "Website")}</dt>
                      <dd>
                        <a className={groundStyles.sheetLink} href={homepage} target="_blank" rel="noopener noreferrer">
                          {t("새 창에서 열기", "Open in new tab")}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            <div className={groundStyles.sheetSection}>
              <h3>{t("캠페인 조건", "Campaign terms")}</h3>
              <dl className={groundStyles.sheetInfoList}>
                <div className={groundStyles.sheetInfoRow}>
                  <dt>{t("작업 범위", "Work scope")}</dt>
                  <dd>{t("캠페인 브리프에서 확인", "See the campaign brief")}</dd>
                </div>
                <div className={groundStyles.sheetInfoRow}>
                  <dt>{t("모집 인원", "Slots")}</dt>
                  <dd>{t(`${campaign.maxParticipants}명`, `${campaign.maxParticipants}`)}</dd>
                </div>
                <div className={groundStyles.sheetInfoRow}>
                  <dt>{t("현재 지원", "Applied")}</dt>
                  <dd>{t(`${campaign.applicationCount}명`, `${campaign.applicationCount}`)}</dd>
                </div>
                <div className={groundStyles.sheetInfoRow}>
                  <dt>{t("남은 기간", "Time left")}</dt>
                  <dd>{deadlineText(campaign.deadline, t)}</dd>
                </div>
              </dl>
            </div>

            {company && (
              <div className={groundStyles.sheetSection}>
                <h3>{t("이 브랜드의 공개 캠페인", "Other public campaigns from this brand")}</h3>
                {company.openCampaigns.length > 0 ? (
                  <ul className={groundStyles.sheetList}>
                    {company.openCampaigns.map((openCampaign) => (
                      <li key={openCampaign.id}>
                        <strong>{openCampaign.title}</strong>
                        <span>{t("모집 중", "Recruiting")} · {deadlineText(openCampaign.deadline, t)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={groundStyles.sheetLead}>
                    {t("현재 추가로 공개된 캠페인이 없습니다.", "No other public campaigns are available right now.")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <footer className={groundStyles.sheetFooter}>
          <button type="button" className={groundStyles.actionSecondary} onClick={onClose}>
            {t("닫기", "Close")}
          </button>
          <GroundActionLink href="/signup/creator">
            {t("크리에이터 지원", "Apply as a creator")}
          </GroundActionLink>
        </footer>
      </div>
    </div>
  );
}
