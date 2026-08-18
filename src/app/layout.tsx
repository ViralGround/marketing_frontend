import type { Metadata } from "next";
import { Archivo_Black } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import AuthInit from "@/components/auth/AuthInit";
import ConsentAnalytics from "@/components/analytics/ConsentAnalytics";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const SUBLANDING_DIRECTION_CONTRACT = `<!--
THESIS: Public role pages behave like one live production call sheet, refusing generic SaaS card grids.
OWN-WORLD: Paper #f6f5f1, ink #0a090b and violet #7331e0; ruled documents, film contact strips, hard scene seams, Archivo Black and Pretendard.
STORY: Visitors understand the offer, inspect real workflow and workspace evidence, verify terms and choose consultation, application or campaign detail.
FIRST VIEWPORT: Giant page-specific type occupies the left, a vertical take strip owns the center, a tilted factual call sheet sits right, and the primary action remains visible.
FORM: Live production call-sheet sequence, candidate 5/7, seed 69640d99; combined with the approved Film Contact Cut typography and scroll rhythm.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

// 2-축 폰트 시스템: Pretendard(본문, globals.css에서 import) + Archivo Black(영문 디스플레이).
// Geist/Geist Mono 는 미사용 프리로드였으므로 제거 (AI-tells audit 2026-08-13).
// 시안4 확정 디스플레이 폰트 — 영문 헤드라인 전용(한글은 Pretendard 굵은 웨이트).
const archivoBlack = Archivo_Black({
  variable: "--font-archivo",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://viralground.kr"),
  title: {
    default: "Viral Ground — AI SaaS Creator Network",
    template: "%s | Viral Ground",
  },
  description: "AI SaaS를 이해하는 크리에이터와 브랜드를 연결하고 콘텐츠 성과를 함께 운영합니다.",
  alternates: { canonical: "/" },
  verification: {
    other: {
      "naver-site-verification": "a59b53171d2e2a259c4912e2d9490bbc0cd28384",
    },
  },
  openGraph: {
    title: "Viral Ground",
    description: "AI SaaS를 이해하는 크리에이터와 브랜드를 연결하고 콘텐츠 성과를 함께 운영합니다.",
    // metadataBase(NEXT_PUBLIC_SITE_URL) 기준으로 절대화 — 도메인 하드코딩 금지.
    url: "/",
    siteName: "Viral Ground",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Viral Ground",
    description: "AI SaaS를 이해하는 크리에이터와 브랜드를 연결하고 콘텐츠 성과를 함께 운영합니다.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${archivoBlack.variable} h-full antialiased`}
    >
      <head>
        {/* hydration 전에 동기 실행. localStorage 우선, 없으면 OS 설정. <html.dark> 를
            먼저 부착해 라이트→다크 전환 시 발생하는 흰 깜빡임을 막는다. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=s||(p?'dark':'light');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {/* 디자인 방향 계약은 작업용 메타데이터 — 프로덕션 HTML에는 싣지 않는다 */}
        {process.env.NODE_ENV !== "production" && (
          <template data-impeccable-contract dangerouslySetInnerHTML={{ __html: SUBLANDING_DIRECTION_CONTRACT }} />
        )}
        <AuthInit />
        <Header />
        <main className="flex-1">{children}</main>
        <ConditionalFooter />
        <ConsentAnalytics gaId={GA_ID} />
      </body>
    </html>
  );
}
