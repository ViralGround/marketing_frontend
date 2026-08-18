import type { ReactNode } from "react";

/**
 * 소프트 오픈: 공개 크리에이터 풀은 실데이터가 0인 동안 색인 제외.
 * /creators/[id]가 클라이언트 컴포넌트라 metadata를 못 내보내므로
 * 레이아웃에서 robots를 걸어 목록·상세를 한 번에 덮는다 (sitemap·robots.ts와 정합).
 */
export const metadata = {
  robots: { index: false, follow: false },
};

export default function CreatorsLayout({ children }: { children: ReactNode }) {
  return children;
}
