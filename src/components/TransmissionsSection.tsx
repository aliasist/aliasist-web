import { motion } from "framer-motion";
import { playHover, playTransmit } from "@/hooks/useSound";
import { useEffect, useRef, useState } from "react";

const posts = [
  {
    freq: "FREQ-001",
    tag: "AiSec",
    date: "Coming Soon",
    title: "AiSec, PenTesting, and a mission to fortify the future of AI.",
    excerpt:
      "The threat landscape is shifting. AI systems aren't just targets anymore — they're vectors. Here's what I'm learning about the field I'm building toward.",
  },
  {
    freq: "FREQ-002",
    tag: "Projects",
    date: "Coming Soon",
    title: "Building Aliasist-Files-Abductor: why I made a tool nobody asked for.",
    excerpt:
      "The best tools start as personal itches. This is the story of a messy downloads folder and the alien that fixed it.",
  },
  {
    freq: "FREQ-003",
    tag: "Career",
    date: "Coming Soon",
    title: "Self-taught to CS degree: what nobody tells you about the gap.",
    excerpt:
      "The gap between self-taught instinct and academic rigor is real. Here's how I'm bridging it — and what I'm finding on the other side.",
  },
];

function useTransmitOnView() {
  const ref = useRef<HTMLDivElement>(null);
  const [fired, setFired] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired) {
          playTransmit();
          setFired(true);
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [fired]);
  return ref;
}

const TransmissionsSection = () => {
  const sectionRef = useTransmitOnView();

  return (
    <section id="transmissions" className="py-28 px-6 bg-card" ref={sectionRef}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="classified-divider mb-16"
        >
          <span>Blog // Transmissions</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight"
        >
          Tech is moving fast.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-sm text-muted-foreground font-mono mb-12"
        >
          // transmissions incoming — frequency: weekly(ish)
        </motion.p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0.5">
          {posts.map((post, i) => (
            <motion.div
              key={post.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              onMouseEnter={() => playHover()}
              className="group bg-background border border-border p-7 hover:border-electric/30 transition-all duration-300 cursor-pointer relative overflow-hidden hover:-translate-y-0.5"
            >
              {/* Hover teal line */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-electric scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />

              <div className="flex items-center justify-between mb-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-electric">
                  {post.freq}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {post.date}
                </span>
              </div>

              <div className="mb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground border border-border px-2 py-0.5">
                  {post.tag}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-foreground mb-3 leading-snug group-hover:text-electric transition-colors duration-300">
                {post.title}
              </h3>

              <p className="text-sm text-foreground/50 leading-relaxed mb-6">
                {post.excerpt}
              </p>

              <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-electric flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="animate-pulse">▮</span> Transmission pending ↗
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TransmissionsSection;
