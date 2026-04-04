/**
 * SplashScreen
 * Full-screen loading overlay shown once per session.
 * Fades out after a minimum display time.
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MIN_DISPLAY_MS = 1600;

interface AISplashScreenProps {
  onDismiss?: () => void;
}

const AISplashScreen = ({ onDismiss }: AISplashScreenProps) => {
  const [visible, setVisible] = useState(true);
  const dismissedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => dismiss(), MIN_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, []);

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
          key="splash"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#0a0f0a" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Dark overlay gradient */}
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
                animate={{ width: "100%" }}
                transition={{ duration: MIN_DISPLAY_MS / 1000, ease: "easeOut" }}
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
              READY
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
