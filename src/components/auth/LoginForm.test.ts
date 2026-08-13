import { describe, expect, it } from "vitest";
import { resolveLoginCredentials } from "./LoginForm";

describe("resolveLoginCredentials", () => {
  it("maps the creator 1/1 alias to the creator demo account in development", () => {
    expect(resolveLoginCredentials("CREATOR", "1", "1", true)).toEqual({
      email: "creator.demo@viralground.local",
      password: "DemoLogin!2026",
    });
  });

  it("maps the company 1/1 alias to the company demo account in development", () => {
    expect(resolveLoginCredentials("COMPANY", " 1 ", "1", true)).toEqual({
      email: "company.demo@viralground.local",
      password: "DemoLogin!2026",
    });
  });

  it("never maps the alias when the production guard is active", () => {
    expect(resolveLoginCredentials("CREATOR", "1", "1", false)).toEqual({
      email: "1",
      password: "1",
    });
  });
});
