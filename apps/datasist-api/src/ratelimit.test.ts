import { afterEach, describe, expect, it } from "vitest";
import {
  _resetRateLimit,
  clientKey,
  isBodyTooLarge,
  isOriginAllowed,
  rateLimit,
} from "./ratelimit";

afterEach(() => _resetRateLimit());

describe("rateLimit", () => {
  it("allows up to the limit then blocks within the window", () => {
    const t0 = 1_000_000;
    for (let i = 0; i < 3; i++) {
      expect(rateLimit("ip-a", 3, 60_000, t0 + i).allowed).toBe(true);
    }
    const blocked = rateLimit("ip-a", 3, 60_000, t0 + 4);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("recovers after the window slides past old hits", () => {
    const t0 = 2_000_000;
    for (let i = 0; i < 3; i++) rateLimit("ip-b", 3, 60_000, t0 + i);
    expect(rateLimit("ip-b", 3, 60_000, t0 + 100).allowed).toBe(false);
    // advance beyond the window — old hits expire
    expect(rateLimit("ip-b", 3, 60_000, t0 + 60_001).allowed).toBe(true);
  });

  it("tracks separate clients independently", () => {
    const t = 3_000_000;
    rateLimit("ip-c", 1, 60_000, t);
    expect(rateLimit("ip-c", 1, 60_000, t + 1).allowed).toBe(false);
    expect(rateLimit("ip-d", 1, 60_000, t + 1).allowed).toBe(true);
  });
});

describe("clientKey", () => {
  it("prefers CF-Connecting-IP", () => {
    const r = new Request("https://x", { headers: { "CF-Connecting-IP": "1.2.3.4" } });
    expect(clientKey(r)).toBe("1.2.3.4");
  });
  it("falls back to first x-forwarded-for entry", () => {
    const r = new Request("https://x", { headers: { "x-forwarded-for": "9.9.9.9, 10.0.0.1" } });
    expect(clientKey(r)).toBe("9.9.9.9");
  });
  it("defaults to 'unknown' when no IP headers", () => {
    expect(clientKey(new Request("https://x"))).toBe("unknown");
  });
});

describe("isOriginAllowed", () => {
  const allowed = "https://data.aliasist.com";
  it("allows requests with no Origin (native mobile / server)", () => {
    expect(isOriginAllowed(new Request("https://x"), allowed)).toBe(true);
  });
  it("allows the configured origin", () => {
    const r = new Request("https://x", { headers: { Origin: allowed } });
    expect(isOriginAllowed(r, allowed)).toBe(true);
  });
  it("blocks a different browser origin", () => {
    const r = new Request("https://x", { headers: { Origin: "https://evil.example" } });
    expect(isOriginAllowed(r, allowed)).toBe(false);
  });
  it("does not block when no allow-list is configured", () => {
    const r = new Request("https://x", { headers: { Origin: "https://evil.example" } });
    expect(isOriginAllowed(r, undefined)).toBe(true);
  });
});

describe("isBodyTooLarge", () => {
  it("flags oversized Content-Length", () => {
    const r = new Request("https://x", { method: "POST", headers: { "Content-Length": "99999" } });
    expect(isBodyTooLarge(r, 32 * 1024)).toBe(true);
  });
  it("passes small or missing Content-Length", () => {
    const small = new Request("https://x", { method: "POST", headers: { "Content-Length": "100" } });
    expect(isBodyTooLarge(small, 32 * 1024)).toBe(false);
    expect(isBodyTooLarge(new Request("https://x"), 32 * 1024)).toBe(false);
  });
});
