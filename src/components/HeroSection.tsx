import { motion } from "framer-motion";
import AlienEye from "./AlienEye";
import { playClick } from "@/hooks/useSound";
import heroBanner from "@/assets/hero-banner.png";
import badge from "@/assets/badge.png";
import aliasistIcon from "@/assets/aliasist-icon.jpg";
import { useAIImage } from "@/hooks/useAIImage";

const HeroSection = () => {
  // AI-generated banner — unique on every visit, falls back to static asset
  const { src: aiBanner, loading: bannerLoading } = useAIImage("hero");

  return (
    <section className="relative min-h-screen flex items-center justify-center grid-bg overflow-hidden scanlines">
      {/* Static fallback banner — always visible at base opacity */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.10] pointer-events-none"
        style={{ backgroundImage: `url(${heroBanner})` }}
      />

      {/* AI-generated banner — fades in over the static one */}
      {aiBanner && (
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: `url(${aiBanner})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: bannerLoading ? 0 : 0.18 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        />
      )}

      {/* Layered radial glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_35%,_hsl(165_90%_42%_/_0.06)_0%,_transparent_65%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_80%,_hsl(165_90%_42%_/_0.04)_0%,_transparent_70%)] pointer-events-none" />

      {/* Top-right signal badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute top-24 right-6 sm:right-12 hidden sm:flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground border border-border/50 px-3 py-1.5 bg-background/30 backdrop-blur-md"
      >
        <span className="text-electric animate-pulse">▮</span>
        Systems Operational // Q2 2026
      </motion.div>

      {/* New icon — bottom right atmospheric */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1.5 }}
        className="absolute bottom-12 right-8 hidden lg:block pointer-events-none"
      >
        <img
          src={aliasistIcon}
          alt=""
          className="w-24 h-24 rounded-xl opacity-[0.12] hover:opacity-[0.22] transition-opacity duration-700 object-cover"
        />
      </motion.div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">

        {/* Eye */}
        <motion.div
          className="flex justify-center mb-10"
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <AlienEye />
        </motion.div>

        {/* Eyeline label */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <span className="block w-12 h-px bg-gradient-to-r from-transparent to-electric/60" />
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-electric/80">
            AI Security & Adversarial Defense
          </p>
          <span className="block w-12 h-px bg-gradient-to-l from-transparent to-electric/60" />
        </motion.div>

        {/* Wordmark */}
        <motion.h1
          className="glitch-text text-6xl sm:text-8xl md:text-[9rem] font-bold tracking-tight text-foreground mb-5 leading-none select-none"
          data-text="ALIASIST"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          ALIASIST
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="font-mono text-[11px] uppercase tracking-[0.24em] text-electric/60 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.7 }}
        >
          Adversarial by Nature. Defensive by Design.
        </motion.p>

        {/* Sub copy */}
        <motion.p
          className="text-base sm:text-lg text-muted-foreground mb-12 max-w-lg mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          Building the tools that find the gaps before they do.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#projects"
            onClick={() => playClick()}
            className="group relative px-8 py-3.5 bg-electric text-background font-mono text-xs uppercase tracking-[0.14em] rounded-sm overflow-hidden transition-all hover:-translate-y-0.5 active:scale-95"
          >
            <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative">View My Work</span>
          </a>
          <a
            href="#contact"
            onClick={() => playClick()}
            className="px-8 py-3.5 border border-border/60 text-foreground/80 font-mono text-xs uppercase tracking-[0.14em] rounded-sm hover:border-electric/60 hover:text-electric hover:bg-electric/5 transition-all hover:-translate-y-0.5 active:scale-95"
          >
            Contact Me
          </a>
        </motion.div>

        {/* Status row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex items-center justify-center gap-5 mt-16 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/30"
        >
          {["Open Source", "AI Security", "5 Live Apps"].map((t, i) => (
            <span key={t} className="flex items-center gap-5">
              {i > 0 && <span className="w-1 h-1 rounded-full bg-border/60" />}
              {t}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Roswell badge watermark */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1.2 }}
        className="absolute bottom-16 left-8 hidden lg:block pointer-events-none"
      >
        <img src={badge} alt="" className="w-24 h-24 opacity-[0.15] hover:opacity-30 transition-opacity duration-700" />
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
