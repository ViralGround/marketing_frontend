"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";

export default function LegalPage({
  title,
  version,
  effectiveDate,
  body,
}: {
  title: string;
  version: string;
  effectiveDate: string;
  body: string;
}) {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/" className="text-sm text-muted hover:text-foreground">
        &larr; {t("처음으로", "Home")}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-foreground">{title}</h1>
      <p className="mt-1 text-xs text-faint">
        {version} · {t("시행일", "Effective date")} {effectiveDate}
      </p>
      <article className="mt-6 rounded border border-line bg-surface p-6">
        <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-content-soft">
          {body}
        </pre>
      </article>
    </div>
  );
}
