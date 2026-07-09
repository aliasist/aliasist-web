import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import AlienEye from "./AlienEye";
import { hero } from "@/content/homepage";
import { HomeGoogleAuth } from "@/components/HomeGoogleAuth";
import { playClick, playHover } from "@/hooks/useSound";

/** Beacon-style hero link: rotating gradient ring + text shimmer (CSS), plus a
 * mouse-tracked magnetic tilt (JS/framer-motion) — a subtle tractor-beam pull
 * toward the cursor that fits the UFO theme. */
const HeroBeaconLink = () => {
  const ref = useRef<HTMLAnchorElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 220, damping: 18, mass: 0.4 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);
  const rotateX = useTransform(y, [-20, 20], [8, -8]);
  const rotateY = useTransform(x, [-30, 30], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - (rect.left + rect.width / 2));
    mouseY.set(e.clientY - (rect.top + rect.height / 2));
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={hero.heroLinkHref}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={playHover}
      onClick={playClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.32, duration: 0.6 }}
      style={{ x, y, rotateX, rotateY }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.97 }}
      className="hero-beacon-link tap-target mb-6 inline-flex items-center gap-1.5 rounded-sm border border-electric/25 bg-background/45 px-3.5 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md sm:py-1.5"
    >
      <span className="hero-beacon-link__text">{hero.heroLinkLabel}</span>
    </motion.a>
  );
};

const HeroSection = () => {
  return (
    <section
      id="top"
      className="relative flex min-h-[100dvh] min-h-screen items-center justify-center overflow-hidden grid-bg scanlines"
    >
      {/* Background photo — slow Ken-burns drift + vignette; respects prefers-reduced-motion */}
      <div
        className="hero-bg-photo absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.28] pointer-events-none motion-safe:animate-hero-photo-drift will-change-transform"
        style={{ backgroundImage: "url(/background.png)" }}
      />
      <div
        className="absolute inset-0 pointer-events-none z-[0] bg-[radial-gradient(ellipse_85%_75%_at_50%_42%,_transparent_0%,_hsl(var(--background)_/_0.72)_88%,_hsl(var(--background)_/_0.95)_100%)]"
        aria-hidden
      />

      {/* Layered radial glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_35%,_hsl(165_90%_42%_/_0.06)_0%,_transparent_65%)] pointer-events-none" />
      <div className="absolute inset-0 hero-violet-glow-a pointer-events-none" />
      <div className="absolute inset-0 hero-violet-glow-b pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_80%,_hsl(165_90%_42%_/_0.04)_0%,_transparent_70%)] pointer-events-none" />

      <div className="relative z-10 mx-auto flex w-full max-w-site flex-col items-center px-4 pt-24 pb-14 text-center sm:px-8 lg:px-12 xl:px-16">
        {/* Alien eye — centered over the UFO in the background photo */}
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-6 flex justify-center sm:mb-8"
        >
          <AlienEye />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-sm border border-violet/20 bg-background/55 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground shadow-[0_0_26px_hsl(var(--violet)_/_0.08)] backdrop-blur-md"
        >
          <span className="size-1.5 rounded-full bg-electric shadow-electric-dot" />
          {hero.statusBadge}
        </motion.div>

        <HeroBeaconLink />

        <motion.h1
          className="glitch-text text-glow-violet mb-5 select-none text-6xl font-bold leading-none tracking-normal text-foreground sm:text-8xl md:text-[9rem]"
          data-text={hero.wordmark}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {hero.wordmark}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="mb-6 flex items-center justify-center gap-3"
        >
          <span className="block h-px w-12 bg-gradient-to-r from-transparent via-violet/55 to-electric/50" />
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-electric/80 sm:text-[11px]">
            {hero.eyeline}
          </p>
          <span className="block h-px w-12 bg-gradient-to-l from-transparent via-violet/55 to-electric/50" />
        </motion.div>

        <motion.p
          className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-electric/65"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.7 }}
        >
          {hero.tagline}
        </motion.p>

        <motion.p
          className="mx-auto mb-8 max-w-2xl rounded-sm border border-violet/15 bg-background/76 px-5 py-4 text-base leading-relaxed text-foreground/86 shadow-[0_0_22px_hsl(var(--electric)_/_0.1),0_0_32px_hsl(var(--violet)_/_0.08),0_2px_14px_hsl(0_0%_0%_/_0.14)] backdrop-blur-md sm:px-7 sm:py-5 sm:text-lg"
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
            onMouseEnter={playHover}
            onClick={playClick}
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-sm bg-electric px-7 py-3.5 font-mono text-xs uppercase tracking-[0.14em] text-background shadow-electric-sm outline-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cta-duo focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95"
          >
            <span className="absolute inset-0 translate-y-full bg-white/10 transition-transform duration-300 group-hover:translate-y-0" />
            <span className="relative">{hero.ctaContact}</span>
            <ArrowRight className="relative size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
          </a>
          <a
            href={hero.ctaSecondaryHref}
            onMouseEnter={playHover}
            onClick={playClick}
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

      {/* Bottom fade — softer so it doesn’t crush the scene like full background@60% */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background/80 via-background/25 to-transparent pointer-events-none z-[2]" />
    </section>
  );
};

export default HeroSection;
