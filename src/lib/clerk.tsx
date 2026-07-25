import { ClerkProvider } from "@clerk/react";
import { useMemo, type ReactNode } from "react";

const PRODUCTION_PUBLISHABLE_KEY = "pk_live_Y2xlcmsuYWxpYXNpc3QuY29tJA";

/**
 * Production and preview should set the publishable sign-in key.
 * The fallback is safe to ship because publishable keys are public client IDs;
 * keep the secret key env-only.
 */
function resolvePublishableKey(): string {
  const primary = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();
  if (primary) return primary;

  if (import.meta.env.DEV) {
    const devKey = import.meta.env.VITE_CLERK_DEV_PUBLISHABLE_KEY?.trim();
    if (devKey) return devKey;
    console.warn(
      "[Sign-in] Set VITE_CLERK_PUBLISHABLE_KEY or VITE_CLERK_DEV_PUBLISHABLE_KEY for local sign-in.",
    );
    return "";
  }

  console.warn(
    "[Sign-in] Missing VITE_CLERK_PUBLISHABLE_KEY; using the production publishable key fallback.",
  );
  return PRODUCTION_PUBLISHABLE_KEY;
}

const PUBLISHABLE_KEY = resolvePublishableKey();

/** Same URLs as suite apps (`apps/datasist`, etc.) — sign-in UI lives on Pages at auth.aliasist.com */
const CENTRAL_SIGN_IN =
  import.meta.env.VITE_CLERK_PRIMARY_SIGN_IN_URL?.trim() ||
  "https://auth.aliasist.com/sign-in";
const CENTRAL_SIGN_UP =
  import.meta.env.VITE_CLERK_PRIMARY_SIGN_UP_URL?.trim() ||
  "https://auth.aliasist.com/sign-up";

/** Same sign-in instance as auth.aliasist.com. */
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL?.trim();

/** Origins that sign-in may redirect back to after Account Portal / OAuth. */
const defaultRedirectOriginPatterns: Array<string | RegExp> = [
  /^https:\/\/.+\.trycloudflare\.com$/,
  /^http:\/\/localhost(?::\d+)?$/,
  /^http:\/\/127\.0\.0\.1(?::\d+)?$/,
  // apex + www + subdomains (e.g. www.aliasist.com, aliasist.com)
  /^https:\/\/([\w-]+\.)?aliasist\.com$/,
];

function useAllowedRedirectOrigins(): Array<string | RegExp> {
  return useMemo(() => {
    const list: Array<string | RegExp> = [...defaultRedirectOriginPatterns];
    if (typeof window !== "undefined" && window.location.origin) {
      list.unshift(window.location.origin);
    }
    const raw = import.meta.env.VITE_CLERK_EXTRA_ORIGINS?.trim();
    if (raw) {
      for (const part of raw.split(",")) {
        const o = part.trim();
        if (o) list.push(o);
      }
    }
    return list;
  }, []);
}

/** Preview tunnel hostnames run sign-in on the primary domain, then return here. */
function useSatelliteProps(): {
  isSatellite?: true;
  domain?: (url: URL) => string;
  signInUrl?: string;
  signUpUrl?: string;
} {
  return useMemo(() => {
    if (typeof window === "undefined") return {};
    if (!window.location.hostname.endsWith(".trycloudflare.com")) return {};

    return {
      isSatellite: true,
      domain: (url: URL) => url.host,
      signInUrl: CENTRAL_SIGN_IN,
      signUpUrl: CENTRAL_SIGN_UP,
    };
  }, []);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const allowedRedirectOrigins = useAllowedRedirectOrigins();
  const satellite = useSatelliteProps();

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY ?? ""}
      afterSignOutUrl="/"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      signInForceRedirectUrl="/"
      signUpForceRedirectUrl="/"
      allowedRedirectOrigins={allowedRedirectOrigins}
      {...(clerkProxyUrl ? { proxyUrl: clerkProxyUrl } : {})}
      {...satellite}
      appearance={{
        variables: {
          colorPrimary: "hsl(165 90% 42%)",
          colorBackground: "hsl(220 18% 9%)",
          colorInputBackground: "hsl(220 18% 11%)",
          colorText: "hsl(150 10% 94%)",
          colorTextSecondary: "hsl(220 12% 55%)",
          borderRadius: "0.6rem",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
