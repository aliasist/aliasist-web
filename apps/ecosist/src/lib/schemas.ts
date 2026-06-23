import { z } from "zod";

export const EcoAlertSchema = z.object({
  id: z.string(),
  event: z.string(),
  severity: z.string().nullable(),
  urgency: z.string().nullable(),
  certainty: z.string().nullable(),
  headline: z.string().nullable(),
  areaDesc: z.string().nullable(),
  sent: z.string().nullable(),
  effective: z.string().nullable(),
  expires: z.string().nullable(),
  description: z.string().nullable(),
  instruction: z.string().nullable(),
  senderName: z.string().nullable(),
  geometry: z.unknown(),
});

export const EcoQuakeSchema = z.object({
  id: z.string(),
  magnitude: z.number(),
  place: z.string().nullable(),
  time: z.number().nullable(),
  url: z.string().nullable(),
  tsunami: z.boolean(),
  status: z.string().nullable(),
  lat: z.number(),
  lng: z.number(),
  depth: z.number().nullable(),
  alert: z.string().nullable(),
});

export const EcoEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  link: z.string().nullable(),
  category: z.string().nullable(),
  source: z.string().nullable(),
  date: z.string().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
});

export const EcoSignalsSchema = z.object({
  alerts: z.array(EcoAlertSchema),
  earthquakes: z.array(EcoQuakeSchema),
  events: z.array(EcoEventSchema),
  spaceWeather: z
    .object({
      time: z.string().nullable(),
      kpIndex: z.number().nullable(),
    })
    .nullable(),
  generatedAt: z.string(),
});

export const EcoSpaceWeatherSchema = z.object({
  source: z.string(),
  latest: z
    .object({
      time: z.string().nullable(),
      kpIndex: z.number().nullable(),
      aRunning: z.number().nullable(),
      stationCount: z.number().nullable(),
    })
    .nullable(),
  history: z.array(
    z.object({
      time: z.string().nullable(),
      kpIndex: z.number().nullable(),
      aRunning: z.number().nullable(),
      stationCount: z.number().nullable(),
    }),
  ),
});

export type EcoAlert = z.infer<typeof EcoAlertSchema>;
export type EcoQuake = z.infer<typeof EcoQuakeSchema>;
export type EcoEvent = z.infer<typeof EcoEventSchema>;
export type EcoSpaceWeather = z.infer<typeof EcoSpaceWeatherSchema>;
