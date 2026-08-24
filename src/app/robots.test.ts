import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "./robots";

afterEach(() => vi.unstubAllEnvs());

describe("robots metadata", () => {
  it("disallows every crawler on staging", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://staging.viralground.kr");

    expect(robots()).toEqual({
      rules: { userAgent: "*", disallow: "/" },
    });
  });

  it("keeps public production SEO and route-specific exclusions", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://viralground.kr");
    const result = robots();

    expect(result.sitemap).toBe("https://viralground.kr/sitemap.xml");
    expect(result.rules).toMatchObject({ userAgent: "*", allow: "/" });
  });
});
