import LegalPage from "@/components/legal/LegalPage";
import { TERMS_BODY, TERMS_EFFECTIVE_DATE, TERMS_TITLE, TERMS_VERSION } from "@/lib/legal/terms";

export const metadata = {
  title: "이용약관",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title={TERMS_TITLE}
      version={TERMS_VERSION}
      effectiveDate={TERMS_EFFECTIVE_DATE}
      body={TERMS_BODY}
    />
  );
}
