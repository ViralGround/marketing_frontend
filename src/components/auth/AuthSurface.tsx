"use client";

import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/lib/i18n";

interface AuthSurfaceProps {
  title: string;
  description: string;
  children: React.ReactNode;
  wide?: boolean;
}

/** 인증 화면에서도 공개 사이트의 종이·잉크·전기 보라·Archivo 세계를 이어준다. */
export default function AuthSurface({ title, description, children, wide = false }: AuthSurfaceProps) {
  const { t } = useLang();

  return (
    <div className="relative min-h-[calc(100svh-65px)] overflow-hidden bg-paper px-5 py-12 text-ink md:px-10 md:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(10,9,11,0.12)_1px,transparent_1px)] [background-size:100%_32px]"
      />
      <div className={`relative mx-auto grid max-w-6xl gap-10 ${wide ? "lg:grid-cols-[minmax(260px,0.7fr)_minmax(520px,1.3fr)]" : "lg:grid-cols-[minmax(260px,0.9fr)_minmax(360px,1.1fr)]"} lg:items-start`}>
        <aside className="pt-3 lg:sticky lg:top-28 lg:pt-12">
          <Link href="/" className="hidden min-h-11 items-center lg:inline-flex" aria-label="ViralGround 홈">
            <Image src="/viral-ground-logo.png" alt="ViralGround" width={410} height={326} sizes="(min-width: 768px) 208px, 176px" className="h-auto w-44 md:w-52" />
          </Link>
          <p className="font-display text-[clamp(36px,11vw,88px)] uppercase leading-[0.76] tracking-[-0.04em] lg:mt-8">
            AI SaaS
            <br />
            <span className="text-violet">meets</span>
            <br />
            creators.
          </p>
          <p className="mt-5 max-w-sm text-sm font-semibold leading-relaxed text-ink/65 lg:mt-7">
            {t(
              "제품을 이해하는 크리에이터와 브리프부터 게시까지 함께 운영하는 관리형 베타.",
              "A managed beta connecting AI products with creators who can explain them clearly.",
            )}
          </p>
        </aside>

        <section className="border-2 border-ink bg-white p-6 shadow-[0_18px_48px_rgba(10,9,11,0.14)] md:p-9" aria-labelledby="auth-surface-title">
          <header className="mb-8 border-b-2 border-ink pb-6">
            <h1 id="auth-surface-title" className="text-[clamp(28px,4vw,44px)] font-black leading-tight tracking-[-0.035em]">
              {title}
            </h1>
            <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-ink/60">{description}</p>
          </header>
          {children}
        </section>
      </div>
    </div>
  );
}
