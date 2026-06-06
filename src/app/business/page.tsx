import BusinessHeroSection from "@/components/landing/business/BusinessHeroSection";
import BusinessPerformanceSection from "@/components/landing/business/BusinessPerformanceSection";
import BusinessFeaturesSection from "@/components/landing/business/BusinessFeaturesSection";
import BusinessCasesSection from "@/components/landing/business/BusinessCasesSection";
import BusinessBottomCTA from "@/components/landing/business/BusinessBottomCTA";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "기업 | Viral Ground",
  description:
    "직전 캠페인 CPV 4.16원 · 최대 ROAS 924%. 첫 달 안에 성과가 나오는 UGC 마케팅.",
};

export default function BusinessLandingPage() {
  return (
    <>
      <BusinessHeroSection />
      <div id="performance" className="scroll-mt-20">
        <BusinessPerformanceSection />
      </div>
      <div id="features" className="scroll-mt-20">
        <BusinessFeaturesSection />
      </div>
      <div id="cases" className="scroll-mt-20">
        <BusinessCasesSection />
      </div>
      <BusinessBottomCTA />
      <Footer />
    </>
  );
}
