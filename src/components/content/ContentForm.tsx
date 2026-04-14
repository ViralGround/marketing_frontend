"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { ContentRequest, Content } from "@/types";

interface ContentFormProps {
  initialData?: Content;
  mode: "create" | "edit";
}

export default function ContentForm({ initialData, mode }: ContentFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [body, setBody] = useState(initialData?.body || "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    initialData?.status || "DRAFT"
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload: ContentRequest = { title, body, status };

    try {
      if (mode === "create") {
        await api.post("/contents", payload);
      } else {
        await api.put(`/contents/${initialData?.id}`, payload);
      }
      router.push("/contents");
    } catch {
      setError(mode === "create" ? "Failed to create content" : "Failed to update content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-500 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-700">
          Body
        </label>
        <textarea
          id="body"
          rows={10}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-500 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-500 focus:outline-none"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-gray-900 px-6 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : mode === "create" ? "Create" : "Update"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
