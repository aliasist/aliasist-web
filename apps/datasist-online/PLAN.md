# Ultimate Datasist Implementation Plan

## Objective
Create a unified "Ultimate Datasist" on `datasist.online` featuring a high-performance 3D visualization of the global data center footprint and its environmental impact using Electricity Maps data.

## 1. Backend: DataSist API (apps/datasist-api)
- [ ] **Global Grid Endpoint:** Implement `GET /api/grid/intensity` to return carbon intensity for all zones.
- [ ] **Electricity Maps Sync:** 
    - Create a background sync function that uses the premium key to fetch global intensity.
    - Store the results in the `external_api_observations` D1 table.
- [ ] **Facility Impact API:** Update the facility insights to use cached global data for more accurate, real-time reporting.

## 2. Frontend: Ultimate Globe (apps/datasist-online)
- [ ] **3D Scene (React Three Fiber):**
    - [x] Scaffold Vite project.
    - [x] Install R3F, Drei, and Three.js.
    - [x] Basic Globe component with atmospheric glow.
- [ ] **Data Integration:**
    - Fetch facility list from `datasist-api`.
    - Fetch global grid intensity from `datasist-api`.
- [ ] **Visualization Layers:**
    - **Markers:** Pulsing 3D points for data centers (colored by capacity or status).
    - **Grid Heatmap:** Colorize the globe surface based on Electricity Maps carbon intensity data.
    - **Interactive Cards:** Floating glassmorphic cards for facility details (on click/hover).

## 3. Deployment
- [ ] Configure `datasist.online` custom domain on Cloudflare Pages.
- [ ] Set up `ELECTRICITY_MAPS_API_KEY` in `datasist-api` secrets.

## Next Steps
1. Enhance `datasist-api` with global grid sync.
2. Implement facility fetching in the 3D globe.
3. Add the "Heatmap" layer to the globe using R3F.
