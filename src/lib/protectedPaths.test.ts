import { describe, expect, it } from "vitest";
import { isProtectedAppPath, isRoleWorkspacePath } from "./protectedPaths";

describe("isProtectedAppPath", () => {
  it.each(["/business", "/creator", "/creators", "/login", "/signup/company"])(
    "keeps the public route %s outside auth redirects",
    (pathname) => {
      expect(isProtectedAppPath(pathname)).toBe(false);
    },
  );

  it.each([
    "/company",
    "/company/dashboard",
    "/admin/members",
    "/creator/home",
    "/creator/campaigns/1",
    "/profile/setup",
  ])("recognizes the protected route %s", (pathname) => {
    expect(isProtectedAppPath(pathname)).toBe(true);
  });
});

describe("isRoleWorkspacePath", () => {
  it.each([
    "/company/dashboard",
    "/company/campaigns/4",
    "/creator/dashboard",
    "/creator/mypage",
    "/admin",
    "/admin/dashboard",
  ])(
    "uses the authenticated workspace chrome for %s",
    (pathname) => expect(isRoleWorkspacePath(pathname)).toBe(true),
  );

  it.each(["/creator", "/creators", "/business", "/profile/setup"])(
    "keeps the existing page chrome for %s",
    (pathname) => expect(isRoleWorkspacePath(pathname)).toBe(false),
  );
});
