const DRAFT_VERSION = "v1.0-draft";

/**
 * 공개 동의 버전은 backend LEGAL_*_VERSION과 배포마다 exact-match 해야 한다.
 * 로컬 기본값은 명시적으로 draft이며 운영 확정본을 가장하지 않는다.
 */
export const LEGAL_CONSENT_VERSIONS = Object.freeze({
  termsVersion:
    process.env.NEXT_PUBLIC_LEGAL_TERMS_VERSION?.trim() || DRAFT_VERSION,
  privacyVersion:
    process.env.NEXT_PUBLIC_LEGAL_PRIVACY_VERSION?.trim() || DRAFT_VERSION,
  age14Version:
    process.env.NEXT_PUBLIC_LEGAL_AGE14_VERSION?.trim() || DRAFT_VERSION,
  creatorThirdPartyVersion:
    process.env.NEXT_PUBLIC_LEGAL_CREATOR_THIRD_PARTY_VERSION?.trim() ||
    DRAFT_VERSION,
  marketingVersion:
    process.env.NEXT_PUBLIC_LEGAL_MARKETING_VERSION?.trim() || DRAFT_VERSION,
});

export function legalConsentPayload(
  role: "CREATOR" | "COMPANY",
  marketingOptIn: boolean,
) {
  const common = {
    termsVersion: LEGAL_CONSENT_VERSIONS.termsVersion,
    privacyVersion: LEGAL_CONSENT_VERSIONS.privacyVersion,
    age14Version: LEGAL_CONSENT_VERSIONS.age14Version,
  };
  const marketing = marketingOptIn
    ? { marketingVersion: LEGAL_CONSENT_VERSIONS.marketingVersion }
    : {};

  if (role === "CREATOR") {
    return {
      ...common,
      creatorThirdPartyVersion:
        LEGAL_CONSENT_VERSIONS.creatorThirdPartyVersion,
      ...marketing,
    };
  }

  return { ...common, ...marketing };
}
