const RELEASE_ID =
  process.env.NEXT_PUBLIC_RELEASE_ID?.trim() || process.env.RELEASE_ID?.trim() || "local";

const COMMIT_SHA =
  process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
  process.env.GITHUB_SHA?.trim() ||
  "local";

export function GET() {
  return Response.json(
    {
      releaseId: RELEASE_ID,
      commitSha: COMMIT_SHA,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
