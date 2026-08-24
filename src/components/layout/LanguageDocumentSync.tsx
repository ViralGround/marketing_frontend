"use client";

import { useEffect } from "react";
import { useLang } from "@/lib/i18n";

/** Keeps the document language accurate after a persisted English preference hydrates. */
export default function LanguageDocumentSync() {
  const { lang } = useLang();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
