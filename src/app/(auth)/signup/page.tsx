import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center">
      <div className="w-full max-w-lg space-y-6 p-8">
        <h1 className="text-center text-2xl font-bold text-gray-900">
          회원가입
        </h1>
        <p className="text-center text-gray-500">계정 유형을 선택해주세요</p>
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/signup/company"
            className="flex flex-col items-center gap-3 rounded border border-gray-200 p-6 hover:border-gray-400 transition-colors"
          >
            <span className="text-3xl">🏢</span>
            <span className="text-lg font-semibold text-gray-900">기업</span>
            <span className="text-sm text-gray-500 text-center">
              크리에이터를 찾고 캠페인을 관리하세요
            </span>
          </Link>
          <Link
            href="/signup/creator"
            className="flex flex-col items-center gap-3 rounded border border-gray-200 p-6 hover:border-gray-400 transition-colors"
          >
            <span className="text-3xl">🎨</span>
            <span className="text-lg font-semibold text-gray-900">크리에이터</span>
            <span className="text-sm text-gray-500 text-center">
              작업물을 보여주고 기회를 얻으세요
            </span>
          </Link>
        </div>
        <p className="text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-gray-900 underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
