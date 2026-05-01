/**
 * SplashScreen — dark “hangar” entrance, ship warms up with teal glow, then hands off to the site.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MIN_DISPLAY_MS = 2100;

interface AISplashScreenProps {
  onDismiss?: () => void;
}

const AISplashScreen = ({ onDismiss }: AISplashScreenProps) => {
  const [visible, setVisible] = useState(true);
  const dismissedRef = useRef(false);

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setVisible(false);
    setTimeout(() => onDismiss?.(), 800);
  }, [onDismiss]);

  useEffect(() => {
    const timer = setTimeout(dismiss, MIN_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [dismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          style={{
            background:
              "radial-gradient(ellipse 90% 75% at 50% 85%, hsl(165 25% 8%) 0%, hsl(220 22% 4%) 42%, #020403 100%)",
          }}
        >
          {/* Ship plate — same asset as hero; rises out of black then glows */}
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
            style={{ backgroundImage: "url(/background.png)" }}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{
              opacity: [0, 0.08, 0.22, 0.38, 0.48],
              scale: [1.08, 1.04, 1.02, 1, 1],
            }}
            transition={{
              duration: 1.85,
              ease: [0.16, 1, 0.3, 1],
              times: [0, 0.15, 0.4, 0.72, 1],
            }}
          />

          {/* Teal reactor glow — pulses as “systems” come online */}
          <motion.div
            aria-hidden
            className="absolute inset-0 pointer-events-none mix-blend-screen"
            style={{
              background:
                "radial-gradient(ellipse 52% 38% at 50% 68%, hsl(165 90% 48% / 0.55) 0%, hsl(165 90% 42% / 0.18) 38%, transparent 62%)",
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0, 0.35, 0.12, 0.5, 0.28, 0.55, 0.4],
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              times: [0, 0.12, 0.28, 0.42, 0.58, 0.7, 0.85, 1],
            }}
          />

          {/* Outer void — heavy at first, lifts so the ship reads */}
          <motion.div
            aria-hidden
            className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_115%_95%_at_50%_45%,transparent_0%,transparent_22%,rgba(0,0,0,0.88)_78%,rgba(0,0,0,0.97)_100%)]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0.38 }}
            transition={{ delay: 0.35, duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Cool rim light */}
          <motion.div
            aria-hidden
            className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background via-transparent to-black/70"
            initial={{ opacity: 0.95 }}
            animate={{ opacity: 0.55 }}
            transition={{ delay: 0.5, duration: 1.1 }}
          />

          {/* Scanline texture */}
          <div className="absolute inset-0 scanlines opacity-[0.14] pointer-events-none" />

          {/* Center content */}
          <div className="relative z-10 flex flex-col items-center gap-6 text-center px-6">

            <motion.div
              initial={{ opacity: 0, y: 16, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.55, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono text-5xl sm:text-6xl font-bold tracking-[0.22em] text-foreground uppercase drop-shadow-[0_0_24px_hsl(165_90%_42%_/_0.25)]"
            >
              ALIASIST
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.55 }}
              className="font-mono text-[10px] uppercase tracking-[0.35em] text-electric/70"
            >
              INITIALIZING // SYSTEMS ONLINE
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="w-48 h-[2px] bg-border/40 rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full rounded-full bg-electric shadow-[0_0_12px_hsl(165_90%_42%_/_0.8)]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: MIN_DISPLAY_MS / 1000, ease: "easeOut" }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.05 }}
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/50"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-electric shadow-[0_0_8px_hsl(165_90%_42%_/_0.9)] animate-pulse" />
              READY
            </motion.div>
          </div>

          <div className="absolute top-6 left-6 font-mono text-[9px] tracking-[0.2em] text-electric/25 uppercase select-none">
            ALIASIST V1.1.0
          </div>
          <div className="absolute top-6 right-6 font-mono text-[9px] tracking-[0.2em] text-electric/25 uppercase select-none">
            {new Date().getFullYear()} // SECURE
          </div>
          <div className="absolute bottom-6 left-6 font-mono text-[9px] tracking-[0.2em] text-muted-foreground/25 uppercase select-none">
            AI SECURITY // ADVERSARIAL DEFENSE
          </div>
          <div className="absolute bottom-6 right-6 font-mono text-[9px] tracking-[0.2em] text-electric/25 uppercase select-none">
            ● SIGNAL ACTIVE
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AISplashScreen;
