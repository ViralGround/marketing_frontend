import type { MetadataRoute } from "next";

const SITE_URL = "https://viralground.kr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 로그인이 필요하거나 개인정보가 노출되는 영역은 색인 차단.
      disallow: [
        "/admin/",
        "/creator/",
        "/company/",
        "/creators/",
        "/profile/",
        "/login",
        "/signup",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
