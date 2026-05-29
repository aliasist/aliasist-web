/**
 * Pure logic for Atomicity — stopwatch rows (“tasks”) in localStorage.
 * Work-block helpers remain for migrating legacy v1 lap rows into elapsed totals.
 */

export const LEGACY_STORAGE_KEY = "atomicity-state-v1";
export const STORAGE_KEY = "atomicity-state-v2";

function pad2(n) {
  return String(Math.floor(n)).padStart(2, "0");
}

function pad3(n) {
  return String(Math.floor(n)).padStart(3, "0");
}

export function formatElapsed(ms) {
  const total = Math.max(0, ms);
  const fracMs = Math.floor(total % 1000);
  const s = Math.floor(total / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const hs = pad2(h);
  const mm = pad2(m);
  const ss = pad2(sec);
  const mi = pad3(fracMs);
  return {
    h: hs,
    m: mm,
    s: ss,
    ms: mi,
    compact: `${hs}:${mm}:${ss}.${mi}`,
  };
}

export function formatLocalStamp(d = new Date()) {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${mo}-${day} ${h}:${mi}:${s}`;
}

/** Parse YYYY-MM-DD HH:MM:SS as local time → epoch ms, or null */
export function parseLocalStampToMs(stamp) {
  if (typeof stamp !== "string") return null;
  const m = stamp.trim().match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!m) return null;
  const d = new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    Number(m[4]),
    Number(m[5]),
    Number(m[6]),
    0,
  );
  const t = d.getTime();
  return Number.isFinite(t) ? t : null;
}

export function parseCompactToMs(compact) {
  if (typeof compact !== "string") return 0;
  const m = compact.trim().match(/^(\d+):(\d{2}):(\d{2})\.(\d{1,3})$/);
  if (!m) return 0;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  const s = Number(m[3]);
  let frac = m[4];
  while (frac.length < 3) frac += "0";
  const ms = Number(frac.slice(0, 3));
  return (((h * 60 + mi) * 60 + s) * 1000 + ms) | 0;
}

/** @returns {number | null} */
export function parseElapsedInput(input) {
  const t = String(input).trim();
  if (!t) return null;
  const full = t.match(/^(\d+):(\d{2}):(\d{2})(?:\.(\d{1,3}))?$/);
  if (full) {
    const h = Number(full[1]);
    const m = Number(full[2]);
    const s = Number(full[3]);
    let frac = full[4] || "";
    while (frac.length < 3) frac += "0";
    if (frac.length > 3) return null;
    const ms = frac ? Number(frac.slice(0, 3)) : 0;
    if (h < 0 || m > 59 || s > 59 || ms > 999) return null;
    const out = (((h * 60 + m) * 60 + s) * 1000 + ms) | 0;
    return out >= 0 ? out : null;
  }
  const short = t.match(/^(\d+):(\d{2})\.(\d{1,3})$/);
  if (short) {
    const mi = Number(short[1]);
    const s = Number(short[2]);
    if (s > 59) return null;
    let frac = short[3];
    while (frac.length < 3) frac += "0";
    const ms = Number(frac.slice(0, 3));
    const out = ((mi * 60 + s) * 1000 + ms) | 0;
    return out >= 0 ? out : null;
  }
  return null;
}

export function syncRecordDerived(r) {
  r.compact = formatElapsed(r.elapsedMs).compact;
}

export function newBlockRowId() {
  return typeof globalThis.crypto !== "undefined" && globalThis.crypto.randomUUID
    ? globalThis.crypto.randomUUID()
    : `wb-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** @internal legacy lap row */
function normalizeLegacyLapRow(r) {
  const lapRowId =
    typeof r.lapRowId === "string" && r.lapRowId
      ? r.lapRowId
      : typeof r.blockRowId === "string" && r.blockRowId
        ? r.blockRowId
        : newBlockRowId();
  let ms = typeof r.elapsedMs === "number" && Number.isFinite(r.elapsedMs) ? Math.max(0, r.elapsedMs | 0) : NaN;
  if (!Number.isFinite(ms)) ms = parseCompactToMs(typeof r.compact === "string" ? r.compact : "");
  return {
    lapRowId,
    seq: r.seq,
    stamp: typeof r.stamp === "string" ? r.stamp : "",
    task: typeof r.task === "string" ? r.task : "",
    compact: "",
    elapsedMs: Math.max(0, ms | 0),
    edited: !!r.edited,
  };
}

function syncLegacyLapDerived(r) {
  r.compact = formatElapsed(r.elapsedMs).compact;
}

/** Segment duration from cumulative lap times (legacy). */
function segmentBySeqLegacy(records) {
  const sorted = [...records].sort((a, b) => a.seq - b.seq);
  /** @type {Map<number, number>} */
  const seg = new Map();
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) seg.set(sorted[i].seq, sorted[i].elapsedMs);
    else seg.set(sorted[i].seq, Math.max(0, sorted[i].elapsedMs - sorted[i - 1].elapsedMs));
  }
  return seg;
}

