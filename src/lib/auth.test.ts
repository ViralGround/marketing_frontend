import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "./api";
import { clearSessionHint } from "./sessionHint";
import { removeTokens } from "./auth";

vi.mock("./api", () => ({ default: { post: vi.fn() } }));
vi.mock("./sessionHint", () => ({ clearSessionHint: vi.fn() }));

describe("removeTokens", () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset();
    vi.mocked(clearSessionHint).mockReset();
  });

  it("clears the local session hint only after server logout succeeds", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: undefined });

    await removeTokens();

    expect(api.post).toHaveBeenCalledWith("/auth/logout");
    expect(clearSessionHint).toHaveBeenCalledOnce();
  });

  it("keeps local auth state intact when server logout fails", async () => {
    vi.mocked(api.post).mockRejectedValue(new Error("offline"));

    await expect(removeTokens()).rejects.toThrow("server did not confirm logout");
    expect(clearSessionHint).not.toHaveBeenCalled();
  });
});
