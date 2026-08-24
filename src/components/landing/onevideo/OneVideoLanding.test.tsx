import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OneVideoLanding from "./OneVideoLanding";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("@/lib/i18n", () => ({ useLang: () => ({ t: (ko: string) => ko }) }));
vi.mock("@/lib/gtag", () => ({ trackEvent: vi.fn() }));

describe("OneVideoLanding", () => {
  beforeEach(() => {
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    vi.mocked(HTMLMediaElement.prototype.play).mockClear();
  });

  it("provides a truthful first action and disables autoplay for reduced motion", async () => {
    const { container } = render(<OneVideoLanding />);

    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("AI SaaS");
    expect(screen.getAllByRole("link", { name: "브랜드 베타 문의" }).length).toBeGreaterThan(0);
    expect(container.querySelectorAll("main").length).toBe(0);
    expect(container.textContent).not.toContain("UP TO ₩2.5M");
    expect(container.textContent).not.toContain("조건과 보상");
    expect(container.textContent).not.toContain("범위·일정·보상");
    expect(container.textContent).toContain("범위·일정·검수 기준");
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });
});
