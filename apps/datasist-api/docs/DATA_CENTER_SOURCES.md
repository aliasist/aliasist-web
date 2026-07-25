# Global Data Center Source Catalog — aliasist.world

Goal: expand the DataSist registry from its current **~340 AI-only facilities** (synced from
`aidatacenterindex.com`, CC BY 4.0) to a **global compilation of all data centers** —
adding the colocation/interconnection long tail and richer power/operator data.
This catalogs every viable source, how usable it is (license / cost / coverage), how it maps to
the existing `data_centers` schema, and a phased ingestion plan.

Researched June 2026.

> **Status:** Phase 1 (PeeringDB) and Phase 2 (Epoch AI) ingesters are **implemented**.
> See `POST /api/sync/peeringdb` and `POST /api/sync/epoch` in `src/index.ts`,
> migration `0003_facility_source.sql`, geocoded coords in `data/epoch_geocoded.json`
> (regenerate with `scripts/geocode-epoch.mjs`).

---

## TL;DR — what to build first

1. **PeeringDB** (`/api/fac`) — free, no key, structured, global colo/interconnection facilities with lat/lng. **Primary backbone.**
2. **Epoch AI – AI Data Centers** — CC-BY, ~60 of the largest AI/hyperscale facilities with **power (MW), compute, cost, coords, status**. **Best fit for the "AI data center intelligence" angle.**
3. **OpenStreetMap (Overpass)** + **Wikidata (SPARQL)** — free, global, fill gaps & cross-validate coordinates.
4. **Cloud provider region datasets** (AWS/Azure/GCP/OCI) — hyperscaler region coverage.
5. Commercial directories (**Cloudscene**, **Data Center Map**) — only if a licensed feed is worth paying for; **ATLAS** GitHub set is proprietary, do not scrape.

---

## Current state (for reference)

- Registry table `data_centers` (Drizzle/SQLite-on-D1, synced to Neon): `name, company, companyType (hyperscale|colocation|neocloud), lat, lng, city, state, country, capacityMW, estimatedAnnualGWh, waterUsageMillionGallons, status, yearOpened, yearPlanned, investmentBillions, acreage, primaryModels, communityImpact, communityResistance, gridRisk, renewablePercent, notes`.
- Live-signal enrichment already wired (keep as-is): **EIA** (US power price), **Electricity Maps** (carbon), **Open-Meteo** (weather/air), **NWS** (US alerts). Stored in `external_api_observations`.
- **Gap = the facility registry itself.** The sources below fill that.

---

## Tier 1 — Free, structured, directly ingestable (build these)

### 1. PeeringDB — `fac` (facilities)
- **Endpoint:** `https://www.peeringdb.com/api/fac` (single: `/api/fac/{id}`)
- **Auth:** none for read (guest). Optional HTTP basic / API key raises rate limits.
- **Coverage:** global colocation & interconnection facilities (tens of thousands), high coordinate completeness.
- **Fields:** `id, name, org_id, org_name, address1/2, city, state, zipcode, country, latitude, longitude, website, clli, notes` + interconnection metadata.
- **Paging:** `?limit=&skip=`, field filter `?fields=`, server filters like `country=DE`.
- **License:** community data under PeeringDB's data-ownership policy — attribution; verify redistribution terms before bulk republish.
- **Schema map:** `name→name`, `org_name→company`, `companyType="colocation"`, `latitude/longitude→lat/lng`, `city/state/country` direct. No capacity/power.
- **Notes:** cleanest free backbone; pairs well with Epoch for the power layer.

### 2. Epoch AI — AI Data Centers
- **URL:** `https://epoch.ai/data/ai-data-centers` (CSV + ZIP downloads)
- **Coverage:** ~60 largest operational/planned **AI** data centers; 9.4 GW IT power, 8.8M H100-eq. Updated 2026-06-24.
- **Fields:** operator/owner, location & coordinates, **power MW**, compute (H100-eq / OP/s), **cost estimate**, **status** (construction/operation timelines, phases), cooling, hardware.
- **License:** **CC-BY** — free to use/redistribute **with attribution to Epoch AI** (BibTeX provided). ✅ Cleanest reuse terms of any source here.
- **Schema map:** `operator→company`, `companyType="hyperscale"`, power→`capacityMW`, status→`status`, coords→`lat/lng`, timelines→`yearOpened/yearPlanned`, cost→`investmentBillions`.
- **Notes:** highest-value rows; perfect for the headline AI facilities on the globe.

