"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface ContactItem {
  id: number;
  email: string;
  brandName: string;
  contactName: string | null;
  createdAt: string;
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get<{ contacts: ContactItem[] }>("/admin/contacts")
      .then((res) => setContacts(res.data.contacts))
      .catch(() => setError("상담 신청 목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">상담 신청</h1>
          <p className="mt-1 text-sm text-muted">
            랜딩 페이지에서 접수된 가벼운 상담신청 목록입니다.
          </p>
        </div>
        <span className="text-sm text-muted">
          총 <b className="text-foreground">{contacts.length}</b>건
        </span>
      </header>

      {loading ? (
        <p className="text-muted">불러오는 중...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : contacts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-surface-muted p-12 text-center text-muted">
          아직 접수된 상담 신청이 없습니다.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">접수일</th>
                <th className="px-4 py-3">브랜드명</th>
                <th className="px-4 py-3">담당자</th>
                <th className="px-4 py-3">이메일</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-t border-line hover:bg-surface-muted/40">
                  <td className="px-4 py-3 text-muted whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleString("ko-KR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{c.brandName}</td>
                  <td className="px-4 py-3 text-content-soft">
                    {c.contactName || <span className="text-faint">(미입력)</span>}
                  </td>
                  <td className="px-4 py-3 text-content-soft">
                    <a
                      href={`mailto:${c.email}`}
                      className="text-primary hover:underline"
                    >
                      {c.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`mailto:${c.email}?subject=${encodeURIComponent(
                        `[Viral Ground] ${c.brandName} 상담 회신`
                      )}`}
                      className="rounded border border-line-strong px-3 py-1.5 text-xs text-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      회신
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
