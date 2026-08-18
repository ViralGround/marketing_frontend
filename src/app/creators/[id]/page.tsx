"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import api from "@/lib/api";
import {
  GroundAccent,
  GroundActionButton,
  GroundActionLink,
  GroundDockLink,
  GroundFinalBand,
  GroundHero,
  GroundMetricStrip,
  GroundSection,
  GroundState,
  PublicGroundFrame,
  groundStyles,
} from "@/components/landing/ground/PublicGround";
import { useLang } from "@/lib/i18n";
import { trackEvent } from "@/lib/gtag";

type ReviewAuthorRole = "CREATOR" | "COMPANY" | "ADMIN";

interface ReviewItem {
  id: number;
  authorRole: ReviewAuthorRole;
  authorName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface PortfolioItem {
  campaignTitle: string;
  brandName: string;
  settledAt: string | null;
}

interface Portfolio {
  creator: { id: number; name: string; joinedAt: string };
  summary: {
    totalCompleted: number;
    reviewCount: number;
    averageRating: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    metricSampleSize: number;
    averageViews: number;
  };
  items: PortfolioItem[];
}

const ROLE_CODE = {
  CREATOR: "CREATOR",
  COMPANY: "BRAND",
  ADMIN: "ADMIN",
} as const;

export default function CreatorPortfolioPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { t, lang } = useLang();
  const locale = lang === "en" ? "en-US" : "ko-KR";
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [portfolioError, setPortfolioError] = useState(false);
  const [reviewsError, setReviewsError] = useState(false);

  const loadPortfolio = useCallback(async () => {
    if (!id) return;
    const [portfolioResult, reviewsResult] = await Promise.allSettled([
      api.get<Portfolio>(`/creators/${id}/portfolio`),
      api.get<{ reviews: ReviewItem[] }>(`/creators/${id}/reviews`),
    ]);

    if (portfolioResult.status === "fulfilled") {
      setPortfolio(portfolioResult.value.data);
      setPortfolioError(false);
    } else {
      setPortfolioError(true);
    }

    if (reviewsResult.status === "fulfilled") {
      setReviews(reviewsResult.value.data.reviews);
      setReviewsError(false);
    } else {
      setReviewsError(true);
    }
    setLoading(false);
  }, [id]);

  const retryReviews = useCallback(async () => {
    if (!id) return;
    try {
      const response = await api.get<{ reviews: ReviewItem[] }>(`/creators/${id}/reviews`);
      setReviews(response.data.reviews);
      setReviewsError(false);
    } catch {
      setReviewsError(true);
    }
  }, [id]);

  useEffect(() => {
    const requestTimer = window.setTimeout(() => {
      void loadPortfolio();
    }, 0);
    return () => window.clearTimeout(requestTimer);
  }, [loadPortfolio]);

  const sections = [
    { id: "creator-profile", label: t("프로필", "Profile") },
    { id: "creator-work", label: t("완료 작업", "Completed work") },
    { id: "creator-reviews", label: t("브랜드 리뷰", "Brand reviews") },
    { id: "creator-collaborate", label: t("함께하기", "Collaborate") },
  ];

  const heroTitle: ReactNode = loading ? (
    t("프로필을 불러오는 중입니다", "Loading creator profile")
  ) : portfolioError || !portfolio ? (
    t("포트폴리오를 불러오지 못했습니다", "The portfolio couldn't be loaded")
  ) : (
    <GroundAccent>{portfolio.creator.name}</GroundAccent>
  );

  const heroDescription = loading
    ? t("공개된 작업 이력과 리뷰를 확인하고 있습니다.", "Checking public work history and reviews.")
    : portfolioError || !portfolio
      ? t("연결 상태를 확인한 뒤 다시 시도해 주세요.", "Check your connection and try again.")
      : t(
          `${new Date(portfolio.creator.joinedAt).toLocaleDateString(locale)}부터 활동한 공개 크리에이터입니다. 캠페인에 기록된 완료 이력과 성과만 표시합니다.`,
          `Public creator since ${new Date(portfolio.creator.joinedAt).toLocaleDateString(locale)}. Only completed work and recorded performance are shown.`,
        );

