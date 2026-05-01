/**
 * Client-side observability: Sentry (errors / tracing / replay) and optional Datadog RUM.
 * Configure via Vite env; never commit tokens or DSNs.
 *
 * When both Sentry replay and Datadog RUM are enabled, Datadog session replay defaults to 0
 * to avoid duplicate heavy replay payloads unless overridden.
 */

function datadogSite(): string {
  return import.meta.env.VITE_DATADOG_SITE?.trim() || "datadoghq.com";
}

export async function initBrowserObservability(): Promise<void> {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN?.trim();
  const ddAppId = import.meta.env.VITE_DATADOG_APPLICATION_ID?.trim();
  const ddClientToken = import.meta.env.VITE_DATADOG_CLIENT_TOKEN?.trim();

  if (import.meta.env.PROD && sentryDsn) {
    const Sentry = await import("@sentry/react");
    Sentry.init({
      dsn: sentryDsn,
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_SENTRY_RELEASE?.trim() || "aliasist-site",
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0.5) || 0,
      replaysOnErrorSampleRate: Number(import.meta.env.VITE_SENTRY_REPLAY_ERROR_SAMPLE_RATE ?? 1) || 0,
      replaysSessionSampleRate: Number(import.meta.env.VITE_SENTRY_REPLAY_SESSION_SAMPLE_RATE ?? 0.05) || 0,
      sendDefaultPii: false,
    });
  }

  const ddAllowed =
    import.meta.env.PROD || import.meta.env.VITE_DATADOG_ENABLE_DEV === "true";
  if (!ddAllowed || !ddAppId || !ddClientToken) return;

  const hasSentryReplay =
    import.meta.env.PROD &&
    !!import.meta.env.VITE_SENTRY_DSN?.trim() &&
    Number(import.meta.env.VITE_SENTRY_REPLAY_SESSION_SAMPLE_RATE ?? 0.05) > 0;

  const replayDefault = hasSentryReplay
    ? 0
    : Number(import.meta.env.VITE_DATADOG_SESSION_REPLAY_SAMPLE_RATE ?? 20);

  const { datadogRum } = await import("@datadog/browser-rum");

  datadogRum.init({
    applicationId: ddAppId,
    clientToken: ddClientToken,
    site: datadogSite(),
    service: import.meta.env.VITE_DATADOG_SERVICE?.trim() || "aliasist-site",
    env: import.meta.env.MODE,
    sessionSampleRate: Number(import.meta.env.VITE_DATADOG_SESSION_SAMPLE_RATE ?? 100),
    sessionReplaySampleRate: Number.isFinite(replayDefault) ? replayDefault : 0,
    defaultPrivacyLevel: "mask-user-input",
    allowedTracingUrls: [
      { match: window.location.origin, propagatorTypes: ["datadog"] },
    ],
  });
}
