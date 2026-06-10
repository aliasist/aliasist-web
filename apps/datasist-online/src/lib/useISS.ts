import { useEffect, useState } from "react";
import { dataApiUrl } from "../lib/dataApi";

export type ISSPosition = {
  lat: number;
  lon: number;
  altitudeKm: number;
  velocityKps?: number;
  timestamp?: number;
};

type ISSUpstream = {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity?: number;
  timestamp?: number;
};

const ISS_PUBLIC_UPSTREAM = "https://api.wheretheiss.at/v1/satellites/25544";

export function useISS(pollMs = 5000) {
  const [iss, setIss] = useState<ISSPosition | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function tick() {
      if (document.visibilityState === "hidden") return;
      try {
        let resp: Response | null = null;

        try {
          resp = await fetch(dataApiUrl("/api/iss"), { headers: { accept: "application/json" } });
        } catch {
          resp = null;
        }

        if (!resp || !resp.ok) {
          resp = await fetch(ISS_PUBLIC_UPSTREAM, { headers: { accept: "application/json" } });
        }

        if (!resp.ok) throw new Error("ISS fetch failed (" + resp.status + ")");

        const data = (await resp.json()) as ISSUpstream;
        const next: ISSPosition = {
          lat: data.latitude,
          lon: data.longitude,
          altitudeKm: data.altitude,
          velocityKps: data.velocity,
          timestamp: data.timestamp,
        };
        if (!cancelled) {
          setIss((prev) => {
            if (
              prev &&
              prev.lat === next.lat &&
              prev.lon === next.lon &&
              prev.altitudeKm === next.altitudeKm &&
              prev.velocityKps === next.velocityKps &&
              prev.timestamp === next.timestamp
            ) {
              return prev;
            }
            return next;
          });
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    }

    tick();
    intervalId = window.setInterval(tick, pollMs);

    const onVis = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVis);
      if (intervalId != null) clearInterval(intervalId);
    };
  }, [pollMs]);

  return { iss, error };
}
