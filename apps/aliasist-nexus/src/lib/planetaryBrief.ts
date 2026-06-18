import type { Earthquake, LiveSignals } from "./useLiveSignals";

export type RiskLevel = "LOW" | "ELEVATED" | "HIGH" | "CRITICAL";

export interface PlanetaryBrief {
  generatedAt: number;
  status: LiveSignals["status"];
  eventCount: number;
  strongest: Earthquake | null;
  kpIndex: number | null;
  kpLabel: string;
  solarFlux: number | null;
  flareClass: string;
  riskScore: number;
  riskLevel: RiskLevel;
  summary: string;
}

export function createPlanetaryBrief(signals: LiveSignals): PlanetaryBrief {
  const strongest = signals.quakes.reduce<Earthquake | null>(
    (current, quake) => (!current || quake.magnitude > current.magnitude ? quake : current),
    null,
  );

  // Advanced Multi-Signal Risk Scoring
  let riskScore = 0;

  // 1. Seismic Component (Max 40)
  if (strongest) {
    if (strongest.magnitude >= 7.0) riskScore += 40;
    else if (strongest.magnitude >= 6.0) riskScore += 30;
    else if (strongest.magnitude >= 5.0) riskScore += 20;
    else if (strongest.magnitude >= 4.0) riskScore += 10;
  }

  // 2. Geomagnetic Component (Max 30)
  const kp = signals.spaceWeather.kpIndex ?? 0;
  if (kp >= 8) riskScore += 30;
  else if (kp >= 6) riskScore += 20;
  else if (kp >= 4) riskScore += 10;

  // 3. Solar Flare Component (Max 30)
  const flare = signals.spaceWeather.solarFlareClass;
  if (flare === "X") riskScore += 30;
  else if (flare === "M") riskScore += 15;
  else if (flare === "C") riskScore += 5;

  riskScore = Math.min(100, riskScore);

  const riskLevel: RiskLevel = 
    riskScore >= 80 ? "CRITICAL" : 
    riskScore >= 50 ? "HIGH" : 
    riskScore >= 25 ? "ELEVATED" : "LOW";

  const seismicSummary = strongest
    ? `Strongest seismic event: M${strongest.magnitude.toFixed(1)} @ ${strongest.place}.`
    : "Seismic baseline nominal.";
  
  const solarSummary = `Geomagnetic state: ${signals.spaceWeather.kpLabel} (Kp ${kp.toFixed(1)}). Flare Activity: Class ${flare}.`;

  return {
    generatedAt: signals.lastUpdated ?? Date.now(),
    status: signals.status,
    eventCount: signals.quakes.length,
    strongest,
    kpIndex: signals.spaceWeather.kpIndex,
    kpLabel: signals.spaceWeather.kpLabel,
    solarFlux: signals.spaceWeather.solarFlux,
    flareClass: flare,
    riskScore,
    riskLevel,
    summary: `${seismicSummary} ${solarSummary}`,
  };
}

export function briefToMarkdown(brief: PlanetaryBrief): string {
  const generated = new Date(brief.generatedAt).toISOString();
  return [
    "# Aliasist Nexus // Planetary Intelligence Brief",
    "",
    `Generated: ${generated}`,
    `System Status: ${brief.status.toUpperCase()}`,
    `Composite Risk: ${brief.riskLevel} (${brief.riskScore}/100)`,
    "",
    "## Intelligence Signals",
    `- Seismic Events: ${brief.eventCount} (Last 24h)`,
    `- Peak Magnitude: ${brief.strongest?.magnitude.toFixed(1) ?? "N/A"}`,
    `- Planetary K-index: ${brief.kpIndex?.toFixed(1) ?? "N/A"} (${brief.kpLabel})`,
    `- Solar Flare Class: ${brief.flareClass}`,
    `- Solar Flux: ${brief.solarFlux?.toFixed(1) ?? "N/A"} SFU`,
    "",
    "## Tactical Summary",
    brief.summary,
    "",
    "---",
    "Sources: USGS Earthquake Hazards Program; NOAA Space Weather Prediction Center.",
    "© 2026 Aliasist // Open Intelligence",
  ].join("\n");
}
