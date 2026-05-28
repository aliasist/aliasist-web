#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();

function readDevVars(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) out[key] = value;
  }
  return out;
}

function exists(rel) {
  try {
    return fs.existsSync(path.join(cwd, rel));
  } catch {
    return false;
  }
}

const devVarsPath = path.join(cwd, ".dev.vars");
const devVarsExamplePath = path.join(cwd, ".dev.vars.example");
const devVars = readDevVars(devVarsPath);

const publishableKey =
  process.env.VITE_CLERK_PUBLISHABLE_KEY ||
  process.env.VITE_CLERK_DEV_PUBLISHABLE_KEY ||
  process.env.CLERK_PUBLISHABLE_KEY ||
  devVars.VITE_CLERK_PUBLISHABLE_KEY ||
  devVars.VITE_CLERK_DEV_PUBLISHABLE_KEY ||
  devVars.CLERK_PUBLISHABLE_KEY ||
  "";
const secretKey =
  process.env.CLERK_SECRET_KEY || devVars.CLERK_SECRET_KEY || "";

const issues = [];
const notes = [];

if (!exists("node_modules")) {
  issues.push("Missing `node_modules/` (run `npm install`).");
}

if (!fs.existsSync(devVarsPath)) {
  notes.push(
    "No `.dev.vars` found (copy `.dev.vars.example` → `.dev.vars` for local Clerk + Pages Functions).",
  );
}
if (fs.existsSync(devVarsExamplePath) && !fs.existsSync(devVarsPath)) {
  notes.push("Quickstart: `cp .dev.vars.example .dev.vars` then fill keys.");
}

if (!publishableKey) {
  issues.push(
    "Missing Clerk publishable key (`VITE_CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_DEV_PUBLISHABLE_KEY`, or `CLERK_PUBLISHABLE_KEY`).",
  );
}
if (!secretKey) {
  notes.push(
    "Clerk secret key not set (`CLERK_SECRET_KEY`) — `/api/*` auth routes will reject requests.",
  );
}

const ok = issues.length === 0;
process.stdout.write(ok ? "✅ aliasistabductor doctor: OK\n" : "⚠️  aliasistabductor doctor: needs attention\n");

for (const issue of issues) process.stdout.write(`- ${issue}\n`);
for (const note of notes) process.stdout.write(`- ${note}\n`);

process.stdout.write("\nSuggested commands:\n");
process.stdout.write("- dev:    npm run dev\n");
process.stdout.write("- build:  npm run build\n");
process.stdout.write("- test:   npm test\n");
process.stdout.write("- pages:  npm run preview  (build + Pages Functions)\n");

process.exitCode = ok ? 0 : 1;
