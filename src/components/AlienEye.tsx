import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * AlienEye — cursor-tracking iris, animated pupil dilation, teal glow ring.
 * The eye "follows" the cursor within a ±20deg arc.
 */
const AlienEye = () => {
  const eyeRef = useRef<HTMLDivElement>(null);
  const [iris, setIris] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = eyeRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const angle = Math.atan2(dy, dx);
      const dist = Math.min(Math.hypot(dx, dy), 160);
      const maxOffset = 14;
      const pct = Math.min(dist / 300, 1);
      setIris({
        x: Math.cos(angle) * maxOffset * pct,
        y: Math.sin(angle) * maxOffset * pct,
      });
    };
    window.addEventListener("mousemove", onMove);

    // Random blinks
    const blinkLoop = () => {
      const delay = 2500 + Math.random() * 4000;
      setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 140);
        blinkLoop();
      }, delay);
    };
    blinkLoop();

    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <motion.div
      ref={eyeRef}
      className="relative flex items-center justify-center"
      style={{ width: 200, height: 200 }}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {/* Outer glow rings */}
      <motion.div
        className="absolute rounded-full border border-electric/20"
        style={{ width: 200, height: 200 }}
        animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full border border-electric/10"
        style={{ width: 220, height: 220 }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      {/* Sclera (outer eye white — darkened for alien) */}
      <div
        className="relative rounded-full overflow-hidden"
        style={{
          width: 160,
          height: 160,
          background: "radial-gradient(circle at 40% 35%, hsl(220 18% 18%), hsl(220 18% 8%))",
          boxShadow: "0 0 40px 8px hsl(165 90% 42% / 0.3), inset 0 0 30px hsl(165 90% 42% / 0.08)",
          border: "1.5px solid hsl(165 90% 42% / 0.5)",
        }}
      >
        {/* Iris */}
        <motion.div
          className="absolute"
          style={{
            width: 90,
            height: 90,
            top: "50%",
            left: "50%",
            transform: `translate(calc(-50% + ${iris.x}px), calc(-50% + ${iris.y}px))`,
            transition: "transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Iris base */}
          <div
            className="w-full h-full rounded-full"
            style={{
              background: "radial-gradient(circle at 35% 30%, hsl(165 90% 56%), hsl(165 90% 30%), hsl(220 18% 10%))",
              boxShadow: "0 0 16px hsl(165 90% 42% / 0.6)",
            }}
          />

          {/* Iris pattern rings */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "repeating-radial-gradient(circle at center, transparent 12px, hsl(165 90% 42% / 0.12) 14px, transparent 16px)",
              animation: "iris-rotate 12s linear infinite",
            }}
          />

          {/* Pupil */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 36,
              height: 36,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(circle at 35% 30%, hsl(220 18% 22%), hsl(220 18% 4%))",
              boxShadow: "0 0 8px hsl(0 0% 0% / 0.8)",
            }}
            animate={{ scale: [1, 0.85, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Catchlight */}
            <div
              className="absolute rounded-full bg-white/70"
              style={{ width: 10, height: 10, top: 6, left: 8 }}
            />
          </motion.div>
        </motion.div>

        {/* Blink eyelid */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "hsl(220 18% 8%)",
            transformOrigin: "top",
            scaleY: blink ? 1 : 0,
            transition: "transform 0.07s ease-in-out",
          }}
        />
      </div>

      {/* Scanline shimmer */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, hsl(165 90% 80% / 0.04) 0%, transparent 50%, hsl(165 90% 42% / 0.04) 100%)",
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
};

export default AlienEye;
