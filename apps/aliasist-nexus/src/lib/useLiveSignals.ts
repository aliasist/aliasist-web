import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { 
  EarthquakeFeedSchema, 
  SolarFluxSchema, 
  KpIndexSchema, 
  XRayFluxSchema,
  type Earthquake,
  type SpaceWeather,
  type Patent
} from "./schemas";
import { MOCK_QUAKES, MOCK_SPACE_WEATHER, MOCK_SOURCE_HEALTH, MOCK_PATENTS } from "./mocks";

export type { Earthquake, SpaceWeather, Patent };

const USGS_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson";
const NOAA_FLUX_URL = "https://services.swpc.noaa.gov/json/f107_cm_flux.json";
const NOAA_KP_URL = "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json";
const NOAA_XRAY_URL = "https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json";

// Toggle this to test mock vs live data
const USE_MOCKS = true; // Enabled for Patent Intelligence development

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

function getFlareClass(flux: number) {
  if (flux >= 1e-4) return "X";
  if (flux >= 1e-5) return "M";
  if (flux >= 1e-6) return "C";
  if (flux >= 1e-7) return "B";
  return "A";
}

export interface LiveSignals {
  quakes: Earthquake[];
  spaceWeather: SpaceWeather;
  patents: Patent[];
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
  uspto: boolean;
}

export function useLiveSignals(pollMs = 120_000): LiveSignals {
  const [quakes, setQuakes] = useState<Earthquake[]>(USE_MOCKS ? MOCK_QUAKES : []);
  const [spaceWeather, setSpaceWeather] = useState<SpaceWeather>(USE_MOCKS ? MOCK_SPACE_WEATHER : { 
    solarFlux: null, 
    kpIndex: null, 
    kpLabel: "Scanning",
    solarFlareClass: "A" 
  });
  const [patents, setPatents] = useState<Patent[]>(USE_MOCKS ? MOCK_PATENTS : []);
  const [sourceHealth, setSourceHealth] = useState<SourceHealth>(USE_MOCKS ? MOCK_SOURCE_HEALTH : { usgs: false, noaa: false, uspto: false });
  const [lastUpdated, setLastUpdated] = useState<number | null>(USE_MOCKS ? Date.now() : null);
  const [lastAttempted, setLastAttempted] = useState<number | null>(null);
  const [hasAttempted, setHasAttempted] = useState(USE_MOCKS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mountedRef = useRef(false);
  const refreshPromiseRef = useRef<Promise<SourceHealth> | null>(null);

  const refresh = useCallback((): Promise<SourceHealth> => {
    if (USE_MOCKS) return Promise.resolve(MOCK_SOURCE_HEALTH);
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    const operation = (async () => {
      if (mountedRef.current) setIsRefreshing(true);
      
      const [usgsResult, noaaResult] = await Promise.allSettled([
        fetch(USGS_URL).then(async (res) => {
          if (!res.ok) throw new Error(`USGS ${res.status}`);
          const json = await res.json();
          const parsed = EarthquakeFeedSchema.parse(json);
          return parsed.features.map(f => ({
            id: f.id,
            magnitude: f.properties.mag,
            place: f.properties.place,
            time: f.properties.time,
            coordinates: f.geometry.coordinates,
          }));
        }),
        Promise.all([
          fetch(NOAA_FLUX_URL).then(r => r.json()),
          fetch(NOAA_KP_URL).then(r => r.json()),
          fetch(NOAA_XRAY_URL).then(r => r.json()),
        ]).then(([fluxJson, kpJson, xrayJson]) => {
          const flux = SolarFluxSchema.parse(fluxJson);
          const kp = KpIndexSchema.parse(kpJson);
          const xray = XRayFluxSchema.parse(xrayJson);
          
          const latestFlux = flux.at(-1)?.flux ?? null;
          const latestKp = kp.at(-1)?.kp_index ?? kp.at(-1)?.kp ?? null;
          
          const primaryXray = xray.filter(x => x.energy === "0.1-0.8nm").at(-1);
          const flareClass = primaryXray ? getFlareClass(primaryXray.flux) : "A";

          return {
            solarFlux: latestFlux,
            kpIndex: latestKp,
            kpLabel: latestKp == null ? "Unknown" : getKpLabel(latestKp),
            solarFlareClass: flareClass
          };
        }),
      ]);

      const health: SourceHealth = {
        usgs: usgsResult.status === "fulfilled",
        noaa: noaaResult.status === "fulfilled",
        uspto: false,
      };
      const capturedAt = Date.now();

      if (!mountedRef.current) return health;
      
      if (usgsResult.status === "fulfilled") setQuakes(usgsResult.value);
      if (noaaResult.status === "fulfilled") setSpaceWeather(noaaResult.value);

      setSourceHealth(health);
      setHasAttempted(true);
      setLastAttempted(capturedAt);

      if (health.usgs || health.noaa) setLastUpdated(capturedAt);
      
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
    if (!USE_MOCKS) void refresh();
    const timer = window.setInterval(() => !USE_MOCKS && void refresh(), pollMs);
    return () => {
      mountedRef.current = false;
      window.clearInterval(timer);
    };
  }, [pollMs, refresh]);

  const status = useMemo<LiveSignals["status"]>(() => {
    if (!hasAttempted) return "loading";
    return sourceHealth.usgs && sourceHealth.noaa ? "live" : "degraded";
  }, [hasAttempted, sourceHealth]);

  return {
    quakes,
    spaceWeather,
    patents,
    sourceHealth,
    lastUpdated,
    lastAttempted,
    status,
    isRefreshing,
    refresh,
  };
}
