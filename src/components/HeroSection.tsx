import { useEffect, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { hero } from "@/content/homepage";
import { HomeGoogleAuth } from "@/components/HomeGoogleAuth";
import mascot from "@/assets/logo-clean.svg";

const EYE_GLOW_COLORS = [
  "hsl(165 90% 58%)",
  "hsl(186 95% 62%)",
  "hsl(252 100% 72%)",
  "hsl(42 92% 62%)",
] as const;

const EYE_GLOW_VISIT_KEY = "aliasist-eye-glow-visits";
const EYE_GLOW_SESSION_KEY = "aliasist-eye-glow-session";
const EYE_GLOW_WINDOW_MS = 6 * 60 * 60 * 1000;

function pickEyeGlowColor() {
  const timeSlot = Math.floor(Date.now() / EYE_GLOW_WINDOW_MS);
  let visits = 0;

  try {
    visits = Number(localStorage.getItem(EYE_GLOW_VISIT_KEY) ?? "0");
    if (!sessionStorage.getItem(EYE_GLOW_SESSION_KEY)) {
      visits += 1;
      localStorage.setItem(EYE_GLOW_VISIT_KEY, String(visits));
      sessionStorage.setItem(EYE_GLOW_SESSION_KEY, "1");
    }
  } catch {
    visits = 0;
  }

  return EYE_GLOW_COLORS[(timeSlot + Math.floor(visits / 3)) % EYE_GLOW_COLORS.length];
}

const HeroSection = () => {
  const [eyeGlowColor, setEyeGlowColor] = useState<(typeof EYE_GLOW_COLORS)[number]>(EYE_GLOW_COLORS[0]);

  useEffect(() => {
    setEyeGlowColor(pickEyeGlowColor());
  }, []);

  return (
    <section
      id="top"
      className="relative flex min-h-[100dvh] min-h-screen items-center justify-center overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none z-[0] bg-[radial-gradient(ellipse_85%_75%_at_50%_42%,_transparent_0%,_hsl(var(--background)_/_0.55)_75%,_transparent_100%)]"
        aria-hidden
      />

      {/* Layered radial glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_35%,_hsl(165_90%_42%_/_0.06)_0%,_transparent_65%)] pointer-events-none" />
      <div className="absolute inset-0 hero-violet-glow-a pointer-events-none" />
      <div className="absolute inset-0 hero-violet-glow-b pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_80%,_hsl(165_90%_42%_/_0.04)_0%,_transparent_70%)] pointer-events-none" />

      <div className="relative z-10 mx-auto flex w-full max-w-site flex-col items-center px-4 pt-14 pb-14 text-center sm:px-8 sm:pt-16 lg:px-12 xl:px-16">
        <motion.div
          className="alien-logo-glow mb-5 h-28 w-28 sm:h-36 sm:w-36 md:h-44 md:w-44"
          style={{ "--alien-eye-glow": eyeGlowColor } as CSSProperties}
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src={mascot}
            alt={hero.mascotAlt}
            title={hero.mascotTitle}
            draggable={false}
            className="h-full w-full select-none object-contain drop-shadow-logo-aura"
          />
        </motion.div>

        <motion.h1
          className="text-glow-violet mb-5 select-none text-6xl font-bold leading-none tracking-[0.04em] text-foreground sm:text-8xl md:text-[9rem]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {hero.wordmark}
        </motion.h1>

        <motion.p
          className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-electric/65"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.7 }}
        >
          {hero.tagline}
        </motion.p>

        <motion.p
          className="readable-copy mx-auto mb-8 rounded-sm border border-violet/15 bg-background/76 px-4 py-4 text-foreground/86 shadow-[0_0_22px_hsl(var(--electric)_/_0.1),0_0_32px_hsl(var(--violet)_/_0.08),0_2px_14px_hsl(0_0%_0%_/_0.14)] backdrop-blur-md sm:px-8 sm:py-5 sm:text-lg"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          {hero.subcopy}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.6 }}
          className="hero-cta-group mt-2 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <a
            href={hero.ctaContactHref}
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-sm bg-electric px-7 py-3.5 font-mono text-xs uppercase tracking-[0.14em] text-background shadow-electric-sm outline-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cta-duo focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95"
          >
            <span className="absolute inset-0 translate-y-full bg-white/10 transition-transform duration-300 group-hover:translate-y-0" />
            <span className="relative">{hero.ctaContact}</span>
            <ArrowRight className="relative size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
          </a>
          <a
            href={hero.ctaSecondaryHref}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-violet/22 bg-background/38 px-7 py-3.5 font-mono text-xs uppercase tracking-[0.14em] text-foreground/82 outline-none backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-electric/45 hover:bg-[linear-gradient(135deg,hsl(var(--electric)_/_0.06),hsl(var(--violet)_/_0.08))] hover:text-electric hover:shadow-[0_0_26px_hsl(var(--electric)_/_0.12),0_0_32px_hsl(var(--violet)_/_0.1),inset_0_1px_0_hsl(var(--violet)_/_0.18)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95"
          >
            <Mail className="size-3.5" aria-hidden />
            {hero.ctaSecondary}
          </a>
        </motion.div>

        <div className="mt-6 flex justify-center">
          <HomeGoogleAuth />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
