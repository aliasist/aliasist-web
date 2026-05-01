import { describe, expect, it } from "vitest";
import { readJsonBody, trimTrailingSlashes } from "./api";

describe("trimTrailingSlashes", () => {
  it("removes trailing slashes", () => {
    expect(trimTrailingSlashes("https://ex.com")).toBe("https://ex.com");
    expect(trimTrailingSlashes("https://ex.com/")).toBe("https://ex.com");
    expect(trimTrailingSlashes("https://ex.com///")).toBe("https://ex.com");
  });
});

describe("readJsonBody", () => {
  it("parses JSON responses", async () => {
    const res = new Response('{"a":1}');
    await expect(readJsonBody<{ a: number }>(res)).resolves.toEqual({ a: 1 });
  });

  it("returns null on invalid JSON", async () => {
    const res = new Response("<html>");
    await expect(readJsonBody(res)).resolves.toBeNull();
  });

  it("returns null on empty body", async () => {
    const res = new Response("");
    await expect(readJsonBody(res)).resolves.toBeNull();
  });
});
