import LegalPage from "@/components/legal/LegalPage";
import {
  AGE14_BODY,
  AGE14_EFFECTIVE_DATE,
  AGE14_TITLE,
  AGE14_VERSION,
} from "@/lib/legal/age14";

export const metadata = {
  title: "만 14세 이상 확인 | Viral Ground",
};

export default function Age14Page() {
  return (
    <LegalPage
      title={AGE14_TITLE}
      version={AGE14_VERSION}
      effectiveDate={AGE14_EFFECTIVE_DATE}
      body={AGE14_BODY}
    />
  );
}
