import Link from "next/link";
import type { Content } from "@/types";

export default function ContentCard({ content }: { content: Content }) {
  return (
    <Link
      href={`/contents/${content.id}`}
      className="block rounded border border-gray-200 p-4 hover:border-gray-400 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-900">{content.title}</h2>
        <span
          className={`text-xs px-2 py-1 rounded ${
            content.status === "PUBLISHED"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {content.status === "PUBLISHED" ? "게시됨" : "임시저장"}
        </span>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2">{content.body}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span>{content.author.name}</span>
        <span>{new Date(content.createdAt).toLocaleDateString()}</span>
      </div>
    </Link>
  );
}
