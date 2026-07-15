# Ecosist frontend API contract

Ecosist uses the shared Aliasist Workers API through the same-origin Pages proxy
at `/api/ecosist`. Override that frontend base with `VITE_ECOSIST_API_BASE` when
developing against another proxy-compatible environment.

Required public endpoints:

- `GET /api/ecosist/signals?area=US` — normalized NWS alerts, USGS earthquakes, NASA
  EONET natural events, and the latest NOAA K-index.
- `GET /api/ecosist/space-weather` — latest NOAA SWPC K-index plus recent history.
- `GET /api/ecosist/cameras` — normalized, terms-aware public camera catalog.
- `GET /api/ecosist/camera-sources` — connector provenance and configuration state.

The UI treats the API as federated environmental infrastructure: a failed feed
degrades source health without replacing real data with invented mock records.
