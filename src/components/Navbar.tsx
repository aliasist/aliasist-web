import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "@/assets/logo-transparent.png";

const anchorLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Blog", href: "#blog" },
];

const routeLinks = [
  { label: "DataSist", href: "/datasist" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark =
      window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
    const initialIsDark = stored ? stored === "dark" : prefersDark;

    setIsDark(initialIsDark);
    document.documentElement.classList.toggle("dark", initialIsDark);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  const location = useLocation();
  const isOnDataSist = location.pathname === "/datasist";

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border shadow-sm"
          : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center">
          <img src={logo} alt="Aliasist" className="h-8 w-auto" />
        </a>
        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {/* Anchor links — only show when not on a sub-page */}
          {!isOnDataSist && anchorLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-mono uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
          {/* Route links */}
          {routeLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-xs font-mono uppercase tracking-[0.1em] transition-colors ${
                location.pathname === link.href
                  ? "text-electric"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={toggleTheme}
            className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={isDark}
          >
            <span className="relative inline-flex h-5 w-9 items-center rounded-full border border-border bg-background transition-colors">
              <span
                className={`inline-block h-4 w-4 rounded-full bg-foreground transition-transform duration-200 ${
                  isDark ? "translate-x-4" : "translate-x-1"
                }`}
              />
            </span>
            <span className="hidden lg:inline">{isDark ? "Dark" : "Light"}</span>
          </button>
          {!isOnDataSist && (
            <a
              href="#contact"
              className="text-xs font-mono uppercase tracking-[0.1em] bg-foreground text-background px-4 py-2 rounded-sm hover:bg-foreground/85 transition-colors"
            >
              Contact
            </a>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-sm border border-border bg-background text-foreground/80 hover:text-foreground transition-colors h-9 w-9"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={isDark}
          >
            {isDark ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-foreground"
              >
                <path
                  d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M12 2v2M12 20v2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-foreground"
              >
                <path
                  d="M21 14.5A8.5 8.5 0 0 1 9.5 3a6.5 6.5 0 1 0 11.5 11.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-foreground p-2"
            aria-label="Toggle menu"
          >
            <div className="w-5 flex flex-col gap-1">
              <span className={`block h-px bg-foreground transition-all ${mobileOpen ? "rotate-45 translate-y-[3px]" : ""}`} />
              <span className={`block h-px bg-foreground transition-all ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block h-px bg-foreground transition-all ${mobileOpen ? "-rotate-45 -translate-y-[3px]" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden bg-background/95 backdrop-blur-md border-b border-border"
        >
          <div className="px-6 py-4 flex flex-col gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full inline-flex items-center justify-between rounded-sm border border-border bg-background px-3 py-2 text-xs font-mono uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={isDark}
            >
              <span>Theme</span>
              <span className="text-foreground">{isDark ? "Dark" : "Light"}</span>
            </button>
            {anchorLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-xs font-mono uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            {routeLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`text-xs font-mono uppercase tracking-[0.1em] transition-colors ${
                  location.pathname === link.href
                    ? "text-electric"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="#contact"
              onClick={() => setMobileOpen(false)}
              className="text-xs font-mono uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground"
            >
              Contact
            </a>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
