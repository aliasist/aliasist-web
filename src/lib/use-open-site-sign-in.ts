import { useCallback } from "react";
import { useClerkSignInModal } from "@/components/ClerkSignInModalRoot";

export function useOpenSiteSignIn() {
  const { openSignInModal } = useClerkSignInModal();

  return useCallback(() => {
    openSignInModal();
  }, [openSignInModal]);
}
