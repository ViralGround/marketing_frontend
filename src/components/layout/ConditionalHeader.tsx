"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function ConditionalHeader() {
  const pathname = usePathname();

  // 랜딩페이지에서는 전용 헤더를 사용하므로 기존 헤더 숨김
  if (pathname === "/") return null;

  return <Header />;
}
