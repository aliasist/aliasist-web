import { describe, expect, it } from "vitest";
import { briefToMarkdown, createPlanetaryBrief } from "./planetaryBrief";
import type { LiveSignals } from "./useLiveSignals";

function signals(overrides: Partial<LiveSignals> = {}): LiveSignals {
  return {
    quakes: [
      { id: "recent", magnitude: 3.2, place: "Recent Ridge", time: 200 },
      { id: "strongest", magnitude: 6.1, place: "Strongest Basin", time: 100 },
    ],
    spaceWeather: { solarFlux: 145.2, kpIndex: 4.5, kpLabel: "Active" },
    sourceHealth: { usgs: true, noaa: true },
    lastUpdated: Date.UTC(2026, 5, 12, 12),
    lastAttempted: Date.UTC(2026, 5, 12, 12),
    status: "live",
    isRefreshing: false,
    refresh: async () => ({ usgs: true, noaa: true }),
    ...overrides,
  };
}

describe("createPlanetaryBrief", () => {
  it("selects the strongest event instead of assuming feed order", () => {
    const brief = createPlanetaryBrief(signals());

    expect(brief.strongest?.id).toBe("strongest");
    expect(brief.summary).toContain("Strongest Basin");
  });

  it("calculates bounded risk levels from seismic and K-index signals", () => {
    const high = createPlanetaryBrief(signals());
    const low = createPlanetaryBrief(signals({
      quakes: [{ id: "low", magnitude: 2.7, place: "Minor Shelf", time: 100 }],
      spaceWeather: { solarFlux: 80, kpIndex: 1, kpLabel: "Quiet" },
    }));

    expect(high.riskScore).toBe(83);
    expect(high.riskLevel).toBe("HIGH");
    expect(low.riskScore).toBe(9);
    expect(low.riskLevel).toBe("LOW");
  });

  it("exports source attribution, provenance, and safety language", () => {
    const markdown = briefToMarkdown(createPlanetaryBrief(signals({ status: "cached" })));

    expect(markdown).toContain("Signal status: CACHED");
    expect(markdown).toContain("Sources: USGS Earthquake Hazards Program; NOAA Space Weather Prediction Center.");
    expect(markdown).toContain("not an emergency alert");
  });
});
