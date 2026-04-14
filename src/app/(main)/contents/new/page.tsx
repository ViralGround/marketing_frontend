import ContentForm from "@/components/content/ContentForm";

export default function NewContentPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">콘텐츠 작성</h1>
      <ContentForm mode="create" />
    </div>
  );
}
