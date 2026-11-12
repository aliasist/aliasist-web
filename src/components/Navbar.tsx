import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, UserButton } from "@clerk/react";
import aliasistLogo from "@/assets/apple-touch-icon.png";
import { pageNavLinks, suiteApps } from "@/content/homepage";
import { useOpenSiteSignIn } from "@/lib/use-open-site-sign-in";

const isExternalHref = (href: string) => /^https?:\/\//.test(href);
const opensInNewTab = (app: (typeof liveSuiteApps)[number]) =>
  isExternalHref(app.href) || ("openInNewTab" in app && app.openInNewTab);

// Retired apps stay listed on the Contact section (as a demo-modal link) but
// are dropped from the Menu dropdown / mobile nav, which is for live suite apps only.
const liveSuiteApps = suiteApps.filter(
  app => !("isDemo" in app && app.isDemo)
);

// ── Sub-components ─────────────────────────────────────────────────────────────

const mobileSignInButtonClass =
  "flex-1 rounded-md border border-electric/35 bg-electric/[0.04] py-2.5 text-center text-sm text-electric shadow-electric-mobile-signin transition-all duration-300 hover:border-electric/50 hover:bg-electric/10 hover:shadow-electric-mobile-signin-hover active:scale-[0.99]";

const navUserButtonAppearance = {
  elements: {
    userButtonAvatarBox: "h-8 w-8 ring-1 ring-border/50 rounded-full",
    userButtonPopoverCard: "rounded-md border border-border bg-card shadow-lg",
  },
};

const DesktopAuthControl = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const openSiteSignIn = useOpenSiteSignIn();

  if (isSignedIn) {
    return <UserButton appearance={navUserButtonAppearance} />;
  }

  return (
    <button
      type="button"
      aria-busy={!isLoaded}
      aria-label="Sign in"
      onClick={() => openSiteSignIn()}
      className={`text-sm text-[#8e929b] hover:text-white transition-colors font-sans lowercase cursor-pointer bg-transparent border-0 p-0 outline-none focus-visible:ring-2 focus-visible:ring-primary ${!isLoaded ? "opacity-70" : ""}`}
    >
      Login
    </button>
  );
};

const MobileAuthControl = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const openSiteSignIn = useOpenSiteSignIn();

  if (isSignedIn) {
    return (
      <div className="flex-1 flex items-center justify-center py-2">
        <UserButton appearance={navUserButtonAppearance} />
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-busy={!isLoaded}
      aria-label="Sign in"
      onClick={() => openSiteSignIn()}
      className={`${mobileSignInButtonClass} cursor-pointer${!isLoaded ? " opacity-70" : ""}`}
    >
      Login
    </button>
  );
};

// ── Main Navbar ───────────────────────────────────────────────────────────────

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      setMobileOpen(false);
      mobileTriggerRef.current?.focus();
    };
    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMobileOpen(false);
    };
    closeOnDesktop();
    desktop.addEventListener("change", closeOnDesktop);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      desktop.removeEventListener("change", closeOnDesktop);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const stored = localStorage.getItem("aliasist-theme");
    const dark = stored ? stored === "dark" : true;
    document.documentElement.classList.toggle("light", !dark);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="site-nav sticky top-0 left-0 right-0 z-[200] pt-[env(safe-area-inset-top,0px)] bg-[#15171c] border-b border-black text-[#8e929b] shadow-sm"
    >
      <a
        href="#main-content"
        className="fixed left-4 top-20 z-[100] -translate-x-[200%] focus:translate-x-0 transition-transform duration-200 px-4 py-2 bg-card border border-border/60 rounded-[var(--radius)] text-xs text-foreground shadow-lg outline-none ring-2 ring-ring ring-offset-2 ring-offset-background sm:left-6 sm:top-24"
      >
        Skip to content
      </a>
      <div className="relative z-30 mx-auto flex h-14 w-full max-w-site items-center justify-between gap-5 px-4 sm:gap-8 sm:px-8 lg:px-12 xl:px-16">

        {/* ── LEFT: Aliasist Logo & Daunt quick nav ── */}
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="flex items-center gap-2.5 text-white no-underline outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Back to Aliasist homepage"
          >
            <img
              src={aliasistLogo}
              alt="Aliasist Logo"
              className="h-8 w-8 object-contain rounded"
            />
          </a>
        </div>

        {/* ── RIGHT: Login ── */}
        <div className="hidden md:flex items-center gap-5 flex-shrink-0">
          <DesktopAuthControl />
        </div>

        {/* ── MOBILE: Hamburger ── */}
        <button
          ref={mobileTriggerRef}
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground p-2 -mr-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          <div className="w-5 flex flex-col gap-[5px]">
            <span className={`block h-px bg-foreground transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[6px]" : ""}`} />
            <span className={`block h-px bg-foreground transition-all duration-300 ${mobileOpen ? "opacity-0 w-0" : ""}`} />
            <span className={`block h-px bg-foreground transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[6px]" : ""}`} />
          </div>
        </button>
      </div>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              tabIndex={-1}
              className="fixed inset-0 z-10 block cursor-default bg-background/80 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              id="mobile-navigation"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="relative z-20 md:hidden overflow-hidden border-b border-border bg-background"
            >
              <div className="max-h-[calc(100dvh-4.5rem-env(safe-area-inset-top,0px))] overflow-y-auto overscroll-contain space-y-1 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 sm:px-8 lg:px-12 xl:px-16">

              {/* Page links */}
              {pageNavLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="-mx-1 flex h-12 items-center rounded-lg px-3 text-sm text-muted-foreground transition-all duration-300 ease-out hover:bg-electric/[0.06] hover:pl-4 hover:text-foreground hover:shadow-[inset_3px_0_0_hsl(165_90%_42%_/_0.65)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {link.label}
                </a>
              ))}

              {/* Divider */}
              <div className="h-px bg-border/50 my-3" />

              {/* Project links */}
              <p className="text-xs text-muted-foreground/40 py-1">
                Projects
              </p>
              {liveSuiteApps.map(app => (
                <a
                  key={app.label}
                  href={app.href}
                  target={opensInNewTab(app) ? "_blank" : undefined}
                  rel={opensInNewTab(app) ? "noopener noreferrer" : undefined}
                  onClick={() => setMobileOpen(false)}
                  className="group -mx-1 flex h-12 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition-all duration-300 hover:bg-electric/[0.06] hover:text-electric hover:shadow-[inset_3px_0_0_hsl(165_90%_42%_/_0.5)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-sm border border-border/60 bg-background/45 font-mono text-[10px] font-semibold text-electric transition-all duration-300 group-hover:border-electric/50 group-hover:shadow-[0_0_12px_hsl(var(--electric)/0.28)]">
                    {app.icon}
                  </span>
                  <span>{app.label}</span>
                  <span className="ml-auto text-[10px] opacity-30 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">↗</span>
                </a>
              ))}



              {/* Contact then Sign In, Sign In on the right */}
              <div className="flex gap-3 pt-2">
                <a href="#contact"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-md bg-electric py-2.5 text-center text-sm text-background shadow-electric-sm transition-[background-color,box-shadow,transform] duration-300 hover:bg-electric/90 hover:shadow-electric-md active:scale-[0.99] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                  Contact
                </a>
                <MobileAuthControl />
              </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
