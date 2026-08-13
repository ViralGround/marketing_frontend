import CreatorGround from "@/components/landing/onevideo/CreatorGround";

export const metadata = {
  title: "크리에이터 | Viral Ground",
  description:
    "AI SaaS를 이해하고 자기 언어로 설명하는 크리에이터를 위한 ViralGround 관리형 베타.",
};

// 크리에이터 설득 랜딩 (시안4 디자인). 관문(/)의 "크리에이터 지원" CTA 로 진입.
export default function CreatorLandingPage() {
  return <CreatorGround />;
}
