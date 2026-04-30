import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClerkLoaded, ClerkLoading, Show, SignInButton, UserButton } from "@clerk/react";
import newLogo from "@/assets/mascot.svg";
import { playHover, playClick, setEnabled } from "@/hooks/useSound";
import { pageNavLinks, suiteApps } from "@/content/homepage";

// ── Sub-components ─────────────────────────────────────────────────────────────

// Suite dropdown
const SuiteDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(o => !o); playClick(); }}
        onMouseEnter={() => playHover()}
        className={`flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.1em] transition-colors duration-200 ${
          open ? "text-electric" : "text-muted-foreground hover:text-foreground"
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
            className="absolute top-full right-0 mt-3 w-64 bg-card border border-border shadow-[0_8px_40px_hsl(165_90%_42%_/_0.12)] z-50 overflow-hidden"
            style={{ borderRadius: "2px" }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50">
                Aliasist Suite
              </span>
              <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-electric/60">
                <span className="w-1 h-1 rounded-full bg-electric animate-pulse" />
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
                className="group flex items-center gap-3 px-4 py-3 hover:bg-electric/5 border-b border-border/30 last:border-0 transition-colors"
              >
                <span className="text-xl leading-none">{app.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs font-semibold text-foreground group-hover:text-electric transition-colors">
                    {app.label}
                  </p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground/50 mt-0.5 truncate">
                    {app.sub}
                  </p>
                </div>
                <span className="opacity-0 group-hover:opacity-100 text-electric font-mono text-xs transition-opacity">↗</span>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const signInButtonClass =
  "text-xs font-mono uppercase tracking-[0.1em] text-muted-foreground hover:text-electric border border-border/60 hover:border-electric/40 px-3 py-1.5 rounded-sm transition-all duration-200 hover:bg-electric/5";

const mobileSignInButtonClass =
  "flex-1 text-center text-xs font-mono uppercase tracking-[0.1em] text-electric border border-electric/30 py-2.5 rounded-sm hover:bg-electric/5 transition-colors";

const DesktopAuthControl = () => (
  <>
    <ClerkLoading>
      <button
        type="button"
        disabled
        className={`${signInButtonClass} opacity-50 cursor-wait`}
        aria-busy="true"
      >
        Sign In
      </button>
    </ClerkLoading>
    <ClerkLoaded>
      <Show when="signed-in">
        <UserButton />
      </Show>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button
            type="button"
            onMouseEnter={() => playHover()}
            onClick={() => playClick()}
            className={signInButtonClass}
          >
            Sign In
          </button>
        </SignInButton>
      </Show>
    </ClerkLoaded>
  </>
);

const MobileAuthControl = ({ onDone }: { onDone: () => void }) => (
  <>
    <ClerkLoading>
      <button
        type="button"
        disabled
        className={`${mobileSignInButtonClass} opacity-50 cursor-wait`}
        aria-busy="true"
      >
        Sign In
      </button>
    </ClerkLoading>
    <ClerkLoaded>
      <Show when="signed-in">
        <div className="flex-1 flex items-center justify-center py-2">
          <UserButton />
        </div>
      </Show>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button
            type="button"
            onClick={() => {
              playClick();
              onDone();
            }}
            className={mobileSignInButtonClass}
          >
            Sign In
          </button>
        </SignInButton>
      </Show>
    </ClerkLoaded>
  </>
);

// ── Main Navbar ───────────────────────────────────────────────────────────────

const Navbar = () => {
  const [scrolled, setScrolled]         = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [isDark, setIsDark]             = useState(true);
  const [soundOn, setSoundOn]           = useState(true);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    playClick();
    setIsDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle("light", !next);
      localStorage.setItem("aliasist-theme", next ? "dark" : "light");
      return next;
    });
  };

  const toggleSound = () => {
    setSoundOn(prev => { setEnabled(!prev); return !prev; });
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/85 backdrop-blur-xl border-b border-border/50 shadow-[0_1px_24px_hsl(165_90%_42%_/_0.05)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">

        {/* ── LEFT: Logo ── */}
        <a
          href="/"
          onClick={() => playClick()}
          onMouseEnter={() => playHover()}
          className="flex items-center gap-2.5 flex-shrink-0 group"
          aria-label="Aliasist home"
        >
          <motion.img
            src={newLogo}
            alt="Aliasist"
            className="h-12 w-auto max-h-14 object-contain drop-shadow-[0_2px_12px_hsl(165_90%_42%_/_0.12)] transition-all duration-300"
            style={{ minWidth: 48, background: "transparent" }}
            whileHover={{ scale: 1.1, filter: "drop-shadow(0 0 16px hsl(165 90% 42% / 0.8))" }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          />
          <span className="font-bold text-sm tracking-[0.12em] uppercase text-foreground group-hover:text-electric transition-colors duration-300">
            Aliasist
          </span>
        </a>

        {/* ── CENTER: Page links ── */}
        <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
          {pageNavLinks.map(link => {
            const isActive = activeSection === link.href.replace("#", "");
            return (
              <a
                key={link.href}
                href={link.href}
                onMouseEnter={() => playHover()}
                className={`relative text-xs font-mono uppercase tracking-[0.1em] transition-colors duration-200 group py-1 ${
                  isActive ? "text-electric" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                <span className={`absolute bottom-0 left-0 h-px bg-electric transition-all duration-300 ${
                  isActive ? "w-full" : "w-0 group-hover:w-full"
                }`} />
              </a>
            );
          })}

          {/* Subtle separator */}
          <span className="w-px h-4 bg-border/60 mx-1" />

          {/* Suite dropdown */}
          <SuiteDropdown />
        </div>

        {/* ── RIGHT: Controls ── */}
        <div className="hidden md:flex items-center gap-4 flex-shrink-0">

          {/* Sound toggle */}
          <button
            onClick={toggleSound}
            title={soundOn ? "Mute" : "Unmute"}
            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-electric transition-colors text-sm rounded-sm hover:bg-electric/5"
            aria-label={soundOn ? "Mute sounds" : "Enable sounds"}
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

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? "Light mode" : "Dark mode"}
            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-electric transition-colors rounded-sm hover:bg-electric/5"
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

          {/* Divider */}
          <span className="w-px h-5 bg-border/60" />

          {/* Auth */}
          <DesktopAuthControl />

          {/* Contact CTA */}
          <a
            href="#contact"
            onMouseEnter={() => playHover()}
            onClick={() => playClick()}
            className="text-xs font-mono uppercase tracking-[0.1em] bg-electric text-background px-4 py-1.5 rounded-full hover:bg-electric/85 transition-all duration-200 hover:shadow-[0_0_16px_hsl(165_90%_42%_/_0.3)]"
          >
            Contact
          </a>
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
            <div className="px-6 py-6 space-y-1">

              {/* Page links */}
              {pageNavLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => { playClick(); setMobileOpen(false); }}
                  className="flex items-center h-11 text-xs font-mono uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors"
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
                  className="flex items-center gap-3 h-11 text-xs font-mono uppercase tracking-[0.1em] text-muted-foreground hover:text-electric transition-colors"
                >
                  <span>{app.icon}</span>
                  <span>{app.label}</span>
                  <span className="ml-auto opacity-30 text-[10px]">↗</span>
                </a>
              ))}

              {/* Divider */}
              <div className="h-px bg-border/50 my-3" />

              {/* Controls row */}
              <div className="flex items-center gap-4 py-2">
                <button onClick={toggleSound} className="text-xs font-mono text-muted-foreground hover:text-electric transition-colors">
                  {soundOn ? "Sound On" : "Sound Off"}
                </button>
                <button onClick={toggleTheme} className="text-xs font-mono text-muted-foreground hover:text-electric transition-colors">
                  {isDark ? "Light Mode" : "Dark Mode"}
                </button>
              </div>

              {/* Auth + Contact */}
              <div className="flex gap-3 pt-2">
                <MobileAuthControl onDone={() => setMobileOpen(false)} />
                <a href="#contact"
                  onClick={() => { playClick(); setMobileOpen(false); }}
                  className="flex-1 text-center text-xs font-mono uppercase tracking-[0.1em] bg-electric text-background py-2.5 rounded-sm hover:bg-electric/85 transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
