import {
  ClerkLoaded,
  SignIn,
  useAuth,
} from "@clerk/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type ClerkSignInModalContextValue = {
  openSignInModal: () => void;
};

const ClerkSignInModalContext =
  createContext<ClerkSignInModalContextValue | null>(null);

export function useClerkSignInModal(): ClerkSignInModalContextValue {
  const ctx = useContext(ClerkSignInModalContext);
  if (!ctx) {
    throw new Error(
      "useClerkSignInModal must be used within ClerkSignInModalRoot",
    );
  }
  return ctx;
}

/**
 * Full-screen overlay with Clerk `<SignIn />` — works on the primary domain even when
 * `clerk.openSignIn()` would navigate to the hosted Account Portal.
 */
export function ClerkSignInModalRoot({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) setOpen(false);
  }, [isSignedIn]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const openSignInModal = useCallback(() => setOpen(true), []);

  return (
    <ClerkSignInModalContext.Provider value={{ openSignInModal }}>
      {children}
      {open ? (
        <div
          className="fixed inset-0 z-[600] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="clerk-sign-in-title"
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[var(--radius)] border border-border/80 bg-card shadow-electric-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close sign in"
              className="tap-compact absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-border/50 bg-background/80 font-mono text-sm leading-none text-muted-foreground hover:border-electric/40 hover:text-electric"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <h2 id="clerk-sign-in-title" className="sr-only">
              Sign in
            </h2>
            <div className="p-4 pt-12">
              <ClerkLoaded>
                <SignIn
                  routing="hash"
                  forceRedirectUrl="/"
                  fallbackRedirectUrl="/"
                  oauthFlow="popup"
                  withSignUp
                />
              </ClerkLoaded>
            </div>
          </div>
        </div>
      ) : null}
    </ClerkSignInModalContext.Provider>
  );
}
