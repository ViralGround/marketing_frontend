import LegalPage from "@/components/legal/LegalPage";
import {
  MARKETING_BODY,
  MARKETING_EFFECTIVE_DATE,
  MARKETING_TITLE,
  MARKETING_VERSION,
} from "@/lib/legal/marketing";

export const metadata = {
  title: "마케팅 정보 수신 동의",
  alternates: { canonical: "/marketing" },
};

export default function MarketingPage() {
  return (
    <LegalPage
      title={MARKETING_TITLE}
      version={MARKETING_VERSION}
      effectiveDate={MARKETING_EFFECTIVE_DATE}
      body={MARKETING_BODY}
    />
  );
}
