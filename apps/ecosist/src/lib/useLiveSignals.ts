import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  EcoSignalsSchema,
  EcoSpaceWeatherSchema,
  type EcoAlert,
  type EcoEvent,
  type EcoQuake,
  type EcoSpaceWeather,
} from "./schemas";

export type { EcoAlert, EcoEvent, EcoQuake, EcoSpaceWeather };

const API_BASE = (import.meta.env.VITE_ECOSIST_API_BASE ??
  "/api/ecosist").replace(/\/$/, "");

function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}

function kpLabel(kp: number | null) {
  if (kp == null) return "Scanning";
  if (kp < 2) return "Quiet";
  if (kp < 4) return "Unsettled";
  if (kp < 5) return "Active";
  if (kp < 6) return "G1 Storm";
  if (kp < 7) return "G2 Storm";
  if (kp < 8) return "G3 Storm";
  if (kp < 9) return "G4 Storm";
  return "G5 Extreme";
}

export interface SourceHealth {
  ecosist: boolean;
  nws: boolean;
  usgs: boolean;
  nasa: boolean;
  noaa: boolean;
}

export interface LiveSignals {
  alerts: EcoAlert[];
  quakes: EcoQuake[];
  events: EcoEvent[];
  spaceWeather: EcoSpaceWeather | null;
  kpIndex: number | null;
  kpLabel: string;
  sourceHealth: SourceHealth;
  lastUpdated: number | null;
  lastAttempted: number | null;
  status: "loading" | "live" | "degraded";
  isRefreshing: boolean;
  refresh: () => Promise<SourceHealth>;
}

const OFFLINE: SourceHealth = {
  ecosist: false,
  nws: false,
  usgs: false,
  nasa: false,
  noaa: false,
};

export function useLiveSignals(pollMs = 120_000): LiveSignals {
  const [alerts, setAlerts] = useState<EcoAlert[]>([]);
  const [quakes, setQuakes] = useState<EcoQuake[]>([]);
  const [events, setEvents] = useState<EcoEvent[]>([]);
  const [spaceWeather, setSpaceWeather] = useState<EcoSpaceWeather | null>(null);
  const [aggregateKp, setAggregateKp] = useState<number | null>(null);
  const [sourceHealth, setSourceHealth] = useState<SourceHealth>(OFFLINE);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [lastAttempted, setLastAttempted] = useState<number | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mountedRef = useRef(false);
  const refreshPromiseRef = useRef<Promise<SourceHealth> | null>(null);

  const refresh = useCallback((): Promise<SourceHealth> => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    const operation = (async () => {
      if (mountedRef.current) setIsRefreshing(true);

      const [signalsResult, spaceResult] = await Promise.allSettled([
        fetch(apiUrl("/signals?area=US"), { headers: { accept: "application/json" } })
          .then(async (response) => {
            if (!response.ok) throw new Error(`EcoSist signals ${response.status}`);
            return EcoSignalsSchema.parse(await response.json());
          }),
        fetch(apiUrl("/space-weather"), { headers: { accept: "application/json" } })
          .then(async (response) => {
            if (!response.ok) throw new Error(`EcoSist space weather ${response.status}`);
            return EcoSpaceWeatherSchema.parse(await response.json());
          }),
      ]);

      const aggregate = signalsResult.status === "fulfilled" ? signalsResult.value : null;
      const space = spaceResult.status === "fulfilled" ? spaceResult.value : null;
      const health: SourceHealth = {
        ecosist: aggregate !== null || space !== null,
        nws: aggregate !== null,
        usgs: aggregate !== null,
        nasa: aggregate !== null,
        noaa: space !== null || aggregate?.spaceWeather != null,
      };
      const capturedAt = Date.now();

      if (!mountedRef.current) return health;
      if (aggregate) {
        setAlerts(aggregate.alerts);
        setQuakes(aggregate.earthquakes);
        setEvents(aggregate.events);
        setAggregateKp(aggregate.spaceWeather?.kpIndex ?? null);
      }
      if (space) setSpaceWeather(space);
      setSourceHealth(health);
      setHasAttempted(true);
      setLastAttempted(capturedAt);
      if (health.ecosist) setLastUpdated(capturedAt);
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

  const kpIndex = spaceWeather?.latest?.kpIndex ?? aggregateKp;
  const status = useMemo<LiveSignals["status"]>(() => {
    if (!hasAttempted) return "loading";
    return sourceHealth.ecosist && sourceHealth.noaa ? "live" : "degraded";
  }, [hasAttempted, sourceHealth]);

  return {
    alerts,
    quakes,
    events,
    spaceWeather,
    kpIndex,
    kpLabel: kpLabel(kpIndex),
    sourceHealth,
    lastUpdated,
    lastAttempted,
    status,
    isRefreshing,
    refresh,
  };
}