  const heroActions = portfolioError ? (
    <>
      <GroundActionButton
        onClick={() => {
          setLoading(true);
          setPortfolioError(false);
          void loadPortfolio();
        }}
      >
        {t("다시 불러오기", "Try again")}
      </GroundActionButton>
      <GroundActionLink href="/creators" tone="secondary">
        {t("크리에이터 목록", "Creator list")}
      </GroundActionLink>
    </>
  ) : (
    <>
      <GroundActionLink
        href="/business"
        onClick={() => trackEvent("cta_click", { location: "creator_profile_hero", target: "business" })}
      >
        {t("이 크리에이터와 캠페인 문의", "Ask about a campaign")}
      </GroundActionLink>
      <GroundActionLink href="/creators" tone="secondary">
        {t("크리에이터 목록", "Creator list")}
      </GroundActionLink>
    </>
  );

  const metrics = portfolio
    ? [
        { label: t("완료 캠페인", "Completed"), value: t(`${portfolio.summary.totalCompleted}건`, `${portfolio.summary.totalCompleted}`) },
        { label: t("브랜드 리뷰", "Reviews"), value: t(`${portfolio.summary.reviewCount}건`, `${portfolio.summary.reviewCount}`) },
        {
          label: t("평점", "Rating"),
          value: portfolio.summary.reviewCount ? portfolio.summary.averageRating.toFixed(1) : "—",
        },
        {
          label: t("평균 조회수", "Average views"),
          value: portfolio.summary.metricSampleSize ? portfolio.summary.averageViews.toLocaleString(locale) : "—",
        },
        { label: t("누적 조회수", "Total views"), value: portfolio.summary.totalViews.toLocaleString(locale) },
        { label: t("누적 좋아요", "Total likes"), value: portfolio.summary.totalLikes.toLocaleString(locale) },
      ]
    : [];

