"use client";

import Badge from "@/components/ui/Badge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLang } from "@/lib/i18n";

export default function BusinessCasesSection() {
  const ref = useScrollAnimation<HTMLDivElement>();
  const { t } = useLang();

  return (
    <section className="bg-surface py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <Badge>{t("함께한 고객", "Our clients")}</Badge>
          <h2 className="mt-4 text-3xl font-bold text-foreground md:text-4xl">
            {t("저희와 일하고 있는 브랜드", "Brands working with us")}
          </h2>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-5">
          <div className="md:col-span-3 rounded-2xl border border-line bg-section-alt p-8 md:p-10">
            <div className="mb-4 flex items-center gap-2">
              <Badge>{t("AI 서비스", "AI service")}</Badge>
              <span className="text-xs text-muted">{t("2개월 전 계약 · 현재 진행중", "Signed 2 months ago · in progress")}</span>
            </div>
            <h3 className="text-2xl font-semibold text-foreground">
              {t("인스타그램 마케팅 대행", "Managed Instagram marketing")}
            </h3>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              {t(
                "크리에이터 풀과 자체 소재 기획력을 결합해 첫 달부터 측정 가능한 KPI를 만들었습니다. CPM 효율, 인게이지먼트 레이트, 그리고 ROAS 까지 한 보고서에 담아 매주 공유합니다.",
                "By combining our Creator pool with in-house content planning, we delivered measurable KPIs from the very first month. CPM efficiency, engagement rate and ROAS are all captured in a single report shared every week.",
              )}
            </p>

            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-6">
              <div>
                <p className="text-xs text-muted">{t("평균 CPV", "Avg. CPV")}</p>
                <p className="mt-1 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                  {t("4.16", "₩4.16")}<span className="text-base font-bold text-muted">{t("원", "")}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">{t("최대 ROAS", "Max ROAS")}</p>
                <p className="mt-1 text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
                  924<span className="text-base font-bold text-muted">%</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">{t("단일 캠페인 뷰", "Single-campaign views")}</p>
                <p className="mt-1 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                  {t("120", "1.2")}<span className="text-base font-bold text-muted">{t("만+", "M+")}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 rounded-2xl border border-line bg-section-alt p-8">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              {t("지표 해석", "How to read the metrics")}
            </p>
            <ul className="mt-4 space-y-4 text-sm text-muted leading-relaxed">
              <li>
                <span className="font-semibold text-foreground">{t("CPV 4.16원", "CPV ₩4.16")}</span>{" "}
                {t(
                  "— 1회 노출에 4원. 일반 캠페인(10~30원) 대비 압도적으로 낮은 단가.",
                  "— ₩4 per view. Dramatically lower than a typical campaign (₩10–30).",
                )}
              </li>
              <li>
                <span className="font-semibold text-foreground">{t("EMV ≥ 3배", "EMV ≥ 3×")}</span>{" "}
                {t(
                  "— 시장 평균 CPM 기준 환산 시 3배 이상의 노출 효과.",
                  "— Over 3× the reach when converted at the market-average CPM.",
                )}
              </li>
              <li>
                <span className="font-semibold text-foreground">{t("높은 인게이지먼트", "High engagement")}</span>{" "}
                {t(
                  "— 낮은 CPM 은 알고리즘 점수가 높았다는 신호. 좋아요·댓글·저장이 함께 따라왔다는 뜻.",
                  "— A low CPM signals a strong algorithm score, meaning Likes, comments and saves followed.",
                )}
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-faint">
          {t(
            "* 동종 업계 / 비공개 NDA 사유로 브랜드명은 상담 시 공유드립니다.",
            "* Due to industry overlap and NDAs, brand names are shared during the Consultation.",
          )}
        </p>
      </div>
    </section>
  );
}
