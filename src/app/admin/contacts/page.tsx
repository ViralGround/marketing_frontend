"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Card from "@/components/ui/Card";

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
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">상담 신청</h1>
          <p className="mt-2 text-sm text-muted">
            랜딩 페이지에서 접수된 가벼운 상담신청 목록입니다.
          </p>
        </div>
        <span className="text-sm text-muted">
          총 <b className="font-semibold text-foreground">{contacts.length}</b>건
        </span>
      </header>

      {loading ? (
        <p className="text-muted">불러오는 중...</p>
      ) : error ? (
        <p className="text-error">{error}</p>
      ) : contacts.length === 0 ? (
        <Card className="border-dashed bg-surface-muted py-12 text-center text-muted">
          아직 접수된 상담 신청이 없습니다.
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">접수일</th>
                  <th className="px-5 py-3 font-medium">브랜드명</th>
                  <th className="px-5 py-3 font-medium">담당자</th>
                  <th className="px-5 py-3 font-medium">이메일</th>
                  <th className="w-24 px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {contacts.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-surface-muted">
                    <td className="px-5 py-3 whitespace-nowrap text-muted">
                      {new Date(c.createdAt).toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3 font-medium text-foreground">{c.brandName}</td>
                    <td className="px-5 py-3 text-content-soft">
                      {c.contactName || <span className="text-faint">(미입력)</span>}
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
                          `[Viral Ground] ${c.brandName} 상담 회신`,
                        )}`}
                        className="inline-flex items-center rounded-full border border-line-strong px-3 py-1.5 text-xs font-medium text-content-soft transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        회신
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
