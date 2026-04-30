import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  alpha: number;
  speed: number;
  twinkleOffset: number;
}

const NUM_STARS = 180;

const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Seed stars
    starsRef.current = Array.from({ length: NUM_STARS }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.2 + 0.2,
      alpha: Math.random() * 0.6 + 0.1,
      speed: Math.random() * 0.008 + 0.002,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.01;

      for (const s of starsRef.current) {
        const twinkle = s.alpha * (0.6 + 0.4 * Math.sin(t * s.speed * 80 + s.twinkleOffset));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);

        // Occasional teal-tinted star
        const isTeal = s.r > 1.1;
        ctx.fillStyle = isTeal
          ? `rgba(0, 201, 123, ${twinkle})`
          : `rgba(220, 235, 240, ${twinkle})`;
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} id="starfield" aria-hidden="true" />;
};

export default Starfield;
