import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/api";
import MarketingConsentSettings from "./MarketingConsentSettings";

vi.mock("@/lib/i18n", () => ({ useLang: () => ({ t: (ko: string) => ko }) }));
vi.mock("@/lib/legalVersions", () => ({
  LEGAL_CONSENT_VERSIONS: { marketingVersion: "marketing-final-v1" },
}));
vi.mock("@/lib/api", () => ({
  default: { get: vi.fn(), put: vi.fn() },
}));

afterEach(() => vi.resetAllMocks());

describe("MarketingConsentSettings", () => {
  it("withdraws an existing opt-in without requiring a new document agreement", async () => {
    const user = userEvent.setup();
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { optedIn: true, optedInAt: "2026-01-01T00:00:00" },
    });
    vi.mocked(api.put).mockResolvedValueOnce({
      data: { optedIn: false, optedInAt: null },
    });

    render(<MarketingConsentSettings />);

    const checkbox = await screen.findByRole("checkbox", {
      name: /이메일 마케팅 정보 수신에 동의합니다/,
    });
    expect((checkbox as HTMLInputElement).checked).toBe(true);
    await user.click(checkbox);
    await user.click(screen.getByRole("button", { name: "수신 설정 저장" }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith("/account/marketing-consent", {
        optedIn: false,
      }),
    );
    expect(await screen.findByText("마케팅 이메일 수신 동의를 철회했습니다.")).toBeTruthy();
  });

  it("sends the exact displayed version only when opting in", async () => {
    const user = userEvent.setup();
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { optedIn: false, optedInAt: null },
    });
    vi.mocked(api.put).mockResolvedValueOnce({
      data: { optedIn: true, optedInAt: "2026-08-13T05:00:00" },
    });

    render(<MarketingConsentSettings />);
    const checkbox = await screen.findByRole("checkbox", {
      name: /이메일 마케팅 정보 수신에 동의합니다/,
    });
    await user.click(checkbox);
    await user.click(screen.getByRole("button", { name: "수신 설정 저장" }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith("/account/marketing-consent", {
        optedIn: true,
        marketingVersion: "marketing-final-v1",
      }),
    );
  });
});
