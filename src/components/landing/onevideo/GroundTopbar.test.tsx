import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GroundTopbar from "./GroundTopbar";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("@/lib/i18n", () => ({
  useLang: () => ({ t: (ko: string) => ko, lang: "ko", setLang: vi.fn() }),
}));
vi.mock("@/lib/gtag", () => ({ trackEvent: vi.fn() }));

describe("GroundTopbar", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  it("exposes a mobile menu with both beta actions and restores scroll on close", async () => {
    const user = userEvent.setup();
    render(<GroundTopbar />);

    const trigger = screen.getByRole("button", { name: "메뉴 열기" });
    await user.click(trigger);

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const menu = screen.getByRole("dialog", { name: "전체 메뉴" });
    expect(menu.parentElement).toBe(document.body);
    expect(screen.getByRole("link", { name: "브랜드 베타 문의" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "크리에이터 지원" })).toBeTruthy();
    expect(document.body.style.overflow).toBe("hidden");

    expect(document.activeElement).toBe(within(menu).getByRole("link", { name: "크리에이터" }));
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    // 포커스 트랩은 마지막 포커스 가능 요소(언어 토글)로 감긴다
    expect(document.activeElement).toBe(
      within(menu).getByRole("button", { name: "Switch to English" }),
    );

    await user.keyboard("{Escape}");
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe("");
  });
});
