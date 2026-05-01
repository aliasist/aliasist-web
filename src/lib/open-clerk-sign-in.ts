import { clerkReturnHref, clerkReturnUrl } from "@/lib/clerk-return-url";

type ClerkSignInClient = {
  loaded: boolean;
  openSignIn: (opts?: { fallbackRedirectUrl?: string }) => void;
  redirectToSignIn: (opts?: {
    redirectUrl?: string | null;
    signInFallbackRedirectUrl?: string | null;
  }) => Promise<unknown>;
  /** Satellite — Clerk adds sync params for tunnels. */
  buildSignInUrl?: (opts?: {
    redirectUrl?: string | null;
    signInFallbackRedirectUrl?: string | null;
  }) => string;
};

/**
 * Default: send users to **auth.aliasist.com** (same as DataSist / EcoSist). Embedded modal often breaks
 * on this origin without `VITE_CLERK_PROXY_URL` because Clerk FAPI is on clerk.aliasist.com.
 *
 * Set `VITE_CLERK_SIGN_IN_MODE=modal` only if you configure proxy + want overlay sign-in here.
 *
 * @see https://clerk.com/docs/guides/dashboard/dns-domains/satellite-domains
 */
export function openClerkSignIn(clerk: ClerkSignInClient): void {
  if (!clerk.loaded) return;

  const mode = import.meta.env.VITE_CLERK_SIGN_IN_MODE?.trim().toLowerCase();
  const href = clerkReturnHref();

  if (mode === "modal") {
    clerk.openSignIn({ fallbackRedirectUrl: clerkReturnUrl() });
    return;
  }

  const onTunnel =
    typeof window !== "undefined" &&
    window.location.hostname.endsWith(".trycloudflare.com");

  if (onTunnel && typeof clerk.buildSignInUrl === "function") {
    window.location.assign(
      clerk.buildSignInUrl({
        redirectUrl: href,
        signInFallbackRedirectUrl: href,
      }),
    );
    return;
  }

  void clerk.redirectToSignIn({
    redirectUrl: href,
    signInFallbackRedirectUrl: href,
  });
}
