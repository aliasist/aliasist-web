import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, UserButton } from "@clerk/react";
import newLogo from "@/assets/apple-touch-icon.png";
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

// Projects dropdown
const SuiteDropdown = ({ isActive = false }: { isActive?: boolean }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const highlighted = open || isActive;

  useEffect(() => {
    if (!open) return;

    let remove: (() => void) | undefined;
    const frame = requestAnimationFrame(() => {
      const onPointerDown = (e: PointerEvent) => {
        if (ref.current?.contains(e.target as Node)) return;
        setOpen(false);
      };
      document.addEventListener("pointerdown", onPointerDown);
      remove = () => document.removeEventListener("pointerdown", onPointerDown);
    });

    return () => {
      cancelAnimationFrame(frame);
      remove?.();
    };
  }, [open]);

  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  const openNow = () => {
    clearTimeout(closeTimerRef.current);
    setOpen(true);
  };

  // Short delay so moving the cursor from the button down into the dropdown
  // panel doesn't close it — mouse briefly leaves both elements mid-transit.
  const closeSoon = () => {
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`group relative flex items-center gap-1.5 overflow-hidden rounded-full px-2.5 py-1.5 text-xs font-mono uppercase tracking-[0.16em] outline-none transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-electric/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          highlighted
            ? "bg-electric/10 text-electric shadow-electric-xs"
            : "text-muted-foreground hover:bg-electric/[0.06] hover:text-foreground hover:shadow-electric-ring-inset"
        }`}
      >
        <span className="relative z-10">Menu</span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="relative z-10"
          width="10" height="10" viewBox="0 0 24 24" fill="none"
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
        <span
          className={`pointer-events-none absolute inset-x-2 top-1/2 h-full -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-electric/10 to-transparent opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100 ${highlighted ? "opacity-60" : ""}`}
          aria-hidden
        />
        <span
          className={`absolute bottom-1 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-accent-line-duo shadow-accent-line-duo transition-all duration-300 ease-out ${
            highlighted ? "w-[calc(100%-1.25rem)] opacity-100" : "w-0 opacity-0 group-hover:w-[calc(100%-1.25rem)] group-hover:opacity-100"
          }`}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full right-0 z-50 mt-3 w-64 overflow-hidden rounded-lg border border-border/80 bg-card/95 shadow-electric-panel backdrop-blur-xl"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50">
                Projects
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-electric/60">
                {liveSuiteApps.length} Links
              </span>
            </div>

            {liveSuiteApps.map((app, i) => (
              <motion.a
                key={app.label}
                href={app.href}
                target={opensInNewTab(app) ? "_blank" : undefined}
                rel={opensInNewTab(app) ? "noopener noreferrer" : undefined}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15, delay: i * 0.04 }}
                className="group relative flex items-center gap-3 border-b border-border/30 px-4 py-3 transition-colors duration-300 last:border-0 hover:bg-[linear-gradient(90deg,hsl(165_90%_42%_/_0.06)_0%,transparent_100%)] outline-none focus-visible:z-10 focus-visible:bg-[linear-gradient(90deg,hsl(165_90%_42%_/_0.12)_0%,transparent_100%)] focus-visible:ring-2 focus-visible:ring-electric/60 focus-visible:ring-inset"
              >
                <span className="absolute left-0 top-1/2 h-0 w-[3px] -translate-y-1/2 rounded-full bg-electric opacity-0 shadow-electric-accent-line transition-all duration-300 group-hover:h-[60%] group-hover:opacity-100" aria-hidden />
                <span className="flex size-7 shrink-0 items-center justify-center rounded-sm border border-border/60 bg-background/45 font-mono text-[10px] font-semibold text-electric transition-all duration-300 group-hover:border-violet/45 group-hover:shadow-[0_0_12px_hsl(var(--violet)/0.28)]">
                  {app.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs font-semibold text-foreground transition-colors duration-300 group-hover:text-electric">
                    {app.label}
                  </p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground/50 mt-0.5 truncate">
                    {app.sub}
                  </p>
                </div>
                <span className="translate-x-0.5 font-mono text-xs text-electric opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">↗</span>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const signInButtonClass =
  "border border-border/50 bg-background/40 px-3.5 py-2 text-xs font-mono uppercase tracking-[0.16em] text-muted-foreground backdrop-blur-sm transition-all duration-300 ease-out hover:border-violet/40 hover:bg-electric/[0.07] hover:text-electric hover:shadow-[0_0_22px_hsl(var(--violet)/0.18),inset_0_1px_0_hsl(0_0%_100%/0.04)] active:scale-[0.98] rounded-full";

const mobileSignInButtonClass =
  "flex-1 rounded-md border border-electric/35 bg-electric/[0.04] py-2.5 text-center text-xs font-mono uppercase tracking-[0.16em] text-electric shadow-electric-mobile-signin transition-all duration-300 hover:border-electric/50 hover:bg-electric/10 hover:shadow-electric-mobile-signin-hover active:scale-[0.99]";

const utilityButtonClass =
  "tap-compact flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-muted-foreground transition-all duration-300 ease-out hover:border-electric/25 hover:bg-electric/[0.08] hover:text-electric hover:shadow-electric-utility-hover active:scale-95";

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
      className={`${signInButtonClass} shrink-0 cursor-pointer text-foreground/90 ${!isLoaded ? "opacity-70" : ""}`}
    >
      Sign In
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
      Sign In
    </button>
  );
};

// ── Main Navbar ───────────────────────────────────────────────────────────────

const Navbar = () => {
  const [scrolled, setScrolled]         = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [isDark, setIsDark]             = useState(true);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen]);

  // Scroll-spy — highlight the nav link whose section is in view
  useEffect(() => {
    const sectionIds = pageNavLinks.map(l => l.href.replace("#", ""));
    const observers: IntersectionObserver[] = [];
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.25, rootMargin: "-80px 0px -40% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("aliasist-theme");
    const dark = stored ? stored === "dark" : true;
    setIsDark(dark);
    document.documentElement.classList.toggle("light", !dark);
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle("light", !next);
      localStorage.setItem("aliasist-theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`site-nav fixed top-0 left-0 right-0 z-[200] pt-[env(safe-area-inset-top,0px)] transition-all duration-300 ${
        scrolled
          ? "bg-background/82 backdrop-blur-2xl border-b border-border/50 shadow-electric-bar"
          : "bg-background/[0.03] backdrop-blur-[2px]"
      }`}
    >
      <a
        href="#main-content"
        className="fixed left-4 top-20 z-[100] -translate-x-[200%] focus:translate-x-0 transition-transform duration-200 px-4 py-2 bg-card border border-border/60 rounded-[var(--radius)] font-mono text-[10px] uppercase tracking-widest text-foreground shadow-lg outline-none ring-2 ring-ring ring-offset-2 ring-offset-background sm:left-6 sm:top-24"
      >
        Skip to content
      </a>
      <div className="relative z-30 mx-auto flex h-[4.5rem] w-full max-w-site items-center justify-between gap-5 px-4 sm:gap-8 sm:px-8 lg:px-12 xl:px-16">

        {/* ── LEFT: Logo ── */}
        <a
          href="/"
          className="group flex flex-shrink-0 items-center gap-3 rounded-xl border-0 bg-transparent py-1 pr-2 text-left transition-all duration-300 hover:bg-electric/[0.04] cursor-pointer outline-none appearance-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Back to Aliasist homepage"
        >
          <motion.img
            src={newLogo}
            alt=""
            className="h-12 w-12 object-contain drop-shadow-logo-aura transition-all duration-300 sm:h-14 sm:w-14"
            style={{ background: "transparent" }}
            whileHover={{ scale: 1.08, rotate: -3, filter: "drop-shadow(0 0 16px hsl(165 90% 42% / 0.8)) drop-shadow(0 0 22px hsl(278 82% 67% / 0.45))" }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          />
        </a>

        {/* ── CENTER: Page links ── */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-2 rounded-full border border-border/35 bg-background/50 px-2.5 py-1.5 shadow-electric-violet-well backdrop-blur-md">
          {pageNavLinks.map(link => {
            const isActive = activeSection === link.href.replace("#", "");
            return (
              <a
                key={link.href}
                href={link.href}
                className={`group relative overflow-hidden rounded-full px-4 py-2 text-xs font-mono uppercase tracking-[0.16em] transition-all duration-300 ease-out outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  isActive
                    ? "bg-electric/[0.12] text-electric shadow-electric-xs"
                    : "text-muted-foreground hover:bg-electric/[0.06] hover:text-foreground hover:tracking-[0.2em] hover:shadow-electric-ring-inset-soft"
                }`}
              >
                <span className="relative z-10">{link.label}</span>
                <span
                  className={`pointer-events-none absolute inset-x-2 top-1/2 h-full -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-electric/10 to-transparent opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100 ${isActive ? "opacity-60" : ""}`}
                  aria-hidden
                />
                <span
                  className={`absolute bottom-1 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-accent-line-duo shadow-accent-line-duo transition-all duration-300 ease-out ${
                    isActive ? "w-[calc(100%-1.25rem)] opacity-100" : "w-0 opacity-0 group-hover:w-[calc(100%-1.25rem)] group-hover:opacity-100"
                  }`}
                />
              </a>
            );
          })}

          {/* Subtle separator */}
          <span className="mx-1.5 h-4 w-px bg-border/60" />

          {/* Projects dropdown */}
          <SuiteDropdown isActive={activeSection === "projects"} />
        </div>

        {/* ── RIGHT: Controls ── */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1 rounded-full border border-border/35 bg-background/50 p-1 shadow-electric-nav-well-inset backdrop-blur-md">
            <button
              onClick={toggleTheme}
              title={isDark ? "Light mode" : "Dark mode"}
              className={utilityButtonClass}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
          </div>
          <div className="flex items-center gap-3 shrink-0 min-w-0">
            <a
              href="#contact"
              className="rounded-full bg-electric px-5 py-2 text-xs font-mono uppercase tracking-[0.16em] text-background shadow-electric-sm transition-[background-color,box-shadow,transform] duration-300 ease-out hover:bg-electric/90 hover:shadow-electric-md active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Contact
            </a>
            <DesktopAuthControl />
          </div>
        </div>

        {/* ── MOBILE: Hamburger ── */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground p-2 -mr-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Toggle menu"
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
              className="fixed inset-0 z-10 block cursor-default bg-background/50 backdrop-blur-lg md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="relative z-20 md:hidden overflow-hidden border-b border-border bg-background/98 backdrop-blur-xl"
            >
              <div className="space-y-1 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 sm:px-8 lg:px-12 xl:px-16">

              {/* Page links */}
              {pageNavLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="-mx-1 flex h-12 items-center rounded-lg px-3 text-xs font-mono uppercase tracking-[0.15em] text-muted-foreground transition-all duration-300 ease-out hover:bg-electric/[0.06] hover:pl-4 hover:text-foreground hover:shadow-[inset_3px_0_0_hsl(165_90%_42%_/_0.65)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {link.label}
                </a>
              ))}

              {/* Divider */}
              <div className="h-px bg-border/50 my-3" />

              {/* Project links */}
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 py-1">
                Projects
              </p>
              {liveSuiteApps.map(app => (
                <a
                  key={app.label}
                  href={app.href}
                  target={opensInNewTab(app) ? "_blank" : undefined}
                  rel={opensInNewTab(app) ? "noopener noreferrer" : undefined}
                  onClick={() => setMobileOpen(false)}
                  className="group -mx-1 flex h-12 items-center gap-3 rounded-lg px-3 text-xs font-mono uppercase tracking-[0.15em] text-muted-foreground transition-all duration-300 hover:bg-electric/[0.06] hover:text-electric hover:shadow-[inset_3px_0_0_hsl(165_90%_42%_/_0.5)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-sm border border-border/60 bg-background/45 font-mono text-[10px] font-semibold text-electric transition-all duration-300 group-hover:border-violet/45 group-hover:shadow-[0_0_12px_hsl(var(--violet)/0.28)]">
                    {app.icon}
                  </span>
                  <span>{app.label}</span>
                  <span className="ml-auto text-[10px] opacity-30 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">↗</span>
                </a>
              ))}

              {/* Divider */}
              <div className="h-px bg-border/50 my-3" />

              {/* Controls row */}
              <div className="flex items-center gap-4 py-2">
                <button type="button" onClick={toggleTheme} className="rounded-md px-2 py-1 text-xs font-mono text-muted-foreground transition-all duration-300 hover:bg-electric/[0.06] hover:text-electric">
                  {isDark ? "Light Mode" : "Dark Mode"}
                </button>
              </div>

              {/* Contact then Sign In — Sign In on the right */}
              <div className="flex gap-3 pt-2">
                <a href="#contact"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-md bg-electric py-2.5 text-center text-xs font-mono uppercase tracking-[0.16em] text-background shadow-electric-sm transition-[background-color,box-shadow,transform] duration-300 hover:bg-electric/90 hover:shadow-electric-md active:scale-[0.99] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
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
