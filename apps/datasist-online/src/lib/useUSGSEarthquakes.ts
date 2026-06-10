import { useState, useEffect } from "react";

export interface Earthquake {
  id: string;
  lat: number;
  lon: number;
  magnitude: number;
  depth: number;
  place: string;
  time: number;
}

const FEED = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson";

export function useUSGSEarthquakes(pollMs = 60_000) {
  const [quakes, setQuakes] = useState<Earthquake[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res  = await fetch(FEED);
        const json = await res.json();
        if (cancelled) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsed: Earthquake[] = (json.features as any[]).map((f) => ({
          id:        f.id,
          lat:       f.geometry.coordinates[1] as number,
          lon:       f.geometry.coordinates[0] as number,
          magnitude: f.properties.mag        as number,
          depth:     f.geometry.coordinates[2] as number,
          place:     f.properties.place       as string,
          time:      f.properties.time        as number,
        }));
        setQuakes(parsed);
        setError(null);
        setLastUpdated(Date.now());
      } catch {
        if (!cancelled) setError("USGS feed unavailable");
      }
    }

    load();
    const id = setInterval(load, pollMs);
    return () => { cancelled = true; clearInterval(id); };
  }, [pollMs]);

  return { quakes, error, lastUpdated };
}
