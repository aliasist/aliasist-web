import { motion } from "framer-motion";
import AlienEye from "./AlienEye";
import { playClick } from "@/hooks/useSound";
import heroBanner from "@/assets/hero-banner.png";
import badge from "@/assets/badge.png";
import aliasistIcon from "@/assets/aliasist-icon.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center grid-bg overflow-hidden scanlines">
      {/* Hero banner background — very subtle, mostly dark */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.12] pointer-events-none"
        style={{ backgroundImage: `url(${heroBanner})` }}
      />
      {/* Radial gradient centered on eye */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_40%,_hsl(165_90%_42%_/_0.07)_0%,_transparent_70%)] pointer-events-none" />

      {/* Top-right signal badge */}
      <div className="absolute top-24 right-6 sm:right-12 hidden sm:flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground border border-border/60 px-3 py-1.5 bg-background/40 backdrop-blur-sm">
        <span className="text-electric animate-pulse">▮</span>
        Systems Operational // Q2 2026
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">

        {/* Eye — above the wordmark */}
        <motion.div
          className="flex justify-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
        >
          <AlienEye />
        </motion.div>

        {/* Eyeline label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <span className="block w-10 h-px bg-electric/60" />
          <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-electric">
            AI Security & Adversarial Defense
          </p>
          <span className="block w-10 h-px bg-electric/60" />
        </motion.div>

        {/* Wordmark */}
        <motion.h1
          className="glitch-text text-6xl sm:text-8xl md:text-[9rem] font-bold tracking-tight text-foreground mb-6 leading-none select-none"
          data-text="ALIASIST"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          ALIASIST
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="font-mono text-xs uppercase tracking-[0.22em] text-electric/70 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.6 }}
        >
          Adversarial by Nature. Defensive by Design.
        </motion.p>

        {/* Sub copy */}
        <motion.p
          className="text-base text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6 }}
        >
          Building the tools that find the gaps before they do.
          Open-source AI security, automation, and adversarial tooling.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#projects"
            onClick={() => playClick()}
            className="electric-pulse px-8 py-3.5 bg-electric text-background font-mono text-xs uppercase tracking-[0.12em] rounded-sm hover:bg-electric/85 transition-all hover:-translate-y-0.5 active:scale-95"
          >
            View My Work
          </a>
          <a
            href="#contact"
            onClick={() => playClick()}
            className="px-8 py-3.5 border border-border text-foreground font-mono text-xs uppercase tracking-[0.12em] rounded-sm hover:border-electric/50 hover:text-electric transition-all hover:-translate-y-0.5 active:scale-95"
          >
            Contact Me
          </a>
        </motion.div>

        {/* Bottom status row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="flex items-center justify-center gap-6 mt-16 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40"
        >
          <span>Open Source</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>AI Security</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>Aliasist Suite</span>
        </motion.div>
      </div>

      {/* Roswell badge watermark — bottom left */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-16 left-8 hidden lg:block pointer-events-none"
      >
        <img
          src={badge}
          alt="Aliasist Roswell Badge"
          className="w-28 h-28 opacity-20 hover:opacity-40 transition-opacity duration-500"
        />
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
