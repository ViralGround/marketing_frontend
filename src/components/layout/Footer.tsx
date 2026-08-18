"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { getBusinessInfoRows } from "@/lib/businessInfo";

export default function Footer() {
  const { t, lang } = useLang();
  const businessRows = getBusinessInfoRows();

  return (
    <footer className="border-t border-line bg-surface-muted">
      {businessRows.length > 0 ? (
        <dl className="mx-auto flex max-w-5xl flex-wrap gap-x-4 gap-y-1 px-4 pt-5 text-[11.5px] text-faint">
          {businessRows.map((row) => (
            <div key={row.label} className="flex gap-1">
              <dt>{lang === "en" ? row.labelEn : row.label}</dt>
              <dd className="m-0 text-muted">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© Viral Ground</p>
        <nav className="flex gap-4">
          <Link href="/terms" className="hover:text-foreground">
            {t("이용약관", "Terms")}
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            {t("개인정보 처리방침", "Privacy Policy")}
          </Link>
          <Link href="/privacy/third-party" className="hover:text-foreground">
            {t("제3자 제공", "Third-party Sharing")}
          </Link>
          <Link href="/marketing" className="hover:text-foreground">
            {t("마케팅 수신", "Marketing Consent")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
