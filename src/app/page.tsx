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
      <FeaturedCampaignsSection />
      <SupportSection />
      <RewardTableSection />
      <EarningsSimulator />
      <HowItWorksSection />
      <FeaturesSection />
      <FAQSection />
      <BottomCTA />
      <Footer />
    </>
  );
}
