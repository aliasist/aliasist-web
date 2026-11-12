import * as auth from "../_lib/clerk-auth";
import { afterEach, describe, expect, it, vi } from "vitest";
import { detectSist, fetchRagContext, formatRagContext, onRequestPost, parseMessages, ragCacheKey } from "./chat";

function chatRequest(content = "hello") {
  return new Request("https://aliasist.test/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content }] }),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("detectSist", () => {
  it("routes space topics", () => {
    expect(detectSist("When is the next SpaceX launch?")).toBe("space");
    expect(detectSist("Tell me about the ISS orbit")).toBe("space");
  });

  it("routes data center topics", () => {
    expect(detectSist("What is a hyperscale datacenter?")).toBe("data");
    expect(detectSist("explain PUE for a server rack")).toBe("data");
  });

  it("routes environmental topics", () => {
    expect(detectSist("hurricane and flood risk this week")).toBe("eco");
  });

  it("routes plural forms of eco keywords (regression: 'storms'/'hurricanes' previously fell through to null)", () => {
    expect(detectSist("any tropical storms active right now?")).toBe("eco");
    expect(detectSist("are there any hurricanes right now")).toBe("eco");
    expect(detectSist("give me a rundown of active wildfires")).toBe("eco");
    expect(detectSist("what floods are happening")).toBe("eco");
  });

  it("routes earthquake/seismic questions to eco (previously had no matching keyword at all)", () => {
    expect(detectSist("were there any earthquakes today?")).toBe("eco");
    expect(detectSist("any recent quakes near California")).toBe("eco");
    expect(detectSist("tell me about seismic activity")).toBe("eco");
  });

  it("routes plural forms across other sists", () => {
    expect(detectSist("tell me about nearby asteroids")).toBe("space");
    expect(detectSist("how many data centers does Aliasist track?")).toBe("data");
    expect(detectSist("what's the outlook on interest rates")).toBe("pulse");
    expect(detectSist("show me the submarine cables")).toBe("agsc");
  });

  it("routes market topics", () => {
    expect(detectSist("what did the Fed do to interest rates")).toBe("pulse");
  });

  it("routes waterfall / globe topics", () => {
    expect(detectSist("what is waterfall?")).toBe("agsc");
    expect(detectSist("show me the undersea cable map")).toBe("agsc");
  });

  it("returns null for off-topic questions", () => {
    expect(detectSist("what's your favorite color?")).toBeNull();
    expect(detectSist("")).toBeNull();
  });

  it("is case-insensitive", () => {
    expect(detectSist("ASTEROID belt facts")).toBe("space");
  });
});

describe("parseMessages", () => {
  it("returns null on malformed JSON", () => {
    expect(parseMessages("<html>not json")).toBeNull();
    expect(parseMessages("{ bad")).toBeNull();
  });

  it("returns an empty array when messages is missing or not an array", () => {
    expect(parseMessages("{}")).toEqual([]);
    expect(parseMessages('{"messages":"nope"}')).toEqual([]);
  });

  it("drops entries without string role/content", () => {
    const out = parseMessages(
      JSON.stringify({ messages: [{ role: "user", content: "hi" }, { role: 1, content: 2 }, {}] }),
    );
    expect(out).toEqual([{ role: "user", content: "hi" }]);
  });

  it("normalizes any non-assistant role to user", () => {
    const out = parseMessages(
      JSON.stringify({ messages: [{ role: "system", content: "x" }, { role: "assistant", content: "y" }] }),
    );
    expect(out).toEqual([
      { role: "user", content: "x" },
      { role: "assistant", content: "y" },
    ]);
  });

  it("keeps only the last 10 messages", () => {
    const many = Array.from({ length: 15 }, (_, i) => ({ role: "user", content: `m${i}` }));
    const out = parseMessages(JSON.stringify({ messages: many }));
    expect(out).toHaveLength(10);
    expect(out?.[0]?.content).toBe("m5");
  });

  it("truncates over-long content to 1200 chars", () => {
    const out = parseMessages(
      JSON.stringify({ messages: [{ role: "user", content: "a".repeat(5000) }] }),
    );
    expect(out?.[0]?.content).toHaveLength(1200);
  });
});