  return (
    <PublicGroundFrame
      sections={sections}
      mobileDock={
        <>
          <GroundDockLink href="/business">
            {t("이 크리에이터와 캠페인 문의", "Ask about a campaign")}
          </GroundDockLink>
          <GroundDockLink href="/creators" secondary aria-label={t("목록으로", "Back to list")}>
            <ArrowLeft aria-hidden="true" size={19} />
          </GroundDockLink>
        </>
      }
    >
      <GroundHero
        id="creator-profile"
        profile
        corner="ViralGround / Public portfolio"
        title={heroTitle}
        description={heroDescription}
        actions={heroActions}
        media={
          <div className={groundStyles.profileMonogram} aria-hidden="true">
            {portfolio?.creator.name.trim().charAt(0) || "VG"}
          </div>
        }
      />

      {metrics.length > 0 && <GroundMetricStrip items={metrics} />}

      <GroundSection
        id="creator-work"
        title={t("완료한 작업", "Completed work")}
        description={t(
          "정산 완료로 기록된 공개 캠페인만 표시합니다. 작업별 브랜드와 완료일을 확인할 수 있습니다.",
          "Only public campaigns recorded as completed are shown, with brand and completion date.",
        )}
      >
        {loading ? (
          <GroundState loading title={t("작업 이력을 확인하는 중입니다", "Loading work history")} />
        ) : portfolioError || !portfolio ? (
          <GroundState
            title={t("작업 이력을 표시할 수 없습니다", "Work history is unavailable")}
            description={t("프로필을 다시 불러오면 함께 확인됩니다.", "Reload the profile to check it again.")}
          />
        ) : portfolio.items.length === 0 ? (
          <GroundState
            title={t("아직 공개된 완료 작업이 없습니다", "No completed work is public yet")}
            description={t("완료된 캠페인이 공개되면 이곳에 기록됩니다.", "Completed campaigns will appear here when made public.")}
          />
        ) : (
          <ol className={groundStyles.historyList}>
            {portfolio.items.map((item, index) => (
              <li
                key={`${item.brandName}-${item.campaignTitle}-${item.settledAt ?? index}`}
                className={groundStyles.historyItem}
              >
                <span className={groundStyles.historyIndex}>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <p className={groundStyles.historyBrand}>{item.brandName}</p>
                  <h3 className={groundStyles.historyTitle}>{item.campaignTitle}</h3>
                </div>
                <span className={groundStyles.historyBrand}>
                  {item.settledAt
                    ? `${t("완료", "Completed")} ${new Date(item.settledAt).toLocaleDateString(locale)}`
                    : t("완료일 미표시", "Date unavailable")}
                </span>
              </li>
            ))}
          </ol>
        )}
      </GroundSection>

      <GroundSection
        id="creator-reviews"
        title={t("브랜드 리뷰", "Brand reviews")}
        description={t(
          "완료 캠페인에서 작성된 리뷰만 표시합니다. 리뷰를 불러오지 못해도 작업 이력은 그대로 볼 수 있습니다.",
          "Only reviews from completed campaigns are shown. Work history remains available if reviews fail to load.",
        )}
      >
        {loading ? (
          <GroundState loading title={t("리뷰를 확인하는 중입니다", "Loading reviews")} />
        ) : reviewsError ? (
          <div role="alert">
            <GroundState
              title={t("리뷰만 불러오지 못했습니다", "Only reviews couldn't be loaded")}
              description={t("프로필과 작업 이력은 정상적으로 표시되고 있습니다.", "The profile and work history remain available.")}
              action={
                <GroundActionButton onClick={() => void retryReviews()}>
                  {t("리뷰 다시 불러오기", "Retry reviews")}
                </GroundActionButton>
              }
            />
          </div>
        ) : reviews.length === 0 ? (
          <GroundState
            title={t("아직 작성된 리뷰가 없습니다", "No reviews yet")}
            description={t("완료 캠페인의 브랜드 리뷰가 공개되면 이곳에 표시됩니다.", "Published brand reviews from completed campaigns will appear here.")}
          />
        ) : (
          <ul className={groundStyles.reviewList}>
            {reviews.map((review) => (
              <li key={review.id} className={groundStyles.reviewItem}>
                <span className={groundStyles.historyIndex}>{ROLE_CODE[review.authorRole]}</span>
                <div>
                  <p className={groundStyles.reviewMeta}>
                    {new Date(review.createdAt).toLocaleDateString(locale)}
                  </p>
                  <h3 className={groundStyles.reviewAuthor}>{review.authorName}</h3>
                  {review.comment && <p className={groundStyles.reviewComment}>{review.comment}</p>}
                </div>
                <span className={groundStyles.reviewRating} aria-label={t(`평점 ${review.rating}점`, `Rating ${review.rating} out of 5`)}>
                  <Star size={16} fill="currentColor" aria-hidden="true" /> {review.rating.toFixed(1)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </GroundSection>

      <GroundFinalBand
        id="creator-collaborate"
        title={t("이 크리에이터와 캠페인을 시작해 보세요", "Start a campaign with this creator")}
        description={t(
          "브랜드 상담에서 제품과 목표를 알려주시면 가능한 운영 범위와 크리에이터 검토 기준부터 정리합니다.",
          "Share your product and goal in a brand consultation; we begin with scope and creator-review criteria.",
        )}
        actions={
          <>
            <GroundActionLink
              href="/business"
              onClick={() => trackEvent("cta_click", { location: "creator_portfolio", target: "business" })}
            >
              {t("브랜드 캠페인 문의", "Brand campaign inquiry")}
            </GroundActionLink>
            <GroundActionLink href="/creators" tone="onDark">
              {t("다른 크리에이터 보기", "Browse other creators")}
            </GroundActionLink>
          </>
        }
      />
    </PublicGroundFrame>
  );
}
