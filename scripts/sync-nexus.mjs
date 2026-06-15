import { cp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "apps", "aliasist-nexus", "dist");
const destination = path.join(root, "public", "nexus");

try {
  const sourceStats = await stat(source);
  if (!sourceStats.isDirectory()) throw new Error("Nexus build output is not a directory");
} catch {
  throw new Error("Missing apps/aliasist-nexus/dist. Run npm run build:nexus first.");
}

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });

console.log("Synced Aliasist Nexus to public/nexus");