/**
 * @typedef {{
 *   blockRowId: string,
 *   seq: number,
 *   startStamp: string,
 *   endStamp: string,
 *   task: string,
 *   compact: string,
 *   elapsedMs: number,
 *   edited?: boolean
 * }} WorkBlock
 */

/**
 * @param {object} r
 * @param {number} r.seq
 * @returns {WorkBlock}
 */
export function normalizeWorkBlock(r) {
  const blockRowId =
    typeof r.blockRowId === "string" && r.blockRowId
      ? r.blockRowId
      : typeof r.lapRowId === "string" && r.lapRowId
        ? r.lapRowId
        : newBlockRowId();
  let ms = typeof r.elapsedMs === "number" && Number.isFinite(r.elapsedMs) ? Math.max(0, r.elapsedMs | 0) : NaN;
  if (!Number.isFinite(ms)) ms = parseCompactToMs(typeof r.compact === "string" ? r.compact : "");
  const out = {
    blockRowId,
    seq: r.seq,
    startStamp: typeof r.startStamp === "string" ? r.startStamp : "",
    endStamp: typeof r.endStamp === "string" ? r.endStamp : "",
    task: typeof r.task === "string" ? r.task : "",
    compact: "",
    elapsedMs: Math.max(0, ms | 0),
    edited: !!r.edited,
  };
  syncRecordDerived(out);
  return out;
}

/** @param {any[]} rawList */
export function convertLegacyLapsToWorkBlocks(rawList) {
  const rows = rawList
    .filter(
      (r) =>
        r &&
        typeof r.seq === "number" &&
        typeof r.stamp === "string" &&
        typeof r.task === "string" &&
        (typeof r.compact === "string" || typeof r.elapsedMs === "number"),
    )
    .map((r) => {
      const x = normalizeLegacyLapRow(r);
      syncLegacyLapDerived(x);
      return x;
    });
  const sorted = [...rows].sort((a, b) => a.seq - b.seq);
  const segMap = segmentBySeqLegacy(sorted);
  return sorted.map((r) => {
    const dur = segMap.get(r.seq) ?? 0;
    const end = r.stamp;
    const endMs = parseLocalStampToMs(end);
    let startStamp = "—";
    if (endMs != null && dur > 0) {
      startStamp = formatLocalStamp(new Date(endMs - dur));
    }
    return normalizeWorkBlock({
      blockRowId: r.lapRowId,
      seq: r.seq,
      startStamp,
      endStamp: end,
      task: r.task,
      elapsedMs: dur,
      edited: r.edited,
    });
  });
}

function isWorkBlockRow(r) {
  return (
    r &&
    typeof r.seq === "number" &&
    typeof r.startStamp === "string" &&
    r.startStamp.length > 0 &&
    typeof r.endStamp === "string" &&
    r.endStamp.length > 0 &&
    typeof r.task === "string"
  );
}

function isLegacyLapRow(r) {
  return (
    r &&
    typeof r.seq === "number" &&
    typeof r.stamp === "string" &&
    typeof r.task === "string" &&
    (typeof r.compact === "string" || typeof r.elapsedMs === "number") &&
    !r.startStamp
  );
}

/** @param {any[]} raw */
export function migrateLegacyWorkLog(raw) {
  if (!Array.isArray(raw)) return [];
  const clean = raw.filter(Boolean);
  if (!clean.length) return [];
  const legacy = clean.filter(isLegacyLapRow);
  const modern = clean.filter(isWorkBlockRow);
  const converted = legacy.length ? convertLegacyLapsToWorkBlocks(legacy) : [];
  const normalizedModern = modern.map((r) => normalizeWorkBlock(r));
  return [...converted, ...normalizedModern].sort((a, b) => a.seq - b.seq);
}

