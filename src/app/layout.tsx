import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalHeader from "@/components/layout/ConditionalHeader";
import Footer from "@/components/layout/Footer";
import AuthInit from "@/components/auth/AuthInit";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Viral Ground",
  description: "크리에이터와 기업을 연결하는 마케팅 플랫폼",
  openGraph: {
    title: "Viral Ground",
    description: "크리에이터와 기업을 연결하는 마케팅 플랫폼",
    url: "https://viralground.kr",
    siteName: "Viral Ground",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Viral Ground",
    description: "크리에이터와 기업을 연결하는 마케팅 플랫폼",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
        <AuthInit />
        <ConditionalHeader />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
