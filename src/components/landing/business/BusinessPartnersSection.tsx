"use client";

import Image from "next/image";
import { useLang } from "@/lib/i18n";

/**
 * 기업 랜딩 — 함께하는 브랜드(파트너) 스트립.
 * - 로고 수가 MARQUEE_MIN 미만이면 가운데 정적 배치(과하지 않게).
 * - MARQUEE_MIN 이상이면 좌우로 무한히 흐르는 marquee 로 자동 전환(양끝 페이드, hover 시 정지).
 * - 각 항목: 브랜드 아이콘(풀컬러) + 이름 락업. 링크 없음(노출 전용).
 * - 라벨만 다국어(KO/EN), 파트너 이름은 고유명사라 번역하지 않는다.
 */
type Partner = { name: string; logo: string | null };

const PARTNERS: Partner[] = [
  { name: "Calamus PPT", logo: "/partners/calamus.png" },
  { name: "교수님 피하기", logo: "/partners/gpkorea.png" },
];

// 이 개수 이상이면 정적 배치 → 흐르는 marquee 로 전환.
const MARQUEE_MIN = 6;

function PartnerItem({ partner }: { partner: Partner }) {
  return (
    <div className="flex items-center gap-3">
      {partner.logo && (
        <Image
          src={partner.logo}
          alt={partner.name}
          width={72}
          height={72}
          className="h-9 w-9 rounded-xl object-contain"
        />
      )}
      <span className="whitespace-nowrap text-xl font-bold tracking-tight text-content-soft md:text-2xl">
        {partner.name}
      </span>
    </div>
  );
}

export default function BusinessPartnersSection() {
  const { t } = useLang();
  const marquee = PARTNERS.length >= MARQUEE_MIN;

  return (
    <section className="border-y border-line bg-surface py-12 md:py-14">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-faint">
        {t("함께하는 브랜드", "Our Partners")}
      </p>

      {marquee ? (
        <div className="mt-7 flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
          <div className="flex w-max animate-marquee">
            {[0, 1].map((dup) => (
              <ul
                key={dup}
                className="flex shrink-0 items-center gap-14 pr-14"
                aria-hidden={dup === 1}
              >
                {PARTNERS.map((p) => (
                  <li key={`${p.name}-${dup}`}>
                    <PartnerItem partner={p} />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      ) : (
        <div className="mx-auto mt-7 flex max-w-4xl flex-wrap items-center justify-center gap-x-14 gap-y-8 px-6">
          {PARTNERS.map((p) => (
            <PartnerItem key={p.name} partner={p} />
          ))}
        </div>
      )}
    </section>
  );
}
