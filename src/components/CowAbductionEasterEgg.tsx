import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const EASTER_EGG_VIDEO = "/intro-homepage.mp4";

interface CowAbductionEasterEggProps {
  open: boolean;
  onClose: () => void;
}

type Phase = "abduct" | "flight";

const CowAbductionEasterEgg = ({ open, onClose }: CowAbductionEasterEggProps) => {
  const [phase, setPhase] = useState<Phase>("abduct");
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    setPhase("abduct");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (phase !== "flight") return;
    const t = setTimeout(() => onCloseRef.current(), 1500);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="easter-egg-title"
          className="fixed inset-0 z-[250] flex items-stretch justify-center sm:items-center p-0 sm:p-6 max-sm:pt-[max(0.75rem,env(safe-area-inset-top))] max-sm:pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/72 backdrop-blur-sm"
            onClick={() => onClose()}
          />

          <motion.div
            className="relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border/60 bg-[hsl(220_22%_6%)] shadow-[0_0_80px_hsl(165_90%_42%_/_0.12)] sm:rounded-2xl"
            initial={{ scale: 0.94, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="easter-egg-title" className="sr-only">
              Hooman Specimen upload complete
            </h2>
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              <motion.video
                key="intro-homepage"
                className="h-full w-full bg-black object-contain"
                src={EASTER_EGG_VIDEO}
                controls
                autoPlay
                playsInline
                preload="metadata"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                onEnded={() => {
                  if (phase === "abduct") setPhase("flight");
                }}
              />

              {phase === "flight" && (
                <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
                  <motion.div
                    className="absolute left-[54%] top-[46%]"
                    initial={{ opacity: 1, y: 0, scale: 1 }}
                    animate={{ opacity: 0, y: -150, scale: 1.6 }}
                    transition={{ duration: 1.2, ease: "easeIn" }}
                  >
                    {/* Cow specimen being released / disappearing */}
                    <div className="relative h-5 w-14 rounded-[45%_55%_48%_52%] bg-white shadow-lg">
                      <div className="absolute -left-2 top-0 h-4 w-2.5 rounded-full bg-white border-l border-gray-300" />
                      <div className="absolute -right-1.5 top-1 h-3 w-2 rounded-full bg-white border-r border-gray-300" />
                      <div className="mt-1.5 flex pl-1.5 pr-1.5 justify-between">
                        <div className="h-2 w-0.5 rounded-full bg-gray-300" />
                        <div className="h-2 w-0.5 rounded-full bg-gray-300" />
                        <div className="h-2 w-0.5 rounded-full bg-gray-300" />
                        <div className="h-2 w-0.5 rounded-full bg-gray-300" />
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    className="absolute left-[54%] top-[46%]"
                    initial={{ opacity: 1, y: 0, scale: 1 }}
                    animate={{ opacity: 0, y: -320, scale: 2.2 }}
                    transition={{ duration: 1.4, ease: "easeIn" }}
                  >
                    {/* UFO breaking off / flying off */}
                    <div className="relative h-9 w-20 rounded-full border-2 border-cyan-300 bg-cyan-100/80 shadow-[0_0_24px_rgba(99,243,255,0.6)]" />
                    <div className="absolute -bottom-2 left-1/2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-yellow-200" />
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CowAbductionEasterEgg;
