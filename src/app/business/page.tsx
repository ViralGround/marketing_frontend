import BusinessConsolePage from "@/components/landing/console/BusinessConsolePage";

export const metadata = {
  title: "브랜드",
  description:
    "AI SaaS 제품을 이해하는 크리에이터와 브리프부터 콘텐츠 검수·게시·성과 확인까지 함께 운영하는 관리형 베타.",
  alternates: { canonical: "/business" },
};

export default function BusinessLandingPage() {
  return <BusinessConsolePage />;
}
