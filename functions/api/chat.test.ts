import { describe, expect, it } from "vitest";
import { detectSist, formatRagContext, parseMessages } from "./chat";

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
});