describe("formatRagContext", () => {
  const base = { model: "m", latencyMs: 1, sist: "space" as const };

  it("returns null when a vector/LLM answer is empty", () => {
    expect(formatRagContext("space", { ...base, answer: "", source: "vectorize", chunks: [] })).toBeNull();
  });

  it("returns null for local-rag with no chunks", () => {
    expect(
      formatRagContext("space", { ...base, answer: "canned wrapper", source: "local-rag", chunks: [] }),
    ).toBeNull();
  });

  it("grounds local-rag on chunks and drops the canned answer wrapper", () => {
    const out = formatRagContext("space", {
      ...base,
      answer: 'Closest grounded answer for: "x"',
      source: "local-rag",
      chunks: [{ id: "1", source: "iss", score: 0.9, text: "The ISS orbits ~400km up." }],
    });
    expect(out).toContain("=== RAG Context (SPACE) ===");
    expect(out).toContain("[iss] The ISS orbits ~400km up.");
    expect(out).not.toContain("Closest grounded answer");
  });

  it("formats a context block with header and answer", () => {
    const out = formatRagContext("space", {
      ...base,
      answer: "The ISS orbits at ~400km.",
      source: "vectorize",
      chunks: [],
    });
    expect(out).toContain("=== RAG Context (SPACE) ===");
    expect(out).toContain("The ISS orbits at ~400km.");
    expect(out).toContain("=== End RAG Context ===");
  });

  it("includes up to three source excerpts, truncated", () => {
    const out = formatRagContext("data", {
      ...base,
      sist: "data",
      answer: "answer",
      source: "vectorize",
      chunks: [
        { id: "1", source: "doc-a", score: 0.9, text: "x".repeat(500) },
        { id: "2", source: "doc-b", score: 0.8, text: "short" },
        { id: "3", source: "doc-c", score: 0.7, text: "third" },
        { id: "4", source: "doc-d", score: 0.6, text: "fourth-should-be-dropped" },
      ],
    });
    expect(out).toContain("Source excerpts:");
    expect(out).toContain("[doc-a]");
    expect(out).toContain("[doc-c]");
    expect(out).not.toContain("fourth-should-be-dropped");
    // 500-char chunk should be truncated to 300
    expect(out).not.toContain("x".repeat(301));
  });

  it("includes liveContext in local-rag mode even with no chunks", () => {
    const out = formatRagContext("eco", {
      ...base,
      sist: "eco",
      answer: 'Closest grounded answer for: "x"',
      source: "local-rag",
      chunks: [],
      liveContext: JSON.stringify({ planetarySnapshot: { alertCount: 3 } }),
    });
    expect(out).not.toBeNull();
    expect(out).toContain("Live snapshot");
    expect(out).toContain("alertCount");
  });

  it("includes liveContext alongside a synthesized vector-mode answer", () => {
    const out = formatRagContext("eco", {
      ...base,
      sist: "eco",
      answer: "There is one active hurricane.",
      source: "groq",
      chunks: [],
      liveContext: JSON.stringify({ planetarySnapshot: { activeStorms: [{ name: "Elida" }] } }),
    });
    expect(out).toContain("There is one active hurricane.");
    expect(out).toContain("Live snapshot");
    expect(out).toContain("Elida");
  });

  it("omits the live snapshot line when liveContext is absent", () => {
    const out = formatRagContext("eco", {
      ...base,
      sist: "eco",
      answer: "generic answer",
      source: "groq",
      chunks: [],
    });
    expect(out).not.toContain("Live snapshot");
  });
});

