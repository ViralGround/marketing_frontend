import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/api";
import AdminAuditLogsPage from "./page";

vi.mock("@/lib/i18n", () => ({
  useLang: () => ({ t: (ko: string) => ko, lang: "ko" }),
}));
vi.mock("@/lib/api", () => ({ default: { get: vi.fn() } }));

afterEach(() => vi.clearAllMocks());

describe("AdminAuditLogsPage", () => {
  it("renders the PII-safe audit projection and applies exact filters", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        items: [{
          id: 1,
          requestId: "request-12345678",
          actorId: 7,
          actorRole: "ADMIN",
          action: "MEMBER_STATUS_CHANGED",
          resourceType: "member",
          resourceId: "22",
          outcome: "SUCCESS",
          createdAt: "2026-08-22T01:00:00Z",
        }],
        page: 0,
        size: 50,
        totalElements: 1,
        totalPages: 1,
      },
    } as never);

    render(<AdminAuditLogsPage />);

    expect(await screen.findByText("MEMBER_STATUS_CHANGED")).toBeTruthy();
    expect(screen.getByText("ADMIN #7")).toBeTruthy();
    expect(screen.queryByText(/free-form reason/i)).toBeNull();

    fireEvent.change(screen.getByLabelText("행위자 ID"), { target: { value: "7" } });
    fireEvent.change(screen.getByLabelText("리소스 유형"), { target: { value: "member" } });
    fireEvent.click(screen.getByRole("button", { name: "필터 적용" }));

    await waitFor(() => expect(api.get).toHaveBeenLastCalledWith(
      expect.stringContaining("actorId=7&resourceType=member"),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    ));
  });

  it("rejects an inverted time range before making another request", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { items: [], page: 0, size: 50, totalElements: 0, totalPages: 0 },
    } as never);
    render(<AdminAuditLogsPage />);
    await screen.findByText("조건에 맞는 감사로그가 없습니다.");

    fireEvent.change(screen.getByLabelText("시작 시간"), { target: { value: "2026-08-23T00:00" } });
    fireEvent.change(screen.getByLabelText("종료 시간"), { target: { value: "2026-08-22T00:00" } });
    fireEvent.click(screen.getByRole("button", { name: "필터 적용" }));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "시작 시간은 종료 시간보다 빨라야 합니다.",
    );
    expect(api.get).toHaveBeenCalledTimes(1);
  });
});
