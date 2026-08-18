import { beforeEach, describe, expect, it, vi } from "vitest";
import CreatorApplicationsRedirect from "./applications/page";
import CreatorCampaignsRedirect from "./campaigns/page";

const mocks = vi.hoisted(() => ({ redirect: vi.fn() }));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

beforeEach(() => mocks.redirect.mockReset());

describe("creator compatibility redirects", () => {
  it("keeps /creator/applications compatible with the consolidated work page", () => {
    CreatorApplicationsRedirect();
    expect(mocks.redirect).toHaveBeenCalledWith("/creator/mypage");
  });

  it("keeps /creator/campaigns compatible with the discover page", () => {
    CreatorCampaignsRedirect();
    expect(mocks.redirect).toHaveBeenCalledWith("/creator/home");
  });
});
