/**
 * SplashScreen — full-screen black starfield, logo video fades in at max size, then homepage.
 *
 * Add under /public:
 *   • aliasist_video.mp4  (H.264, muted for autoplay)
 *   • splash-logo-poster.jpg (optional poster while loading)
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SplashStarfield } from "@/components/SplashStarfield";

const SPLASH_MP4 = "/aliasist_video.mp4";
// Optional poster while the MP4 loads. Leave undefined unless the asset exists in `/public`.
const SPLASH_POSTER: string | undefined = undefined;

type SplashPhase = "menu" | "playing" | "ending";

/** Luminance mask: white center = full video, fading to transparent → starfield shows through (no hard rectangle). */
const SPLASH_VIDEO_MASK =
  "radial-gradient(ellipse 118% 112% at 50% 50%, #fff 0%, #fff 30%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.28) 68%, rgba(255,255,255,0.08) 84%, rgba(255,255,255,0) 100%)";

/** Fallback edge feather (works even if CSS masking is unsupported). */
const SPLASH_EDGE_FEATHER_OVERLAY =
  "radial-gradient(ellipse 120% 114% at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.22) 62%, rgba(0,0,0,0.62) 78%, rgba(0,0,0,0.92) 90%, rgba(0,0,0,1) 100%)";

const splashVideoMaskStyle = {
  WebkitMaskImage: SPLASH_VIDEO_MASK,
  maskImage: SPLASH_VIDEO_MASK,
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat" as const,
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
  WebkitMaskPosition: "center",
  maskPosition: "center" as const,
};

/** Minimum time on splash after video ends (very short clips). */
const MIN_SPLASH_MS = 2400;
/** Hard cap. */
const MAX_SPLASH_MS = 16000;
/** Pause on the final frame before fading to the site. */
const END_HOLD_MS = 1800; // Slightly longer pause on last frame
const MENU_AFTER_VIDEO_MS = 1200; // Show menu splash briefly after video
/** Fade duration for the video layer before the splash exits. */
const END_FADE_MS = 2200;

interface AISplashScreenProps {
  onDismiss?: () => void;
}

function readReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const AISplashScreen = ({ onDismiss }: AISplashScreenProps) => {
  const [visible, setVisible] = useState(true);
  const [reducedMotion] = useState(readReducedMotion);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [phase, setPhase] = useState<SplashPhase>("menu");
  const [ending, setEnding] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);

  const dismissedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startedRef = useRef(performance.now());
  const videoReadyRef = useRef(false);
  const endTimerRef = useRef<number | null>(null);

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setVisible(false);
    setTimeout(() => onDismiss?.(), 800);
  }, [onDismiss]);

  const scheduleDismissAfterMin = useCallback(() => {
    const elapsed = performance.now() - startedRef.current;
    const wait = Math.max(0, MIN_SPLASH_MS - elapsed);
    window.setTimeout(dismiss, wait);
  }, [dismiss]);

  const clearEndTimer = useCallback(() => {
    if (!endTimerRef.current) return;
    window.clearTimeout(endTimerRef.current);
    endTimerRef.current = null;
  }, []);

  const holdLastFrameThenDismiss = useCallback(() => {
    if (ending) return;
    setEnding(true);

    const el = videoRef.current;
    if (el) {
      try {
        const dur = Number.isFinite(el.duration) ? el.duration : 0;
        if (dur > 0) el.currentTime = Math.max(0, dur - 0.02);
        el.pause();
      } catch {
        // ignore
      }
    }

    const elapsed = performance.now() - startedRef.current;
    const minRemaining = Math.max(0, MIN_SPLASH_MS - elapsed);
    const holdMs = Math.max(END_HOLD_MS, minRemaining);

    clearEndTimer();
    endTimerRef.current = window.setTimeout(() => {
      // Instead of dismissing, show the menu splash again briefly
      setPhase("menu");
      setShowVideo(false);
      clearEndTimer();
      endTimerRef.current = window.setTimeout(() => {
        scheduleDismissAfterMin();
      }, MENU_AFTER_VIDEO_MS);
    }, holdMs);
  }, [ending, clearEndTimer, scheduleDismissAfterMin]);

  const showFallback = reducedMotion || videoFailed;

  const markVideoPainted = useCallback(() => {
    if (videoReadyRef.current) return;
    videoReadyRef.current = true;
    setVideoReady(true);
  }, []);

  useEffect(() => {
    if (!showVideo) return;

    const el = videoRef.current;
    if (!el) return;

    const onError = () => setVideoFailed(true);
    const onPlaying = () => markVideoPainted();

    el.addEventListener("error", onError);
    el.addEventListener("playing", onPlaying);

    const p = el.play();
    if (p !== undefined) {
      p.then(() => setNeedsInteraction(false)).catch(() => setNeedsInteraction(true));
    }

    return () => {
      el.removeEventListener("error", onError);
      el.removeEventListener("playing", onPlaying);
    };
  }, [showVideo, holdLastFrameThenDismiss, markVideoPainted]);

  // Some browsers/devtool throttling can delay `loadeddata`/`canplay` events; ensure we don't keep the
  // video fully transparent if it is actually playing.
  useEffect(() => {
    if (!showVideo) return;
    if (videoReadyRef.current) return;
    const t = window.setTimeout(() => {
      markVideoPainted();
    }, 650);
    return () => window.clearTimeout(t);
  }, [showVideo, markVideoPainted]);

  const retryPlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    const p = el.play();
    if (p !== undefined) {
      p.then(() => setNeedsInteraction(false)).catch(() => setVideoFailed(true));
    }
  }, []);

  useEffect(() => {
    if (!showFallback) return;
    const t = window.setTimeout(dismiss, MIN_SPLASH_MS);
    return () => clearTimeout(t);
  }, [showFallback, dismiss]);

  useEffect(() => {
    const t = window.setTimeout(dismiss, MAX_SPLASH_MS);
    return () => clearTimeout(t);
  }, [dismiss]);

  useEffect(() => {
    return () => clearEndTimer();
  }, [clearEndTimer]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[9999] overflow-hidden bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, transition: { duration: 1.6, ease: "easeInOut" } }}
        >
          <SplashStarfield reducedMotion={reducedMotion} />

          {(phase === "menu" || phase === "ending") && (
            <motion.div
              className="absolute inset-0 z-10 flex items-center justify-center bg-black"
              style={{ pointerEvents: phase === "ending" ? "none" : "auto" }}
              initial={{ opacity: 1 }}
              animate={{ opacity: phase === "ending" ? 1 : 1 }}
            >
              <div className="flex flex-col items-center gap-4">
                <button
                  type="button"
                  disabled={phase === "ending"}
                  onClick={() => {
                    clearEndTimer();
                    startedRef.current = performance.now();
                    setVideoReady(false);
                    videoReadyRef.current = false;
                    setVideoFailed(false);
                    setNeedsInteraction(false);
                    setEnding(false);
                    setPhase("playing");
                    setShowVideo(true);
                  }}
                  className="focus:outline-none group"
                  style={{ background: "none", border: "none" }}
                >
                  <img
                    src="/splash_button.png"
                    alt="Enter Splash"
                    style={{ display: "block" }}
                  />
                </button>
                <div className="mt-2 px-4 py-2 rounded bg-black/70 border border-yellow-400 text-yellow-200 text-sm font-medium shadow-lg animate-pulse max-w-xs text-center" role="alert" aria-live="polite">
                  <span className="inline-block align-middle mr-2" aria-hidden="true">🔊</span>
                  <span className="align-middle">Heads up: Audio will play when you enter. Please lower your volume if needed.</span>
                </div>
              </div>
            </motion.div>
          )}
          {showVideo && (
            <motion.div
              className="absolute inset-0 z-10 flex items-center justify-center bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: !videoReady ? 0 : phase === "ending" ? 0 : 1 }}
              transition={{
                duration: phase === "ending" ? END_FADE_MS / 1000 : 0.75,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div
                className="relative h-[100dvh] w-[100vw]"
                style={splashVideoMaskStyle}
              >
                <video
                  ref={videoRef}
                  className="block h-full w-full object-contain object-center"
                  playsInline
                  preload="auto"
                  poster={SPLASH_POSTER}
                  aria-label="Aliasist logo animation"
                  onLoadedData={markVideoPainted}
                  onCanPlay={markVideoPainted}
                  onEnded={holdLastFrameThenDismiss}
                >
                  <source src={SPLASH_MP4} type="video/mp4" />
                </video>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: SPLASH_EDGE_FEATHER_OVERLAY,
                    filter: "blur(10px)",
                    transform: "scale(1.02)",
                  }}
                />
              </div>

              {needsInteraction && !showFallback && (
                <div className="absolute bottom-6 left-1/2 z-20 w-[min(92vw,520px)] -translate-x-1/2 text-center">
                  <button
                    type="button"
                    onClick={retryPlay}
                    className="w-full rounded-2xl border border-white/15 bg-black/70 px-5 py-3 text-sm font-medium text-white shadow-[0_18px_50px_-24px_rgba(0,0,0,0.85)] backdrop-blur-md transition hover:bg-black/80"
                  >
                    Tap to play
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {showFallback && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 16, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.25, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="font-mono text-5xl font-bold uppercase tracking-[0.22em] text-white drop-shadow-[0_0_28px_rgba(255,255,255,0.12)] sm:text-6xl"
              >
                ALIASIST
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.55 }}
                className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/45"
              >
                A L I A S I S T 
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="h-[2px] w-48 overflow-hidden rounded-full bg-white/15"
              >
                <motion.div
                  className="h-full rounded-full bg-white/50 shadow-[0_0_14px_rgba(255,255,255,0.35)]"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: MIN_SPLASH_MS / 1000, ease: "easeOut" }}
                />
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AISplashScreen;
