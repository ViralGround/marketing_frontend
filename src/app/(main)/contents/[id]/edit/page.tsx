"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import ContentForm from "@/components/content/ContentForm";
import type { Content } from "@/types";

export default function EditContentPage() {
  const { id } = useParams();
  const router = useRouter();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Content>(`/contents/${id}`)
      .then((res) => setContent(res.data))
      .catch(() => router.push("/contents"))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading || !content) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-gray-500">
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">콘텐츠 수정</h1>
      <ContentForm initialData={content} mode="edit" />
    </div>
  );
}
