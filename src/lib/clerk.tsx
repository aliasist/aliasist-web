import { ClerkProvider } from "@clerk/react";
import { useMemo, type ReactNode } from "react";

/**
 * Prefer env (`.env.local`, Cloudflare Pages build vars); optional dev key when running `vite` locally.
 * Fallback keeps production builds working when vars are injected only at deploy time.
 */
function resolvePublishableKey(): string {
  const primary = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();
  if (primary) return primary;

  if (import.meta.env.DEV) {
    const devKey = import.meta.env.VITE_CLERK_DEV_PUBLISHABLE_KEY?.trim();
    if (devKey) return devKey;
  }

  return "pk_live_Y2xlcmsuYWxpYXNpc3QuY29tJA";
}

const PUBLISHABLE_KEY = resolvePublishableKey();

/** Same URLs as suite apps (`apps/datasist`, etc.) — sign-in UI lives on Pages at auth.aliasist.com */
const CENTRAL_SIGN_IN =
  import.meta.env.VITE_CLERK_PRIMARY_SIGN_IN_URL?.trim() ||
  "https://auth.aliasist.com/sign-in";
const CENTRAL_SIGN_UP =
  import.meta.env.VITE_CLERK_PRIMARY_SIGN_UP_URL?.trim() ||
  "https://auth.aliasist.com/sign-up";

/** Same Clerk instance as auth.aliasist.com — set on Pages when using custom FAPI host. */
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL?.trim();

const defaultRedirectOriginPatterns: Array<string | RegExp> = [
  /^https:\/\/.+\.trycloudflare\.com$/,
  /^http:\/\/localhost(?::\d+)?$/,
  /^http:\/\/127\.0\.0\.1(?::\d+)?$/,
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

/**
 * Cloudflare tunnel hostnames are a different site origin than aliasist.com.
 * Clerk treats that as a satellite: sign-in runs on the primary (Account Portal), then returns here.
 * Dashboard: https://dashboard.clerk.com/~/domains → Satellites → add each *.trycloudflare.com host.
 *
 * @see https://clerk.com/docs/guides/dashboard/dns-domains/satellite-domains
 */
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
      signInUrl={CENTRAL_SIGN_IN}
      signUpUrl={CENTRAL_SIGN_UP}
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
