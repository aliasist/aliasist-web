import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SignInButton, useAuth, UserButton } from "@clerk/react";
import newLogo from "@/assets/aliasist-logo-brand.svg";
import CowAbductionEasterEgg from "@/components/CowAbductionEasterEgg";
import { playHover, playClick, setEnabled } from "@/hooks/useSound";
import { pageNavLinks, suiteApps } from "@/content/homepage";

// ── Sub-components ─────────────────────────────────────────────────────────────

// Suite dropdown
const SuiteDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(o => !o); playClick(); }}
        onMouseEnter={() => playHover()}
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-mono uppercase tracking-[0.16em] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open
            ? "bg-electric/10 text-electric shadow-electric-xs"
            : "text-muted-foreground hover:bg-electric/[0.06] hover:text-foreground hover:shadow-electric-ring-inset"
        }`}
      >
        Suite
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          width="10" height="10" viewBox="0 0 24 24" fill="none"
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
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
                Aliasist Suite
              </span>
              <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-electric/60">
                <span className="w-1 h-1 rounded-full bg-electric animate-pulse shadow-electric-dot" />
                {suiteApps.length} Live
              </span>
            </div>

            {suiteApps.map((app, i) => (
              <motion.a
                key={app.label}
                href={app.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => { playClick(); setOpen(false); }}
                onMouseEnter={() => playHover()}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15, delay: i * 0.04 }}
                className="group relative flex items-center gap-3 border-b border-border/30 px-4 py-3 transition-colors duration-300 last:border-0 hover:bg-[linear-gradient(90deg,hsl(165_90%_42%_/_0.06)_0%,transparent_100%)]"
              >
                <span className="absolute left-0 top-1/2 h-0 w-[3px] -translate-y-1/2 rounded-full bg-electric opacity-0 shadow-electric-accent-line transition-all duration-300 group-hover:h-[60%] group-hover:opacity-100" aria-hidden />
                <span className="text-xl leading-none transition-transform duration-300 group-hover:scale-110">{app.icon}</span>
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
  "border border-border/50 bg-background/40 px-3.5 py-2 text-xs font-mono uppercase tracking-[0.16em] text-muted-foreground backdrop-blur-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-electric/35 hover:bg-electric/[0.07] hover:text-electric hover:shadow-electric-glass-hover active:scale-[0.98] rounded-full";

const mobileSignInButtonClass =
  "flex-1 rounded-md border border-electric/35 bg-electric/[0.04] py-2.5 text-center text-xs font-mono uppercase tracking-[0.16em] text-electric shadow-electric-mobile-signin transition-all duration-300 hover:border-electric/50 hover:bg-electric/10 hover:shadow-electric-mobile-signin-hover active:scale-[0.99]";

const utilityButtonClass =
  "tap-compact flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-muted-foreground transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-electric/25 hover:bg-electric/[0.08] hover:text-electric hover:shadow-electric-utility-hover active:scale-95";

const navUserButtonAppearance = {
  elements: {
    userButtonAvatarBox: "h-8 w-8 ring-1 ring-border/50 rounded-full",
    userButtonPopoverCard: "rounded-md border border-border bg-card shadow-lg",
  },
};

const DesktopAuthControl = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (isSignedIn) {
    return <UserButton appearance={navUserButtonAppearance} />;
  }

  return (
    <SignInButton mode="modal" fallbackRedirectUrl="/" forceRedirectUrl="/">
      <button
        type="button"
        aria-busy={!isLoaded}
        aria-label={isLoaded ? "Sign in" : "Loading sign-in"}
        title={!isLoaded ? "Connecting to Clerk…" : "Sign in"}
        onMouseEnter={() => {
          playHover();
        }}
        className={`${signInButtonClass} shrink-0 cursor-pointer text-foreground/90 ${!isLoaded ? "opacity-70" : ""}`}
      >
        Sign In
      </button>
    </SignInButton>
  );
};

const MobileAuthControl = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <div className="flex-1 flex items-center justify-center py-2">
        <UserButton appearance={navUserButtonAppearance} />
      </div>
    );
  }

  return (
    <SignInButton mode="modal" fallbackRedirectUrl="/" forceRedirectUrl="/">
      <button
        type="button"
        aria-busy={!isLoaded}
        aria-label={isLoaded ? "Sign in" : "Loading sign-in"}
        title={!isLoaded ? "Connecting to Clerk…" : "Sign in"}
        onMouseEnter={() => {
          playHover();
        }}
        className={`${mobileSignInButtonClass} cursor-pointer${!isLoaded ? " opacity-70" : ""}`}
      >
        Sign In
      </button>
    </SignInButton>
  );
};

// ── Main Navbar ───────────────────────────────────────────────────────────────

const Navbar = () => {
  const [scrolled, setScrolled]         = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [isDark, setIsDark]             = useState(true);
  const [soundOn, setSoundOn]           = useState(true);
  const [activeSection, setActiveSection] = useState("");
  const [easterEggOpen, setEasterEggOpen] = useState(false);

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

  useEffect(() => {
    try {
      const stored = localStorage.getItem("aliasist-sound");
      const on = stored ? stored === "on" : true;
      setSoundOn(on);
      setEnabled(on);
    } catch {
      setSoundOn(true);
      setEnabled(true);
    }
  }, []);

  const toggleTheme = () => {
    playClick();
    setIsDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle("light", !next);
      localStorage.setItem("aliasist-theme", next ? "dark" : "light");
      return next;
    });
  };

  const toggleSound = () => {
    setSoundOn(prev => {
      const next = !prev;
      if (next) {
        setEnabled(true);
        playClick();
      } else {
        playClick();
        setEnabled(false);
      }
      try {
        localStorage.setItem("aliasist-sound", next ? "on" : "off");
      } catch {
        // ignore
      }
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
      <div className="mx-auto flex h-[4.5rem] w-full max-w-site items-center justify-between gap-5 px-4 sm:gap-8 sm:px-8 lg:px-12 xl:px-16">

        {/* ── LEFT: Logo ── */}
        <button
          type="button"
          onClick={() => {
            playClick();
            setEasterEggOpen(true);
          }}
          onMouseEnter={() => playHover()}
          className="group flex flex-shrink-0 items-center gap-3 rounded-xl border-0 bg-transparent py-1 pr-2 text-left transition-all duration-300 hover:bg-electric/[0.04] cursor-pointer outline-none appearance-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Aliasist"
          aria-haspopup="dialog"
          aria-expanded={easterEggOpen}
        >
          <motion.img
            src={newLogo}
            alt=""
            className="h-14 w-auto max-h-16 object-contain drop-shadow-electric-logo transition-all duration-300 sm:h-16 sm:max-h-[4.5rem]"
            style={{ minWidth: 56, background: "transparent" }}
            whileHover={{ scale: 1.1, filter: "drop-shadow(0 0 16px hsl(165 90% 42% / 0.8))" }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          />
          <div className="hidden sm:flex flex-col leading-none">
            <span className="font-bold text-sm uppercase tracking-[0.16em] text-foreground transition-all duration-300 group-hover:text-electric group-hover:[text-shadow:0_0_28px_hsl(165_90%_42%_/_0.25)]">
              Aliasist
            </span>
            <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground/45 transition-colors duration-300 group-hover:text-muted-foreground/65">
              Signal Active
            </span>
          </div>
        </button>

        {/* ── CENTER: Page links ── */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-2 rounded-full border border-border/35 bg-background/50 px-2.5 py-1.5 shadow-electric-nav-well backdrop-blur-md">
          {pageNavLinks.map(link => {
            const isActive = activeSection === link.href.replace("#", "");
            return (
              <a
                key={link.href}
                href={link.href}
                onMouseEnter={() => playHover()}
                className={`group relative overflow-hidden rounded-full px-4 py-2 text-xs font-mono uppercase tracking-[0.16em] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
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
                  className={`absolute bottom-1 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-electric shadow-electric-accent-line transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isActive ? "w-[calc(100%-1.25rem)] opacity-100" : "w-0 opacity-0 group-hover:w-[calc(100%-1.25rem)] group-hover:opacity-100"
                  }`}
                />
              </a>
            );
          })}

          {/* Subtle separator */}
          <span className="mx-1.5 h-4 w-px bg-border/60" />

          {/* Suite dropdown */}
          <SuiteDropdown />
        </div>

        {/* ── RIGHT: Controls ── */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1 rounded-full border border-border/35 bg-background/50 p-1 shadow-electric-nav-well-inset backdrop-blur-md">
            <button
              onClick={toggleSound}
              title={soundOn ? "Mute" : "Unmute"}
              className={utilityButtonClass}
              aria-label={soundOn ? "Mute sounds" : "Enable sounds"}
              onMouseEnter={() => playHover()}
            >
              {soundOn ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
                </svg>
              )}
            </button>

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
              onMouseEnter={() => playHover()}
              onClick={() => playClick()}
              className="rounded-full bg-electric px-5 py-2 text-xs font-mono uppercase tracking-[0.16em] text-background shadow-electric-sm transition-[background-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-electric/90 hover:shadow-electric-md active:scale-[0.98]"
            >
              Contact
            </a>
            <DesktopAuthControl />
          </div>
        </div>

        {/* ── MOBILE: Hamburger ── */}
        <button
          onClick={() => { playClick(); setMobileOpen(!mobileOpen); }}
          className="md:hidden text-foreground p-2 -mr-2"
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
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-background/98 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <div className="space-y-1 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 sm:px-8 lg:px-12 xl:px-16">

              {/* Page links */}
              {pageNavLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => { playClick(); setMobileOpen(false); }}
                  className="-mx-1 flex h-12 items-center rounded-lg px-3 text-xs font-mono uppercase tracking-[0.15em] text-muted-foreground transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-electric/[0.06] hover:pl-4 hover:text-foreground hover:shadow-[inset_3px_0_0_hsl(165_90%_42%_/_0.65)]"
                >
                  {link.label}
                </a>
              ))}

              {/* Divider */}
              <div className="h-px bg-border/50 my-3" />

              {/* Suite apps */}
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 py-1">
                The Suite
              </p>
              {suiteApps.map(app => (
                <a
                  key={app.label}
                  href={app.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => { playClick(); setMobileOpen(false); }}
                  className="group -mx-1 flex h-12 items-center gap-3 rounded-lg px-3 text-xs font-mono uppercase tracking-[0.15em] text-muted-foreground transition-all duration-300 hover:bg-electric/[0.06] hover:text-electric hover:shadow-[inset_3px_0_0_hsl(165_90%_42%_/_0.5)]"
                >
                  <span className="transition-transform duration-300 group-hover:scale-110">{app.icon}</span>
                  <span>{app.label}</span>
                  <span className="ml-auto text-[10px] opacity-30 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">↗</span>
                </a>
              ))}

              {/* Divider */}
              <div className="h-px bg-border/50 my-3" />

              {/* Controls row */}
              <div className="flex items-center gap-4 py-2">
                <button type="button" onClick={toggleSound} className="rounded-md px-2 py-1 text-xs font-mono text-muted-foreground transition-all duration-300 hover:bg-electric/[0.06] hover:text-electric">
                  {soundOn ? "Sound On" : "Sound Off"}
                </button>
                <button type="button" onClick={toggleTheme} className="rounded-md px-2 py-1 text-xs font-mono text-muted-foreground transition-all duration-300 hover:bg-electric/[0.06] hover:text-electric">
                  {isDark ? "Light Mode" : "Dark Mode"}
                </button>
              </div>

              {/* Contact then Sign In — Sign In on the right */}
              <div className="flex gap-3 pt-2">
                <a href="#contact"
                  onClick={() => { playClick(); setMobileOpen(false); }}
                  className="flex-1 rounded-md bg-electric py-2.5 text-center text-xs font-mono uppercase tracking-[0.16em] text-background shadow-electric-sm transition-[background-color,box-shadow,transform] duration-300 hover:bg-electric/90 hover:shadow-electric-md active:scale-[0.99]">
                  Contact
                </a>
                <MobileAuthControl />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CowAbductionEasterEgg open={easterEggOpen} onClose={() => setEasterEggOpen(false)} />
    </motion.nav>
  );
};

export default Navbar;
