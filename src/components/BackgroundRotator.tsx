import { useEffect, useMemo, useRef, useState } from "react";

const BG_IMAGES = [
  "/bg/ufo-01.png",
  "/bg/ufo-02.png",
  "/bg/ufo-03.png",
  "/bg/ufo-04.png",
] as const;

function readMotionConstrained(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    window.matchMedia("(hover: none), (pointer: coarse)").matches
  );
}

function pickNextIndex(current: number, count: number): number {
  if (count <= 1) return 0;
  let next = current;
  while (next === current) next = Math.floor(Math.random() * count);
  return next;
}

export default function BackgroundRotator() {
  const images = useMemo(() => [...BG_IMAGES], []);
  const [motionConstrained] = useState(readMotionConstrained);
  const [active, setActive] = useState(() => Math.floor(Math.random() * images.length));
  const [next, setNext] = useState(() => pickNextIndex(active, images.length));
  const [showNext, setShowNext] = useState(false);

  const timerRef = useRef<number | null>(null);
  const cycleRef = useRef(0);

  useEffect(() => {
    if (motionConstrained) return;
    // Preload to reduce flashes on first swap.
    for (const src of images) {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    }
  }, [images, motionConstrained]);

  useEffect(() => {
    if (motionConstrained) return;

    const schedule = () => {
      const cycle = ++cycleRef.current;
      const ms = 18000 + Math.floor(Math.random() * 14000); // 18–32s
      timerRef.current = window.setTimeout(() => {
        // Guard against stale timers.
        if (cycle !== cycleRef.current) return;
        const upcoming = pickNextIndex(active, images.length);
        setNext(upcoming);
        setShowNext(true);
        // After crossfade, commit.
        window.setTimeout(() => {
          if (cycle !== cycleRef.current) return;
          setActive(upcoming);
          setShowNext(false);
          schedule();
        }, 1400);
      }, ms);
    };

    schedule();
    return () => {
      cycleRef.current++;
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [active, images.length, motionConstrained]);

  return (
    <div className="bg-rotator" aria-hidden>
      <div
        className="bg-rotator__layer"
        style={{ backgroundImage: `url(${images[active]})`, opacity: showNext ? 0 : 1 }}
      />
      <div
        className="bg-rotator__layer"
        style={{ backgroundImage: `url(${images[next]})`, opacity: showNext ? 1 : 0 }}
      />
    </div>
  );
}
