import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center">
      <div className="w-full max-w-lg space-y-6 p-8">
        <h1 className="text-center text-2xl font-bold text-gray-900">
          Sign Up
        </h1>
        <p className="text-center text-gray-500">Choose your account type</p>
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/signup/company"
            className="flex flex-col items-center gap-3 rounded border border-gray-200 p-6 hover:border-gray-400 transition-colors"
          >
            <span className="text-3xl">🏢</span>
            <span className="text-lg font-semibold text-gray-900">Company</span>
            <span className="text-sm text-gray-500 text-center">
              Find creators and manage campaigns
            </span>
          </Link>
          <Link
            href="/signup/creator"
            className="flex flex-col items-center gap-3 rounded border border-gray-200 p-6 hover:border-gray-400 transition-colors"
          >
            <span className="text-3xl">🎨</span>
            <span className="text-lg font-semibold text-gray-900">Creator</span>
            <span className="text-sm text-gray-500 text-center">
              Showcase your work and get opportunities
            </span>
          </Link>
        </div>
        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-gray-900 underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
