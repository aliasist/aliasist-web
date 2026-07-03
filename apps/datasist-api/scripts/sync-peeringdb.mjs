// One-off / repeatable PeeringDB → remote D1 sync.
// Mirrors syncFromPeeringDB in src/index.ts (the admin route is Clerk-gated and
// unconfigured in prod, so this runs the same logic locally via wrangler).
//
// Usage:
//   node scripts/sync-peeringdb.mjs            # generate peeringdb-sync.sql
//   node scripts/sync-peeringdb.mjs --max 2000 # bound the fetch
//   npx wrangler d1 execute datasist --remote --file=peeringdb-sync.sql -y
//
// PeeringDB has no power data → capacity/energy stay NULL; status is always
// "operational" (it's a directory of live facilities).

import { writeFileSync } from "node:fs";

// ── Same alpha-2 → display-name map as src/index.ts ────────────────────────────
const ISO_COUNTRY = {
  US: "USA", GB: "United Kingdom", DE: "Germany", NL: "Netherlands", FR: "France",
  IE: "Ireland", SE: "Sweden", NO: "Norway", FI: "Finland", DK: "Denmark",
  ES: "Spain", IT: "Italy", PL: "Poland", CH: "Switzerland", AT: "Austria",
  BE: "Belgium", PT: "Portugal", CA: "Canada", BR: "Brazil", MX: "Mexico",
  JP: "Japan", CN: "China", HK: "Hong Kong", SG: "Singapore", KR: "South Korea",
  IN: "India", AU: "Australia", NZ: "New Zealand", AE: "UAE", SA: "Saudi Arabia",
  IL: "Israel", ZA: "South Africa", NG: "Nigeria", KE: "Kenya", EG: "Egypt",
  TR: "Turkey", RU: "Russia", ID: "Indonesia", MY: "Malaysia", TH: "Thailand",
  VN: "Vietnam", PH: "Philippines", TW: "Taiwan", CZ: "Czechia", RO: "Romania",
  BG: "Bulgaria", GR: "Greece", HU: "Hungary", CL: "Chile", AR: "Argentina",
  CO: "Colombia",
};

const countryName = (code) =>
  code ? (ISO_COUNTRY[code.toUpperCase()] ?? code.toUpperCase()) : "Unknown";

// ── Fetch facilities from PeeringDB, paginated and bounded ─────────────────────
async function fetchPeeringDbFacilities({ country, max = 5000 } = {}) {
  const pageSize = 500;
  const all = [];
  let skip = 0;

  while (all.length < max) {
    const url = new URL("https://www.peeringdb.com/api/fac");
    url.searchParams.set("fields", "id,name,org_name,city,state,country,latitude,longitude,website");
    url.searchParams.set("limit", String(pageSize));
    url.searchParams.set("skip", String(skip));
    if (country) url.searchParams.set("country", country.toUpperCase());

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "DataSist/3.x (aliasist.com)", Accept: "application/json" },
    });
    if (!res.ok) {
      console.error(`PeeringDB fetch failed at skip=${skip}: ${res.status}`);
      break;
    }
    const data = await res.json();
    const batch = data.data ?? [];
    all.push(...batch);
    process.stderr.write(`\rfetched ${all.length}...`);
    if (batch.length < pageSize) break; // last page
    skip += pageSize;
  }
  process.stderr.write("\n");
  return all.slice(0, max);
}

// ── Normalize to a data_centers row (same as normalizePeeringDbFac) ────────────
function normalize(fac) {
  return {
    name: fac.name,
    company: fac.org_name?.slice(0, 120) || "Unknown",
    company_type: "colocation",
    lat: Number(fac.latitude),
    lng: Number(fac.longitude),
    city: fac.city?.trim() || "Unknown",
    state: fac.state?.trim() || "",
    country: countryName(fac.country),
    status: "operational",
    community_resistance: 0,
    notes: ["Source: PeeringDB", fac.website].filter(Boolean).join(" | "),
    source: "peeringdb",
    external_ref: `peeringdb:fac:${fac.id}`,
  };
}

const q = (v) =>
  v === null || v === undefined ? "NULL"
  : typeof v === "number" ? String(v)
  : `'${String(v).replace(/'/g, "''")}'`;

// ── Main ───────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const maxIdx = args.indexOf("--max");
const max = maxIdx !== -1 ? Number(args[maxIdx + 1]) : 5000;

const facilities = await fetchPeeringDbFacilities({ max });
const rows = facilities
  .map(normalize)
  .filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng) && !(r.lat === 0 && r.lng === 0));

console.log(`fetched=${facilities.length} usable=${rows.length} skippedNoCoords=${facilities.length - rows.length}`);

const stmts = ["DELETE FROM data_centers WHERE source = 'peeringdb';"];
const BATCH = 50;
for (let i = 0; i < rows.length; i += BATCH) {
  const values = rows.slice(i, i + BATCH).map((f) =>
    `(${q(f.name)},${q(f.company)},${q(f.company_type)},${f.lat},${f.lng},${q(f.city)},${q(f.state)},${q(f.country)},` +
    `NULL,NULL,NULL,${q(f.status)},NULL,NULL,NULL,NULL,'[]',NULL,0,NULL,NULL,${q(f.notes)},${q(f.source)},${q(f.external_ref)})`
  );
  stmts.push(
    "INSERT INTO data_centers\n" +
    "  (name,company,company_type,lat,lng,city,state,country,\n" +
    "   capacity_mw,estimated_annual_gwh,water_usage_million_gallons,\n" +
    "   status,year_opened,year_planned,investment_billions,acreage,\n" +
    "   primary_models,community_impact,community_resistance,\n" +
    "   grid_risk,renewable_percent,notes,source,external_ref)\n" +
    "VALUES\n  " + values.join(",\n  ") + ";"
  );
}

const out = new URL("../peeringdb-sync.sql", import.meta.url).pathname;
writeFileSync(out, stmts.join("\n\n") + "\n");
console.log(`wrote ${out} (${stmts.length} statements)`);
console.log("apply with: npx wrangler d1 execute datasist --remote --file=peeringdb-sync.sql -y");