### 3. OpenStreetMap — Overpass API
- **Endpoint:** `https://overpass-api.de/api/interpreter` (also overpass-turbo.eu to prototype)
- **Coverage:** global, community-tagged; variable completeness; good for buildings/footprints.
- **License:** **ODbL** — attribution **and share-alike** on derived DB; keep OSM-derived data attributable/separable.
- **Query (data centers worldwide):**
  ```
  [out:json][timeout:180];
  (
    nwr["telecom"="data_center"];
    nwr["building"="data_center"];
    nwr["man_made"="data_center"];
  );
  out center tags;
  ```
- **Schema map:** `name→name`, `operator`/`brand` tag→`company`, `out center`→`lat/lng`, `addr:city/country`→city/country.
- **Notes:** great for coordinate cross-validation & footprint/acreage; messy operator names — normalize.

### 4. Wikidata — SPARQL
- **Endpoint:** `https://query.wikidata.org/sparql?format=json&query=...`
- **Coverage:** notable named data centers globally; sparse but **CC0 (public domain)** — zero license friction.
- **Query (verify the data-center QID, ~`wd:Q1149571`):**
  ```sparql
  SELECT ?item ?itemLabel ?coord ?operatorLabel ?countryLabel WHERE {
    ?item wdt:P31/wdt:P279* wd:Q1149571 .
    OPTIONAL { ?item wdt:P625 ?coord. }      # coordinates
    OPTIONAL { ?item wdt:P137 ?operator. }   # operator
    OPTIONAL { ?item wdt:P17  ?country. }    # country
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }
  ```
- **Schema map:** `itemLabel→name`, `operatorLabel→company`, `coord→lat/lng`, `countryLabel→country`; keep the Wikidata QID as a cross-reference key.

### 5. Cloud provider region datasets (hyperscaler coverage)
- **AWS:** Global Infrastructure regions/AZs (public page + `ip-ranges.json` region codes).
- **Azure:** datacenter geographies / region list (public JSON in Azure docs & SDK metadata).
- **GCP:** `https://cloud.google.com/about/locations` + region metadata.
- **OCI:** public region list.
- **Multi-cloud:** **Google Cloud Location Finder (CLF) API** — locations across GCP/AWS/Azure/OCI with type/territory/carbon filters. TeleGeography **Cloud Infrastructure Map** (visual).
- **Caveat:** these are **regions**, not individual buildings — represent as `companyType="hyperscale"` region markers, or use to seed/label hyperscaler presence rather than 1:1 facilities.

---

## Tier 2 — Commercial directories (best coverage, need license/$$)

| Source | Coverage | Access | Notes |
|---|---|---|---|
| **Cloudscene** (cloudscene.com) | 4,700+ DCs, 4,200 providers, 110 countries | Directory; API/data feed is commercial | Strong colo coverage; contact for licensed feed |
| **Data Center Map** (datacentermap.com) | Global colo/cloud/connectivity directory | "About our Data" → licensing; not open | Returned HTTP 429 to automated fetch — **do not scrape**; license instead |
| **Baxtel** / **Datacenters.com** | Large US + global directories | Mostly partnership/scrape-restricted | Useful manual cross-check |
| **TeleGeography** | Cloud + submarine cable + colo | Commercial research | Premium; good for connectivity layer |

> Decision needed: is a paid feed (Cloudscene / Data Center Map) worth it, or do we assemble from free Tier‑1 sources + manual curation? See "Open questions."

---

## Tier 3 — Reference / benchmark / enrichment (not direct ingest)

- **ATLAS — Global-Data-Center-Map** (github.com/Ringmast4r) — **18,110 DCs / 116 countries / 4,181 operators**, 12 formats. ⚠️ **License: "All Rights Reserved" — may NOT be copied/redistributed without written permission.** Only 33.9% have verified GPS. → Use as a **coverage benchmark**, or **email the author for a license**; do not ingest as-is.
- **Kaggle sets** — "Global Data Center Dataset", "Global Data Center & AI Water/Electricity Usage", "Global Data Centre Energy Footprints". Mostly **country-level aggregates**; check each dataset's license individually. Good for the water/energy fields.
- **Uptime Institute / Data Center Dynamics (DCD)** — research & news, no API; narrative enrichment + `notes`.
- **SEC filings / company IR** — hyperscaler self-reported capex/capacity → `investmentBillions`, `capacityMW`.
- **CAIDA AS-Facilities** — maps ASNs to interconnection facilities (research) — connectivity enrichment.

---

