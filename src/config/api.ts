/**
 * Worker / API bases for the marketing site. Override with Vite env in .env.local
 * (e.g. staging workers) without editing components.
 */

function trimTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, "");
}

const DEFAULT_LLM_BASE = "https://llm-chat.bchooper0730.workers.dev";
const DEFAULT_NEWS_BASE = "https://aliasist-news.bchooper0730.workers.dev";

const llmBase = trimTrailingSlashes(import.meta.env.VITE_LLM_CHAT_BASE_URL || DEFAULT_LLM_BASE);
const newsBase = trimTrailingSlashes(import.meta.env.VITE_NEWS_WORKER_BASE_URL || DEFAULT_NEWS_BASE);

export const siteEndpoints = {
  /** Contact form → llm-chat worker */
  contactApi: `${llmBase}/api/contact`,
  /** Floating AI widget → same worker as contact */
  chatApi: `${llmBase}/api/chat`,
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
