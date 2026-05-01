import { useClerk } from "@clerk/react";
import { useCallback } from "react";
export function useOpenSiteSignIn() {
  const clerk = useClerk();

  return useCallback(() => {
    if (!clerk.loaded) return;
    clerk.openSignIn({
      fallbackRedirectUrl: "/",
      forceRedirectUrl: "/",
    });
  }, [clerk]);
}
