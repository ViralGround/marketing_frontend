"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import ContentCard from "@/components/content/ContentCard";
import type { Content } from "@/types";

export default function ContentsPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Content[]>("/contents")
      .then((res) => setContents(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Contents</h1>
      {contents.length === 0 ? (
        <p className="text-gray-500">No content yet.</p>
      ) : (
        <div className="space-y-4">
          {contents.map((c) => (
            <ContentCard key={c.id} content={c} />
          ))}
        </div>
      )}
    </div>
  );
}
