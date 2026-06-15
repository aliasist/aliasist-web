import type { Earthquake, LiveSignals } from "./useLiveSignals";

export type RiskLevel = "LOW" | "ELEVATED" | "HIGH";

export interface PlanetaryBrief {
  generatedAt: number;
  status: LiveSignals["status"];
  eventCount: number;
  strongest: Earthquake | null;
  kpIndex: number | null;
  kpLabel: string;
  solarFlux: number | null;
  riskScore: number;
  riskLevel: RiskLevel;
  summary: string;
}

export function createPlanetaryBrief(signals: LiveSignals): PlanetaryBrief {
  const strongest = signals.quakes.reduce<Earthquake | null>(
    (current, quake) => (!current || quake.magnitude > current.magnitude ? quake : current),
    null,
  );
  const seismicScore = strongest ? Math.min(60, Math.max(0, (strongest.magnitude - 2.5) * 18)) : 0;
  const solarScore = signals.spaceWeather.kpIndex === null
    ? 0
    : Math.min(40, signals.spaceWeather.kpIndex * 5);
  const riskScore = Math.round(Math.min(100, seismicScore + solarScore));
  const riskLevel: RiskLevel = riskScore >= 65 ? "HIGH" : riskScore >= 35 ? "ELEVATED" : "LOW";

  const seismicSummary = strongest
    ? `The strongest M${strongest.magnitude.toFixed(1)} event was reported near ${strongest.place}.`
    : "No magnitude 2.5+ seismic events are currently available.";
  const solarSummary = signals.spaceWeather.kpIndex === null
    ? "Space-weather telemetry is unavailable."
    : `Planetary K-index is ${signals.spaceWeather.kpIndex.toFixed(1)} (${signals.spaceWeather.kpLabel}).`;

  return {
    generatedAt: signals.lastUpdated ?? Date.now(),
    status: signals.status,
    eventCount: signals.quakes.length,
    strongest,
    kpIndex: signals.spaceWeather.kpIndex,
    kpLabel: signals.spaceWeather.kpLabel,
    solarFlux: signals.spaceWeather.solarFlux,
    riskScore,
    riskLevel,
    summary: `${seismicSummary} ${solarSummary}`,
  };
}

export function briefToMarkdown(brief: PlanetaryBrief): string {
  const generated = new Date(brief.generatedAt).toISOString();
  const strongest = brief.strongest
    ? `M${brief.strongest.magnitude.toFixed(1)} near ${brief.strongest.place}`
    : "Unavailable";

  return [
    "# Aliasist Nexus Planetary Brief",
    "",
    `Generated: ${generated}`,
    `Signal status: ${brief.status.toUpperCase()}`,
    `Composite risk: ${brief.riskLevel} (${brief.riskScore}/100)`,
    "",
    "## Live Signals",
    `- Seismic events (M2.5+, 24h): ${brief.eventCount}`,
    `- Strongest event: ${strongest}`,
    `- Planetary K-index: ${brief.kpIndex?.toFixed(1) ?? "Unavailable"} (${brief.kpLabel})`,
    `- Solar flux: ${brief.solarFlux?.toFixed(1) ?? "Unavailable"} SFU`,
    "",
    "## Operational Summary",
    brief.summary,
    "",
    "Sources: USGS Earthquake Hazards Program; NOAA Space Weather Prediction Center.",
    "This automated public-data brief is informational and is not an emergency alert.",
  ].join("\n");
}
