import { motion } from "framer-motion";
import { playHover, playScan } from "@/hooks/useSound";
import { useEffect, useRef, useState } from "react";

const skills = [
  "Python", "JavaScript", "HTML / CSS",
  "UI Design", "CLI Tools", "File Automation",
  "Security Research", "AiSec (Learning)", "React / Vite", "Node.js",
];

const stats = [
  { num: "10+", label: "Years coding since childhood", sym: "+" },
  { num: "2×",  label: "Languages — Python & JS",      sym: "×" },
  { num: "1→",  label: "Clear target: AiSec",           sym: "→" },
  { num: "∞",   label: "Problems left to solve",         sym: "∞" },
];

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const skillItem = {
  hidden: { opacity: 0, scale: 0.85 },
  show:   { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } },
};

function useScanOnView() {
  const ref = useRef<HTMLDivElement>(null);
  const [fired, setFired] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired) {
          playScan();
          setFired(true);
        }
      },
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
    <section id="about" className="py-28 px-6 bg-card relative">
      <div className="max-w-5xl mx-auto">
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
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-8 tracking-tight">
              Origin file.
            </h2>

            <div className="space-y-5 text-base leading-relaxed text-foreground/65">
              <p>
                I've been poking at code since I was a kid —{" "}
                <strong className="text-foreground font-semibold">HTML, CSS, Python</strong>.
                Always a passion project. The advent of AI changed the
                trajectory entirely — this is the frontier I want to be on.
              </p>
              <p>
                Currently studying{" "}
                <strong className="text-foreground font-semibold">Computer Information Systems</strong>,
                building open-source security tools, and learning the adversarial
                side of machine learning. Aliasist is where I ship real things
                while I work toward that goal.
              </p>
              <p>
                The tools change.{" "}
                <strong className="text-foreground font-semibold">The obsession doesn't.</strong>
              </p>
            </div>

            {/* Path badge */}
            <motion.div
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="mt-8 inline-flex items-center gap-2 bg-foreground text-electric font-mono text-xs px-4 py-2.5 tracking-[0.12em] uppercase"
            >
              ◈ Path: CIS → CS → AiSec
            </motion.div>

            {/* Skills */}
            <div className="mt-10" ref={skillsRef}>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
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
                    className="px-3 py-1.5 text-xs font-mono bg-background text-foreground/65 border border-border rounded-sm hover:border-electric/50 hover:text-electric hover:bg-electric/5 transition-all cursor-default"
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
            transition={{ duration: 0.6, delay: 0.12 }}
            className="flex flex-col gap-0.5"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onMouseEnter={() => playHover()}
                className="group bg-background border-l-2 border-transparent hover:border-electric px-8 py-7 transition-all duration-300 hover:bg-card hover:shadow-[inset_4px_0_0_hsl(165_90%_42%_/_0.15)]"
              >
                <div className="text-5xl font-bold tracking-tight text-foreground mb-1">
                  {s.sym === "∞" ? (
                    <span className="text-electric">∞</span>
                  ) : (
                    <>
                      <span>{s.num.replace(/[+×→∞]/g, "")}</span>
                      <span className="text-electric">{s.sym}</span>
                    </>
                  )}
                </div>
                <div className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground group-hover:text-foreground/70 transition-colors">
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
