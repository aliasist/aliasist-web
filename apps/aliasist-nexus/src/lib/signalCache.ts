import type { Earthquake, SpaceWeather } from "./useLiveSignals";

const CACHE_KEY = "aliasist-nexus-signals-v1";
const CACHE_VERSION = 1;
export const MAX_CACHE_AGE_MS = 24 * 60 * 60 * 1000;

export interface CachedSignals {
  capturedAt: number;
  quakes: Earthquake[];
  spaceWeather: SpaceWeather;
}

interface CacheEnvelope extends CachedSignals {
  version: number;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isEarthquake(value: unknown): value is Earthquake {
  if (!value || typeof value !== "object") return false;
  const quake = value as Partial<Earthquake>;
  return (
    typeof quake.id === "string" &&
    quake.id.length > 0 &&
    isFiniteNumber(quake.magnitude) &&
    typeof quake.place === "string" &&
    isFiniteNumber(quake.time)
  );
}

function isSpaceWeather(value: unknown): value is SpaceWeather {
  if (!value || typeof value !== "object") return false;
  const weather = value as Partial<SpaceWeather>;
  return (
    (weather.solarFlux === null || isFiniteNumber(weather.solarFlux)) &&
    (weather.kpIndex === null || isFiniteNumber(weather.kpIndex)) &&
    typeof weather.kpLabel === "string"
  );
}

export function parseSignalCache(raw: string | null, now = Date.now()): CachedSignals | null {
  if (!raw) return null;

  try {
    const value = JSON.parse(raw) as Partial<CacheEnvelope>;
    if (
      value.version !== CACHE_VERSION ||
      !isFiniteNumber(value.capturedAt) ||
      value.capturedAt > now ||
      now - value.capturedAt > MAX_CACHE_AGE_MS ||
      !Array.isArray(value.quakes) ||
      !value.quakes.every(isEarthquake) ||
      !isSpaceWeather(value.spaceWeather)
    ) {
      return null;
    }

    return {
      capturedAt: value.capturedAt,
      quakes: value.quakes,
      spaceWeather: value.spaceWeather,
    };
  } catch {
    return null;
  }
}

export function loadSignalCache(): CachedSignals | null {
  if (typeof window === "undefined") return null;
  try {
    return parseSignalCache(window.localStorage.getItem(CACHE_KEY));
  } catch {
    return null;
  }
}

export function saveSignalCache(signals: CachedSignals): void {
  if (typeof window === "undefined") return;

  const envelope: CacheEnvelope = {
    version: CACHE_VERSION,
    ...signals,
  };

  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(envelope));
  } catch {
    // Storage can be unavailable in private or locked-down browsing contexts.
  }
}
