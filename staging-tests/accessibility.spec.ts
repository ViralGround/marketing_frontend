import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const STAGING_ORIGIN = "https://staging.viralground.kr";
const API_ORIGIN = "https://api.staging.viralground.kr";
const ROUTES = [
  "/",
  "/business",
  "/creator",
  "/campaigns",
  "/creators",
  "/login/company",
  "/login/creator",
] as const;

for (const route of ROUTES) {
  test(`staging ${route} has no serious or critical axe violations`, async ({ page }) => {
    expect(new URL(STAGING_ORIGIN).origin).toBe("https://staging.viralground.kr");
    const unexpectedNetworkTargets: string[] = [];
    await page.route("**/*", async (requestRoute) => {
      const target = new URL(requestRoute.request().url());
      if (
        !["http:", "https:"].includes(target.protocol) ||
        target.origin === STAGING_ORIGIN ||
        target.origin === API_ORIGIN
      ) {
        await requestRoute.continue();
        return;
      }
      unexpectedNetworkTargets.push(target.origin);
      await requestRoute.abort("blockedbyclient");
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const response = await page.goto(`${STAGING_ORIGIN}${route}`, {
      waitUntil: "domcontentloaded",
    });
    expect(response?.ok()).toBe(true);
    expect(response?.headers()["x-robots-tag"]?.toLowerCase()).toContain("noindex");
    expect(response?.headers()["content-security-policy"]).toContain(
      `connect-src 'self' ${API_ORIGIN}`,
    );
    await page.evaluate(() => document.fonts.ready);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical?.startsWith(STAGING_ORIGIN)).toBe(true);
    const result = await new AxeBuilder({ page })
      .exclude('[aria-hidden="true"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations
        .filter(({ impact }) => impact === "critical" || impact === "serious")
        .map(({ id, impact, nodes }) => ({
          id,
          impact,
          nodes: nodes.length,
          targets: nodes.map(({ target }) => target.join(" ")),
          summaries: nodes.map(({ failureSummary }) => failureSummary),
        })),
    ).toEqual([]);
    expect([...new Set(unexpectedNetworkTargets)]).toEqual([]);
  });
}
