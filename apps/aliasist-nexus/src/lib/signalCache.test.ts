import { describe, expect, it } from "vitest";
import { MAX_CACHE_AGE_MS, parseSignalCache } from "./signalCache";

const now = Date.UTC(2026, 5, 12, 12);
const valid = {
  version: 1,
  capturedAt: now - 60_000,
  quakes: [{ id: "quake-1", magnitude: 4.2, place: "Test Basin", time: now - 120_000 }],
  spaceWeather: { solarFlux: 132.4, kpIndex: 3.1, kpLabel: "Unsettled" },
};

describe("parseSignalCache", () => {
  it("accepts a fresh cache with the expected schema", () => {
    expect(parseSignalCache(JSON.stringify(valid), now)).toEqual({
      capturedAt: valid.capturedAt,
      quakes: valid.quakes,
      spaceWeather: valid.spaceWeather,
    });
  });

  it("rejects stale, future-dated, malformed, and invalid numeric data", () => {
    expect(parseSignalCache(JSON.stringify({ ...valid, capturedAt: now - MAX_CACHE_AGE_MS - 1 }), now)).toBeNull();
    expect(parseSignalCache(JSON.stringify({ ...valid, capturedAt: now + 1 }), now)).toBeNull();
    expect(parseSignalCache("{not-json", now)).toBeNull();
    expect(parseSignalCache(JSON.stringify({
      ...valid,
      quakes: [{ ...valid.quakes[0], magnitude: "large" }],
    }), now)).toBeNull();
  });
});
