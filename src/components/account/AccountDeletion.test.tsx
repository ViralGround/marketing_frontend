import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/api";
import { removeTokens } from "@/lib/auth";
import AccountDeletion from "./AccountDeletion";

const mocks = vi.hoisted(() => ({
  logout: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("@/lib/i18n", () => ({ useLang: () => ({ t: (ko: string) => ko }) }));
vi.mock("@/lib/api", () => ({ default: { delete: vi.fn() } }));
vi.mock("@/lib/auth", () => ({ removeTokens: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}));
vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: (selector: (state: { logout: () => void }) => unknown) =>
    selector({ logout: mocks.logout }),
}));

afterEach(() => {
  vi.resetAllMocks();
  document.body.style.overflow = "";
});

async function openAndConfirm(
  user: ReturnType<typeof userEvent.setup>,
  scope: "company" | "creator",
) {
  const accountName = scope === "company" ? "회사" : "크리에이터";
  const opener = screen.getByRole("button", { name: `${accountName} 계정 탈퇴` });
  await user.click(opener);
  const dialog = screen.getByRole("dialog", {
    name: `${accountName} 계정을 탈퇴할까요?`,
  });
  await user.click(within(dialog).getByRole("checkbox"));
  return { opener, dialog };
}

describe("AccountDeletion", () => {
  it("requires explicit confirmation, deletes the creator account, and clears the session", async () => {
    const user = userEvent.setup();
    vi.mocked(api.delete).mockResolvedValueOnce({ status: 204 } as never);
    vi.mocked(removeTokens).mockResolvedValueOnce(undefined);
    render(<AccountDeletion scope="creator" />);

    const opener = screen.getByRole("button", { name: "크리에이터 계정 탈퇴" });
    await user.click(opener);
    const dialog = screen.getByRole("dialog", {
      name: "크리에이터 계정을 탈퇴할까요?",
    });
    expect(dialog.parentElement?.parentElement).toBe(document.body);
    expect(document.body.style.overflow).toBe("hidden");
    expect(
      within(dialog).getByText(/로그인과 크리에이터 계정의 공개 노출이 즉시 차단/),
    ).toBeTruthy();
    expect(
      within(dialog).getByText(/거래·법적 증적은 관련 법령 및 승인된 보존기간/),
    ).toBeTruthy();

    const deleteButton = within(dialog).getByRole("button", { name: "계정 탈퇴" });
    expect((deleteButton as HTMLButtonElement).disabled).toBe(true);
    await user.click(within(dialog).getByRole("checkbox"));
    expect((deleteButton as HTMLButtonElement).disabled).toBe(false);
    await user.click(deleteButton);

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith("/me"));
    expect(removeTokens).toHaveBeenCalledOnce();
    expect(mocks.logout).toHaveBeenCalledOnce();
    expect(mocks.replace).toHaveBeenCalledWith("/");
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("explains a creator campaign conflict and links to the matching status section", async () => {
    const user = userEvent.setup();
    vi.mocked(api.delete).mockRejectedValueOnce({
      response: {
        status: 409,
        data: { code: "ACCOUNT_HAS_ACTIVE_CAMPAIGN" },
      },
    });
    render(<AccountDeletion scope="creator" />);

    const { dialog } = await openAndConfirm(user, "creator");
    await user.click(within(dialog).getByRole("button", { name: "계정 탈퇴" }));

    const alert = await within(dialog).findByRole("alert");
    expect(alert.textContent).toContain("진행 중인 캠페인 또는 미정산 건");
    expect(
      within(alert).getByRole("link", { name: "내 캠페인 현황 확인" }).getAttribute("href"),
    ).toBe("/creator/mypage#creator-applications");
    expect(
      (within(dialog).getByRole("button", { name: "다시 시도" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
    expect(removeTokens).not.toHaveBeenCalled();
    expect(mocks.logout).not.toHaveBeenCalled();
  });

  it("closes the creator dialog on Escape and restores focus to its trigger", async () => {
    const user = userEvent.setup();
    render(<AccountDeletion scope="creator" />);
    const opener = screen.getByRole("button", { name: "크리에이터 계정 탈퇴" });
    await user.click(opener);

    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(opener);
    expect(document.body.style.overflow).toBe("");
  });

  it("preserves the company endpoint and login redirect contract", async () => {
    const user = userEvent.setup();
    vi.mocked(api.delete).mockResolvedValueOnce({ status: 204 } as never);
    vi.mocked(removeTokens).mockResolvedValueOnce(undefined);
    render(<AccountDeletion scope="company" />);

    const { dialog } = await openAndConfirm(user, "company");
    await user.click(within(dialog).getByRole("button", { name: "계정 탈퇴" }));

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith("/company/me"));
    expect(removeTokens).toHaveBeenCalledOnce();
    expect(mocks.logout).toHaveBeenCalledOnce();
    expect(mocks.replace).toHaveBeenCalledWith("/login");
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("preserves the company active-campaign recovery link", async () => {
    const user = userEvent.setup();
    vi.mocked(api.delete).mockRejectedValueOnce({
      response: {
        status: 409,
        data: { code: "ACCOUNT_HAS_ACTIVE_CAMPAIGN" },
      },
    });
    render(<AccountDeletion scope="company" />);

    const { dialog } = await openAndConfirm(user, "company");
    await user.click(within(dialog).getByRole("button", { name: "계정 탈퇴" }));

    const alert = await within(dialog).findByRole("alert");
    expect(
      within(alert).getByRole("link", { name: "캠페인 상태 확인" }).getAttribute("href"),
    ).toBe("/company/campaigns");
  });
});
