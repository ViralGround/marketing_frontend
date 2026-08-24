import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CompanyInfoModal from "./CompanyInfoModal";
import api from "@/lib/api";

vi.mock("@/lib/api", () => ({ default: { get: vi.fn() } }));
vi.mock("@/lib/i18n", () => ({ useLang: () => ({ t: (ko: string) => ko }) }));
vi.mock("@/hooks/useDialogA11y", () => ({ useDialogA11y: () => ({ current: null }) }));

describe("CompanyInfoModal non-transactional release contract", () => {
  it("never renders reward amounts even if a stale API payload still contains them", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {
      companyName: "테스트 회사",
      industry: "SaaS",
      homepage: null,
      introduction: "제품을 만드는 회사",
      logoUrl: null,
      openCampaigns: [{ id: 2, title: "다른 캠페인", rewardAmount: 900000, deadline: null }],
    } });
    const campaign = {
      id: 1,
      title: "공개 캠페인",
      brandName: "테스트 브랜드",
      rewardAmount: 500000,
      deadline: null,
      maxParticipants: 3,
      applicationCount: 1,
      thumbnailUrl: null,
      companyMemberId: 10,
      logoUrl: null,
      brandIntroduction: null,
    };

    const { container } = render(
      <CompanyInfoModal open campaign={campaign} onClose={vi.fn()} />,
    );

    await waitFor(() => expect(screen.getByText("다른 캠페인")).toBeTruthy());
    expect(container.textContent).toContain("작업 범위");
    expect(container.textContent).not.toContain("₩");
    expect(container.textContent).not.toContain("기본 보상");
    expect(container.textContent).not.toContain("500000");
    expect(container.textContent).not.toContain("900000");
  });
});
