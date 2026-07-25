/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Publishable sign-in key (production / tunnel SPA). */
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
  /** Custom sign-in frontend API proxy URL. */
  readonly VITE_CLERK_PROXY_URL?: string;
  /**
   * Google OAuth **Web** client ID for GIS button + One Tap.
   * Must match the Google SSO credentials configured for this sign-in application.
   */
  readonly VITE_GOOGLE_WEB_CLIENT_ID?: string;
  /** Optional dev-instance publishable key; used when `import.meta.env.DEV` if primary unset */
  readonly VITE_CLERK_DEV_PUBLISHABLE_KEY?: string;
  /** Base URL for llm-chat worker (no trailing slash), e.g. https://llm-chat.example.workers.dev */
  readonly VITE_LLM_CHAT_BASE_URL?: string;
  /** Base URL for news worker (no trailing slash) */
  readonly VITE_NEWS_WORKER_BASE_URL?: string;
  /** Sentry browser DSN (production). Set in deployment env or .env.production.local. */
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SENTRY_RELEASE?: string;
  readonly VITE_SENTRY_TRACES_SAMPLE_RATE?: string;
  readonly VITE_SENTRY_REPLAY_ERROR_SAMPLE_RATE?: string;
  readonly VITE_SENTRY_REPLAY_SESSION_SAMPLE_RATE?: string;
  /** Datadog RUM — enable in dev with `true` */
  readonly VITE_DATADOG_ENABLE_DEV?: string;
  readonly VITE_DATADOG_APPLICATION_ID?: string;
  readonly VITE_DATADOG_CLIENT_TOKEN?: string;
  readonly VITE_DATADOG_SITE?: string;
  readonly VITE_DATADOG_SERVICE?: string;
  readonly VITE_DATADOG_SESSION_SAMPLE_RATE?: string;
  readonly VITE_DATADOG_SESSION_REPLAY_SAMPLE_RATE?: string;
  /** Comma-separated extra origins sign-in may redirect to (e.g. preview URLs). */
  readonly VITE_CLERK_EXTRA_ORIGINS?: string;
  /** `modal` = overlay on this site. With `VITE_CLERK_PROXY_URL`, modal is default unless `redirect` is set. */
  readonly VITE_CLERK_SIGN_IN_MODE?: string;
  /** Account Portal URLs when using tunnel satellite mode (defaults match production Aliasist). */
  readonly VITE_CLERK_PRIMARY_SIGN_IN_URL?: string;
  readonly VITE_CLERK_PRIMARY_SIGN_UP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
