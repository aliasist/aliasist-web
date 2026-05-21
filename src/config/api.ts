/**
 * Worker / API bases for the marketing site. Override with Vite env in .env.local
 * (e.g. staging workers) without editing components.
 */

export function trimTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, "");
}

const DEFAULT_LLM_BASE = "https://llm-chat.bchooper0730.workers.dev";
const DEFAULT_NEWS_BASE = "https://aliasist-news.bchooper0730.workers.dev";

function pointsAtCurrentSite(url: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URL(url, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
}

const configuredLlmBase = trimTrailingSlashes(
  import.meta.env.VITE_LLM_CHAT_BASE_URL || DEFAULT_LLM_BASE,
);
const llmBase = pointsAtCurrentSite(configuredLlmBase)
  ? DEFAULT_LLM_BASE
  : configuredLlmBase;
const newsBase = trimTrailingSlashes(import.meta.env.VITE_NEWS_WORKER_BASE_URL || DEFAULT_NEWS_BASE);

export const siteEndpoints = {
  /** Contact form → llm-chat worker */
  contactApi: `${llmBase}/api/contact`,
  /**
   * Floating AI widget → Pages Function proxy (`functions/api/chat.ts`).
   * Requires `Authorization: Bearer <Clerk session JWT>` (enforced server-side).
   */
  chatApi: "/api/chat",
  /**
   * Secured LLM worker fallback for static previews where Pages Functions are absent.
   * The worker also requires the Clerk `Authorization` header.
   */
  chatWorkerApi: `${llmBase}/api/chat`,
  /**
   * Pages Function — Clerk-authenticated chat (`functions/api/chat-messages.ts`).
   * POST requires `Authorization: Bearer <session JWT>` once you switch the widget to this API.
   */
  chatMessagesApi: "/api/chat-messages",
  /** Blog / news rail → news worker */
  newsApi: `${newsBase}/api/news`,
} as const;

/** Safe JSON parse for worker responses (avoids throw on HTML error pages). */
export async function readJsonBody<T>(res: Response): Promise<T | null> {
  const text = (await res.text()).trim();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
