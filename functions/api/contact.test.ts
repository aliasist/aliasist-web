import { afterEach, describe, expect, it, vi } from "vitest";
import { onRequestPost } from "./contact";

function contactRequest(body = JSON.stringify({ name: "A", email: "a@example.com", message: "hi" })) {
  return new Request("https://aliasist.test/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", "CF-Connecting-IP": "192.0.2.7" },
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

describe("POST /api/contact", () => {
  it("proxies a well-formed message to the upstream worker", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const res = await onRequestPost({
      request: contactRequest(),
      env: { LLM_CHAT_BASE_URL: "https://upstream.example" },
    });

    expect(res.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://upstream.example/api/contact",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("returns 429 without touching the metered upstream once the limit is reached", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const res = await onRequestPost({
      request: contactRequest(),
      env: { LLM_CHAT_BASE_URL: "https://upstream.example", CHAT_RATE_LIMIT: kvAt("5") },
    });

    expect(res.status).toBe(429);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("counts a request against the per-IP bucket before proxying", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 200 }));
    const kv = kvAt("2");

    await onRequestPost({
      request: contactRequest(),
      env: { LLM_CHAT_BASE_URL: "https://upstream.example", CHAT_RATE_LIMIT: kv },
    });

    expect(kv.get).toHaveBeenCalledWith("contact-rl:192.0.2.7");
    expect(kv.put).toHaveBeenCalledWith("contact-rl:192.0.2.7", "3", { expirationTtl: 600 });
  });

  it("rejects an oversized body before forwarding it", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const res = await onRequestPost({
      request: contactRequest(JSON.stringify({ message: "x".repeat(9000) })),
      env: { LLM_CHAT_BASE_URL: "https://upstream.example" },
    });

    expect(res.status).toBe(413);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects a non-JSON body rather than paying the upstream to reject it", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const res = await onRequestPost({
      request: contactRequest("<html>bot</html>"),
      env: { LLM_CHAT_BASE_URL: "https://upstream.example" },
    });

    expect(res.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
