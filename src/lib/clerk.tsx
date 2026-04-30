import { ClerkProvider } from "@clerk/react";
import type { ReactNode } from "react";

const DEV_CLERK_KEY = import.meta.env.VITE_CLERK_DEV_PUBLISHABLE_KEY as string | undefined;
const PROD_CLERK_KEY =
  (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined) ??
  "pk_live_Y2xlcmsuYWxpYXNpc3QuY29tJA";

function isLocalDevHost() {
  if (typeof window === "undefined") return false;
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

const publishableKey = isLocalDevHost() && DEV_CLERK_KEY ? DEV_CLERK_KEY : PROD_CLERK_KEY;

/** Wraps Clerk with theme tokens aligned to aliasist.com (dark teal chrome). */
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={publishableKey ?? ""}
      afterSignOutUrl="/"
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
