"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import type { FeaturedCampaign } from "@/types/landing";
import FeaturedCampaignCard from "./FeaturedCampaignCard";
import CompanyInfoModal from "./CompanyInfoModal";

interface ModalState {
  open: boolean;
  companyMemberId: number | null;
  brandName: string;
}

export default function FeaturedCampaignsSection() {
  const ref = useScrollAnimation<HTMLDivElement>();
  const [campaigns, setCampaigns] = useState<FeaturedCampaign[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [modal, setModal] = useState<ModalState>({
    open: false,
    companyMemberId: null,
    brandName: "",
  });

  useEffect(() => {
    api
      .get("/landing/featured-campaigns")
      .then((res) => setCampaigns(res.data.campaigns))
      .catch(() => setCampaigns([]))
      .finally(() => setLoaded(true));
  }, []);

  const openModal = (companyMemberId: number | null, brandName: string) =>
    setModal({ open: true, companyMemberId, brandName });
  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  // 노출할 대표 캠페인이 없으면 섹션 자체를 렌더하지 않는다.
  if (loaded && campaigns.length === 0) return null;

  return (
    <section className="bg-section-alt py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
          지금 모집 중인 대표 캠페인
        </h2>
        <p className="mt-4 text-center text-muted">
          검증된 브랜드들이 Viral Ground에서 크리에이터를 찾고 있어요
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <FeaturedCampaignCard key={c.id} campaign={c} onOpen={openModal} />
          ))}
        </div>
      </div>

      <CompanyInfoModal
        key={modal.companyMemberId ?? `brand:${modal.brandName}`}
        open={modal.open}
        companyMemberId={modal.companyMemberId}
        fallbackBrandName={modal.brandName}
        onClose={closeModal}
      />
    </section>
  );
}
