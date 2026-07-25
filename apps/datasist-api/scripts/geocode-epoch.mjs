#!/usr/bin/env node
/**
 * Geocode Epoch AI "Frontier Data Centers" addresses → coordinates.
 *
 * Epoch's CSV (CC-BY) has clean street addresses but no lat/lng. The DataSist
 * `data_centers` table requires lat/lng, so we geocode once here and commit the
 * result to data/epoch_geocoded.json. The Worker (POST /api/sync/epoch) fetches
 * the LIVE Epoch CSV for the numbers (power/cost/compute) and joins this file by
 * Name for stable coordinates.
 *
 * Re-run when Epoch adds facilities:  node scripts/geocode-epoch.mjs
 *
 * Uses OSM Nominatim (free) at <=1 req/sec per its usage policy.
 * Source: Epoch AI, "AI Data Centers", epoch.ai — CC-BY 4.0.
 */
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../data/epoch_geocoded.json");
const CSV_URL = "https://epoch.ai/data/data_centers/data_centers.csv";
const UA = "aliasist-datasist-geocoder/1.0 (aliasist@proton.me)";

// Minimal RFC-4180 CSV parser (handles quoted fields with embedded newlines/commas).
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; }
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c === "\r") { /* skip */ }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift();
  return rows.filter(r => r.length > 1).map(r => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

async function geocode(query) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  const res = await fetch(url, { headers: { "User-Agent": UA, "Accept": "application/json" } });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || !data[0]) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log("Fetching Epoch CSV…");
  const csv = await (await fetch(CSV_URL, { headers: { "User-Agent": UA } })).text();
  const rows = parseCSV(csv);
  console.log(`Parsed ${rows.length} facilities.`);

  // Preserve any existing coords so re-runs only geocode new/changed rows.
  let prev = {};
  if (existsSync(OUT)) { try { prev = JSON.parse(readFileSync(OUT, "utf8")); } catch {} }

  const out = {};
  let geocoded = 0, reused = 0, failed = 0;
  for (const r of rows) {
    const name = (r.Name || "").trim();
    if (!name) continue;
    const addr = (r.Address || "").replace(/\n/g, " ").trim();
    const country = (r.Country || "").trim();

    if (prev[name]?.lat != null && prev[name]?.address === addr) {
      out[name] = prev[name]; reused++; continue;
    }

    const query = addr || (country ? `${name}, ${country}` : name);
    let coord = await geocode(query);
    // Fallback: try just "city, state/country" slice of the address.
    if (!coord && addr.includes(",")) {
      const tail = addr.split(",").slice(1).join(",").trim();
      if (tail) coord = await geocode(tail);
      await sleep(1100);
    }

    if (coord) { out[name] = { ...coord, address: addr, country }; geocoded++; console.log(`  ✓ ${name} → ${coord.lat.toFixed(4)},${coord.lng.toFixed(4)}`); }
    else { failed++; console.warn(`  ✗ ${name} — no geocode (${query.slice(0, 50)})`); }

    await sleep(1100); // Nominatim policy: <=1 req/sec
  }

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`\nDone. geocoded=${geocoded} reused=${reused} failed=${failed} total=${Object.keys(out).length}`);
  console.log(`Wrote ${OUT}`);
}

main().catch(e => { console.error(e); process.exit(1); });
