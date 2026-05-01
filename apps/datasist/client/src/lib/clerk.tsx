import { ClerkProvider } from "@clerk/react";
import type { ReactNode } from "react";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

export function ClerkAuthProvider({ children }: { children: ReactNode }) {
  if (!publishableKey) return <>{children}</>;

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      afterSignOutUrl="/"
      signInUrl="https://auth.aliasist.com/sign-in"
      signUpUrl="https://auth.aliasist.com/sign-up"
    >
      {children}
    </ClerkProvider>
  );
}

export const hasClerkKey = Boolean(publishableKey);
