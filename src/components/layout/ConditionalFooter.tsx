"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import { isLandingPath } from "@/lib/landingPaths";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // 랜딩페이지에서는 전용 푸터(landing/Footer)를 사용하므로 기본 푸터 숨김
  if (isLandingPath(pathname)) return null;

  return <Footer />;
}
