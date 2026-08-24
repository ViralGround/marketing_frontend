import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PUBLIC_ROUTES = [
  "/",
  "/business",
  "/creator",
  "/campaigns",
  "/creators",
  "/login/company",
  "/login/creator",
] as const;

for (const route of PUBLIC_ROUTES) {
  test(`${route} has no serious or critical automated accessibility violations`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.ok()).toBe(true);
    await page.evaluate(() => document.fonts.ready);

    const result = await new AxeBuilder({ page })
      .exclude('[aria-hidden="true"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    const blockingViolations = result.violations
      .filter(({ impact }) => impact === "critical" || impact === "serious")
      .map(({ id, impact, nodes }) => ({
        id,
        impact,
        nodes: nodes.length,
        targets: nodes.map(({ target }) => target.join(" ")),
        summaries: nodes.map(({ failureSummary }) => failureSummary),
      }));

    expect(blockingViolations).toEqual([]);
  });
}
