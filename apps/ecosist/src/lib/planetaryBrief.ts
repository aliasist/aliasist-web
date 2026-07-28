import type { EcoQuake, LiveSignals } from "./useLiveSignals";

export type RiskLevel = "LOW" | "ELEVATED" | "HIGH" | "CRITICAL";

export interface PlanetaryBrief {
  generatedAt: number;
  status: LiveSignals["status"];
  alertCount: number;
  eventCount: number;
  naturalEventCount: number;
  strongest: EcoQuake | null;
  kpIndex: number | null;
  kpLabel: string;
  riskScore: number;
  riskLevel: RiskLevel;
  sourceCoverage: number;
  summary: string;
}

export function createPlanetaryBrief(signals: LiveSignals): PlanetaryBrief {
  const strongest = signals.quakes.reduce<EcoQuake | null>(
    (current, quake) => (!current || quake.magnitude > current.magnitude ? quake : current),
    null,
  );

  let riskScore = 0;
  if (strongest) {
    if (strongest.magnitude >= 7) riskScore += 35;
    else if (strongest.magnitude >= 6) riskScore += 28;
    else if (strongest.magnitude >= 5) riskScore += 18;
    else if (strongest.magnitude >= 4) riskScore += 8;
  }
  const severeAlerts = signals.alerts.filter((alert) => ["extreme", "severe"].includes((alert.severity ?? "").toLowerCase())).length;
  riskScore += Math.min(35, severeAlerts * 7);
  riskScore += Math.min(15, signals.events.length * 2);
  const kp = signals.kpIndex ?? 0;
  if (kp >= 8) riskScore += 15;
  else if (kp >= 6) riskScore += 10;
  else if (kp >= 5) riskScore += 5;
  riskScore = Math.min(100, riskScore);

  const riskLevel: RiskLevel = riskScore >= 75 ? "CRITICAL" : riskScore >= 50 ? "HIGH" : riskScore >= 25 ? "ELEVATED" : "LOW";
  const sourceCoverage = Math.round(
    ([signals.sourceHealth.nws, signals.sourceHealth.usgs, signals.sourceHealth.nasa, signals.sourceHealth.noaa].filter(Boolean).length / 4) * 100,
  );
  const quakeSummary = strongest
    ? `Strongest seismic event is M${strongest.magnitude.toFixed(1)} near ${strongest.place ?? "an unreported location"}.`
    : "No qualifying seismic events are currently indexed.";
  const alertSummary = `${signals.alerts.length} active NWS alerts and ${signals.events.length} open NASA natural events are in the current feed.`;
  const spaceSummary = `Geomagnetic conditions are ${signals.kpLabel.toLowerCase()} at Kp ${kp.toFixed(1)}.`;

  return {
    generatedAt: signals.lastUpdated ?? Date.now(),
    status: signals.status,
    alertCount: signals.alerts.length,
    eventCount: signals.quakes.length,
    naturalEventCount: signals.events.length,
    strongest,
    kpIndex: signals.kpIndex,
    kpLabel: signals.kpLabel,
    riskScore,
    riskLevel,
    sourceCoverage,
    summary: `${alertSummary} ${quakeSummary} ${spaceSummary}`,
  };
}

export function briefToMarkdown(brief: PlanetaryBrief): string {
  return [
    "# EcoSist Earth and Weather Summary",
    "",
    `Generated: ${new Date(brief.generatedAt).toISOString()}`,
    `Data Status: ${brief.status.toUpperCase()}`,
    `Composite Risk: ${brief.riskLevel} (${brief.riskScore}/100)`,
    `Source Coverage: ${brief.sourceCoverage}%`,
    "",
    "## Current Earth Data",
    `- Active NWS Alerts: ${brief.alertCount}`,
    `- Seismic Events: ${brief.eventCount}`,
    `- Peak Magnitude: ${brief.strongest?.magnitude.toFixed(1) ?? "N/A"}`,
    `- Open NASA Events: ${brief.naturalEventCount}`,
    `- Planetary K-index: ${brief.kpIndex?.toFixed(1) ?? "N/A"} (${brief.kpLabel})`,
    "",
    "## Summary",
    brief.summary,
    "",
    "---",
    "Sources: National Weather Service; USGS; NASA EONET; NOAA SWPC.",
    "© 2026 Aliasist // Ecosist",
  ].join("\n");
}
