import LegalPage from "@/components/legal/LegalPage";
import {
  PRIVACY_BODY,
  PRIVACY_EFFECTIVE_DATE,
  PRIVACY_TITLE,
  PRIVACY_VERSION,
} from "@/lib/legal/privacy";

export const metadata = {
  title: "개인정보 처리방침 | Viral Ground",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title={PRIVACY_TITLE}
      version={PRIVACY_VERSION}
      effectiveDate={PRIVACY_EFFECTIVE_DATE}
      body={PRIVACY_BODY}
    />
  );
}
