import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  alpha: number;
  speed: number;
  twinkleOffset: number;
}

/** Dense subtle field on pure black — splash only (main site keeps using Starfield). */
const NUM_STARS = 420;

interface SplashStarfieldProps {
  reducedMotion: boolean;
}

export function SplashStarfield({ reducedMotion }: SplashStarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const seedStars = () => {
      const w = canvas!.width;
      const h = canvas!.height;
      starsRef.current = Array.from({ length: NUM_STARS }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.05 + 0.15,
        alpha: Math.random() * 0.55 + 0.08,
        speed: Math.random() * 0.006 + 0.0015,
        twinkleOffset: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      seedStars();
    };

    const drawStatic = () => {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);
      for (const s of starsRef.current) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(235, 242, 250, ${s.alpha * 0.85})`;
        ctx.fill();
      }
    };

    resize();

    if (reducedMotion) {
      drawStatic();
      const onResize = () => {
        resize();
        drawStatic();
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    let t = 0;
    const draw = () => {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);
      t += 0.008;
      for (const s of starsRef.current) {
        const twinkle = s.alpha * (0.55 + 0.45 * Math.sin(t * s.speed * 70 + s.twinkleOffset));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(235, 242, 250, ${twinkle})`;
        ctx.fill();
      }
      frameRef.current = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    draw();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      aria-hidden
    />
  );
}
