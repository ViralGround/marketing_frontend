import HeroSection from "@/components/landing/HeroSection";
import StatsSection from "@/components/landing/StatsSection";
import PainPointSection from "@/components/landing/PainPointSection";
import AudienceSection from "@/components/landing/AudienceSection";
import FeaturedCampaignsSection from "@/components/landing/FeaturedCampaignsSection";
import SupportSection from "@/components/landing/SupportSection";
import RewardTableSection from "@/components/landing/RewardTableSection";
import EarningsSimulator from "@/components/landing/EarningsSimulator";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import FAQSection from "@/components/landing/FAQSection";
import BottomCTA from "@/components/landing/BottomCTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <PainPointSection />
      <AudienceSection />
      <div id="campaigns" className="scroll-mt-20">
        <FeaturedCampaignsSection />
      </div>
      <SupportSection />
      <div id="rewards" className="scroll-mt-20">
        <RewardTableSection />
      </div>
      <div id="earnings" className="scroll-mt-20">
        <EarningsSimulator />
      </div>
      <div id="how" className="scroll-mt-20">
        <HowItWorksSection />
      </div>
      <FeaturesSection />
      <div id="faq" className="scroll-mt-20">
        <FAQSection />
      </div>
      <BottomCTA />
      <Footer />
    </>
  );
}
