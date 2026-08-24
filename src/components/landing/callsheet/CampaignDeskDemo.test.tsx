import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CampaignDeskDemo from "./CampaignDeskDemo";

vi.mock("@/lib/i18n", () => ({ useLang: () => ({ t: (ko: string) => ko }) }));
vi.mock("@/lib/gtag", () => ({ trackEvent: vi.fn() }));

describe("CampaignDeskDemo", () => {
  it("does not advertise file upload while the release flag is disabled", async () => {
    const user = userEvent.setup();
    render(<CampaignDeskDemo />);

    await user.click(screen.getByRole("tab", { name: /제출/ }));

    const panel = screen.getByRole("tabpanel");
    expect(within(panel).getByText("파일 제출 비활성화")).toBeTruthy();
    expect(within(panel).getByText(/전용 저장소와 접근 정책 검증/)).toBeTruthy();
    expect(within(panel).queryByText(/500MB/)).toBeNull();
    expect(within(panel).queryByRole("button", { name: "업로드 후 제출" })).toBeNull();
  });
});
