import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/api";
import InstagramConnectCard from "./InstagramConnectCard";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/creator/mypage",
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/lib/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));
vi.mock("@/lib/i18n", () => ({ useLang: () => ({ t: (ko: string) => ko }) }));

describe("InstagramConnectCard", () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
    vi.mocked(api.post).mockReset();
    vi.mocked(api.delete).mockReset();
  });

  it("starts the direct Meta authorization contract without loading a third-party SDK", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        connected: false,
        status: "NONE",
        igUsername: null,
        profileInstagramId: "viral_creator",
        connectedAt: null,
        lastSyncedAt: null,
        lastError: null,
      },
    });
    vi.mocked(api.post).mockReturnValue(new Promise(() => undefined));
    const user = userEvent.setup();
    render(<InstagramConnectCard />);

    await screen.findByText(/@viral_creator/);
    await user.click(screen.getByRole("button", { name: "Instagram 연결" }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/creator/instagram/authorize"));
    expect(document.querySelector('script[src*="phyllo"]')).toBeNull();
  });
});
