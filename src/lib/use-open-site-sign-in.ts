import { useClerk } from "@clerk/react";
import { useCallback } from "react";
import { useClerkSignInModal } from "@/components/ClerkSignInModalRoot";

const FALLBACK_SIGN_IN_URL =
  import.meta.env.VITE_CLERK_PRIMARY_SIGN_IN_URL?.trim() ||
  "https://auth.aliasist.com/sign-in";

export function useOpenSiteSignIn() {
  const clerk = useClerk();
  const { openSignInModal } = useClerkSignInModal();

  return useCallback(() => {
    if (!clerk.loaded) {
      window.location.href = FALLBACK_SIGN_IN_URL;
      return;
    }
    openSignInModal();
  }, [clerk, openSignInModal]);
}
