import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
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
  const filledAuthorSlots = about.authorSlots.filter((s) => s.body.trim().length > 0);

  return (
    <section
      id="about"
      className="relative overflow-hidden px-4 py-28 sm:px-8 lg:px-12 xl:px-16"
    >
      {/* Top-only carryover from the hero so the heading scene blends into About */}
      <div
        className="absolute inset-x-0 top-0 h-[44%] bg-cover bg-center bg-no-repeat opacity-[0.13] pointer-events-none"
        style={{ backgroundImage: "url(/background.png)" }}
      />
      {/* Fade quickly into the same plain field used by the projects section */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/52 via-background/88 to-background pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_72%_48%_at_50%_14%,_hsl(165_90%_42%_/_0.04)_0%,_transparent_62%)] pointer-events-none" />

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
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-8 tracking-tight text-balance max-w-2xl">
              {about.headline}
            </h2>

            <div className="space-y-8 text-base leading-relaxed text-foreground/70 max-w-xl">
              {about.bioBlocks.map((block, i) => (
                <div key={`bio-${block.kicker}-${i}`} className="space-y-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric/85">
                    {block.kicker}
                  </p>
                  <p>{block.body}</p>
                </div>
              ))}

              {filledAuthorSlots.length > 0 && (
                <div className="space-y-8 pt-10 mt-2 border-t border-border/40">
                  {filledAuthorSlots.map((block, i) => (
                    <div key={`author-${block.kicker}-${i}`} className="space-y-2">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric/85">
                        {block.kicker}
                      </p>
                      <p>{block.body}</p>
                    </div>
                  ))}
                </div>
              )}
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
