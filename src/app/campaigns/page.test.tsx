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

  it("does not render a monetary offer from a legacy-shaped landing payload", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { campaigns: [{
      id: 1,
      title: "AI 제품 소개",
      brandName: "테스트 브랜드",
      rewardAmount: 500000,
      deadline: null,
      maxParticipants: 3,
      applicationCount: 1,
      thumbnailUrl: null,
      companyMemberId: null,
      logoUrl: null,
      brandIntroduction: null,
    }] } });

    const { container } = render(<PublicCampaignsPage />);

    await screen.findByText("AI 제품 소개");
    expect(container.textContent).toContain("작업 범위");
    expect(container.textContent).not.toContain("₩");
    expect(container.textContent).not.toContain("기본 보상");
    expect(container.textContent).not.toContain("지급 방식");
    expect(container.textContent).not.toContain("결제·정산");
  });
});
