import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import * as Sentry from "@sentry/react";
import App from "./App";
import "./index.css";

Sentry.init({
  dsn: "https://f58609f03ea0f38b853896ae35547d20@o4511142133760000.ingest.us.sentry.io/4511142153093120",
  environment: import.meta.env.MODE,
  release: "aliasist@1.0.0",
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  tracesSampleRate: 0.5,   // 50% of transactions for performance monitoring
  replaysOnErrorSampleRate: 1.0, // full replay on every error
  replaysSessionSampleRate: 0.05, // 5% of sessions for general replay
  sendDefaultPii: false,
});

// Production Clerk key — also set VITE_CLERK_PUBLISHABLE_KEY in Cloudflare env vars
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string ?? "pk_live_Y2xlcmsuYWxpYXNpc3QuY29tJA";

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY ?? ""} afterSignOutUrl="/">
    <App />
  </ClerkProvider>
);
