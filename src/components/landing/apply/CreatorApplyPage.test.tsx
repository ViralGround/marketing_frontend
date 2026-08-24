import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CreatorApplyPage from "./CreatorApplyPage";

vi.mock("@/lib/i18n", () => ({ useLang: () => ({ t: (ko: string) => ko }) }));
vi.mock("@/lib/gtag", () => ({ trackEvent: vi.fn() }));
vi.mock("@/components/landing/onevideo/GroundTopbar", () => ({ default: () => <div>topbar</div> }));
vi.mock("@/components/landing/onevideo/GroundFooter", () => ({ default: () => <div>footer</div> }));

describe("CreatorApplyPage non-transactional release copy", () => {
  it("explains scope, timeline, and review without promising payment", () => {
    const { container } = render(<CreatorApplyPage />);

    expect(screen.getByRole("heading", { name: "작업 조건 — 범위와 일정" })).toBeTruthy();
    expect(container.textContent).toContain("매칭과 작업 관리만 제공합니다");
    expect(container.textContent).not.toContain("기본 보상");
    expect(container.textContent).not.toContain("지급 방식");
    expect(container.textContent).not.toContain("자동 정산");
    expect(container.textContent).not.toContain("₩");
  });
});
