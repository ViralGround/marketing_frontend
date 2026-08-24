import { defineConfig, devices } from "@playwright/test";

const REQUIRED_CONFIRMATION = "RUN_SANITIZED_STAGING_RC";

if (process.env.STAGING_RC_CONFIRMATION !== REQUIRED_CONFIRMATION) {
  throw new Error(
    `Refusing staging tests: STAGING_RC_CONFIRMATION must equal ${REQUIRED_CONFIRMATION}`,
  );
}

export default defineConfig({
  testDir: "./staging-tests",
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 90_000,
  reporter: process.env.CI ? [["line"], ["junit"]] : [["line"]],
  use: {
    baseURL: "https://staging.viralground.kr",
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: [
    {
      name: "staging-api",
      testIgnore: /(?:accessibility|legal-version-contract|managed-beta-browser)\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "staging-legal-version-contract",
      testMatch: /legal-version-contract\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "staging-browser-role",
      testMatch: /managed-beta-browser\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "staging-desktop-a11y",
      testMatch: /accessibility\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "staging-mobile-a11y",
      testMatch: /accessibility\.spec\.ts/,
      use: { ...devices["Pixel 7"] },
    },
  ],
});
