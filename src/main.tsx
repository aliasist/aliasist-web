import { createRoot } from "react-dom/client";
import { AuthProvider } from "@/lib/clerk";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
);

if (import.meta.env.PROD) {
  void import("@sentry/react").then((Sentry) => {
    Sentry.init({
      dsn: "https://f58609f03ea0f38b853896ae35547d20@o4511142133760000.ingest.us.sentry.io/4511142153093120",
      environment: import.meta.env.MODE,
      release: "aliasist@1.0.0",
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: 0.5,
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: 0.05,
      sendDefaultPii: false,
    });
  });
}
