/* global document, window */
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { resolve, dirname, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "@playwright/test");
const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workspace = resolve(process.env.ALIASIST_WORKSPACE || resolve(repo, ".."));
const output = resolve(repo, ".reports", "browser", new Date().toISOString().replaceAll(":", "-"));
await mkdir(output, { recursive: true });
const selected = process.argv.find(arg => arg.startsWith("--only="))?.slice(7).split(",");
if (selected?.some(id => !["homepage", "pdf", "clear", "globalize"].includes(id))) throw new Error("Unknown browser target");
const mime = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg", ".woff2": "font/woff2" };
const servers = [];
async function serve(relative) {
  const root = resolve(workspace, relative);
  const server = createServer(async (request, response) => {
    const path = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (path.startsWith("/api/")) {
      response.writeHead(503, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Feed unavailable in offline browser check" }));
      return;
    }
    let file = resolve(root, `.${path === "/" ? "/index.html" : path}`);
    if (!file.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    try {
      let body;
      try { body = await readFile(file); } catch {
        if (extname(path)) { response.writeHead(404).end(); return; }
        file = resolve(root, "index.html");
        body = await readFile(file);
      }
      response.writeHead(200, { "Content-Type": mime[extname(file)] || "application/octet-stream" });
      response.end(body);
    } catch { response.writeHead(500).end(); }
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  servers.push(server);
  return `http://127.0.0.1:${server.address().port}`;
}

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome", headless: true });
const results = [];
async function check(id, directory, test) {
  if (selected && !selected.includes(id)) return;
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true, reducedMotion: "reduce" });
  await context.route(/^https?:\/\//, route => new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort());
  const page = await context.newPage();
  page.setDefaultTimeout(15_000);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const assets = [];
  page.on("request", request => { if (request.resourceType() === "script") assets.push(request.url()); });
  const url = await serve(directory);
  try {
    await page.goto(url);
    await test(page, assets, url);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), "Mobile layout must not overflow horizontally");
    // External authentication/telemetry is intentionally unavailable in this check.
    const unexpectedErrors = errors.filter(error => !/clerk|failed to load script/i.test(error));
    assert.deepEqual(unexpectedErrors, [], "Unexpected browser errors");
    await page.screenshot({ path: resolve(output, `${id}.png`) });
    results.push({ id, status: "passed", externalServices: "blocked", errors });
    console.log(`PASS ${id}`);
  } catch (error) {
    results.push({ id, status: "failed", reason: error.message, errors });
    await page.screenshot({ path: resolve(output, `${id}-failure.png`) });
    console.error(`FAIL ${id}: ${error.message}`);
  } finally { await context.close(); }
}

try {
  await check("homepage", "aliasist-web/dist", async (page, assets, url) => {
    await page.getByRole("heading", { name: "Projects that are available now." }).waitFor();
    assert.ok(!assets.some(asset => /\/(Entertainment|Sensor|CosmicOs)-/.test(asset)), "Secondary pages must not load on the homepage");
    await page.locator("#projects").scrollIntoViewIfNeeded();
    assert.equal(await page.locator("#projects article").count(), 6);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), "Homepage fits mobile viewport");
    await page.goto(`${url}/tech`);
    await page.getByRole("heading", { name: /ENGINEERING/ }).waitFor();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(url);
    await page.getByRole("heading", { name: "Projects that are available now." }).waitFor();
  });

  let PDFDocument;
  let pdf;
  if (!selected || selected.some(id => ["pdf", "clear"].includes(id))) {
    const requirePdf = createRequire(resolve(workspace, "pdfsist/package.json"));
    ({ PDFDocument } = requirePdf("pdf-lib"));
    const fixture = await PDFDocument.create();
    fixture.setAuthor("Aliasist browser fixture");
    fixture.addPage([612, 792]).drawText("Aliasist test document");
    fixture.addPage([612, 792]).drawText("Page two");
    pdf = Buffer.from(await fixture.save());
  }

  await check("pdf", "pdfsist/dist", async (page, assets) => {
    await page.getByRole("heading", { name: "PDFSist", exact: true }).waitFor();
    assert.ok(!assets.some(asset => /\/pdf(?:-|\.)/.test(asset)), "PDF engines must not load before a file is chosen");
    await page.getByLabel("Choose a PDF").setInputFiles({ name: "fixture.pdf", mimeType: "application/pdf", buffer: pdf });
    await page.locator(".pdf-page-shell canvas").waitFor();
    await page.getByRole("button", { name: "Next page" }).click();
    await page.getByText("2 / 2", { exact: true }).waitFor();
    await page.getByRole("button", { name: "Previous page" }).click();
    await page.getByRole("button", { name: "Text", exact: true }).click();
    await page.locator(".pdf-page-shell").click({ position: { x: 80, y: 120 } });
    await page.getByText("Tap to edit", { exact: true }).click();
    await page.getByLabel("Annotation text").fill("Verified annotation");
    await page.getByLabel("Annotation text").press("Enter");
    const downloadEvent = page.waitForEvent("download");
    await page.getByRole("button", { name: "Finish", exact: true }).click();
    const download = await downloadEvent;
    const saved = await PDFDocument.load(await readFile(await download.path()));
    assert.equal(saved.getPageCount(), 2);
    assert.equal(download.suggestedFilename(), "fixture-signed.pdf");
    assert.ok(assets.some(asset => /pdf-export-/.test(asset)), "Export engine loads on demand");
  });

  await check("clear", "aliasist-web/apps/clearasist/dist", async page => {
    await page.getByRole("heading", { name: "ClearSist", exact: true }).waitFor();
    await page.getByLabel("Choose files to clean").setInputFiles({ name: "fixture.pdf", mimeType: "application/pdf", buffer: pdf });
    const button = page.getByRole("button", { name: "Download cleaned fixture.pdf" });
    await button.waitFor();
    await button.focus();
    const downloadEvent = page.waitForEvent("download");
    await page.keyboard.press("Enter");
    const download = await downloadEvent;
    const saved = await PDFDocument.load(await readFile(await download.path()), { updateMetadata: false });
    assert.equal(saved.getPageCount(), 2);
    assert.ok(!saved.getAuthor(), "Cleaned PDF must remove the fixture author");
    assert.equal(download.suggestedFilename(), "fixture-clean.pdf");
    await page.getByLabel("Choose files to clean").setInputFiles({ name: "unsupported.txt", mimeType: "text/plain", buffer: Buffer.from("example") });
    await page.getByRole("alert").getByText(/Unsupported format/).waitFor();
  });

  await check("globalize", "projects/aliasist-repos/globalize/dist", async page => {
    await page.locator(".workspace-bar").waitFor();
    const layers = page.locator(".workspace-layers");
    await layers.locator("summary").click();
    await page.getByRole("region", { name: "Map layer controls" }).waitFor();
    await page.keyboard.press("Escape");
    assert.equal(await layers.evaluate(element => element.open), false);
    await page.getByRole("button", { name: "Search places, facilities and layers" }).click();
    await page.getByRole("dialog", { name: "Search Globalize" }).waitFor();
    await page.getByLabel("Search countries, data centers, and layers").fill("Canada");
    await page.getByRole("dialog").getByRole("button", { name: /Canada CA Country/ }).waitFor();
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    assert.equal(await page.getByRole("button", { name: "Search places, facilities and layers" }).evaluate(element => element === document.activeElement), true);
  });
} finally {
  await browser.close();
  for (const server of servers) await new Promise(resolve => server.close(resolve));
  await writeResults();
  console.log(`Browser report: ${resolve(output, "results.json")}`);
}
async function writeResults() {
  const { writeFile } = await import("node:fs/promises");
  await writeFile(resolve(output, "results.json"), JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2) + "\n");
}
if (results.some(result => result.status === "failed")) process.exitCode = 1;
