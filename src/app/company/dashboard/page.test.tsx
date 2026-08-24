import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/api";
import CompanyDashboardPage from "./page";

vi.mock("@/lib/i18n", () => ({ useLang: () => ({ t: (ko: string) => ko }) }));
vi.mock("@/lib/api", () => ({ default: { get: vi.fn() } }));

afterEach(() => vi.resetAllMocks());

describe("CompanyDashboardPage", () => {
  it("renders verified campaign values and hides disabled payment surfaces", async () => {
    vi.mocked(api.get).mockImplementation((url) => {
      if (url === "/company/dashboard") {
        return Promise.resolve({ data: { totalCampaigns: 2, pendingDeposit: 1, depositConfirming: 0, funded: 1, closed: 0 } }) as never;
      }
      return Promise.resolve({ data: { campaigns: [{ id: 7, title: "AI 편집 도구 런칭", brandName: "Demo Brand", status: "OPEN", applicationCount: 4, deadline: "2026-08-30", createdAt: "2026-08-01" }] } }) as never;
    });

    render(<CompanyDashboardPage />);

    // 최근 캠페인 테이블·지원 현황 차트·마감 일정에 모두 나타날 수 있다
    expect((await screen.findAllByText("AI 편집 도구 런칭")).length).toBeGreaterThan(0);
    expect(screen.getByText("4명 지원")).toBeTruthy();
    expect(screen.queryByText("OFF")).toBeNull();
    expect(screen.queryByText(/결제·정산/)).toBeNull();
    expect(screen.queryByText(/현재 어떤 계좌로도 송금하지 마세요/)).toBeNull();
    expect(screen.queryByText(/000-00-0000-000/)).toBeNull();
  });

  it("shows a useful first-campaign state for an empty company account", async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: { totalCampaigns: 0, pendingDeposit: 0, depositConfirming: 0, funded: 0, closed: 0 } } as never)
      .mockResolvedValueOnce({ data: { campaigns: [] } } as never);

    render(<CompanyDashboardPage />);

    expect(await screen.findByText("첫 캠페인을 준비해보세요.")).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /새 캠페인/ }).length).toBeGreaterThan(0);
  });
});
