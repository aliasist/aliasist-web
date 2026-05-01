import { clerkReturnHref, clerkReturnUrl } from "@/lib/clerk-return-url";

type ClerkSignInClient = {
  loaded: boolean;
  openSignIn: (opts?: {
    fallbackRedirectUrl?: string;
    oauthFlow?: "auto" | "redirect" | "popup";
  }) => void;
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
 * With `VITE_CLERK_PROXY_URL` set (recommended for aliasist.com), defaults to **modal + popup OAuth**
 * so users stay on the homepage instead of navigating to auth.aliasist.com.
 *
 * Opt out with `VITE_CLERK_SIGN_IN_MODE=redirect`. Without a proxy, keep redirect mode — modal often
 * breaks when Clerk FAPI is only on clerk.aliasist.com.
 *
 * @see https://clerk.com/docs/guides/dashboard/dns-domains/satellite-domains
 */
export function openClerkSignIn(clerk: ClerkSignInClient): void {
  const mode = import.meta.env.VITE_CLERK_SIGN_IN_MODE?.trim().toLowerCase();
  const proxyConfigured = !!import.meta.env.VITE_CLERK_PROXY_URL?.trim();
  const useModal =
    mode === "modal" || (mode !== "redirect" && proxyConfigured);
  const href = clerkReturnHref();

  if (!clerk.loaded) {
    const fallback =
      import.meta.env.VITE_CLERK_PRIMARY_SIGN_IN_URL?.trim() ||
      "https://auth.aliasist.com/sign-in";
    try {
      const dest = new URL(fallback);
      dest.searchParams.set("redirect_url", href);
      window.location.assign(dest.href);
    } catch {
      window.location.assign(fallback);
    }
    return;
  }

  if (useModal) {
    clerk.openSignIn({
      fallbackRedirectUrl: clerkReturnUrl(),
      oauthFlow: "popup",
    });
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
