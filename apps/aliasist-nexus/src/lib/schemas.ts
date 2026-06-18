import { z } from "zod";

/**
 * USGS Earthquake Schema
 * Safely parses the USGS GeoJSON summary feed.
 */
export const EarthquakeSchema = z.object({
  id: z.string(),
  properties: z.object({
    mag: z.number().nullable().transform((v) => v ?? 0),
    place: z.string().nullable().transform((v) => v ?? "Unknown Location"),
    time: z.number(),
    url: z.string().optional(),
    alert: z.string().nullable().optional(),
  }),
  geometry: z.object({
    coordinates: z.tuple([z.number(), z.number(), z.number()]), // [longitude, latitude, depth]
  }),
});

export const EarthquakeFeedSchema = z.object({
  features: z.array(EarthquakeSchema),
});

/**
 * NOAA Space Weather Schemas
 */
export const SolarFluxSchema = z.array(
  z.object({
    time_tag: z.string(),
    flux: z.number().nullable(),
  })
);

export const KpIndexSchema = z.array(
  z.object({
    time_tag: z.string(),
    kp_index: z.number().optional(),
    kp: z.number().optional(),
  })
);

/**
 * GOES X-Ray Flux (Solar Flares)
 */
export const XRayFluxSchema = z.array(
  z.object({
    time_tag: z.string(),
    flux: z.number(),
    energy: z.string(), // "0.05-0.4nm" or "0.1-0.8nm"
  })
);

/**
 * Patent Intelligence Schemas
 */
export const PatentSchema = z.object({
  id: z.string(),
  title: z.string(),
  abstract: z.string(),
  assignee: z.string(),
  inventors: z.array(z.string()),
  filingDate: z.string(),
  grantDate: z.string().optional(),
  status: z.enum(["Pending", "Granted", "Expired", "Abandoned"]),
  classification: z.string(), // e.g., "G06F", "H04L"
});

export type Patent = z.infer<typeof PatentSchema>;

/**
 * Domain Models (Inferred from Schemas)
 */
export type Earthquake = {
  id: string;
  magnitude: number;
  place: string;
  time: number;
  coordinates: [number, number, number];
};

export type SpaceWeather = {
  solarFlux: number | null;
  kpIndex: number | null;
  kpLabel: string;
  solarFlareClass: string; // A, B, C, M, X
};
