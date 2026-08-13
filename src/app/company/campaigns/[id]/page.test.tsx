import { render, screen } from "@testing-library/react";
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

function detail(escrowStatus: "PENDING_DEPOSIT" | "DEPOSIT_CONFIRMING" | "FUNDED") {
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
  it("shows a no-transfer managed-beta notice and renders applicants without public links", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: detail("PENDING_DEPOSIT") } as never);

    render(<CompanyCampaignDetailPage />);

    expect(await screen.findByRole("heading", { name: "Beta campaign" })).toBeTruthy();
    expect(screen.getByText(/관리 베타에서는 결제·정산 기능이 비활성화/)).toBeTruthy();
    expect(screen.getByText(/어떤 계좌로도 송금하지 마세요/)).toBeTruthy();
    expect(screen.getByText(/운영 계약이 체결되고 PG 결제가 활성화된 뒤/)).toBeTruthy();
    expect(screen.queryByText(/국민은행/)).toBeNull();
    expect(screen.queryByRole("button", { name: /계좌이체 완료/ })).toBeNull();
    expect(api.post).not.toHaveBeenCalled();

    const creatorName = screen.getByText("Creator Lee");
    expect(creatorName.closest("a")).toBeNull();
    expect(screen.queryByRole("link", { name: /상세 프로필/ })).toBeNull();
    expect(document.querySelector('a[href="/creators/91"]')).toBeNull();
  });

  it("qualifies the legacy deposit-review state without promising email confirmation", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: detail("DEPOSIT_CONFIRMING") } as never);

    render(<CompanyCampaignDetailPage />);

    expect(await screen.findByText(/기존 운영 기록상 입금 확인 단계/)).toBeTruthy();
    expect(screen.getByText(/이 상태만으로 실제 송금이나 확인 완료를 보장하지 않습니다/)).toBeTruthy();
    expect(screen.queryByText(/메일로 알려드립니다/)).toBeNull();
  });

  it("qualifies the legacy funded state without claiming a payment guarantee or automatic launch", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: detail("FUNDED") } as never);

    render(<CompanyCampaignDetailPage />);

    expect(await screen.findByText(/기존 운영 기록상 예치 완료 상태/)).toBeTruthy();
    expect(screen.getByText(/결제·정산 보증이나 현재 PG 처리 완료를 의미하지 않습니다/)).toBeTruthy();
    expect(screen.queryByText(/캠페인이 공개되었습니다/)).toBeNull();
  });
});
