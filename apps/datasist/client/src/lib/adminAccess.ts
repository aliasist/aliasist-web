/**
 * Must match Worker secret ADMIN_USER_IDS (comma-separated Clerk user_… ids).
 * Set in `.env` as VITE_DATASIST_ADMIN_USER_IDS for the Admin tab + client guard.
 */

function parseAdminUserIds(raw: string | undefined): Set<string> {
  if (!raw?.trim()) return new Set();
  return new Set(
    raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

const adminIds = parseAdminUserIds(import.meta.env.VITE_DATASIST_ADMIN_USER_IDS);

export function isDatasistAdmin(userId: string | null | undefined): boolean {
  if (!userId || adminIds.size === 0) return false;
  return adminIds.has(userId);
}
