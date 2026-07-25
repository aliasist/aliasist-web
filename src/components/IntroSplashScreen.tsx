import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SPLASH_MS = 2000;
const EXIT_MS = 420;

interface IntroSplashScreenProps {
  onDismiss?: () => void;
}

function readReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const IntroSplashScreen = ({ onDismiss }: IntroSplashScreenProps) => {
  const [visible, setVisible] = useState(true);
  const [reducedMotion] = useState(readReducedMotion);
  const dismissedRef = useRef(false);

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setVisible(false);
    window.setTimeout(() => onDismiss?.(), reducedMotion ? 0 : EXIT_MS);
  }, [onDismiss, reducedMotion]);

  useEffect(() => {
    const timer = window.setTimeout(dismiss, reducedMotion ? 700 : SPLASH_MS);
    return () => window.clearTimeout(timer);
  }, [dismiss, reducedMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          key="splash"
          aria-label="Loading Aliasist"
          onClick={dismiss}
          className="fixed inset-0 z-[9999] flex cursor-pointer flex-col items-center justify-center overflow-hidden border-0 bg-[#031208] px-6 text-center text-[#c9ffd8] outline-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: reducedMotion ? 0 : 0.24 } }}
          exit={{ opacity: 0, transition: { duration: reducedMotion ? 0 : EXIT_MS / 1000, ease: "easeInOut" } }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(circle at 50% 46%, rgba(46, 255, 122, 0.2), rgba(4, 18, 9, 0.86) 44%, #020604 100%)",
            }}
          />
          <div className="relative flex flex-col items-center gap-5">
            <motion.div
              className="font-mono text-5xl font-bold uppercase leading-none tracking-[0.22em] text-[#d6ffe2] drop-shadow-[0_0_26px_rgba(72,255,136,0.28)] sm:text-6xl"
              initial={reducedMotion ? false : { opacity: 0, y: 10, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
            >
              ALIASIST
            </motion.div>
            <motion.p
              className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#79ff9f]/70"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.16, duration: 0.34 }}
            >
              Loading interface
            </motion.p>
            <div className="h-[2px] w-52 overflow-hidden rounded-full bg-[#69ff90]/18">
              <motion.div
                className="h-full rounded-full bg-[#72ff9c] shadow-[0_0_18px_rgba(114,255,156,0.55)]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: reducedMotion ? 0.7 : SPLASH_MS / 1000, ease: "linear" }}
              />
            </div>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default IntroSplashScreen;
