// Appends a new `updates` entry to src/content/homepage.ts from a GitHub
// release's repository_dispatch payload (repo, tag, name, body, url).
// Invoked by .github/workflows/announce-release.yml — not run manually.
import { readFileSync, writeFileSync } from "node:fs";

const CONTENT_PATH = new URL("../src/content/homepage.ts", import.meta.url);

const repo = process.env.REPO ?? "unknown-repo";
const tag = process.env.TAG ?? "";
const name = process.env.NAME || tag || "New release";
const rawBody = process.env.BODY ?? "";
const url = process.env.URL ?? "#";

function firstLine(text) {
  const line = text.split("\n").map(l => l.trim()).find(Boolean);
  return line ?? "";
}

function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function escape(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

const title = escape(truncate(`${repo}: ${name}`, 90));
const body = escape(truncate(firstLine(rawBody) || `New release published on ${repo}.`, 160));
const date = new Date().toISOString().slice(0, 10);
const id = `u-${repo}-${tag}`.replace(/[^a-zA-Z0-9._-]/g, "-");

const entry = `  {
    id: "${escape(id)}",
    kind: "update" as const,
    date: "${date}",
    title: "${title}",
    body: "${body}",
    href: "${escape(url)}",
  },
`;

const source = readFileSync(CONTENT_PATH, "utf8");
const marker = "  // Add new entries above this line, newest first.";
if (!source.includes(marker)) {
  throw new Error(`Could not find insertion marker in ${CONTENT_PATH}`);
}

const updated = source.replace(marker, `${entry}${marker}`);
writeFileSync(CONTENT_PATH, updated);
