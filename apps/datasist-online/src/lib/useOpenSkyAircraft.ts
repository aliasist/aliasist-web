import { useState, useEffect } from "react";
import { dataApiUrl } from "../lib/dataApi";

export interface Aircraft {
  icao24:   string;
  callsign: string;
  lat:      number;
  lon:      number;
  altitude: number;   // metres
  velocity: number;   // m/s
  heading:  number;   // degrees
}

// OpenSky blocks localhost CORS — requires a proxy in production.
// Use the Vite dev proxy to avoid CORS locally; in production this should be
// served via a server-side proxy/worker (direct may fail due to CORS/rate limits).
// Use a stable in-app endpoint so prod can be backed by a Cloudflare Worker without changing client code.
const URL = dataApiUrl("/api/opensky/api/states/all");
const MAX  = 250;

export function useOpenSkyAircraft(pollMs = 30_000) {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [error, setError]       = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res  = await fetch(URL, { headers: { accept: "application/json" } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const states: any[][] = json.states ?? [];
        const parsed: Aircraft[] = states
          .filter((s) => s[5] != null && s[6] != null && !s[8]) // has coords, not on ground
          .slice(0, MAX)
          .map((s) => ({
            icao24:   s[0] as string,
            callsign: (s[1] as string)?.trim() || s[0],
            lon:      s[5] as number,
            lat:      s[6] as number,
            altitude: (s[7] ?? 0) as number,
            velocity: (s[9] ?? 0) as number,
            heading:  (s[10] ?? 0) as number,
          }));

        setAircraft(parsed);
        setError(null);
        setLastUpdated(Date.now());
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "OpenSky unavailable");
      }
    }

    load();
    const id = setInterval(load, pollMs);
    return () => { cancelled = true; clearInterval(id); };
  }, [pollMs]);

  return { aircraft, error, lastUpdated };
}
