"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import { isLandingPath } from "@/lib/landingPaths";

export default function ConditionalHeader() {
  const pathname = usePathname();

  // 랜딩페이지에서는 전용 헤더(LandingHeader)를 사용하므로 기본 헤더 숨김
  if (isLandingPath(pathname)) return null;

  return <Header />;
}
