import LegalPage from "@/components/legal/LegalPage";
import {
  THIRD_PARTY_BODY,
  THIRD_PARTY_EFFECTIVE_DATE,
  THIRD_PARTY_TITLE,
  THIRD_PARTY_VERSION,
} from "@/lib/legal/thirdParty";

export const metadata = {
  title: "개인정보 제3자 제공 동의",
  alternates: { canonical: "/privacy/third-party" },
};

export default function ThirdPartyPage() {
  return (
    <LegalPage
      title={THIRD_PARTY_TITLE}
      version={THIRD_PARTY_VERSION}
      effectiveDate={THIRD_PARTY_EFFECTIVE_DATE}
      body={THIRD_PARTY_BODY}
    />
  );
}