describe("onRequestPost", () => {
  it("reports an unavailable upstream without making sign-in mandatory", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("upstream unavailable"));
    const res = await onRequestPost({ request: chatRequest(), env: {} });
    expect(res.status).toBe(502);
  });

  it("serves anonymous chat with the edge model", async () => {
    const run = vi.fn(async () => ({ response: "edge answer" }));
    const res = await onRequestPost({ request: chatRequest(), env: { AI: { run } } });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ response: "edge answer" });
    expect(run).toHaveBeenCalledOnce();
  });

  it("falls back to the upstream when the edge model fails", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ response: "fallback ok" }), { status: 200 }),
    );
    const res = await onRequestPost({
      request: chatRequest(),
      env: {
        LLM_CHAT_BASE_URL: "https://upstream.example",
        AI: { run: vi.fn(async () => { throw new Error("model unavailable"); }) },
      },
    });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ response: "fallback ok" });
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it("counts anonymous requests before calling the provider", async () => {
    const get = vi.fn(async () => "2");
    const put = vi.fn(async () => {});
    const request = chatRequest();
    request.headers.set("CF-Connecting-IP", "192.0.2.1");
    const res = await onRequestPost({
      request,
      env: {
        CHAT_RATE_LIMIT: { get, put } as unknown as KVNamespace,
        AI: { run: vi.fn(async () => ({ response: "ok" })) },
      },
    });
    expect(res.status).toBe(200);
    expect(get).toHaveBeenCalledWith("chat-rl:192.0.2.1");
    expect(put).toHaveBeenCalledWith("chat-rl:192.0.2.1", "3", { expirationTtl: 60 });
  });

  it("returns 429 without invoking providers when the anonymous limit is reached", async () => {
    const run = vi.fn();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const res = await onRequestPost({
      request: chatRequest(),
      env: {
        CHAT_RATE_LIMIT: { get: vi.fn(async () => "1000"), put: vi.fn() } as unknown as KVNamespace,
        AI: { run },
      },
    });
    expect(res.status).toBe(429);
    expect(run).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects an invalid session rather than treating it as anonymous", async () => {
    vi.spyOn(auth, "authenticateRequest").mockResolvedValue({ ok: false, error: "Unauthorized.", status: 401 });
    const request = chatRequest();
    request.headers.set("Authorization", "Bearer invalid-token");
    const run = vi.fn();
    const res = await onRequestPost({ request, env: { AI: { run } } });
    expect(res.status).toBe(401);
    expect(run).not.toHaveBeenCalled();
  });
});

describe("fetchRagContext", () => {
  it("returns null for a question with no detectable sist (skips the RAG call entirely)", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await fetchRagContext({}, "what's your favorite color?");
    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("requests live grounding for eco questions", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ answer: "It's calm right now.", model: "test", source: "vector", latencyMs: 1, chunks: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await fetchRagContext({}, "is there an active hurricane right now?");

    expect(result).toContain("It's calm right now.");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.sist).toBe("eco");
    expect(body.live).toEqual({ includeDataSnapshot: true });
  });

  it("does not request live grounding for non-eco questions", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ answer: "Launch is Tuesday.", model: "test", source: "vector", latencyMs: 1, chunks: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await fetchRagContext({}, "when is the next SpaceX launch?");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.sist).toBe("space");
    expect(body.live).toBeUndefined();
  });
});

