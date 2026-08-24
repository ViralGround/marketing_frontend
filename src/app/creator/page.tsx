import CreatorApplyPage from "@/components/landing/apply/CreatorApplyPage";

export const metadata = {
  title: "크리에이터 지원",
  description:
    "AI SaaS를 이해하고 자기 언어로 설명하는 크리에이터를 위한 ViralGround 관리형 베타.",
  alternates: { canonical: "/creator" },
};

export default function CreatorLandingPage() {
  return <CreatorApplyPage />;
}
