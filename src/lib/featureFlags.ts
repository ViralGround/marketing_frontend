/**
 * Public release flags are frozen into the browser bundle at build time.
 * Only the exact string "true" enables a feature; missing, malformed, and
 * mixed-environment values all fail closed.
 */
export function parsePublicFeatureFlag(value: string | undefined): boolean {
  return value === "true";
}

export const FEATURE_PAYMENTS_ENABLED = parsePublicFeatureFlag(
  process.env.NEXT_PUBLIC_FEATURE_PAYMENTS,
);

export const FEATURE_INSTAGRAM_ENABLED = parsePublicFeatureFlag(
  process.env.NEXT_PUBLIC_FEATURE_INSTAGRAM,
);

export const FEATURE_UPLOADS_ENABLED = parsePublicFeatureFlag(
  process.env.NEXT_PUBLIC_FEATURE_UPLOADS,
);
