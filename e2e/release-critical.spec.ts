import { expect, test } from "@playwright/test";

test("public surfaces expose route-correct metadata and one main landmark", async ({ page }) => {
  for (const path of ["/", "/business", "/creator", "/campaigns", "/creators"]) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.headers()["x-robots-tag"]).toContain("noindex");
    await expect(page.locator("main")).toHaveCount(1);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).not.toBeNull();
    expect(new URL(canonical as string).pathname).toBe(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflow).toBe(false);
  }
});

test("login surface contains no hidden demo alias", async ({ page }) => {
  await page.goto("/login/company", { waitUntil: "domcontentloaded" });
  await expect(page.getByLabel(/이메일|Email/)).toHaveAttribute("type", "email");
  await expect(page.getByText(/테스트 로그인|Test login/)).toHaveCount(0);
});

test("version endpoint exposes only public release correlation fields", async ({ request }) => {
  const response = await request.get("/version");
  expect(response.ok()).toBe(true);
  expect(Object.keys(await response.json()).sort()).toEqual(["commitSha", "releaseId"]);
});

test("preproduction robots fail closed for every crawler", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.ok()).toBe(true);
  const body = await response.text();
  expect(body).toContain("User-Agent: *");
  expect(body).toContain("Disallow: /");
  expect(body).not.toContain("Sitemap:");
});
