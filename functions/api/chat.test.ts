import { afterEach, describe, expect, it, vi } from "vitest";
import { detectSist, fetchRagContext, formatRagContext, onRequestPost, parseMessages } from "./chat";

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

  it("routes globe / agsc topics", () => {
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
  it("rejects unsigned chat when public chat is disabled", async () => {
    const res = await onRequestPost({
      request: chatRequest(),
      env: {},
    });

    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toMatchObject({
      error: expect.stringContaining("Public chat is not enabled"),
    });
  });

  it("falls back to the upstream worker when Workers AI fails", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ response: "fallback ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await onRequestPost({
      request: chatRequest("tell me about Aliasist"),
      env: {
        PUBLIC_CHAT_ENABLED: "true",
        LLM_CHAT_BASE_URL: "https://upstream.example",
        AI: {
          run: vi.fn(async () => {
            throw new Error("model unavailable");
          }),
        },
      },
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ response: "fallback ok" });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://upstream.example/api/chat",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("uses the upstream worker for public chat when no local model is configured", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ response: "upstream public ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await onRequestPost({
      request: chatRequest("hello"),
      env: {
        PUBLIC_CHAT_ENABLED: "true",
        LLM_CHAT_BASE_URL: "https://upstream.example/",
      },
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ response: "upstream public ok" });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://upstream.example/api/chat",
      expect.objectContaining({ method: "POST" }),
    );
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
