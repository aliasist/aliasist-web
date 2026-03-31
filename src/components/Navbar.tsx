import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Show, UserButton } from "@clerk/react";
import logo from "@/assets/logo-transparent.png";
import { playHover, playClick, setEnabled } from "@/hooks/useSound";

const anchorLinks = [
  { label: "About",    href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Blog",     href: "#transmissions" },
];

const externalLinks = [
  { label: "DataSist",  href: "https://datasist-frontend.pages.dev" },
  { label: "PulseSist", href: "https://pulse.aliasist.com" },
  { label: "SpaceSist", href: "https://space.aliasist.com" },
  { label: "TikaSist",  href: "https://tikasist.pages.dev" },
];

// Each letter of ALIASIST gets a stagger glow on hover
const WORDMARK = "ALIASIST";

const GlowWordmark = () => {
  const [hovered, setHovered] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  useEffect(() => {
    if (!hovered) { setActiveIdx(-1); return; }
    let i = 0;
    const interval = setInterval(() => {
      setActiveIdx(i % WORDMARK.length);
      i++;
    }, 80);
    return () => clearInterval(interval);
  }, [hovered]);

  return (
    <a
      href="/"
      onClick={() => playClick()}
      onMouseEnter={() => { setHovered(true); playHover(); }}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-2.5 group select-none"
      aria-label="Aliasist home"
    >
      <img
        src={logo}
        alt=""
        className="h-7 w-auto transition-all duration-300 group-hover:drop-shadow-[0_0_10px_hsl(165_90%_42%_/_0.8)]"
      />
      <span className="hidden sm:flex font-mono text-sm font-bold tracking-[0.18em] uppercase">
        {WORDMARK.split("").map((char, i) => (
          <motion.span
            key={i}
            animate={{
              color: activeIdx === i ? "hsl(165, 90%, 60%)" : hovered ? "hsl(165, 90%, 42%)" : "hsl(150, 10%, 94%)",
              textShadow: activeIdx === i
                ? "0 0 12px hsl(165 90% 42%), 0 0 24px hsl(165 90% 42% / 0.5)"
                : "none",
            }}
            transition={{ duration: 0.12 }}
            style={{ display: "inline-block" }}
          >
            {char}
          </motion.span>
        ))}
      </span>
    </a>
  );
};

// UFO that tracks cursor across the navbar
const NavUFO = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement> }) => {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 120, damping: 18 });
  const y = useSpring(rawY, { stiffness: 120, damping: 18 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      if (
        e.clientY >= rect.top && e.clientY <= rect.bottom &&
        e.clientX >= rect.left && e.clientX <= rect.right
      ) {
        rawX.set(e.clientX - rect.left - 16);
        rawY.set(e.clientY - rect.top - 10);
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [rawX, rawY]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2 }}
          style={{ x, y, position: "absolute", pointerEvents: "none", zIndex: 60 }}
        >
          {/* UFO SVG */}
          <svg viewBox="0 0 100 58.4" width={32} style={{ filter: "drop-shadow(0 0 6px hsl(165,90%,42%))" }}>
            <defs>
              <linearGradient id="ufo-g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0acb9b" />
                <stop offset="100%" stopColor="#06b077" />
              </linearGradient>
            </defs>
            <path
              d="M 99.922,17.594 C 98.75,11.344 84.634,8.459 65.7,9.774 63.108,5.45 57.739,2.628 51.473,2.26 50.285,0.543 47.711,-0.372 44.973,0.141 42.235,0.654 40.167,2.439 39.681,4.471 33.974,7.084 29.992,11.659 29.142,16.628 11.019,22.262 -1.094,30.063 0.078,36.314 c 1.202,6.408 16.011,9.277 35.668,7.711 1.925,1.294 4.643,2.171 7.826,2.531 -0.885,-0.904 -1.729,-1.926 -2.521,-3.051 0.858,-0.099 1.724,-0.205 2.596,-0.32 0.762,1.323 1.571,2.515 2.413,3.545 2.363,0.065 4.911,-0.131 7.531,-0.622 7.335,-1.375 13.294,-4.696 15.877,-8.406 18.89,-5.66 31.655,-13.701 30.454,-20.108 z M 50.539,29.831 c -13.173,2.471 -24.318,1.983 -24.894,-1.085 -0.223,-1.187 1.173,-2.587 3.724,-3.999 0.11,0.652 0.354,1.271 0.899,1.856 1.538,0.324 3.147,0.509 4.787,0.589 -0.203,-1.647 -0.294,-3.264 -0.288,-4.833 0.957,-0.351 1.972,-0.694 3.041,-1.027 0.06,1.892 0.235,3.864 0.541,5.883 3.97,-0.114 7.965,-0.711 11.446,-1.364 5.907,-1.107 13.24,-2.461 18.553,-5.939 0.339,-0.851 0.283,-1.669 0.069,-2.49 2.897,0.392 4.711,1.191 4.934,2.38 0.574,3.068 -9.638,7.559 -22.812,10.029 z"
              fill="url(#ufo-g)"
              opacity="0.85"
            />
          </svg>
          {/* Teal beam below UFO */}
          <div style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 2,
            height: 20,
            background: "linear-gradient(to bottom, hsl(165,90%,42%), transparent)",
            opacity: 0.5,
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Navbar = () => {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark]         = useState(true);
  const [soundOn, setSoundOn]       = useState(true);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const linkClass = "text-xs font-mono uppercase tracking-[0.1em] text-muted-foreground hover:text-electric transition-colors duration-200 relative group";

  return (
    <>
      <motion.nav
        ref={navRef}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 overflow-visible ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-[0_2px_30px_hsl(165_90%_42%_/_0.06)]"
            : "bg-transparent"
        }`}
      >
        {/* Floating UFO tracker */}
        <NavUFO containerRef={navRef as React.RefObject<HTMLDivElement>} />

        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between relative z-10">
          {/* Glowing wordmark */}
          <GlowWordmark />

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {anchorLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onMouseEnter={() => playHover()}
                className={linkClass}
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-electric group-hover:w-full transition-all duration-300" />
              </a>
            ))}

            {/* Divider */}
            <span className="w-px h-4 bg-border/60" />

            {externalLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => playHover()}
                onClick={() => playClick()}
                className={linkClass}
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-electric group-hover:w-full transition-all duration-300" />
              </a>
            ))}

            {/* Divider */}
            <span className="w-px h-4 bg-border/60" />

            {/* Sound */}
            <button
              type="button"
              onClick={toggleSound}
              className="text-[11px] font-mono text-muted-foreground hover:text-electric transition-colors"
              aria-label={soundOn ? "Mute" : "Unmute"}
              title={soundOn ? "Mute sounds" : "Enable sounds"}
            >
              {soundOn ? "◉" : "◎"}
            </button>

            {/* Theme */}
            <button
              type="button"
              onClick={toggleTheme}
              className="group inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              <span className="relative inline-flex h-5 w-9 items-center rounded-full border border-border/70 bg-background/60 transition-colors">
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-electric transition-transform duration-200 ${isDark ? "translate-x-4" : "translate-x-1"}`} />
              </span>
            </button>

            {/* Auth */}
            <Show when="signed-in">
              <UserButton />
            </Show>
            <Show when="signed-out">
              <a
                href="https://auth.aliasist.com"
                onMouseEnter={() => playHover()}
                onClick={() => playClick()}
                className="relative text-xs font-mono uppercase tracking-[0.1em] border border-electric/40 text-electric px-4 py-2 rounded-sm hover:bg-electric/10 hover:shadow-[0_0_16px_hsl(165_90%_42%_/_0.2)] transition-all duration-300"
              >
                Sign In
              </a>
            </Show>

            {/* Contact CTA */}
            <a
              href="#contact"
              onMouseEnter={() => playHover()}
              onClick={() => playClick()}
              className="relative text-xs font-mono uppercase tracking-[0.1em] bg-electric text-background px-4 py-2 rounded-sm hover:bg-electric/85 transition-all duration-300"
            >
              Contact
            </a>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <button type="button" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground transition-colors p-1" aria-label="Toggle theme">
              {isDark
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" stroke="currentColor" strokeWidth="2"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 14.5A8.5 8.5 0 0 1 9.5 3a6.5 6.5 0 1 0 11.5 11.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
              }
            </button>
            <button onClick={() => { playClick(); setMobileOpen(!mobileOpen); }} className="text-foreground p-2" aria-label="Toggle menu">
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
                {anchorLinks.map(link => (
                  <a key={link.href} href={link.href} onClick={() => { playClick(); setMobileOpen(false); }}
                    className="text-xs font-mono uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors py-1">
                    {link.label}
                  </a>
                ))}
                <div className="h-px bg-border/50" />
                {externalLinks.map(link => (
                  <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                    onClick={() => { playClick(); setMobileOpen(false); }}
                    className="text-xs font-mono uppercase tracking-[0.1em] text-electric hover:text-electric/70 transition-colors py-1 flex items-center justify-between">
                    {link.label}
                    <span className="opacity-50">↗</span>
                  </a>
                ))}
                <div className="h-px bg-border/50" />
                <button onClick={toggleSound} className="text-left text-xs font-mono uppercase tracking-[0.1em] text-muted-foreground py-1">
                  Sound: {soundOn ? "On ◉" : "Off ◎"}
                </button>
                <a href="#contact" onClick={() => { playClick(); setMobileOpen(false); }}
                  className="text-xs font-mono uppercase tracking-[0.1em] text-electric border border-electric/30 px-4 py-2.5 text-center rounded-sm">
                  Contact
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;
