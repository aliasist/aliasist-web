import { describe, expect, it } from "vitest";
import { verifyGithubWebhook } from "../../functions/_lib/github-app";

describe("verifyGithubWebhook", () => {
  it("accepts GitHub's documented SHA-256 webhook signature fixture", async () => {
    const valid = await verifyGithubWebhook(
      "It's a Secret to Everybody",
      "sha256=757107ea0eb2509fc211221cce984b8a37570b6d7586c22c46f4379c8b043e17",
      "Hello, World!",
    );

    expect(valid).toBe(true);
  });

  it("rejects invalid signatures", async () => {
    const valid = await verifyGithubWebhook(
      "It's a Secret to Everybody",
      "sha256=0000000000000000000000000000000000000000000000000000000000000000",
      "Hello, World!",
    );

    expect(valid).toBe(false);
  });
});
