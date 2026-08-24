import { describe, expect, it } from "vitest";
import { parsePublicFeatureFlag } from "./featureFlags";

describe("parsePublicFeatureFlag", () => {
  it("enables only an explicit true value", () => {
    expect(parsePublicFeatureFlag("true")).toBe(true);
  });

  it("fails closed for missing and malformed values", () => {
    expect(parsePublicFeatureFlag(undefined)).toBe(false);
    expect(parsePublicFeatureFlag("")).toBe(false);
    expect(parsePublicFeatureFlag("1")).toBe(false);
    expect(parsePublicFeatureFlag("yes")).toBe(false);
    expect(parsePublicFeatureFlag("TRUE")).toBe(false);
    expect(parsePublicFeatureFlag(" true ")).toBe(false);
    expect(parsePublicFeatureFlag("false")).toBe(false);
  });
});
