import { describe, expect, it } from "vitest";
import { normalizeLoginEmail } from "./LoginForm";

describe("normalizeLoginEmail", () => {
  it("trims a submitted email without applying hidden aliases", () => {
    expect(normalizeLoginEmail("  creator@example.com ")).toBe("creator@example.com");
  });
});
