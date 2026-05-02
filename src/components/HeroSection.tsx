import { motion } from "framer-motion";
import AlienEye from "./AlienEye";
import badge from "@/assets/aliasist-diff-logo.png";
import aliasistIcon from "@/assets/aliasist-logo-brand.svg";
import mascot from "@/assets/blue-logo.svg";
import { hero } from "@/content/homepage";
import { HomeGoogleAuth } from "@/components/HomeGoogleAuth";

const HeroSection = () => {
  return (
    <section
      id="top"
      className="relative flex min-h-[100dvh] min-h-screen items-center justify-center grid-bg overflow-hidden scanlines"
    >
      {/* Background photo — was opacity 0.10 (very dim); radials/scanlines sit above; bottom fade also darkens lower third */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.26] pointer-events-none"
        style={{ backgroundImage: "url(/background.png)" }}
      />

      {/* Layered radial glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_35%,_hsl(165_90%_42%_/_0.06)_0%,_transparent_65%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_80%,_hsl(165_90%_42%_/_0.04)_0%,_transparent_70%)] pointer-events-none" />

      {/* Top-right signal badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute top-24 right-4 hidden items-center gap-2 rounded-sm border border-electric/20 bg-background/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground shadow-electric-xs backdrop-blur-md sm:right-8 sm:flex lg:right-12 xl:right-16"
      >
        <span className="text-electric animate-pulse">▮</span>
        {hero.statusBadge}
      </motion.div>

      {/* Glossy alien icon — bottom right atmospheric */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1.5 }}
        className="pointer-events-none absolute bottom-12 right-4 hidden lg:block xl:right-12 2xl:right-16"
      >
        <img
          src={aliasistIcon}
          alt=""
          className="w-24 h-24 rounded-xl opacity-[0.12] hover:opacity-[0.22] transition-opacity duration-700 object-cover"
        />
      </motion.div>

      {/* Mascot: aliasist, — logo design ideas (desktop) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7, rotate: 8 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.9, duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-2 lg:flex xl:right-12 2xl:right-16"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <div className="absolute -inset-3 rounded-full border border-electric/25 animate-pulse pointer-events-none" />
          <img
            src={mascot}
            alt="Aliasist Logo Draft Ideas"
            title="Aliasist Logo Draft Ideas"
            className="w-44 h-44 xl:w-52 xl:h-52 rounded-full object-cover border-2 border-electric/50 shadow-electric-sm hover:shadow-electric-md hover:scale-105 transition-all duration-500 cursor-pointer select-none"
          />
        </motion.div>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-electric/50 text-center">
          {hero.mascotLabel}
        </p>
      </motion.div>

      <div className="relative z-10 mx-auto w-full max-w-site px-4 text-center sm:px-8 lg:px-12 xl:px-16">

        {/* Eye */}
        <motion.div
          className="flex justify-center mb-10"
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="translate-y-16 sm:translate-y-20">
            <AlienEye />
          </div>
        </motion.div>

        <div className="translate-y-10 sm:translate-y-12">
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
                alt={hero.mascotAlt}
                title={hero.mascotTitle}
                className="w-24 h-24 rounded-full object-cover border-2 border-electric/50 shadow-electric-xs select-none"
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
              {hero.eyeline}
            </p>
            <span className="block w-12 h-px bg-gradient-to-l from-transparent to-electric/60" />
          </motion.div>

          {/* Wordmark */}
          <motion.h1
            className="glitch-text text-6xl sm:text-8xl md:text-[9rem] font-bold tracking-tight text-foreground mb-5 leading-none select-none"
            data-text={hero.wordmark}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {hero.wordmark}
          </motion.h1>

          {/* Tagline */}
          <motion.p
            className="font-mono text-[11px] uppercase tracking-[0.24em] text-electric/60 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
          >
            {hero.tagline}
          </motion.p>

          {/* Sub copy */}
          <motion.p
            className="mx-auto mb-12 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg xl:max-w-2xl"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            {hero.subcopy}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.6 }}
            className="hero-cta-group flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#projects"
              className="group relative px-8 py-3.5 bg-electric text-background font-mono text-xs uppercase tracking-[0.14em] rounded-sm overflow-hidden shadow-electric-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-electric-md active:scale-95"
            >
              <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative">{hero.ctaWork}</span>
            </a>
            <a
              href="#contact"
              className="px-8 py-3.5 border border-border/60 text-foreground/80 font-mono text-xs uppercase tracking-[0.14em] rounded-sm hover:border-electric/60 hover:text-electric hover:bg-electric/5 hover:shadow-electric-outline transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            >
              {hero.ctaContact}
            </a>
          </motion.div>

          <HomeGoogleAuth />
        </div>

        {/* Status row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-5 mt-16 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/30"
        >
          {hero.statusRow.map((t, i) => (
            <span key={t} className="flex items-center gap-5">
              {i > 0 && <span className="w-1 h-1 rounded-full bg-border/60" />}
              {t}
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.35, duration: 0.8 }}
          className="flex justify-center mt-10"
        >
          <img
            src={badge}
            alt=""
            className="w-24 h-24 opacity-[0.15] hover:opacity-30 transition-opacity duration-700"
          />
        </motion.div>
      </div>

      {/* Bottom fade — softer so it doesn’t crush the scene like full background@60% */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background/80 via-background/25 to-transparent pointer-events-none z-[2]" />
    </section>
  );
};

export default HeroSection;
