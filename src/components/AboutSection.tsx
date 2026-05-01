import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import mascot from "@/assets/mascot.png";
import { about } from "@/content/homepage";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const skillItem = {
  hidden: { opacity: 0, scale: 0.8, y: 8 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 280, damping: 22 },
  },
};

function useScanOnView() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(() => {}, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

const AboutSection = () => {
  const skillsRef = useScanOnView();

  return (
    <section id="about" className="relative overflow-hidden bg-card px-4 py-28 sm:px-8 lg:px-12 xl:px-16">
      {/* Atmospheric background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: `url(${mascot})` }}
      />
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-electric/[0.03] pointer-events-none" />

      <div className="relative z-10 mx-auto w-full max-w-site">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="classified-divider mb-16"
        >
          <span>{about.dividerLabel}</span>
        </motion.div>

        <div className="grid items-start gap-16 md:grid-cols-2 xl:gap-24">
          {/* Left — bio */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-8 tracking-tight">
              {about.headline}
            </h2>

            <div className="space-y-5 text-base leading-relaxed text-foreground/60">
              <p>
                {about.bio.p1Before}
                <strong className="text-foreground/90 font-semibold">{about.bio.p1Strong}</strong>
                {about.bio.p1After}
              </p>
              <p>
                {about.bio.p2Before}
                <strong className="text-foreground/90 font-semibold">{about.bio.p2Strong}</strong>
                {about.bio.p2After}
              </p>
              <p>
                {about.bio.p3Before}
                <strong className="text-foreground/90 font-semibold">{about.bio.p3Strong}</strong>
                {about.bio.p3After}
              </p>
            </div>

            {/* Path badge */}
            <motion.div
              whileHover={{ x: 6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="mt-8 inline-flex items-center gap-2 bg-foreground text-electric font-mono text-xs px-4 py-2.5 tracking-[0.12em] uppercase cursor-default"
            >
              {about.pathBadge}
            </motion.div>

            {/* Skills */}
            <div className="mt-10" ref={skillsRef}>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground/60 mb-5">
                {about.skillsLabel}
              </p>
              <motion.div
                className="flex flex-wrap gap-2"
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                {about.skills.map((skill) => (
                  <motion.span
                    key={skill}
                    variants={skillItem}
                    className="px-3 py-1.5 text-xs font-mono bg-background/60 text-foreground/60 border border-border rounded-sm hover:border-electric/60 hover:text-electric hover:bg-electric/5 hover:shadow-electric-xs transition-[colors,background-color,border-color,box-shadow] duration-200 cursor-default"
                  >
                    {skill}
                  </motion.span>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Right — stats */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-px"
          >
            {about.stats.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative bg-background border-l-2 border-transparent hover:border-electric px-8 py-7 transition-all duration-300 hover:bg-card hover:shadow-electric-sm overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-electric/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative text-5xl font-bold tracking-tight text-foreground mb-1.5">
                  {s.sym ? (
                    <>
                      <span>{s.num.replace(/[+×→∞]/g, "")}</span>
                      <span className="text-electric">{s.sym}</span>
                    </>
                  ) : (
                    <span className="text-electric">{s.num}</span>
                  )}
                </div>
                <div className="relative font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground group-hover:text-foreground/70 transition-colors duration-300">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
