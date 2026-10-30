import {
  FILENAME_RE,
  json,
  MAX_CONTENT_BYTES,
  MAX_FILES_PER_USER,
  readJson,
  USERNAME_RE,
  type SpawnosContext,
} from "../../_lib/spawnos";

/**
 * Per-profile text files for spawnOS (Dolphin Files and the terminal's write/cat/rm/ls).
 *
 * GET    /api/spawnos/files?username=u             list
 * GET    /api/spawnos/files?username=u&name=f      read one
 * POST   /api/spawnos/files  { username, name, content }   create or overwrite
 * DELETE /api/spawnos/files?username=u&name=f      delete
 */
export const onRequestGet = async ({ request, env }: SpawnosContext) => {
  const url = new URL(request.url);
  const username = (url.searchParams.get("username") ?? "").trim();
  const name = url.searchParams.get("name");

  if (!USERNAME_RE.test(username)) return json({ error: "invalid username" }, 400);

  if (name) {
    if (!FILENAME_RE.test(name)) return json({ error: "invalid file name" }, 400);
    const row = await env.SPAWNOS_DB.prepare(
      "SELECT name, content, updated_at FROM files WHERE username = ? AND name = ?",
    )
      .bind(username, name)
      .first<{ name: string; content: string; updated_at: number }>();
    if (!row) return json({ error: "not found" }, 404);
    return json({ name: row.name, content: row.content, updatedAt: row.updated_at });
  }

  const list = await env.SPAWNOS_DB.prepare(
    "SELECT name, length(content) AS size, updated_at FROM files WHERE username = ? ORDER BY name",
  )
    .bind(username)
    .all<{ name: string; size: number; updated_at: number }>();
  return json({ files: list.results.map((f) => ({ name: f.name, size: f.size, updatedAt: f.updated_at })) });
};

export const onRequestPost = async ({ request, env }: SpawnosContext) => {
  const body = await readJson(request);
  if (!body) return json({ error: "invalid JSON body" }, 400);

  const username = String(body.username ?? "").trim();
  const name = String(body.name ?? "").trim();
  const content = String(body.content ?? "");

  if (!USERNAME_RE.test(username)) return json({ error: "invalid username" }, 400);
  if (!FILENAME_RE.test(name)) return json({ error: "file name must be 1-64 chars: letters, numbers, _ . -" }, 400);
  const size = new TextEncoder().encode(content).length;
  if (size > MAX_CONTENT_BYTES) return json({ error: "file too large (200KB max)" }, 413);

  const owner = await env.SPAWNOS_DB.prepare("SELECT 1 FROM profiles WHERE username = ?").bind(username).first();
  if (!owner) return json({ error: "unknown user — log in first" }, 404);

  const counts = await env.SPAWNOS_DB.prepare(
    "SELECT COUNT(*) AS total, SUM(name = ?) AS existing FROM files WHERE username = ?",
  )
    .bind(name, username)
    .first<{ total: number; existing: number | null }>();
  if (!counts?.existing && (counts?.total ?? 0) >= MAX_FILES_PER_USER) {
    return json({ error: `file limit reached (${MAX_FILES_PER_USER} files) — delete one first` }, 409);
  }

  const now = Date.now();
  await env.SPAWNOS_DB.prepare(
    "INSERT INTO files (username, name, content, updated_at) VALUES (?, ?, ?, ?) " +
      "ON CONFLICT(username, name) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at",
  )
    .bind(username, name, content, now)
    .run();

  return json({ ok: true, name, size, updatedAt: now });
};

export const onRequestDelete = async ({ request, env }: SpawnosContext) => {
  const url = new URL(request.url);
  const username = (url.searchParams.get("username") ?? "").trim();
  const name = url.searchParams.get("name");

  if (!USERNAME_RE.test(username)) return json({ error: "invalid username" }, 400);
  if (!name || !FILENAME_RE.test(name)) return json({ error: "invalid file name" }, 400);

  await env.SPAWNOS_DB.prepare("DELETE FROM files WHERE username = ? AND name = ?").bind(username, name).run();
  return json({ ok: true });
};
