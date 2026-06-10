import { useState, useEffect } from "react";

export interface SpaceWeather {
  solarFlux:  number | null;   // F10.7 cm flux (SFU)
  kpIndex:    number | null;   // Planetary K-index (0–9)
  kpLabel:    string;          // e.g. "Quiet", "Active", "Storm"
}

const FLUX_URL = "https://services.swpc.noaa.gov/json/f107_cm_flux.json";
const KP_URL   = "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json";

function kpLabel(kp: number): string {
  if (kp < 2)  return "Quiet";
  if (kp < 4)  return "Unsettled";
  if (kp < 5)  return "Active";
  if (kp < 6)  return "G1 Storm";
  if (kp < 7)  return "G2 Storm";
  if (kp < 8)  return "G3 Storm";
  if (kp < 9)  return "G4 Storm";
  return "G5 Extreme";
}

export function useNOAASpaceWeather(pollMs = 300_000) {
  const [weather, setWeather] = useState<SpaceWeather>({
    solarFlux: null,
    kpIndex:   null,
    kpLabel:   "—",
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [fluxRes, kpRes] = await Promise.all([
          fetch(FLUX_URL),
          fetch(KP_URL),
        ]);
        const [fluxJson, kpJson] = await Promise.all([
          fluxRes.json(),
          kpRes.json(),
        ]);
        if (cancelled) return;

        // Last entry is most recent
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lastFlux = (fluxJson as any[]).at(-1);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lastKp   = (kpJson as any[]).at(-1);

        const flux = lastFlux?.flux        ?? null;
        const kp   = lastKp?.kp_index      ?? lastKp?.kp ?? null;

        setWeather({
          solarFlux: flux != null ? Math.round(flux * 10) / 10 : null,
          kpIndex:   kp   != null ? Math.round(kp   * 10) / 10 : null,
          kpLabel:   kp   != null ? kpLabel(kp) : "—",
        });
      } catch {
        // silent — keep last known values
      }
    }

    load();
    const id = setInterval(load, pollMs);
    return () => { cancelled = true; clearInterval(id); };
  }, [pollMs]);

  return weather;
}
