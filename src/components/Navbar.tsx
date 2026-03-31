import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo-transparent.png";
import icon from "@/assets/aliasist-icon.jpg";
import { playHover, playClick, setEnabled, isEnabled } from "@/hooks/useSound";

const anchorLinks = [
  { label: "About",    href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Blog",     href: "#transmissions" },
];

const routeLinks = [
  { label: "DataSist", href: "/datasist" },
  { label: "PulseSist", href: "https://pulse.aliasist.com", external: true },
];

const Navbar = () => {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark]         = useState(true); // dark by default
  const [soundOn, setSoundOn]       = useState(true);
  const location = useLocation();
  const isOnSubPage = location.pathname !== "/";

  /* ── scroll detection ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── theme init — dark first ── */
  useEffect(() => {
    const stored = localStorage.getItem("aliasist-theme");
    const dark = stored ? stored === "dark" : true;
    setIsDark(dark);
    document.documentElement.classList.toggle("light", !dark);
  }, []);

  const toggleTheme = () => {
    playClick();
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("light", !next);
      localStorage.setItem("aliasist-theme", next ? "dark" : "light");
      return next;
    });
  };

  const toggleSound = () => {
    setSoundOn((prev) => {
      setEnabled(!prev);
      return !prev;
    });
  };

  const navLinkClass = (active = false) =>
    `text-xs font-mono uppercase tracking-[0.1em] transition-colors ${
      active
        ? "text-electric"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/85 backdrop-blur-xl border-b border-border/60 shadow-[0_2px_20px_hsl(165_90%_42%_/_0.06)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center group" onClick={() => playClick()}>
            <img
              src={logo}
              alt="Aliasist"
              className="h-8 w-auto transition-all duration-300 group-hover:drop-shadow-[0_0_8px_hsl(165_90%_42%_/_0.6)]"
            />
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {!isOnSubPage &&
              anchorLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => playHover()}
                  className={navLinkClass()}
                >
                  {link.label}
                </a>
              ))}

            {routeLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onMouseEnter={() => playHover()}
                onClick={() => playClick()}
                className={navLinkClass(location.pathname === link.href)}
              >
                {link.label}
              </Link>
            ))}

            {/* Sound toggle */}
            <button
              type="button"
              onClick={toggleSound}
              title={soundOn ? "Mute sounds" : "Enable sounds"}
              className="text-xs font-mono uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors"
              aria-label={soundOn ? "Mute" : "Unmute"}
            >
              {soundOn ? "◉" : "◎"}
            </button>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              <span className="relative inline-flex h-5 w-9 items-center rounded-full border border-border bg-background/60 transition-colors">
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-electric transition-transform duration-200 ${
                    isDark ? "translate-x-4" : "translate-x-1"
                  }`}
                />
              </span>
              <span className="hidden lg:inline text-[10px]">{isDark ? "Dark" : "Light"}</span>
            </button>

            {!isOnSubPage && (
              <a
                href="#contact"
                onMouseEnter={() => playHover()}
                onClick={() => playClick()}
                className="text-xs font-mono uppercase tracking-[0.1em] border border-electric/40 text-electric px-4 py-2 rounded-sm hover:bg-electric/10 transition-all"
              >
                Contact
              </a>
            )}
          </div>

          {/* Mobile toggles */}
          <div className="md:hidden flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" stroke="currentColor" strokeWidth="2"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 14.5A8.5 8.5 0 0 1 9.5 3a6.5 6.5 0 1 0 11.5 11.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
              )}
            </button>
            <button
              onClick={() => { playClick(); setMobileOpen(!mobileOpen); }}
              className="text-foreground p-2"
              aria-label="Toggle menu"
            >
              <div className="w-5 flex flex-col gap-1">
                <span className={`block h-px bg-foreground transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[3px]" : ""}`} />
                <span className={`block h-px bg-foreground transition-all duration-300 ${mobileOpen ? "opacity-0 w-0" : ""}`} />
                <span className={`block h-px bg-foreground transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[3px]" : ""}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border"
            >
              <div className="px-6 py-5 flex flex-col gap-4">
                {!isOnSubPage &&
                  anchorLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => { playClick(); setMobileOpen(false); }}
                      className="text-xs font-mono uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                {routeLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => { playClick(); setMobileOpen(false); }}
                    className={`text-xs font-mono uppercase tracking-[0.1em] transition-colors ${
                      location.pathname === link.href ? "text-electric" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={toggleSound}
                  className="text-left text-xs font-mono uppercase tracking-[0.1em] text-muted-foreground"
                >
                  Sound: {soundOn ? "On ◉" : "Off ◎"}
                </button>
                {!isOnSubPage && (
                  <a
                    href="#contact"
                    onClick={() => { playClick(); setMobileOpen(false); }}
                    className="text-xs font-mono uppercase tracking-[0.1em] text-electric border border-electric/30 px-4 py-2 text-center rounded-sm"
                  >
                    Contact
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;
