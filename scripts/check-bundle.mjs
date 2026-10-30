import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";

// Count the entry and every statically imported chunk. Checking one filename
// alone would let an eager vendor split disguise a loading regression.
const manifest = JSON.parse(await readFile("dist/.vite/manifest.json", "utf8"));
const entry = Object.keys(manifest).find(key => manifest[key].isEntry && key === "index.html");
assert.ok(entry, "Build the homepage before checking its bundle.");
const visited = new Set();
function visit(key) {
  if (visited.has(key)) return;
  visited.add(key);
  assert.ok(manifest[key], `Missing manifest entry: ${key}`);
  for (const imported of manifest[key].imports ?? []) visit(imported);
}
visit(entry);
let gzipBytes = 0;
for (const key of visited) {
  const chunk = manifest[key];
  assert.ok(!/src\/pages\/(Entertainment|Sensor|CosmicOs|BlogCosmicOs)\.tsx/.test(key), `${key} must remain on demand.`);
  gzipBytes += gzipSync(await readFile(`dist/${chunk.file}`)).length;
}
const limit = 180 * 1024;
console.log(`Initial JavaScript: ${(gzipBytes / 1024).toFixed(1)} KiB gzip (${visited.size} chunks; budget ${limit / 1024} KiB).`);
assert.ok(gzipBytes <= limit, "Initial JavaScript exceeds its budget. Review eager imports before changing the limit.");
