import { motion } from "framer-motion";
import AlienEye from "./AlienEye";
import { playClick } from "@/hooks/useSound";
import heroBanner from "@/assets/hero-banner.png";
import badge from "@/assets/badge.png";
import aliasistIcon from "@/assets/logo.png";
import mascot from "@/assets/mascot.png";
const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center grid-bg overflow-hidden scanlines">
      {/* Static banner */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.10] pointer-events-none"
        style={{ backgroundImage: `url(${heroBanner})` }}
      />

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

      {/* Glossy alien icon — bottom right atmospheric */}
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

      {/* Mascot: aliasist, the cowboy alien — hero right side (desktop) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7, rotate: 8 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.9, duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        className="absolute right-6 xl:right-14 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-2 z-20"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <div className="absolute -inset-3 rounded-full border border-electric/25 animate-pulse pointer-events-none" />
          <img
            src={mascot}
            alt="Meet our mascot: aliasist, the cowboy alien!"
            title="Meet our mascot: aliasist, the cowboy alien!"
            className="w-44 h-44 xl:w-52 xl:h-52 rounded-full object-cover border-2 border-electric/50 shadow-[0_0_24px_hsl(165_90%_42%_/_0.35)] hover:shadow-[0_0_48px_hsl(165_90%_42%_/_0.55)] hover:scale-105 transition-all duration-500 cursor-pointer select-none"
          />
        </motion.div>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-electric/50 text-center">
          aliasist // cowboy alien
        </p>
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

        {/* Mascot — mobile only (centered, below the eye) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          className="flex lg:hidden justify-center mb-8"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="absolute -inset-2 rounded-full border border-electric/25 animate-pulse pointer-events-none" />
            <img
              src={mascot}
              alt="Meet our mascot: aliasist, the cowboy alien!"
              title="Meet our mascot: aliasist, the cowboy alien!"
              className="w-24 h-24 rounded-full object-cover border-2 border-electric/50 shadow-[0_0_16px_hsl(165_90%_42%_/_0.3)] select-none"
            />
          </motion.div>
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
          {["Open Source", "AI Security", "4 Live Apps"].map((t, i) => (
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
