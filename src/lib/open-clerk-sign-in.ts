type ClerkSignInClient = {
  loaded: boolean;
  openSignIn: (opts?: {
    fallbackRedirectUrl?: string;
    forceRedirectUrl?: string;
    oauthFlow?: "auto" | "redirect" | "popup";
  }) => void;
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
  if (!clerk.loaded) {
    return;
  }

  clerk.openSignIn({
    fallbackRedirectUrl: "/",
    forceRedirectUrl: "/",
    oauthFlow: "popup",
  });
}
