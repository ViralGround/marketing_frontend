import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AgreementSection, { EMPTY_AGREEMENT } from "./AgreementSection";

vi.mock("@/lib/i18n", () => ({ useLang: () => ({ t: (ko: string) => ko }) }));

describe("AgreementSection legal dialog", () => {
  it("traps a semantic portalled dialog and returns focus to its View trigger", async () => {
    const user = userEvent.setup();
    render(
      <AgreementSection
        role="COMPANY"
        value={EMPTY_AGREEMENT}
        onChange={vi.fn()}
      />,
    );

    const triggers = screen.getAllByRole("button", { name: "보기" });
    const trigger = triggers[0];
    await user.click(trigger);

    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.parentElement?.parentElement).toBe(document.body);
    expect(document.body.style.overflow).toBe("hidden");

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe("");
  });
});
