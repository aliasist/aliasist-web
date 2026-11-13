import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const EASTER_EGG_VIDEO = "/intro-homepage.mp4";

interface CowAbductionEasterEggProps {
  open: boolean;
  onClose: () => void;
}

const CowAbductionEasterEgg = ({ open, onClose }: CowAbductionEasterEggProps) => {
  useEffect(() => {
    if (!open) return;
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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
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
                onEnded={onClose}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CowAbductionEasterEgg;
