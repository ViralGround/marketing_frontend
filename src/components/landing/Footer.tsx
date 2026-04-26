import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div>
            <Link href="/" className="text-lg font-bold text-primary">
              Viral Ground
            </Link>
            <p className="mt-1 text-sm text-faint">
              크리에이터와 브랜드를 연결하는 마케팅 플랫폼
            </p>
          </div>
          <nav className="flex gap-6 text-sm text-muted">
            <Link href="/login" className="hover:text-primary transition-colors">
              로그인
            </Link>
            <Link href="/signup/creator" className="hover:text-primary transition-colors">
              크리에이터 가입
            </Link>
            <Link href="/contents" className="hover:text-primary transition-colors">
              콘텐츠
            </Link>
          </nav>
        </div>
        <div className="mt-8 border-t border-line pt-6 text-center text-xs text-faint">
          &copy; {new Date().getFullYear()} Viral Ground. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
