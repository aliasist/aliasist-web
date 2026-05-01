import { Show, useAuth, useClerk } from "@clerk/react";
import { useCallback, useEffect, useRef } from "react";
import { useOpenSiteSignIn } from "@/lib/use-open-site-sign-in";

const GSI_SCRIPT = "https://accounts.google.com/gsi/client";

/** Singleton script load — avoids duplicate tags across remounts (e.g. React Strict Mode). */
let gsiScriptPromise: Promise<void> | null = null;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>,
          ) => void;
          prompt: (
            momentNotification?: (notification: Record<string, unknown>) => void,
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

function loadGsiScript(): Promise<void> {
  if (gsiScriptPromise) return gsiScriptPromise;

  gsiScriptPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      reject(new Error("Google Identity Services requires a browser"));
      return;
    }

    const finish = () => {
      if (window.google?.accounts?.id) resolve();
      else reject(new Error("Google Identity Services unavailable"));
    };

    if (window.google?.accounts?.id) {
      finish();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GSI_SCRIPT}"]`,
    );

    if (existing) {
      if (existing.dataset.gsiLoaded === "1") {
        finish();
        return;
      }
      existing.addEventListener("load", () => {
        existing.dataset.gsiLoaded = "1";
        finish();
      });
      existing.addEventListener("error", () =>
        reject(new Error("Google Identity Services failed to load")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = GSI_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.gsiLoaded = "1";
      finish();
    };
    script.onerror = () =>
      reject(new Error("Google Identity Services failed to load"));
    document.head.appendChild(script);
  });

  return gsiScriptPromise;
}

/**
 * Embedded Google sign-in on the landing hero: GIS button + One Tap (when
 * `VITE_GOOGLE_WEB_CLIENT_ID` matches the Clerk Google OAuth client).
 * Without that env var, the hero uses the same overlay `<SignIn />` as the navbar.
 */
export function HomeGoogleAuth() {
  const clerk = useClerk();
  const openSiteSignIn = useOpenSiteSignIn();
  const { isLoaded } = useAuth();
  const hostRef = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID?.trim();

  const handleCredential = useCallback(
    async (response: { credential?: string }) => {
      const token = response?.credential;
      if (!token) return;
      try {
        const resource = await clerk.authenticateWithGoogleOneTap({ token });
        const sid = resource.createdSessionId;
        if (sid) await clerk.setActive({ session: sid });
      } catch (err) {
        console.error("[Clerk] Google One Tap / button sign-in failed:", err);
      }
    },
    [clerk],
  );

  useEffect(() => {
    if (!clientId || !isLoaded || !clerk.loaded) return;

    let cancelled = false;
    const host = hostRef.current;
    if (!host) return;

    void (async () => {
      try {
        await loadGsiScript();
        if (cancelled || !hostRef.current) return;

        const gsi = window.google?.accounts?.id;
        if (!gsi) return;

        gsi.cancel();
        gsi.initialize({
          client_id: clientId,
          callback: handleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
          itp_support: true,
        });
        gsi.renderButton(hostRef.current, {
          type: "standard",
          theme: "filled_black",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
        });
        gsi.prompt();
      } catch (err) {
        console.error("[GIS]", err);
      }
    })();

    return () => {
      cancelled = true;
      try {
        window.google?.accounts?.id?.cancel();
      } catch {
        /* noop */
      }
    };
  }, [clientId, clerk.loaded, handleCredential, isLoaded]);

  return (
    <Show when="signed-out">
      <div className="mt-6 flex flex-col items-center justify-center gap-2">
        {clientId ? (
          <div
            id="google-signin-button"
            ref={hostRef}
            className="flex min-h-10 items-center justify-center [&_*]:font-sans"
          />
        ) : (
          <div
            id="google-signin-button"
            className="flex min-h-10 items-center justify-center"
          >
            <button
              type="button"
              className="rounded-sm border border-border/60 px-8 py-3 font-mono text-xs uppercase tracking-[0.14em] text-foreground/80 shadow-none transition-all duration-300 hover:border-electric/60 hover:bg-electric/5 hover:text-electric hover:shadow-electric-outline hover:-translate-y-0.5 active:scale-95"
              onClick={() => openSiteSignIn()}
            >
              Continue with Google
            </button>
          </div>
        )}
      </div>
    </Show>
  );
}
