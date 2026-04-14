import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <h1 className="mb-4 text-4xl font-bold text-gray-900">
        Marketing Platform
      </h1>
      <p className="mb-8 text-lg text-gray-600">
        Manage your marketing content efficiently
      </p>
      <div className="flex gap-4">
        <Link
          href="/signup/company"
          className="rounded bg-gray-900 px-6 py-3 text-white hover:bg-gray-700"
        >
          Start as Company
        </Link>
        <Link
          href="/signup/creator"
          className="rounded border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
        >
          Start as Creator
        </Link>
      </div>
    </div>
  );
}
