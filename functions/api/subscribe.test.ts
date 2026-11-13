import { afterEach, describe, expect, it, vi } from "vitest";
import { onRequestPost } from "./subscribe";

function subscribeRequest(body = JSON.stringify({ email: "a@example.com" })) {
  return new Request("https://aliasist.test/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json", "CF-Connecting-IP": "192.0.2.8" },
    body,
  });
}

function kvAt(count: string) {
  return {
    get: vi.fn(async () => count),
    put: vi.fn(async () => {}),
  } as unknown as KVNamespace;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/subscribe", () => {
  it("proxies a signup to the upstream worker", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const res = await onRequestPost({
      request: subscribeRequest(),
      env: { LLM_CHAT_BASE_URL: "https://upstream.example" },
    });

    expect(res.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://upstream.example/api/subscribe",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("returns 429 without touching the upstream once the signup limit is reached", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const res = await onRequestPost({
      request: subscribeRequest(),
      env: { LLM_CHAT_BASE_URL: "https://upstream.example", CHAT_RATE_LIMIT: kvAt("3") },
    });

    expect(res.status).toBe(429);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects a payload larger than an email address needs", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const res = await onRequestPost({
      request: subscribeRequest(JSON.stringify({ email: `${"x".repeat(3000)}@example.com` })),
      env: { LLM_CHAT_BASE_URL: "https://upstream.example" },
    });

    expect(res.status).toBe(413);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
