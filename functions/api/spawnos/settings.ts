import { json, readJson, USERNAME_RE, type SpawnosContext } from "../../_lib/spawnos";

const MAX_SETTINGS_CHARS = 4000;

/**
 * Saves a spawnOS profile's desktop settings (palette, motion, ...).
 *
 * Request:  POST /api/spawnos/settings  { username, settings }
 */
export const onRequestPost = async ({ request, env }: SpawnosContext) => {
  const body = await readJson(request);
  if (!body) return json({ error: "invalid JSON body" }, 400);

  const username = String(body.username ?? "").trim();
  if (!USERNAME_RE.test(username)) return json({ error: "invalid username" }, 400);
  if (typeof body.settings !== "object" || body.settings === null || Array.isArray(body.settings)) {
    return json({ error: "settings must be an object" }, 400);
  }

  const settingsJson = JSON.stringify(body.settings);
  // Reject rather than truncate: a cut-off string would no longer parse at the next login
  if (settingsJson.length > MAX_SETTINGS_CHARS) return json({ error: "settings too large" }, 413);

  const result = await env.SPAWNOS_DB.prepare(
    "UPDATE profiles SET settings = ?, last_seen = ? WHERE username = ?",
  )
    .bind(settingsJson, Date.now(), username)
    .run();

  if (result.meta.changes === 0) return json({ error: "no profile with that name yet. log in first" }, 404);
  return json({ ok: true });
};
