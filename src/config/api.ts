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

const DEFAULT_UPDATES_BASE = "https://aliasist-updates.bchooper0730.workers.dev";
const updatesBase = trimTrailingSlashes(import.meta.env.VITE_UPDATES_WORKER_BASE_URL || DEFAULT_UPDATES_BASE);

export const siteEndpoints = {
  /** Contact form → Pages Function proxy (`functions/api/contact.ts`). */
  contactApi: "/api/contact",
  /**
   * Contact worker fallback for static previews where Pages Functions are absent.
   * (Worker must allow CORS for browser calls; prefer `contactApi`.)
   */
  contactWorkerApi: `${llmBase}/api/contact`,
  /** Homepage email signup → Pages Function proxy (`functions/api/subscribe.ts`). */
  subscribeApi: "/api/subscribe",
  /**
   * Floating chat widget → Pages Function proxy (`functions/api/chat.ts`).
   * Requires `Authorization: Bearer <session JWT>` (enforced server-side).
   */
  chatApi: "/api/chat",
  /**
   * Secured chat fallback for static previews where Pages Functions are absent.
   * The worker also requires the `Authorization` header.
   */
  chatWorkerApi: `${llmBase}/api/chat`,
  /**
   * Pages Function — signed-in chat (`functions/api/chat-messages.ts`).
   * POST requires `Authorization: Bearer <session JWT>` once you switch the widget to this API.
   */
  chatMessagesApi: "/api/chat-messages",
  /** Blog / news rail → news worker */
  newsApi: `${newsBase}/api/news`,
  /** Project updates & events log → updates worker (managed from verity-console). */
  updatesApi: `${updatesBase}/api/updates`,
  /** GitHub PR Reviewer → Pages Function proxy. */
  githubPrReviewApi: "/api/github-pr-review",
  /** GitHub Companion Project Guide → Pages Function proxy. */
  githubRepoGuideApi: "/api/github-repo-guide",
  /** GitHub App repository installation status → Pages Function. */
  githubInstallStatusApi: "/api/github/install-status",
  /** Entertainment page — trending movies/TV → Pages Function proxy (TMDB). */
  entertainmentMoviesApi: "/api/entertainment/movies",
  /** Entertainment page — on-demand movie/TV trailer lookup → Pages Function proxy (TMDB /videos). */
  entertainmentMovieTrailerApi: "/api/entertainment/movie-trailer",
  /** Entertainment page — popular games → Pages Function proxy (RAWG). */
  entertainmentGamesApi: "/api/entertainment/games",
  /** Entertainment page — on-demand game trailer lookup → Pages Function proxy (RAWG /movies, native video files). */
  entertainmentGameTrailerApi: "/api/entertainment/game-trailer",
  /** Entertainment page — display-only sports odds → Pages Function proxy (The Odds API). */
  entertainmentOddsApi: "/api/entertainment/odds",
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
