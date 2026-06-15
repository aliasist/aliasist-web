import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadSignalCache, saveSignalCache } from "./signalCache";

export interface Earthquake {
  id: string;
  magnitude: number;
  place: string;
  time: number;
}

export interface SpaceWeather {
  solarFlux: number | null;
  kpIndex: number | null;
  kpLabel: string;
}

const USGS_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson";
const NOAA_FLUX_URL = "https://services.swpc.noaa.gov/json/f107_cm_flux.json";
const NOAA_KP_URL = "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json";

function getKpLabel(kp: number) {
  if (kp < 2) return "Quiet";
  if (kp < 4) return "Unsettled";
  if (kp < 5) return "Active";
  if (kp < 6) return "G1 Storm";
  if (kp < 7) return "G2 Storm";
  if (kp < 8) return "G3 Storm";
  if (kp < 9) return "G4 Storm";
  return "G5 Extreme";
}

export interface LiveSignals {
  quakes: Earthquake[];
  spaceWeather: SpaceWeather;
  sourceHealth: SourceHealth;
  lastUpdated: number | null;
  lastAttempted: number | null;
  status: "loading" | "live" | "degraded" | "cached";
  isRefreshing: boolean;
  refresh: () => Promise<SourceHealth>;
}

export interface SourceHealth {
  usgs: boolean;
  noaa: boolean;
}

export function useLiveSignals(pollMs = 120_000): LiveSignals {
  const [initialCache] = useState(loadSignalCache);
  const [quakes, setQuakes] = useState<Earthquake[]>(initialCache?.quakes ?? []);
  const [spaceWeather, setSpaceWeather] = useState<SpaceWeather>(
    initialCache?.spaceWeather ?? { solarFlux: null, kpIndex: null, kpLabel: "Scanning" },
  );
  const [sourceHealth, setSourceHealth] = useState({ usgs: false, noaa: false });
  const [lastUpdated, setLastUpdated] = useState<number | null>(initialCache?.capturedAt ?? null);
  const [lastAttempted, setLastAttempted] = useState<number | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [hasCachedData, setHasCachedData] = useState(initialCache !== null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mountedRef = useRef(false);
  const refreshPromiseRef = useRef<Promise<SourceHealth> | null>(null);

  const refresh = useCallback((): Promise<SourceHealth> => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    const operation = (async () => {
      if (mountedRef.current) setIsRefreshing(true);
      const [usgsResult, noaaResult] = await Promise.allSettled([
        fetch(USGS_URL).then(async (response) => {
          if (!response.ok) throw new Error(`USGS ${response.status}`);
          const json = await response.json() as { features?: Array<{ id: string; properties: { mag: number; place: string; time: number } }> };
          return (json.features ?? []).map((feature) => ({
            id: feature.id,
            magnitude: feature.properties.mag,
            place: feature.properties.place,
            time: feature.properties.time,
          }));
        }),
        Promise.all([fetch(NOAA_FLUX_URL), fetch(NOAA_KP_URL)]).then(async ([fluxResponse, kpResponse]) => {
          if (!fluxResponse.ok || !kpResponse.ok) throw new Error("NOAA unavailable");
          const flux = await fluxResponse.json() as Array<{ flux?: number }>;
          const kp = await kpResponse.json() as Array<{ kp_index?: number; kp?: number }>;
          const latestFlux = flux.at(-1)?.flux ?? null;
          const latestKp = kp.at(-1)?.kp_index ?? kp.at(-1)?.kp ?? null;
          return {
            solarFlux: latestFlux,
            kpIndex: latestKp,
            kpLabel: latestKp == null ? "Unknown" : getKpLabel(latestKp),
          };
        }),
      ]);

      const health = {
        usgs: usgsResult.status === "fulfilled",
        noaa: noaaResult.status === "fulfilled",
      };
      const capturedAt = Date.now();

      if (!mountedRef.current) return health;
      if (usgsResult.status === "fulfilled") setQuakes(usgsResult.value);
      if (noaaResult.status === "fulfilled") setSpaceWeather(noaaResult.value);

      setSourceHealth(health);
      setHasAttempted(true);
      setLastAttempted(capturedAt);

      if (health.usgs || health.noaa) setLastUpdated(capturedAt);
      if (usgsResult.status === "fulfilled" && noaaResult.status === "fulfilled") {
        saveSignalCache({
          capturedAt,
          quakes: usgsResult.value,
          spaceWeather: noaaResult.value,
        });
        setHasCachedData(true);
      }

      return health;
    })().finally(() => {
      refreshPromiseRef.current = null;
      if (mountedRef.current) setIsRefreshing(false);
    });

    refreshPromiseRef.current = operation;
    return operation;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void refresh();
    const timer = window.setInterval(() => void refresh(), pollMs);
    return () => {
      mountedRef.current = false;
      window.clearInterval(timer);
    };
  }, [pollMs, refresh]);

  const status = useMemo<LiveSignals["status"]>(() => {
    if (!hasAttempted && !hasCachedData) return "loading";
    return sourceHealth.usgs && sourceHealth.noaa ? "live" : "degraded";
  }, [hasAttempted, hasCachedData, sourceHealth]);

  const resolvedStatus = useMemo<LiveSignals["status"]>(() => {
    if (status === "degraded" && hasCachedData && !sourceHealth.usgs && !sourceHealth.noaa) return "cached";
    return status;
  }, [hasCachedData, sourceHealth, status]);

  return {
    quakes,
    spaceWeather,
    sourceHealth,
    lastUpdated,
    lastAttempted,
    status: resolvedStatus,
    isRefreshing,
    refresh,
  };
}
