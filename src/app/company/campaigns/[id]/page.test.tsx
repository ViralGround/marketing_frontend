import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/api";
import CompanyCampaignDetailPage from "./page";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  t: (ko: string) => ko,
}));

vi.mock("@/lib/i18n", () => ({ useLang: () => ({ t: mocks.t }) }));
vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "7" }),
  useRouter: () => ({ push: mocks.push }),
}));
vi.mock("@/components/submission/SubmissionTimeline", () => ({ default: () => null }));
vi.mock("@/components/review/ReviewForm", () => ({ default: () => null }));

afterEach(() => {
  vi.resetAllMocks();
});

function detail(escrowStatus: "NONE" | "PENDING_DEPOSIT" | "DEPOSIT_CONFIRMING" | "FUNDED") {
  return {
    id: 7,
    title: "Beta campaign",
    description: "Campaign description",
    brandName: "Viral Ground",
    rewardAmount: 100000,
    totalBudget: 200000,
    maxParticipants: 2,
    status: "DRAFT",
    escrowStatus,
    deadline: null,
    requirements: null,
    thumbnailUrl: null,
    depositRequestedAt: null,
    fundedAt: null,
    createdAt: "2026-08-13T00:00:00Z",
    applicationCount: 1,
    applications: [
      {
        id: 31,
        status: "PENDING",
        message: null,
        submissionUrl: null,
        videoFileKey: null,
        resubmissionCount: 0,
        reviewComment: null,
        rewardPaidAmount: null,
        appliedAt: "2026-08-13T00:00:00Z",
        submittedAt: null,
        settledAt: null,
        creator: { id: 91, name: "Creator Lee", email: "creator@example.com" },
        submissions: [],
      },
    ],
    escrowTransactions: [],
  };
}

describe("CompanyCampaignDetailPage payment truth", () => {
  it("hides disabled payment surfaces and renders applicants without public links", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: detail("PENDING_DEPOSIT") } as never);

    render(<CompanyCampaignDetailPage />);

    expect(await screen.findByRole("heading", { name: "Beta campaign" })).toBeTruthy();
    expect(screen.queryByText(/관리 베타에서는 결제·정산 기능이 비활성화/)).toBeNull();
    expect(screen.queryByText(/어떤 계좌로도 송금하지 마세요/)).toBeNull();
    expect(screen.queryByText(/운영 계약이 체결되고 PG 결제가 활성화된 뒤/)).toBeNull();
    expect(screen.queryByText(/국민은행/)).toBeNull();
    expect(screen.queryByRole("button", { name: /계좌이체 완료/ })).toBeNull();
    expect(api.post).not.toHaveBeenCalled();

    const creatorName = screen.getByText("Creator Lee");
    expect(creatorName.closest("a")).toBeNull();
    expect(screen.queryByRole("link", { name: /상세 프로필/ })).toBeNull();
    expect(document.querySelector('a[href="/creators/91"]')).toBeNull();
  });

  it("hides the legacy deposit-review state while payments are disabled", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: detail("DEPOSIT_CONFIRMING") } as never);

    render(<CompanyCampaignDetailPage />);

    expect(await screen.findByRole("heading", { name: "Beta campaign" })).toBeTruthy();
    expect(screen.queryByText(/기존 운영 기록상 입금 확인 단계/)).toBeNull();
    expect(screen.queryByText(/이 상태만으로 실제 송금이나 확인 완료를 보장하지 않습니다/)).toBeNull();
    expect(screen.queryByText(/메일로 알려드립니다/)).toBeNull();
  });

  it("hides the legacy funded state while payments are disabled", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: detail("FUNDED") } as never);

    render(<CompanyCampaignDetailPage />);

    expect(await screen.findByRole("heading", { name: "Beta campaign" })).toBeTruthy();
    expect(screen.queryByText(/기존 운영 기록상 예치 완료 상태/)).toBeNull();
    expect(screen.queryByText(/결제·정산 보증이나 현재 PG 처리 완료를 의미하지 않습니다/)).toBeNull();
    expect(screen.queryByText(/캠페인이 공개되었습니다/)).toBeNull();
  });

  it("publishes a nonfinancial draft without calling a payment endpoint", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.mocked(api.get).mockResolvedValue({ data: detail("NONE") } as never);
    vi.mocked(api.post).mockResolvedValueOnce({ data: { message: "캠페인이 모집 상태로 공개되었습니다." } } as never);

    render(<CompanyCampaignDetailPage />);
    fireEvent.click(await screen.findByRole("button", { name: "캠페인 공개" }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/company/campaigns/7/publish"));
    expect(api.post).not.toHaveBeenCalledWith(expect.stringContaining("deposit"));
  });

  it("approves submitted content as nonfinancial completion", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const submitted = detail("NONE");
    submitted.status = "OPEN";
    submitted.applications[0].status = "SUBMITTED";
    vi.mocked(api.get).mockResolvedValue({ data: submitted } as never);
    vi.mocked(api.patch).mockResolvedValueOnce({ data: { message: "지원 상태가 변경되었습니다." } } as never);

    render(<CompanyCampaignDetailPage />);
    fireEvent.click(await screen.findByRole("button", { name: /Creator Lee/ }));
    fireEvent.click(await screen.findByRole("button", { name: "콘텐츠 승인" }));

    await waitFor(() => expect(api.patch).toHaveBeenCalledWith(
      "/company/applications/31",
      { action: "APPROVE_CONTENT" },
    ));
    expect(screen.queryByText(/승인·정산은 상용 PG 활성화 후/)).toBeNull();
  });

  it("offers reviews for explicit completed work", async () => {
    const completed = detail("NONE");
    completed.status = "OPEN";
    completed.applications[0].status = "COMPLETED";
    vi.mocked(api.get).mockResolvedValueOnce({ data: completed } as never);

    render(<CompanyCampaignDetailPage />);
    fireEvent.click(await screen.findByRole("button", { name: /Creator Lee/ }));

    expect(await screen.findByRole("button", { name: "리뷰 작성" })).toBeTruthy();
    expect(screen.getAllByText("작업 완료").length).toBeGreaterThan(0);
  });
});
