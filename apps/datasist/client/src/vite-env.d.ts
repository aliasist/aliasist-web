/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
  /** Comma-separated Clerk user ids (`user_…`) allowed to use Admin — match Worker `ADMIN_USER_IDS` */
  readonly VITE_DATASIST_ADMIN_USER_IDS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
