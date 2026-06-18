# Nexus Prime: Frontend-Backend API Contract

This document outlines the required data structures and endpoints for the Nexus Prime intelligence console. The frontend currently uses high-fidelity mock fallbacks located in `src/lib/mocks.ts`.

## Required Endpoints

### 1. Planetary Signals (`GET /api/signals/planetary`)
Returns real-time telemetry from seismic and heliophysics sources.

**Response Schema:**
```typescript
{
  quakes: Array<{
    id: string;
    magnitude: number;
    place: string;
    time: number;
    coordinates: [number, number, number];
  }>;
  spaceWeather: {
    solarFlux: number | null;
    kpIndex: number | null;
    kpLabel: string;
    solarFlareClass: "A" | "B" | "C" | "M" | "X";
  };
  sourceHealth: {
    usgs: boolean;
    noaa: boolean;
  };
  capturedAt: number; // Unix timestamp
}
```

### 2. Tactical Intelligence (`GET /api/intelligence/brief`)
Returns a correlated analysis of current planetary risks.

**Response Schema:**
```typescript
{
  riskScore: number; // 0-100
  riskLevel: "LOW" | "ELEVATED" | "HIGH" | "CRITICAL";
  summary: string;
  analystNote: string;
  generatedAt: number;
}
```

### 3. Patent Innovation Grid (`GET /api/intelligence/patents`)
Returns technical metadata for government-held or pending patents.

**Response Schema:**
```typescript
Array<{
  id: string;
  title: string;
  abstract: string;
  assignee: string;
  inventors: string[];
  filingDate: string;
  grantDate?: string;
  status: "Pending" | "Granted" | "Expired" | "Abandoned";
  classification: string;
}>
```

## Implementation Guidelines
- **Latency:** The UI handles polling; endpoints should be optimized for < 200ms response time.
- **Caching:** Backend should implement a 60-second TTL cache for external public API fetches (USGS/NOAA) to prevent rate limiting.
- **Versioning:** All responses should include a `v4.0` header for compatibility checks.
