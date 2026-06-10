import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SPLASH_MS = 2400;
const EXIT_MS = 500;

const STATUS_MESSAGES = [
  "Locating nearest cow...",
  "Calibrating tractor beam...",
  "Pasture coordinates locked.",
  "Specimen secured. Initiating upload...",
  "Optimizing grid telemetry...",
  "Bypassing atmospheric interference...",
];

interface BrandSplashScreenProps {
  onDismiss?: () => void;
}

const BrandSplashScreen = ({ onDismiss }: BrandSplashScreenProps) => {
  const [visible, setVisible] = useState(true);
  const [statusIdx, setStatusIdx] = useState(0);
  const dismissedRef = useRef(false);

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setVisible(false);
    window.setTimeout(() => onDismiss?.(), EXIT_MS);
  }, [onDismiss]);

  useEffect(() => {
    const timer = window.setTimeout(dismiss, SPLASH_MS + 400);
    const statusInterval = setInterval(() => {
      setStatusIdx((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 450);
    return () => {
      window.clearTimeout(timer);
      clearInterval(statusInterval);
    };
  }, [dismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="brand-splash"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#05080d] overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: EXIT_MS / 1000 } }}
        >
          {/* Scanlines Effect */}
          <div className="absolute inset-0 scanlines opacity-10 pointer-events-none z-20" />
          
          <div className="relative flex flex-col items-center gap-10">
            {/* The UFO Scene */}
            <div className="ufo-scene relative w-[300px] h-[240px]">
              <style>{`
                .ufo {
                  position: absolute; left: 50%; top: 0; transform: translateX(-50%);
                  animation: hover 2s ease-in-out infinite;
                  z-index: 10;
                }
                @keyframes hover {
                  0%, 100% { transform: translateX(-50%) translateY(0); }
                  50% { transform: translateX(-50%) translateY(-15px); }
                }
                .ufo-dome { width: 60px; height: 26px; background: linear-gradient(to bottom, #e6faff, #b8e8f5); border-radius: 50px 50px 60px 60px; margin: 0 auto; }
                .ufo-body { 
                  width: 120px; height: 34px; background: linear-gradient(to bottom, #a2eaf7, #7bbdc9); border-radius: 80px/20px; margin: -8px auto 0;
                  display: flex; justify-content: space-around; align-items: flex-end; padding: 0 25px 6px;
                  box-shadow: 0 4px 30px rgba(0, 255, 204, 0.3);
                }
                .ufo-light { width: 12px; height: 8px; background: #fee784; border-radius: 50%; animation: blink 1s infinite alternate; }
                @keyframes blink { 0% { opacity: 1; } 100% { opacity: 0.3; } }
                
                .beam {
                  position: absolute; left: 50%; top: 52px; width: 90px; height: 150px; transform: translateX(-50%);
                  background: linear-gradient(180deg, rgba(0, 255, 204, 0.1), rgba(0, 255, 204, 0.3) 40%, transparent);
                  clip-path: polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%);
                  animation: beamPulse 1.5s infinite alternate;
                }
                @keyframes beamPulse { 0% { opacity: 0.4; } 100% { opacity: 1; } }

                .cow {
                  position: absolute; left: 50%; bottom: 20px; transform: translateX(-50%);
                  animation: abduct 3s cubic-bezier(0.45, 0, 0.55, 1) infinite;
                }
                @keyframes abduct {
                  0% { transform: translateX(-50%) translateY(0) rotate(0); opacity: 1; }
                  70% { transform: translateX(-50%) translateY(-120px) rotate(-10deg); opacity: 1; }
                  90% { transform: translateX(-50%) translateY(-150px) rotate(0); opacity: 0; }
                  100% { transform: translateX(-50%) translateY(0) rotate(0); opacity: 0; }
                }
                .cow-body { width: 44px; height: 22px; background: #fff; border-radius: 12px 16px 14px 10px; position: relative; }
                .cow-head { position: absolute; width: 16px; height: 14px; background: #fff; border-radius: 60%; left: -10px; top: 2px; }
                .cow-spots { position: absolute; width: 10px; height: 8px; background: #333; border-radius: 50%; top: 4px; left: 15px; box-shadow: 12px 4px 0 #333; }
              `}</style>

              <div className="ufo">
                <div className="ufo-dome" />
                <div className="ufo-body">
                  <div className="ufo-light" style={{ animationDelay: '0s' }} />
                  <div className="ufo-light" style={{ animationDelay: '0.3s' }} />
                  <div className="ufo-light" style={{ animationDelay: '0.6s' }} />
                </div>
              </div>
              <div className="beam" />
              <div className="cow">
                <div className="cow-body" />
                <div className="cow-head" />
                <div className="cow-spots" />
              </div>
            </div>

            {/* Brand Text */}
            <div className="flex flex-col items-center gap-2">
              <motion.div
                className="font-black text-6xl tracking-[0.2em] text-white italic"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                ALIASIST
              </motion.div>
              <motion.div 
                className="text-[#00ffcc] font-mono text-xs tracking-[0.5em] uppercase"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {STATUS_MESSAGES[statusIdx]}
              </motion.div>
            </div>

            {/* Progress Bar */}
            <div className="w-64 h-[2px] bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-[#00ffcc] shadow-[0_0_15px_#00ffcc]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: SPLASH_MS / 1000, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BrandSplashScreen;
