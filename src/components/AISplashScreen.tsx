/**
 * AISplashScreen
 * Full-screen loading overlay with a unique AI-generated background on every visit.
 * Shown once per session (sessionStorage gated).
 * Fades out once the AI art is ready + a minimum display time has passed.
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIImage } from "@/hooks/useAIImage";

const MIN_DISPLAY_MS = 1600; // minimum time the splash is visible
const FALLBACK_DISMISS_MS = 6000; // hard timeout if worker is slow

interface AISplashScreenProps {
  onDismiss?: () => void;
}

const AISplashScreen = ({ onDismiss }: AISplashScreenProps) => {
  const [visible, setVisible] = useState(true);
  const [bgReady, setBgReady] = useState(false);
  const startRef = useRef(Date.now());
  const dismissedRef = useRef(false);

  const { src, loading } = useAIImage("loading");

  // Once the image arrives, wait for MIN_DISPLAY_MS before dismissing
  useEffect(() => {
    if (!loading && !dismissedRef.current) {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
      const timer = setTimeout(() => dismiss(), remaining);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Hard fallback — dismiss regardless of image status
  useEffect(() => {
    const timer = setTimeout(() => dismiss(), FALLBACK_DISMISS_MS);
    return () => clearTimeout(timer);
  }, []);

  // Fade in the background image once it's loaded into the DOM
  const handleBgLoad = () => setBgReady(true);

  function dismiss() {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setVisible(false);
    setTimeout(() => onDismiss?.(), 800);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="ai-splash"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#0a0f0a" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* AI-generated background art */}
          {src && (
            <motion.img
              src={src}
              alt=""
              aria-hidden="true"
              onLoad={handleBgLoad}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: bgReady ? 0.45 : 0 }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
            />
          )}

          {/* Dark overlay gradient — keeps text readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/80 pointer-events-none" />

          {/* Scanline texture */}
          <div className="absolute inset-0 scanlines opacity-30 pointer-events-none" />

          {/* Center content */}
          <div className="relative z-10 flex flex-col items-center gap-6 text-center px-6">

            {/* Logo wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono text-5xl sm:text-6xl font-bold tracking-[0.22em] text-foreground uppercase"
            >
              ALIASIST
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="font-mono text-[10px] uppercase tracking-[0.35em] text-electric/70"
            >
              INITIALIZING // SYSTEMS ONLINE
            </motion.p>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="w-48 h-[2px] bg-border/40 rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full bg-electric rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: loading ? "65%" : "100%" }}
                transition={{ duration: loading ? 1.5 : 0.4, ease: "easeOut" }}
              />
            </motion.div>

            {/* Status label */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/50"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-electric animate-pulse" />
              {loading ? "GENERATING VISUAL SIGNATURE..." : "READY"}
            </motion.div>
          </div>

          {/* Corner decorations */}
          <div className="absolute top-6 left-6 font-mono text-[9px] tracking-[0.2em] text-electric/20 uppercase select-none">
            ALIASIST V1.1.0
          </div>
          <div className="absolute top-6 right-6 font-mono text-[9px] tracking-[0.2em] text-electric/20 uppercase select-none">
            {new Date().getFullYear()} // SECURE
          </div>
          <div className="absolute bottom-6 left-6 font-mono text-[9px] tracking-[0.2em] text-muted-foreground/20 uppercase select-none">
            AI SECURITY // ADVERSARIAL DEFENSE
          </div>
          <div className="absolute bottom-6 right-6 font-mono text-[9px] tracking-[0.2em] text-electric/20 uppercase select-none">
            ● SIGNAL ACTIVE
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AISplashScreen;
