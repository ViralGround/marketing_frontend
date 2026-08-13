import { describe, expect, it } from "vitest";
import { LEGAL_CONSENT_VERSIONS, legalConsentPayload } from "./legalVersions";

describe("legalConsentPayload", () => {
  it("includes creator-only consent and omits marketing version without opt-in", () => {
    expect(legalConsentPayload("CREATOR", false)).toEqual({
      termsVersion: LEGAL_CONSENT_VERSIONS.termsVersion,
      privacyVersion: LEGAL_CONSENT_VERSIONS.privacyVersion,
      age14Version: LEGAL_CONSENT_VERSIONS.age14Version,
      creatorThirdPartyVersion:
        LEGAL_CONSENT_VERSIONS.creatorThirdPartyVersion,
    });
  });

  it("sends marketing version only when a company opts in", () => {
    expect(legalConsentPayload("COMPANY", true)).toEqual({
      termsVersion: LEGAL_CONSENT_VERSIONS.termsVersion,
      privacyVersion: LEGAL_CONSENT_VERSIONS.privacyVersion,
      age14Version: LEGAL_CONSENT_VERSIONS.age14Version,
      marketingVersion: LEGAL_CONSENT_VERSIONS.marketingVersion,
    });
    expect(legalConsentPayload("COMPANY", false)).not.toHaveProperty(
      "marketingVersion",
    );
    expect(legalConsentPayload("COMPANY", true)).not.toHaveProperty(
      "creatorThirdPartyVersion",
    );
  });
});
