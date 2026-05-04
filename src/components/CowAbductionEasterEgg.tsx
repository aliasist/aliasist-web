/**
 * Logo Easter egg — cow abduction splash (image-first).
 * If we ever add a large clip later, it should live in `public/` so Vite does not bundle it.
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { playClick, playScan } from "@/hooks/useSound";

const STATUS_MESSAGES = [
  "Locating nearest cow… I mean file…",
  "Calibrating tractor beam… standby…",
  "Specimen secured. Initiating upload…",
  "Atmospheric interference detected…",
  "Pasture coordinates locked.",
  "Do not be alarmed. This is routine.",
];

interface CowAbductionEasterEggProps {
  open: boolean;
  onClose: () => void;
}

const CowAbductionEasterEgg = ({ open, onClose }: CowAbductionEasterEggProps) => {
  const [statusIdx, setStatusIdx] = useState(0);

  useEffect(() => {
    if (!open) {
      setStatusIdx(0);
      return;
    }
    playScan();
    const t = setInterval(() => setStatusIdx(i => (i + 1) % STATUS_MESSAGES.length), 2600);
    return () => clearInterval(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

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
            onClick={() => {
              playClick();
              onClose();
            }}
          />

          <motion.div
            className="relative z-10 flex max-sm:h-full max-sm:max-h-[100dvh] max-sm:w-full max-sm:max-w-none max-sm:rounded-none w-full max-w-3xl overflow-hidden sm:rounded-2xl border border-border/60 bg-[hsl(220_22%_6%)] shadow-[0_0_80px_hsl(165_90%_42%_/_0.12)] flex-col max-sm:border-x-0"
            initial={{ scale: 0.94, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute inset-0 scanlines opacity-[0.12] pointer-events-none z-20" />

            <div className="relative w-full min-h-[180px] max-sm:aspect-auto max-sm:flex-1 max-sm:min-h-0 max-sm:max-h-[46vh] aspect-video max-h-[min(56vh,480px)] overflow-hidden bg-black">
              <div className="fae absolute inset-0">
                <style>{`
                  .fae{
                    --fae-bg:#05080d;
                    --fae-txt:#e8f6ff;
                    --fae-muted:#9fb6c7;
                    --fae-green:#72ff9c;
                    --fae-cyan:#63f3ff;
                    --fae-gold:#ffd166;
                    position:absolute;inset:0;
                    background:var(--fae-bg);
                    color:var(--fae-txt);
                  }
                  .fae *{box-sizing:border-box}
                  .fae .splash{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
                  .fae .splash-content{text-align:center;position:relative;width:100%;max-width:500px;padding:16px}
                  .fae .stars{position:absolute;inset:0;pointer-events:none}
                  .fae .star{position:absolute;width:3px;height:3px;background:#fff;border-radius:50%;animation:fae-twinkle 2s infinite alternate}
                  @keyframes fae-twinkle{0%{opacity:.2;transform:scale(.8)}100%{opacity:1;transform:scale(1.2)}}
                  .fae .ufo-scene{position:relative;width:220px;height:200px;margin:0 auto 16px}
                  .fae .ufo{position:absolute;left:50%;top:10px;transform:translateX(-50%);z-index:10;animation:fae-ufoHover 3s ease-in-out infinite}
                  @keyframes fae-ufoHover{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-8px)}}
                  .fae .ufo-dome{width:50px;height:22px;background:linear-gradient(to bottom,#e6faff,#b8e8f5);border-radius:50px 50px 60px 60px/25px 25px 15px 15px;margin:0 auto;position:relative;z-index:2}
                  .fae .ufo-body{width:100px;height:28px;background:linear-gradient(to bottom,#a2eaf7,#7bbdc9);border-radius:80px/20px;margin:-6px auto 0;position:relative;z-index:1;box-shadow:0 4px 20px rgba(114,255,156,.2);display:flex;justify-content:space-around;align-items:flex-end;padding:0 20px 4px}
                  .fae .ufo-light{width:10px;height:6px;background:#fee784;border-radius:50%;animation:fae-blink 1.5s infinite alternate;box-shadow:0 2px 8px rgba(254,231,132,.6)}
                  .fae .ufo-light:nth-child(2){animation-delay:.3s}
                  .fae .ufo-light:nth-child(3){animation-delay:.6s}
                  @keyframes fae-blink{0%{opacity:1}100%{opacity:.3}}
                  .fae .beam{position:absolute;left:50%;top:52px;width:70px;height:120px;transform:translateX(-50%);background:linear-gradient(180deg,rgba(114,255,156,.08),rgba(114,255,156,.15) 40%,rgba(255,255,255,.08));clip-path:polygon(25% 0%,75% 0%,100% 100%,0% 100%);z-index:5;animation:fae-beamPulse 2s infinite alternate}
                  @keyframes fae-beamPulse{0%{opacity:.6}100%{opacity:1}}
                  .fae .cow{position:absolute;left:50%;bottom:30px;transform:translateX(-50%);z-index:8;animation:fae-abduct 4s ease-in-out infinite}
                  @keyframes fae-abduct{
                    0%{transform:translateX(-50%) translateY(0) rotate(0)}
                    30%{transform:translateX(-50%) translateY(-10px) rotate(2deg)}
                    60%{transform:translateX(-50%) translateY(-60px) rotate(-3deg)}
                    80%{transform:translateX(-50%) translateY(-90px) rotate(1deg);opacity:1}
                    95%{transform:translateX(-50%) translateY(-105px) rotate(0);opacity:.2}
                    100%{transform:translateX(-50%) translateY(0) rotate(0);opacity:1}
                  }
                  .fae .cow-body{width:36px;height:18px;background:#fff;border-radius:12px 16px 14px 10px;position:relative;box-shadow:inset -4px -2px 0 #eee}
                  .fae .cow-head{position:absolute;width:14px;height:12px;background:#fff;border-radius:60% 70% 50% 40%;left:-8px;top:2px;border-left:2px solid #ccc}
                  .fae .cow-head::before{content:'•';position:absolute;left:4px;top:2px;font-size:5px;color:#333}
                  .fae .cow-spots{position:absolute;width:8px;height:7px;background:#555;border-radius:50%;top:3px;left:12px;box-shadow:10px 3px 0 #555}
                  .fae .cow-legs{display:flex;gap:4px;margin-top:-2px;padding-left:4px}
                  .fae .leg{width:3px;height:12px;background:#eee;border-radius:2px}
                  .fae .leg::after{content:'';display:block;width:4px;height:3px;background:#333;border-radius:50%;margin-top:auto;margin-left:-0.5px}
                  .fae .ground{position:absolute;bottom:0;left:0;right:0;height:28px;background:linear-gradient(to top,#0a1a0a,#0d260d,transparent);border-radius:0 0 8px 8px}
                  .fae .ground::before{content:'🌾  🌱  🌿  🌾  🌱';position:absolute;bottom:4px;left:50%;transform:translateX(-50%);font-size:10px;letter-spacing:6px;opacity:.5}
                  .fae .splash-title{font-size:32px;font-weight:800;color:var(--fae-green);letter-spacing:4px;text-shadow:0 0 30px rgba(114,255,156,.3)}
                  .fae .splash-sub{font-size:12px;color:var(--fae-cyan);letter-spacing:3px;margin-top:2px}
                  .fae .splash-credit{font-family:var(--font-mono,'JetBrains Mono',monospace);font-size:10px;color:var(--fae-muted);margin-top:10px}
                  .fae .splash-status{font-family:var(--font-mono,'JetBrains Mono',monospace);font-size:11px;color:var(--fae-gold);margin-top:12px;animation:fae-pulse 1.5s infinite alternate}
                  @keyframes fae-pulse{0%{opacity:1}100%{opacity:.4}}
                  @media (prefers-reduced-motion: reduce){
                    .fae .ufo,.fae .beam,.fae .cow,.fae .star,.fae .splash-status{animation:none!important}
                  }
                `}</style>

                <motion.div
                  className="splash"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="splash-content">
                    <div className="stars" aria-hidden>
                      <div className="star" style={{ top: "8%", left: "12%", animationDelay: "0s" }} />
                      <div className="star" style={{ top: "15%", left: "80%", animationDelay: "0.3s" }} />
                      <div className="star" style={{ top: "25%", left: "45%", animationDelay: "0.7s" }} />
                      <div className="star" style={{ top: "5%", left: "65%", animationDelay: "1.1s" }} />
                      <div className="star" style={{ top: "35%", left: "20%", animationDelay: "0.5s" }} />
                      <div className="star" style={{ top: "12%", left: "35%", animationDelay: "1.4s" }} />
                      <div className="star" style={{ top: "30%", left: "72%", animationDelay: "0.9s" }} />
                      <div className="star" style={{ top: "18%", left: "55%", animationDelay: "1.7s" }} />
                    </div>

                    <div className="ufo-scene" aria-hidden>
                      <div className="ufo">
                        <div className="ufo-dome" />
                        <div className="ufo-body">
                          <div className="ufo-light" />
                          <div className="ufo-light" />
                          <div className="ufo-light" />
                        </div>
                      </div>
                      <div className="beam" />
                      <div className="cow">
                        <div className="cow-body" />
                        <div className="cow-head" />
                        <div className="cow-spots" />
                        <div className="cow-legs">
                          <div className="leg" />
                          <div className="leg" />
                          <div className="leg" />
                          <div className="leg" />
                        </div>
                      </div>
                      <div className="ground" />
                    </div>

                    <h1 className="splash-title">ALIASIST</h1>
                    <p className="splash-sub">F I L E S &nbsp; A B D U C T O R</p>
                    <p className="splash-credit">coded by dev_aliasist · www.aliasist.com</p>
                    <p className="splash-status">{STATUS_MESSAGES[statusIdx]}</p>
                  </div>
                </motion.div>
              </div>

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35 z-10" />
              <div className="pointer-events-none absolute inset-0 scanlines opacity-[0.08] z-10" />

              <div className="pointer-events-none absolute left-4 top-4 z-10 font-mono text-[8px] uppercase tracking-[0.25em] text-electric/55 drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
                FILES ABDUCTOR // PASTURE.CAPTURED
              </div>
            </div>

            <div className="relative border-t border-border/40 bg-card/60 px-5 py-4 sm:px-6 sm:py-5 backdrop-blur-md pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-5">
              <h2
                id="easter-egg-title"
                className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-foreground"
              >
                Specimen upload complete
              </h2>
              <p className="mt-2 font-mono text-[11px] leading-relaxed text-muted-foreground/80">
                One pasture cow successfully routed off-world. No folders were harmed — only mildly inconvenienced.
                <span className="mt-1 block text-muted-foreground/60">
                  Tip: click the logo again for another “sample.”
                </span>
              </p>
              <button
                type="button"
                onClick={() => {
                  playClick();
                  onClose();
                }}
                className="mt-4 w-full rounded-full border border-electric/35 bg-electric/[0.08] py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-electric transition-all hover:bg-electric/15 hover:shadow-electric-sm active:scale-[0.99]"
              >
                Beam me back
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CowAbductionEasterEgg;
