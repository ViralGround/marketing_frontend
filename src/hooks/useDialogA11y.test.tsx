import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useDialogA11y } from "./useDialogA11y";

function Harness() {
  const [open, setOpen] = useState(false);
  const dialogRef = useDialogA11y<HTMLDivElement>(open, () => setOpen(false));
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>열기</button>
      {open && (
        <div ref={dialogRef} tabIndex={-1} role="dialog">
          <button type="button">첫 번째</button>
          <button type="button">마지막</button>
        </div>
      )}
    </>
  );
}

describe("useDialogA11y", () => {
  it("traps focus, closes on Escape, and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "열기" });

    await user.click(trigger);
    const first = await screen.findByRole("button", { name: "첫 번째" });
    const last = screen.getByRole("button", { name: "마지막" });
    expect(document.activeElement).toBe(first);

    last.focus();
    fireEvent.keyDown(window, { key: "Tab" });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
