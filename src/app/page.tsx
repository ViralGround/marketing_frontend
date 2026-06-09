import HeroSection from "@/components/landing/HeroSection";
import StatsSection from "@/components/landing/StatsSection";
import ResultsShowcaseSection from "@/components/landing/ResultsShowcaseSection";
import MarketContextSection from "@/components/landing/MarketContextSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CommunityBenefitsSection from "@/components/landing/CommunityBenefitsSection";
import ProgramTimelineSection from "@/components/landing/ProgramTimelineSection";
import EarningsSimulator from "@/components/landing/EarningsSimulator";
import FAQSection from "@/components/landing/FAQSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <MarketContextSection />
      <HowItWorksSection />
      <ResultsShowcaseSection />
      <TestimonialsSection />
      <CommunityBenefitsSection />
      <ProgramTimelineSection />
      <div id="earnings" className="scroll-mt-20">
        <EarningsSimulator />
      </div>
      <div id="faq" className="scroll-mt-20">
        <FAQSection />
      </div>
      <FinalCTASection />
      <Footer />
    </>
  );
}
