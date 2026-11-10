import { motion } from "framer-motion";
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


const AboutSection = () => {
  const filledAuthorSlots = about.authorSlots.filter((s) => s.body.trim().length > 0);

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative overflow-hidden px-4 py-28 sm:px-8 lg:px-12 xl:px-16"
    >
      <div className="relative z-10 mx-auto w-full max-w-site">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="section-divider mb-16"
        >
          <span>{about.dividerLabel}</span>
        </motion.div>

        <div className="grid items-start gap-16 md:grid-cols-2 xl:gap-24">
          {/* Left, bio */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 id="about-heading" className="mb-4 max-w-2xl text-3xl font-bold text-foreground sm:text-4xl">
              {about.headline}
            </h2>

            <div className="readable-copy space-y-8 text-foreground/75">
              {about.bioBlocks.map((block, i) => (
                <div key={`bio-${block.kicker}-${i}`} className="space-y-2">
                  <p className="text-xs text-electric/85">
                    {block.kicker}
                  </p>
                  <p>{block.body}</p>
                </div>
              ))}

              {filledAuthorSlots.length > 0 && (
                <div className="space-y-8 pt-10 mt-2 border-t border-border/40">
                  {filledAuthorSlots.map((block, i) => (
                    <div key={`author-${block.kicker}-${i}`} className="space-y-2">
                      <p className="text-xs text-electric/85">
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
              className="mt-8 inline-flex items-center gap-2 bg-foreground text-electric text-sm px-4 py-2.5 cursor-default"
            >
              {about.pathBadge}
            </motion.div>

            {/* Skills */}
            <div className="mt-10">
              <p className="text-sm text-muted-foreground/60 mb-5">
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

          {/* Right, stats */}
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
                className="group relative bg-background border-l-2 border-transparent hover:border-electric px-8 py-7 transition-colors duration-200 hover:bg-card overflow-hidden"
              >
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
                <div className="relative text-sm text-muted-foreground group-hover:text-foreground/70 transition-colors duration-300">
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
