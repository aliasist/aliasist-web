import { useAuth } from "@clerk/react";
import { useEffect } from "react";
import { hasClerkKey } from "@/lib/clerk";
import { setDatasistClerkGetToken } from "@/lib/queryClient";

/**
 * Registers Clerk `getToken` for mutating `apiRequest` calls (POST/PATCH/DELETE).
 * Only mounts when `VITE_CLERK_PUBLISHABLE_KEY` is set (inside `ClerkProvider`).
 */
export function DatasistClerkApiBridge() {
  if (!hasClerkKey) return null;
  return <DatasistClerkApiBridgeInner />;
}

function DatasistClerkApiBridgeInner() {
  const { isSignedIn, getToken } = useAuth();

  useEffect(() => {
    if (!isSignedIn) {
      setDatasistClerkGetToken(null);
      return;
    }
    setDatasistClerkGetToken(() => getToken());
    return () => {
      setDatasistClerkGetToken(null);
    };
  }, [isSignedIn, getToken]);

  return null;
}
