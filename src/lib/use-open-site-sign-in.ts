import { useClerk } from "@clerk/react";
import { useCallback } from "react";
import { useClerkSignInModal } from "@/components/ClerkSignInModalRoot";
export function useOpenSiteSignIn() {
  const clerk = useClerk();
  const { openSignInModal } = useClerkSignInModal();

  return useCallback(() => {
    if (!clerk.loaded) return;
    openSignInModal();
  }, [clerk, openSignInModal]);
}