## Cross-source de-duplication (critical)

Sources overlap heavily, so ingestion must resolve to canonical facilities:

1. **Staging:** load each source raw into `external_api_observations` (already exists) or a new `facility_staging` table, tagged by `source`.
2. **Match key:** normalize name + operator, then cluster by **geo proximity** (e.g. geohash precision ~6, or <150 m haversine). PeeringDB `org_id` and Wikidata `QID` are strong join keys.
3. **Merge / provenance:** write a `facility_sources` crosswalk (`facility_id, source, source_id, last_seen`) so each canonical row in `data_centers` records which sources contributed and we keep attribution (needed for ODbL/CC-BY).
4. **Field precedence:** coordinates → PeeringDB/OSM/Wikidata; power/compute/cost → Epoch AI/SEC; energy/water → EIA/Kaggle/Electricity Maps. Last-writer rules per field, highest-trust source wins.

Suggested additions to schema: a `sources` JSON column on `data_centers` (or the `facility_sources` table above) + nullable `external_ref` (PeeringDB id / Wikidata QID).

---

## Proposed ingestion architecture

```
[ PeeringDB ] [ Epoch CSV ] [ Overpass ] [ Wikidata ] [ Cloud regions ]
      \           \            |            /              /
       \           \           |           /              /
        ───────────► per-source fetch Workers (cron) ────►  facility_staging (raw, by source)
                                                                  │
                                                  dedup + merge job (geo + key match)
                                                                  ▼
                                                   data_centers  +  facility_sources
                                                                  │
                                          existing live-signal enrichment (EIA / Electricity Maps / Open-Meteo / NWS)
                                                                  ▼
                                                   /api/data-centers  →  aliasist.world globe
```

- Each source = a scheduled Cloudflare Worker (you already run Workers/D1/cron).
- Reuse the `external_api_observations` append/bucket pattern for raw pulls.
- Merge job runs after pulls; globe reads the unified `data_centers` as today.

---

## Phased plan

- **Phase 1 (highest ROI) — ✅ DONE:** PeeringDB ingester (`POST /api/sync/peeringdb`), `source`/`external_ref` columns added (migration 0003), paginated + country-filterable, replaces only `source='peeringdb'` rows. Read-time `dedupeFacilities()` merges cross-source name collisions.
- **Phase 2 — ✅ DONE:** Epoch AI importer (`POST /api/sync/epoch`, CC-BY). 50/60 facilities geocoded offline (street addresses → `data/epoch_geocoded.json`); numbers (power MW, capital cost, H100-eq) pulled live from the CSV. Lands as a separate `source='epoch'` overlay — no merge/overwrite of existing rows. (10 rows lack street addresses → skipped until geocoded.) Cloud-region seeding still TODO.
- **Phase 3:** Overpass + Wikidata gap-fill & coordinate cross-validation.
- **Phase 4:** evaluate a paid Cloudscene / Data Center Map feed for the long tail; or request ATLAS license.
- **Always:** keep EIA/Electricity Maps/Open-Meteo/NWS enrichment; surface attribution per source.

---

## Open questions (need your call)

1. **Budget:** willing to pay for a commercial feed (Cloudscene / Data Center Map), or free sources + curation only?
2. **Scope of "data center":** every colo/edge facility (→ PeeringDB gives ~tens of thousands), or curated significant/AI/hyperscale facilities only (→ Epoch + cloud regions, cleaner globe)?
3. **License posture:** OK to mix ODbL (OSM) + CC-BY (Epoch) + CC0 (Wikidata) with proper attribution surfaced on the site? (Recommended yes.)

---

## Sources
- PeeringDB API: https://www.peeringdb.com/apidocs/ · https://docs.peeringdb.com/api_specs/
- Epoch AI – AI Data Centers (CC-BY): https://epoch.ai/data/ai-data-centers
- OSM Overpass: https://wiki.openstreetmap.org/wiki/Overpass_API · https://overpass-turbo.eu/
- Wikidata Query Service: https://query.wikidata.org/
- Cloud Location Finder / regions: https://cloud.google.com/about/locations · https://aws.amazon.com/about-aws/global-infrastructure/regions_az/ · https://www.cloudinfrastructuremap.com/
- Cloudscene: https://cloudscene.com/ · Data Center Map: https://www.datacentermap.com/research/data/
- ATLAS (proprietary, reference only): https://github.com/Ringmast4r/Global-Data-Center-Map
- CAIDA AS-Facilities: https://www.caida.org/catalog/datasets/as-facilities/
