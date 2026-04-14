"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import type { Content } from "@/types";

export default function ContentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Content>(`/contents/${id}`)
      .then((res) => setContent(res.data))
      .catch(() => router.push("/contents"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm("이 콘텐츠를 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/contents/${id}`);
      router.push("/contents");
    } catch {
      alert("삭제에 실패했습니다");
    }
  };

  if (loading || !content) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-gray-500">
        불러오는 중...
      </div>
    );
  }

  const isAuthor = user?.id === content.author.id;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <span
          className={`text-xs px-2 py-1 rounded ${
            content.status === "PUBLISHED"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {content.status === "PUBLISHED" ? "게시됨" : "임시저장"}
        </span>
        {isAuthor && (
          <div className="flex gap-2">
            <Link
              href={`/contents/${id}/edit`}
              className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
            >
              수정
            </Link>
            <button
              onClick={handleDelete}
              className="rounded border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
            >
              삭제
            </button>
          </div>
        )}
      </div>
      <h1 className="mb-4 text-3xl font-bold text-gray-900">{content.title}</h1>
      <div className="mb-6 flex items-center gap-4 text-sm text-gray-500">
        <span>{content.author.name}</span>
        <span>{new Date(content.createdAt).toLocaleString()}</span>
      </div>
      <div className="prose max-w-none whitespace-pre-wrap text-gray-800">
        {content.body}
      </div>
    </div>
  );
}
