import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ConsultationModal from "./ConsultationModal";
import api from "@/lib/api";
import { PRIVACY_VERSION } from "@/lib/legal/privacy";

vi.mock("@/lib/i18n", () => ({ useLang: () => ({ t: (ko: string) => ko }) }));
vi.mock("@/lib/gtag", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/api", () => ({ default: { post: vi.fn() } }));

describe("ConsultationModal", () => {
  it("portals above transformed landing content and restores focus on Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { rerender } = render(
      <>
        <button type="button">상담 열기</button>
        <div style={{ transform: "translateZ(0)" }}>
          <ConsultationModal open={false} onClose={onClose} />
        </div>
      </>,
    );
    const opener = screen.getByRole("button", { name: "상담 열기" });
    opener.focus();

    rerender(
      <>
        <button type="button">상담 열기</button>
        <div style={{ transform: "translateZ(0)" }}>
          <ConsultationModal open onClose={onClose} />
        </div>
      </>,
    );

    const dialog = screen.getByRole("dialog", { name: "가벼운 상담신청" });
    expect(dialog.parentElement).toBe(document.body);
    expect(document.body.style.overflow).toBe("hidden");

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();

    rerender(
      <>
        <button type="button">상담 열기</button>
        <div style={{ transform: "translateZ(0)" }}>
          <ConsultationModal open={false} onClose={onClose} />
        </div>
      </>,
    );
    await waitFor(() => expect(document.body.style.overflow).toBe(""));
    expect(document.activeElement).toBe(opener);
  });

  it("sends explicit privacy consent with the exact rendered document version", async () => {
    const user = userEvent.setup();
    vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 1 } });
    render(<ConsultationModal open onClose={vi.fn()} />);

    await user.type(screen.getByLabelText(/이메일 주소/), "brand@example.com");
    await user.type(screen.getByLabelText(/브랜드명/), "바이럴 브랜드");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "상담 신청하기" }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/contact", expect.objectContaining({
      privacyConsent: true,
      privacyVersion: PRIVACY_VERSION,
      website: "",
    })));
  });
});
