import { motion } from "framer-motion";
import { playHover, playScan } from "@/hooks/useSound";
import { useEffect, useRef, useState } from "react";
import mascot from "../../images/aliasist-mascot-final.png";

const skills = [
  "Python", "JavaScript", "HTML / CSS",
  "React / Vite", "Node.js", "UI Design",
  "CLI Tools", "File Automation",
  "Security Research", "AiSec (Learning)",
];

const stats = [
  { num: "10+", label: "Years coding since childhood", sym: "+" },
  { num: "5",   label: "Live apps in the Aliasist suite", sym: "" },
  { num: "1→",  label: "Clear target: AiSec",           sym: "→" },
  { num: "∞",   label: "Problems left to solve",         sym: "∞" },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const skillItem = {
  hidden: { opacity: 0, scale: 0.8, y: 8 },
  show:   { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 22 } },
};

function useScanOnView() {
  const ref = useRef<HTMLDivElement>(null);
  const [fired, setFired] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !fired) { playScan(); setFired(true); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [fired]);
  return ref;
}

const AboutSection = () => {
  const skillsRef = useScanOnView();

  return (
    <section id="about" className="py-28 px-6 bg-card relative overflow-hidden">
      {/* Atmospheric background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: `url(${mascot})` }}
      />
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-electric/[0.03] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="classified-divider mb-16"
        >
          <span>Dossier // About</span>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left — bio */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-8 tracking-tight">
              Origin file.
            </h2>

            <div className="space-y-5 text-base leading-relaxed text-foreground/60">
              <p>
                I've been poking at code since I was a kid —{" "}
                <strong className="text-foreground/90 font-semibold">HTML, CSS, Python</strong>.
                Always a passion project. The advent of AI changed the
                trajectory entirely — this is the frontier I want to be on.
              </p>
              <p>
                Currently studying{" "}
                <strong className="text-foreground/90 font-semibold">Computer Information Systems</strong>,
                learning the adversarial side of machine learning, and building open-source tools. Aliasist is where I ship real things while I work toward that goal.
              </p>
              <p>
                The tools change.{" "}
                <strong className="text-foreground/90 font-semibold">The obsession doesn't.</strong>
              </p>
            </div>

            {/* Path badge */}
            <motion.div
              whileHover={{ x: 6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="mt-8 inline-flex items-center gap-2 bg-foreground text-electric font-mono text-xs px-4 py-2.5 tracking-[0.12em] uppercase cursor-default"
            >
              ◈ Path: CIS → CS → AiSec
            </motion.div>

            {/* Skills */}
            <div className="mt-10" ref={skillsRef}>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground/60 mb-5">
                // skill_set
              </p>
              <motion.div
                className="flex flex-wrap gap-2"
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                {skills.map((skill) => (
                  <motion.span
                    key={skill}
                    variants={skillItem}
                    onMouseEnter={() => playHover()}
                    className="px-3 py-1.5 text-xs font-mono bg-background/60 text-foreground/60 border border-border rounded-sm hover:border-electric/60 hover:text-electric hover:bg-electric/5 transition-all duration-200 cursor-default"
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
            {stats.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onMouseEnter={() => playHover()}
                className="group relative bg-background border-l-2 border-transparent hover:border-electric px-8 py-7 transition-all duration-300 hover:bg-card overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-electric/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative text-5xl font-bold tracking-tight text-foreground mb-1.5">
                  {s.sym === "∞" ? (
                    <span className="text-electric">∞</span>
                  ) : s.sym ? (
                    <>
                      <span>{s.num.replace(/[+×→∞]/g, "")}</span>
                      <span className="text-electric">{s.sym}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-electric">{s.num}</span>
                    </>
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