describe("fetchRagContext cache freshness", () => {
  const STORED_AT = "x-aliasist-stored-at";

  function stubCache() {
    const store = new Map<string, Response>();
    const cache = {
      match: vi.fn(async (req: Request) => store.get(req.url)),
      put: vi.fn(async (req: Request, res: Response) => {
        store.set(req.url, res);
      }),
    };
    vi.stubGlobal("caches", { default: cache });
    return cache;
  }

  function cachedEntry(text: string, ageMs: number, headers: Record<string, string> = {}) {
    return new Response(text, {
      headers: {
        "Cache-Control": "max-age=3600",
        [STORED_AT]: String(Date.now() - ageMs),
        ...headers,
      },
    });
  }

  function hubResult(sist: string, answer: string) {
    return new Response(
      JSON.stringify({ sist, answer, model: "test", source: "vectorize", latencyMs: 1, chunks: [] }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("serves a fresh static entry instantly without fetching", async () => {
    const cache = stubCache();
    await cache.put(ragCacheKey("space", "when is the next SpaceX launch?"), cachedEntry("cached space text", 0));
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const result = await fetchRagContext({}, "when is the next SpaceX launch?");

    expect(result).toBe("cached space text");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("serves a stale static entry instantly and revalidates in the background", async () => {
    const cache = stubCache();
    await cache.put(ragCacheKey("space", "when is the next SpaceX launch?"), cachedEntry("stale space text", 2 * 3600_000));
    cache.put.mockClear();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(hubResult("space", "fresh from hub"));
    const waited: Promise<unknown>[] = [];

    const result = await fetchRagContext({}, "when is the next SpaceX launch?", [], {
      waitUntil: (p) => waited.push(p),
    });
    await Promise.all(waited);

    expect(result).toBe("stale space text");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(cache.put).toHaveBeenCalledTimes(1);
    const [, putRes] = cache.put.mock.calls[0];
    const storedAt = Number(putRes.headers.get(STORED_AT));
    expect(Math.abs(Date.now() - storedAt)).toBeLessThanOrEqual(5000);
  });

  it("blocks on the hub for a static entry older than the 24h stale window", async () => {
    const cache = stubCache();
    await cache.put(ragCacheKey("space", "when is the next SpaceX launch?"), cachedEntry("ancient space text", 25 * 3600_000));
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(hubResult("space", "fresh from hub"));
    const waited: Promise<unknown>[] = [];

    const result = await fetchRagContext({}, "when is the next SpaceX launch?", [], {
      waitUntil: (p) => waited.push(p),
    });

    expect(result).toContain("fresh from hub");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(waited).toHaveLength(0);
  });

  it("treats entries without a stored-at header as stale and revalidates", async () => {
    const cache = stubCache();
    const entry = cachedEntry("legacy space text", 0);
    entry.headers.delete(STORED_AT);
    await cache.put(ragCacheKey("space", "when is the next SpaceX launch?"), entry);
    cache.put.mockClear();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(hubResult("space", "fresh from hub"));
    const waited: Promise<unknown>[] = [];

    const result = await fetchRagContext({}, "when is the next SpaceX launch?", [], {
      waitUntil: (p) => waited.push(p),
    });
    await Promise.all(waited);

    expect(result).toBe("legacy space text");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(cache.put).toHaveBeenCalledTimes(1);
  });

  it("treats a future stored-at as fresh rather than crashing on negative age", async () => {
    const cache = stubCache();
    await cache.put(ragCacheKey("space", "when is the next SpaceX launch?"), cachedEntry("time-traveling text", -60_000));
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const result = await fetchRagContext({}, "when is the next SpaceX launch?");

    expect(result).toBe("time-traveling text");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("keeps serving stale context when background revalidation fails", async () => {
    const cache = stubCache();
    await cache.put(ragCacheKey("space", "when is the next SpaceX launch?"), cachedEntry("stale space text", 2 * 3600_000));
    cache.put.mockClear();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("hub down"));
    const waited: Promise<unknown>[] = [];

    const result = await fetchRagContext({}, "when is the next SpaceX launch?", [], {
      waitUntil: (p) => waited.push(p),
    });

    expect(result).toBe("stale space text");
    await expect(Promise.all(waited)).resolves.toBeDefined();
    expect(cache.put).not.toHaveBeenCalled();
  });

  it("serves eco context stale-in-window and revalidates in the background", async () => {
    const cache = stubCache();
    await cache.put(ragCacheKey("eco", "are there any hurricanes right now"), cachedEntry("stale eco text", 120_000));
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(hubResult("eco", "fresh from hub"));
    const waited: Promise<unknown>[] = [];

    const result = await fetchRagContext({}, "are there any hurricanes right now", [], {
      waitUntil: (p) => waited.push(p),
    });
    await Promise.all(waited);

    expect(result).toBe("stale eco text");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("treats eco entries beyond the 5-minute stale window as a miss", async () => {
    const cache = stubCache();
    await cache.put(ragCacheKey("eco", "are there any hurricanes right now"), cachedEntry("ancient eco text", 400_000));
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(hubResult("eco", "fresh from hub"));

    const result = await fetchRagContext({}, "are there any hurricanes right now");

    expect(result).toContain("fresh from hub");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("returns no context when a cold eco fetch misses the budget, then seeds the cache", async () => {
    const cache = stubCache();
    // Upstream answers 20ms late; the 5ms budget wins the race.
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () => new Promise<Response>((resolve) => {
        setTimeout(() => resolve(new Response(
          JSON.stringify({ sist: "eco", answer: "storm overhead", chunks: [] }),
          { status: 200 },
        )), 20);
      }),
    );
    const waited: Promise<unknown>[] = [];

    const result = await fetchRagContext({}, "any hurricanes right now?", [], {
      waitUntil: (p) => waited.push(p),
      ecoBudgetMs: 5,
    });

    expect(result).toBeNull();
    await Promise.all(waited);
    expect(cache.put).toHaveBeenCalledTimes(1);
  });
});
