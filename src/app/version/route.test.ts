import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /version", () => {
  it("exposes only release correlation metadata", async () => {
    const response = GET();
    const body = await response.json();

    expect(Object.keys(body).sort()).toEqual(["commitSha", "releaseId"]);
    expect(body.releaseId).toBeTypeOf("string");
    expect(body.commitSha).toBeTypeOf("string");
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
});
