import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface-muted">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© Viral Ground</p>
        <nav className="flex gap-4">
          <Link href="/terms" className="hover:text-foreground">
            이용약관
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            개인정보 처리방침
          </Link>
          <Link href="/privacy/third-party" className="hover:text-foreground">
            제3자 제공
          </Link>
          <Link href="/marketing" className="hover:text-foreground">
            마케팅 수신
          </Link>
        </nav>
      </div>
    </footer>
  );
}
