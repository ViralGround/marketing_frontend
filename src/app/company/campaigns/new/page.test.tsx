import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/api";
import NewCampaignPage from "./page";

const mocks = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("@/lib/i18n", () => ({ useLang: () => ({ t: (ko: string) => ko }) }));
vi.mock("@/lib/api", () => ({ default: { post: vi.fn() } }));
vi.mock("@/components/ui/ImageUploader", () => ({ default: () => null }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));

afterEach(() => {
  vi.mocked(api.post).mockReset();
  mocks.push.mockReset();
});

async function completeBasics(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole("textbox", { name: "캠페인 제목" }), "AI SaaS QA 캠페인");
  await user.type(screen.getByRole("textbox", { name: "브랜드명" }), "ViralGround QA");
  await user.click(screen.getByRole("button", { name: /제품 홍보/ }));
  await user.type(
    screen.getByRole("textbox", { name: "캠페인 설명" }),
    "단계 이동과 최종 요청 계약을 확인합니다.",
  );
}

describe("NewCampaignPage", () => {
  it("keeps the current step on required-field errors and preserves values between steps", async () => {
    const user = userEvent.setup();
    render(<NewCampaignPage />);

    await user.click(screen.getByRole("button", { name: /^다음$/ }));
    expect(screen.getByRole("heading", { name: "캠페인 기본 정보" })).toBeTruthy();

    await completeBasics(user);
    await user.click(screen.getByRole("button", { name: /^다음$/ }));
    expect(screen.getByRole("heading", { name: "필수 결과물 · 요구사항" })).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /기본 정보/ }));
    expect((screen.getByRole("textbox", { name: "캠페인 제목" }) as HTMLInputElement).value).toBe("AI SaaS QA 캠페인");
    expect((screen.getByRole("textbox", { name: "브랜드명" }) as HTMLInputElement).value).toBe("ViralGround QA");
    expect((screen.getByRole("textbox", { name: "캠페인 설명" }) as HTMLTextAreaElement).value).toBe("단계 이동과 최종 요청 계약을 확인합니다.");
    expect(screen.getByRole("button", { name: /제품 홍보/ }).getAttribute("aria-pressed")).toBe("true");
  });

  it("submits the unchanged REST payload contract from the final step", async () => {
    const user = userEvent.setup();
    vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 77 } } as never);
    render(<NewCampaignPage />);

    await completeBasics(user);
    await user.click(screen.getByRole("button", { name: /보상·모집/ }));
    await user.type(screen.getByRole("spinbutton", { name: "1인당 보상 (원)" }), "300000");
    await user.click(screen.getByRole("button", { name: /^캠페인 등록$/ }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/company/campaigns", {
        title: "AI SaaS QA 캠페인",
        description: "[캠페인 목적] 제품 홍보\n\n단계 이동과 최종 요청 계약을 확인합니다.",
        brandName: "ViralGround QA",
        rewardAmount: 300000,
        maxParticipants: 1,
        thumbnailFileKey: null,
        requirements: null,
        deadline: null,
      }),
    );
    expect(mocks.push).toHaveBeenCalledWith("/company/campaigns/77");
  });
});
