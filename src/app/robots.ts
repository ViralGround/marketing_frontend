import type { MetadataRoute } from "next";
import { isPreproductionSite } from "@/lib/deploymentEnvironment";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://viralground.kr";
  if (isPreproductionSite(siteUrl)) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 로그인이 필요하거나 개인정보가 노출되는 영역 + 소프트 오픈에서 숨긴 페이지는 색인 차단.
      // "/creator/"(후행 슬래시)는 앱 내부만 막고 공개 랜딩 /creator는 허용한다.
      disallow: [
        "/admin/",
        "/creator/",
        "/company/",
        "/creators",
        "/campaigns",
        "/profile/",
        "/login",
        "/signup",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
