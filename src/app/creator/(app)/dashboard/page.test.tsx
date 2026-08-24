import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/api";
import CreatorDashboardPage from "./page";

vi.mock("@/lib/i18n", () => ({ useLang: () => ({ t: (ko: string) => ko }) }));
vi.mock("@/lib/api", () => ({ default: { get: vi.fn() } }));

afterEach(() => vi.resetAllMocks());

describe("CreatorDashboardPage", () => {
  it("combines real application, campaign, and performance data with payments hidden", async () => {
    vi.mocked(api.get).mockImplementation((url) => {
      if (url === "/me/stats") return Promise.resolve({ data: { totalEarned: 350000, completedCount: 2, activeCount: 1 } }) as never;
      if (url === "/me/applications") return Promise.resolve({ data: { applications: [{ id: 3, status: "CHANGES_REQUESTED", appliedAt: "2026-08-01", campaign: { id: 8, title: "AI 보이스 캠페인", brandName: "Demo SaaS", rewardAmount: 180000 } }] } }) as never;
      if (url === "/campaigns?sort=recent") return Promise.resolve({ data: { campaigns: [{ id: 9, title: "새 AI 브리프", brandName: "Next Brand", rewardAmount: 220000, deadline: "2026-09-01", applicationCount: 0, myApplication: null }] } }) as never;
      return Promise.resolve({ data: { totals: { views: 12500, likes: 930, comments: 41, completedCount: 2 } } }) as never;
    });

    render(<CreatorDashboardPage />);

    expect(await screen.findByText("AI 보이스 캠페인")).toBeTruthy();
    expect(screen.getByText("수정 필요")).toBeTruthy();
    // 새 캠페인 목록과 다가오는 일정(마감 D-day) 양쪽에 나타날 수 있다
    expect(screen.getAllByText("새 AI 브리프").length).toBeGreaterThan(0);
    expect(screen.queryByText("₩350,000")).toBeNull();
    expect(screen.queryByText("₩180,000")).toBeNull();
    expect(screen.queryByText("₩220,000")).toBeNull();
    expect(screen.queryByRole("tab", { name: "정산" })).toBeNull();
    expect(screen.getByText(/12,500/)).toBeTruthy();
  });

  it("uses explicit empty states instead of illustrative performance claims", async () => {
    vi.mocked(api.get).mockImplementation((url) => {
      if (url === "/me/stats") return Promise.resolve({ data: { totalEarned: 0, completedCount: 0, activeCount: 0 } }) as never;
      if (url === "/me/applications") return Promise.resolve({ data: { applications: [] } }) as never;
      if (url === "/campaigns?sort=recent") return Promise.resolve({ data: { campaigns: [] } }) as never;
      return Promise.resolve({ data: { totals: { views: 0, likes: 0, comments: 0, completedCount: 0 } } }) as never;
    });

    render(<CreatorDashboardPage />);

    expect(await screen.findByText("진행 중인 제작 작업이 없습니다.")).toBeTruthy();
    expect(screen.getByText("현재 모집 중인 캠페인이 없습니다.")).toBeTruthy();
    expect(screen.queryByText("3.12M")).toBeNull();
  });
});
