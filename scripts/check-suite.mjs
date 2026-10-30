import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const exec = promisify(execFile);
const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workspace = resolve(process.env.ALIASIST_WORKSPACE || join(repo, ".."));
const config = JSON.parse(await readFile(new URL("./suite.json", import.meta.url), "utf8"));
const args = process.argv.slice(2);
const verify = args.includes("--verify");
const live = args.includes("--live");
const selected = args.find(arg => arg.startsWith("--only="))?.slice(7).split(",");
const unknown = args.filter(arg => !["--verify", "--live"].includes(arg) && !arg.startsWith("--only="));
if (unknown.length || selected?.some(id => !config.some(app => app.id === id))) {
  throw new Error("Usage: node scripts/check-suite.mjs [--verify] [--live] [--only=homepage,ai,globalize,pdf,clear,space,platform,verity]");
}
const startedAt = new Date().toISOString();
const outputDir = join(repo, ".reports", startedAt.replaceAll(":", "-"));
await mkdir(outputDir, { recursive: true });
const report = { startedAt, workspace, verify, live, products: [] };
const run = (cwd, command) => exec(command[0], command.slice(1), { cwd, timeout: 240_000, maxBuffer: 16 * 1024 * 1024 });
const git = async (cwd, ...command) => (await run(cwd, ["git", ...command])).stdout.trim();
const entries = html => [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+\.js)["']/g)].map(match => match[1]).filter(src => src.startsWith("/assets/")).sort();
let unsuccessful = false;

for (const app of config.filter(app => !selected || selected.includes(app.id))) {
  const cwd = join(workspace, app.path);
  const result = { id: app.id, name: app.name, checks: [], live: { status: "not checked" } };
  report.products.push(result);
  console.log(`Checking ${app.name}…`);
  try { await access(cwd); } catch {
    result.local = "missing checkout";
    unsuccessful = true;
    console.log(`  Missing checkout: ${app.path}`);
    continue;
  }
  result.commit = await git(cwd, "rev-parse", "HEAD");
  result.branch = await git(cwd, "branch", "--show-current");
  result.changedPaths = (await git(cwd, "status", "--porcelain")).split("\n").filter(Boolean);
  result.local = result.changedPaths.length ? "uncommitted changes" : "clean";
  // A local change fingerprint, never the diff itself (which may contain private data).
  result.diffSha256 = createHash("sha256").update(await git(cwd, "diff", "HEAD", "--", ".")).digest("hex");

  if (verify) {
    for (const [index, command] of app.checks.entries()) {
      const log = `${app.id}-${index + 1}.log`;
      const check = { command: command.join(" "), status: "passed", log };
      result.checks.push(check);
      try {
        const out = await run(cwd, command);
        await writeFile(join(outputDir, log), out.stdout + out.stderr);
      } catch (error) {
        check.status = "failed";
        unsuccessful = true;
        await writeFile(join(outputDir, log), `${error.stdout || ""}${error.stderr || ""}\n${error.message}`);
      }
      console.log(`  ${check.status}: ${check.command}`);
    }
  }

  let localEntries = [];
  if (app.dist) {
    try {
      const html = await readFile(join(cwd, app.dist, "index.html"), "utf8");
      localEntries = entries(html);
      result.build = { entryAssets: localEntries, htmlSha256: createHash("sha256").update(html).digest("hex") };
    } catch { result.build = { status: "no local build" }; }
  }
  if (live && app.url) {
    try {
      const url = new URL(app.url);
      url.searchParams.set("release-check", startedAt);
      const response = await fetch(url, { signal: AbortSignal.timeout(20_000), headers: { "Cache-Control": "no-cache" } });
      result.live = { status: response.ok ? "reachable" : ([401, 403].includes(response.status) ? "access blocked; availability unknown" : "HTTP error"), httpStatus: response.status, url: app.url };
      if (!response.ok) unsuccessful = true;
      else if (app.dist) {
        const remoteEntries = entries(await response.text());
        result.live.entryAssets = remoteEntries;
        result.live.sameEntryAssets = localEntries.length > 0 && JSON.stringify(remoteEntries) === JSON.stringify(localEntries);
        result.live.note = "Entry asset comparison only; does not verify lazy chunks, rendering, authentication, or API behavior.";
        if (!result.live.sameEntryAssets) unsuccessful = true;
      }
    } catch (error) {
      result.live = { status: "unverified", reason: error.message, url: app.url };
      unsuccessful = true;
    }
    console.log(`  Live: ${result.live.status}`);
  }
}
report.finishedAt = new Date().toISOString();
await writeFile(join(outputDir, "suite.json"), JSON.stringify(report, null, 2) + "\n");
console.log(`Report: ${join(outputDir, "suite.json")}`);
process.exitCode = unsuccessful ? 1 : 0;
