import OneVideoLanding from "@/components/landing/onevideo/OneVideoLanding";

export const metadata = {
  title: { absolute: "Viral Ground — Play AI, Spread Viral" },
  description:
    "한 편의 영상이 브랜드와 크리에이터의 성장이 되는 곳. 브리프부터 제작·검수·성과 확인까지 한 흐름으로 운영합니다.",
  alternates: { canonical: "/" },
};

// 공통 관문 랜딩(시안4 — 원 비디오 그라운드). 역할 분기는 하단 CTA 가 담당:
// 브랜드 → /business, 크리에이터 → /creator.
export default function Home() {
  return <OneVideoLanding />;
}