export function newTaskId() {
  return typeof globalThis.crypto !== "undefined" && globalThis.crypto.randomUUID
    ? globalThis.crypto.randomUUID()
    : `t-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function defaultTaskName() {
  return `Task · ${formatLocalStamp()}`;
}

/**
 * @param {string} name
 * @param {{ taskId?: () => string, nowIso?: () => string }=} opts
 */
export function createBlankTask(name, opts = {}) {
  const tid = opts.taskId ?? newTaskId;
  const nowIso = opts.nowIso ?? (() => new Date().toISOString());
  const now = nowIso();
  return {
    id: tid(),
    name: (name && String(name).trim()) || defaultTaskName(),
    createdAt: now,
    updatedAt: now,
    baseMs: 0,
    task: "",
    laps: [],
    lapSeq: 0,
    savedBlocks: [],
  };
}

export function taskSortTs(t) {
  return String(t.updatedAt || t.createdAt || "");
}

/** @param {{ id: string, name?: string, updatedAt?: string, createdAt?: string }[]} tasks */
export function sortTasksForHome(tasks) {
  return [...tasks].sort((a, b) => taskSortTs(b).localeCompare(taskSortTs(a)));
}

/**
 * Normalize a stored task from disk (mutates). Strips legacy lap payload.
 * @param {any} s
 */
export function hydrateTask(s) {
  if (typeof s.baseMs !== "number") s.baseMs = 0;
  if (typeof s.task !== "string") s.task = "";
  s.laps = [];
  s.lapSeq = 0;
  if (!Array.isArray(s.savedBlocks)) {
    s.savedBlocks = [];
  } else {
    s.savedBlocks = s.savedBlocks
      .filter((r) => r && typeof r.elapsedMs === "number" && Number.isFinite(r.elapsedMs) && r.elapsedMs >= 0)
      .map((r) => ({
        id: typeof r.id === "string" && r.id ? r.id : newBlockRowId(),
        savedAt: typeof r.savedAt === "string" ? r.savedAt : new Date().toISOString(),
        elapsedMs: Math.max(0, r.elapsedMs | 0),
        label: typeof r.label === "string" ? r.label : "",
        edited: !!r.edited,
      }));
  }
  return s;
}

/** @param {WorkBlock[]} blocks @param {string} listLabel */
export function buildWorkLogTsv(blocks, listLabel) {
  const esc = (x) => String(x).replace(/\r?\n/g, " ").replace(/\t/g, " ");
  const sorted = [...blocks].sort((a, b) => a.seq - b.seq);
  const lines = sorted.map((r) => {
    const adj = r.edited ? "yes" : "no";
    return `${r.seq}\t${esc(r.startStamp)}\t${esc(r.endStamp)}\t${esc(r.task)}\t${esc(r.compact)}\t${r.elapsedMs}\t${adj}`;
  });
  return `tasks\t${esc(listLabel)}\nentry\tstart_local\tend_local\ttask\tduration_hms\tduration_ms\tadjusted\n${lines.join("\n")}`;
}

/** @param {WorkBlock[]} blocks @param {string} blockRowId */
export function deleteBlockByRowId(blocks, blockRowId) {
  return blocks.filter((r) => r.blockRowId !== blockRowId);
}

/**
 * @param {WorkBlock} record
 * @param {{ startStamp: string, endStamp: string, task: string, elapsedMs: number }} patch
 */
export function patchWorkBlock(record, patch) {
  const next = {
    ...record,
    startStamp: patch.startStamp,
    endStamp: patch.endStamp,
    task: patch.task,
    elapsedMs: Math.max(0, patch.elapsedMs | 0),
    edited: true,
  };
  syncRecordDerived(next);
  return next;
}

/** @param {{ id: string }[]} tasks @param {string} id */
export function deleteTaskById(tasks, id) {
  return tasks.filter((t) => t.id !== id);
}

/**
 * @param {{ id: string, name: string }[]} tasks
 * @param {string} id
 * @param {string} newName
 * @param {string} updatedAtIso
 */
export function renameTaskById(tasks, id, newName, updatedAtIso) {
  const name = String(newName).trim();
  return tasks.map((t) => (t.id === id ? { ...t, name, updatedAt: updatedAtIso } : t));
}

/** @param {{ seq: number, startStamp: string, endStamp: string, task: string, elapsedMs: number, blockRowId?: string }} fields */
export function makeWorkBlock(fields) {
  return normalizeWorkBlock({
    blockRowId: fields.blockRowId,
    seq: fields.seq,
    startStamp: fields.startStamp,
    endStamp: fields.endStamp,
    task: fields.task,
    elapsedMs: fields.elapsedMs,
    compact: formatElapsed(fields.elapsedMs).compact,
  });
}
