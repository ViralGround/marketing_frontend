import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PublicCampaignsPage from "./page";
import api from "@/lib/api";

vi.mock("@/lib/api", () => ({ default: { get: vi.fn() } }));
vi.mock("@/lib/i18n", () => ({ useLang: () => ({ t: (ko: string) => ko }) }));
vi.mock("@/lib/gtag", () => ({ trackEvent: vi.fn() }));
vi.mock("@/components/landing/onevideo/GroundTopbar", () => ({ default: () => <div>topbar</div> }));
vi.mock("@/components/landing/onevideo/GroundFooter", () => ({ default: () => <div>footer</div> }));
vi.mock("@/components/landing/CompanyInfoModal", () => ({ default: () => null }));

describe("PublicCampaignsPage", () => {
  beforeEach(() => vi.mocked(api.get).mockReset());

  it("does not disguise a request failure as an empty state and supports retry", async () => {
    vi.mocked(api.get)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ data: { campaigns: [] } });
    const user = userEvent.setup();
    render(<PublicCampaignsPage />);

    expect((await screen.findByRole("alert")).textContent).toContain("캠페인을 불러오지 못했습니다");
    expect(screen.queryByText("다음 캠페인을 준비 중이에요")).toBeNull();

    await user.click(screen.getByRole("button", { name: "다시 불러오기" }));
    await waitFor(() => expect(screen.getByText("다음 캠페인을 준비 중이에요")).toBeTruthy());
    expect(api.get).toHaveBeenCalledTimes(2);
  });
});
