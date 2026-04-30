/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL for llm-chat worker (no trailing slash), e.g. https://llm-chat.example.workers.dev */
  readonly VITE_LLM_CHAT_BASE_URL?: string;
  /** Base URL for news worker (no trailing slash) */
  readonly VITE_NEWS_WORKER_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
