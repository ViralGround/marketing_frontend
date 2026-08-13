"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import { useLang } from "@/lib/i18n";

interface ContactItem {
  id: number;
  email: string;
  brandName: string;
  contactName: string | null;
  privacyConsentVersion: string | null;
  privacyConsentedAt: string | null;
  createdAt: string;
}

export default function AdminContactsPage() {
  const { t } = useLang();
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    api
      .get<{ contacts: ContactItem[] }>("/admin/contacts", { signal: controller.signal })
      .then((res) => {
        if (!active) return;
        setContacts(res.data.contacts);
        setError("");
      })
      .catch(() => {
        if (!active) return;
        setError(t("상담 신청 목록을 불러오지 못했습니다.", "Failed to load consultation requests."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [t]);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("상담 신청", "Consultation requests")}</h1>
          <p className="mt-2 text-sm text-muted">
            {t(
              "랜딩 페이지에서 접수된 가벼운 상담신청 목록입니다.",
              "Consultation requests submitted from the landing page.",
            )}
          </p>
        </div>
        <span className="text-sm text-muted">
          {t("총 ", "Total ")}<b className="font-semibold text-foreground">{contacts.length}</b>{t("건", "")}
        </span>
      </header>

      {loading ? (
        <p className="text-muted">{t("불러오는 중...", "Loading...")}</p>
      ) : error ? (
        <p className="text-error">{error}</p>
      ) : contacts.length === 0 ? (
        <Card className="border-dashed bg-surface-muted py-12 text-center text-muted">
          {t("아직 접수된 상담 신청이 없습니다.", "No consultation requests yet.")}
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">{t("접수일", "Received")}</th>
                  <th className="px-5 py-3 font-medium">{t("브랜드명", "Brand name")}</th>
                  <th className="px-5 py-3 font-medium">{t("담당자", "Contact")}</th>
                  <th className="px-5 py-3 font-medium">{t("이메일", "Email")}</th>
                  <th className="w-24 px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {contacts.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-surface-muted">
                    <td className="px-5 py-3 whitespace-nowrap text-muted">
                      <span className="block">
                        {new Date(c.createdAt).toLocaleString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="mt-1 block font-mono text-[11px] text-faint">
                        {c.privacyConsentVersion
                          ? `${t("동의", "Consent")}: ${c.privacyConsentVersion}`
                          : t("레거시 · 동의 버전 미상", "Legacy · consent version unknown")}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-foreground">{c.brandName}</td>
                    <td className="px-5 py-3 text-content-soft">
                      {c.contactName || <span className="text-faint">{t("(미입력)", "(not provided)")}</span>}
                    </td>
                    <td className="px-5 py-3">
                      <a
                        href={`mailto:${c.email}`}
                        className="text-primary underline-offset-2 hover:underline"
                      >
                        {c.email}
                      </a>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <a
                        href={`mailto:${c.email}?subject=${encodeURIComponent(
                          t(`[Viral Ground] ${c.brandName} 상담 회신`, `[Viral Ground] Re: ${c.brandName} consultation`),
                        )}`}
                        className="inline-flex items-center rounded-full border border-line-strong px-3 py-1.5 text-xs font-medium text-content-soft transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        {t("회신", "Reply")}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
