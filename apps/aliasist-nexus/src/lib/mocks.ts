import type { Earthquake, SpaceWeather } from "./schemas";

export const MOCK_QUAKES: Earthquake[] = [
  {
    id: "mock-1",
    magnitude: 5.2,
    place: "Pacific-Antarctic Ridge",
    time: Date.now() - 3600000,
    coordinates: [-125.4, -55.2, 10],
  },
  {
    id: "mock-2",
    magnitude: 3.1,
    place: "Baja California, Mexico",
    time: Date.now() - 7200000,
    coordinates: [-115.8, 32.1, 8],
  },
  {
    id: "mock-3",
    magnitude: 4.5,
    place: "Near Coast of Northern Chile",
    time: Date.now() - 10800000,
    coordinates: [-70.2, -20.5, 35],
  }
];

export const MOCK_SPACE_WEATHER: SpaceWeather = {
  solarFlux: 165.4,
  kpIndex: 3.2,
  kpLabel: "Unsettled",
  solarFlareClass: "M"
};

export const MOCK_SOURCE_HEALTH = {
  usgs: true,
  noaa: true,
  uspto: true
};

export const MOCK_PATENTS: any[] = [
  {
    id: "US-11234567-B2",
    title: "Quantum Neural Uplink Protocol",
    abstract: "A method for synchronizing distributed neural networks using non-local quantum state entanglement to reduce latency in global intelligence grids.",
    assignee: "Aliasist Research Lab // Gov-Contract-77",
    inventors: ["B. Maverick", "Nexus-Core-AI"],
    filingDate: "2025-02-14",
    grantDate: "2026-05-10",
    status: "Granted",
    classification: "G06N 10/00"
  },
  {
    id: "US-2026-009821-A1",
    title: "Planetary Atmospheric Carbon Sequestration Via Ionized Plasma",
    abstract: "Systems and methods for large-scale removal of CO2 from the upper atmosphere using ground-based plasma projectors.",
    assignee: "Department of Environmental Security",
    inventors: ["Dr. Aris Thorne"],
    filingDate: "2026-01-05",
    status: "Pending",
    classification: "B01D 53/00"
  }
];
