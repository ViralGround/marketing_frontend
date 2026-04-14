import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <h1 className="mb-4 text-4xl font-bold text-gray-900">
        Viral Ground
      </h1>
      <p className="mb-8 text-lg text-gray-600">
        크리에이터와 기업을 연결하는 마케팅 콘텐츠 플랫폼
      </p>
      <div className="flex gap-4">
        <Link
          href="/signup/company"
          className="rounded bg-gray-900 px-6 py-3 text-white hover:bg-gray-700"
        >
          기업으로 시작하기
        </Link>
        <Link
          href="/signup/creator"
          className="rounded border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
        >
          크리에이터로 시작하기
        </Link>
      </div>
    </div>
  );
}
