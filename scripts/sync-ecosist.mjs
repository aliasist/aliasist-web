import { cp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "apps", "ecosist", "dist");
const destination = path.join(root, "public", "ecosist");
const retiredNexus = path.join(root, "public", "nexus");

try {
  const sourceStats = await stat(source);
  if (!sourceStats.isDirectory()) throw new Error("not a directory");
} catch {
  throw new Error("Missing Ecosist build output. Run npm run build:ecosist first.");
}

await rm(destination, { recursive: true, force: true });
await rm(retiredNexus, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });

console.log("Synced Ecosist to public/ecosist and retired public/nexus");
