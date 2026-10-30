import { json, readJson, USERNAME_RE, type SpawnosContext } from "../../_lib/spawnos";

/**
 * spawnOS login: creates the profile on first use, then returns its settings and file list.
 *
 * Request:  POST /api/spawnos/login  { username }
 */
export const onRequestPost = async ({ request, env }: SpawnosContext) => {
  const body = await readJson(request);
  if (!body) return json({ error: "invalid JSON body" }, 400);

  const username = String(body.username ?? "").trim();
  if (!USERNAME_RE.test(username)) {
    return json({ error: "username must be 2-20 chars: letters, numbers, _ or -" }, 400);
  }

  const now = Date.now();
  const existing = await env.SPAWNOS_DB.prepare(
    "SELECT settings, created_at FROM profiles WHERE username = ?",
  )
    .bind(username)
    .first<{ settings: string | null; created_at: number }>();

  let settings: unknown = {};
  let createdAt = now;

  if (existing) {
    try {
      settings = JSON.parse(existing.settings || "{}");
    } catch {
      settings = {};
    }
    createdAt = existing.created_at;
    await env.SPAWNOS_DB.prepare("UPDATE profiles SET last_seen = ? WHERE username = ?").bind(now, username).run();
  } else {
    await env.SPAWNOS_DB.prepare(
      "INSERT INTO profiles (username, settings, created_at, last_seen) VALUES (?, ?, ?, ?)",
    )
      .bind(username, "{}", now, now)
      .run();
  }

  const files = await env.SPAWNOS_DB.prepare(
    "SELECT name, length(content) AS size, updated_at FROM files WHERE username = ? ORDER BY name",
  )
    .bind(username)
    .all<{ name: string; size: number; updated_at: number }>();

  return json({
    username,
    settings,
    createdAt,
    lastSeen: now,
    isNew: !existing,
    files: files.results.map((f) => ({ name: f.name, size: f.size, updatedAt: f.updated_at })),
  });
};
