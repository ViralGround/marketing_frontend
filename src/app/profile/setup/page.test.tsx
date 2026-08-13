import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/api";
import ProfileSetupPage from "./page";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("@/lib/i18n", () => ({ useLang: () => ({ t: (ko: string) => ko }) }));
vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

afterEach(() => {
  vi.resetAllMocks();
});

describe("ProfileSetupPage", () => {
  it("loads every editable profile value and saves the explicit public opt-in", async () => {
    const user = userEvent.setup();
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        hasProfile: true,
        profile: {
          canEdit: false,
          editingSkill: "MEDIUM",
          faceExposure: true,
          profileImage: "profiles/existing.webp",
          instagramId: "existing_creator",
          publicProfileOptIn: true,
        },
      },
    });
    vi.mocked(api.post).mockResolvedValueOnce({ status: 200 } as never);

    render(<ProfileSetupPage />);

    const instagram = await screen.findByRole("textbox", { name: /인스타그램 아이디/ });
    expect((instagram as HTMLInputElement).value).toBe("existing_creator");
    expect(
      within(screen.getByRole("group", { name: "영상 편집이 가능한가요?" }))
        .getByRole("button", { name: "아니요" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      within(screen.getByRole("group", { name: "편집 실력은 어느 정도인가요?" }))
        .getByRole("button", { name: "중" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      within(screen.getByRole("group", { name: "얼굴 공개가 가능한가요?" }))
        .getByRole("button", { name: "예" })
        .getAttribute("aria-pressed"),
    ).toBe("true");

    const publicOptIn = screen.getByRole("checkbox", {
      name: /공개 크리에이터 풀에 내 프로필 노출/,
    });
    expect((publicOptIn as HTMLInputElement).checked).toBe(true);
    expect(screen.getByText(/연락처, 제출 파일, 지급액은 공개되지 않습니다/)).toBeTruthy();
    expect(screen.getByText(/동의하지 않아도 프로필 저장과 캠페인 참여가 가능/)).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "프로필 저장" }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/profile", {
        canEdit: false,
        editingSkill: "MEDIUM",
        faceExposure: true,
        profileImage: "profiles/existing.webp",
        instagramId: "existing_creator",
        publicProfileOptIn: true,
      }),
    );
    expect(mocks.push).toHaveBeenCalledWith("/creator/home");
  });

  it("defaults public exposure to false without blocking profile save or campaign participation", async () => {
    const user = userEvent.setup();
    vi.mocked(api.get).mockResolvedValueOnce({ data: { hasProfile: false } });
    vi.mocked(api.post).mockResolvedValueOnce({ status: 200 } as never);

    render(<ProfileSetupPage />);

    const publicOptIn = await screen.findByRole("checkbox", {
      name: /공개 크리에이터 풀에 내 프로필 노출/,
    });
    expect((publicOptIn as HTMLInputElement).checked).toBe(false);

    await user.click(
      within(screen.getByRole("group", { name: "영상 편집이 가능한가요?" })).getByRole(
        "button",
        { name: "예" },
      ),
    );
    await user.click(
      within(screen.getByRole("group", { name: "편집 실력은 어느 정도인가요?" })).getByRole(
        "button",
        { name: "상" },
      ),
    );
    await user.click(
      within(screen.getByRole("group", { name: "얼굴 공개가 가능한가요?" })).getByRole(
        "button",
        { name: "아니요" },
      ),
    );
    await user.click(screen.getByRole("button", { name: "프로필 저장" }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        "/profile",
        expect.objectContaining({
          publicProfileOptIn: false,
          profileImage: null,
          instagramId: null,
        }),
      ),
    );
  });

  it("blocks an unsafe empty form when loading fails and supports a bounded retry", async () => {
    const user = userEvent.setup();
    vi.mocked(api.get)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ data: { hasProfile: false } });

    render(<ProfileSetupPage />);

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("기존 정보를 보호하기 위해 빈 폼을 열지 않았습니다");
    expect(screen.queryByRole("button", { name: "프로필 저장" })).toBeNull();

    await user.click(within(alert).getByRole("button", { name: "다시 불러오기" }));

    expect(await screen.findByRole("button", { name: "프로필 저장" })).toBeTruthy();
    expect(api.get).toHaveBeenCalledTimes(2);
  });

  it("aborts an in-flight profile request when the page unmounts", () => {
    let requestSignal: AbortSignal | undefined;
    vi.mocked(api.get).mockImplementationOnce((_url, config) => {
      requestSignal = config?.signal as AbortSignal;
      return new Promise(() => {}) as never;
    });

    const { unmount } = render(<ProfileSetupPage />);
    unmount();

    expect(requestSignal?.aborted).toBe(true);
  });
});
