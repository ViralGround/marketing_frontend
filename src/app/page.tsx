import OneVideoLanding from "@/components/landing/onevideo/OneVideoLanding";

export const metadata = {
  title: "Viral Ground — Play AI, Spread Viral",
  description:
    "한 편의 영상이 브랜드와 크리에이터의 성장이 되는 곳. 브랜드에는 더 진짜 같은 콘텐츠를, 크리에이터에는 더 선명한 보상을.",
};

// 공통 관문 랜딩(시안4 — 원 비디오 그라운드). 역할 분기는 하단 CTA 가 담당:
// 브랜드 → /business, 크리에이터 → /creator.
export default function Home() {
  return <OneVideoLanding />;
}
