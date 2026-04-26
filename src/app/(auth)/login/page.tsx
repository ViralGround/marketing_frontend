import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center py-12">
      <div className="w-full max-w-md space-y-6 rounded border border-line bg-surface p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-foreground">로그인</h1>
          <p className="text-sm text-muted">로그인 유형을 선택해주세요</p>
        </div>

        <div className="space-y-3">
          <Link
            href="/login/creator"
            className="flex flex-col gap-1 rounded-lg border border-line-strong px-5 py-4 hover:border-gray-900"
          >
            <span className="text-base font-semibold text-foreground">
              크리에이터 로그인
            </span>
            <span className="text-sm text-muted">
              캠페인에 지원하고 콘텐츠를 제작합니다
            </span>
          </Link>
          <Link
            href="/login/company"
            className="flex flex-col gap-1 rounded-lg border border-line-strong px-5 py-4 hover:border-gray-900"
          >
            <span className="text-base font-semibold text-foreground">
              기업 로그인
            </span>
            <span className="text-sm text-muted">
              캠페인을 등록하고 크리에이터를 모집합니다
            </span>
          </Link>
        </div>

        <p className="text-center text-xs text-muted">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="text-foreground underline">
            가입하기
          </Link>
        </p>
      </div>
    </div>
  );
}
