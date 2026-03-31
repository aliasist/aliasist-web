import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { playClick, playHover } from "@/hooks/useSound";
import logo from "@/assets/logo-transparent.png";
import datasistHero from "@/assets/hero-banner.png";

const DATASIST_URL = "https://datasist-frontend.pages.dev";

const stats = [
  { value: "48", label: "Facilities Tracked" },
  { value: "13", label: "Countries" },
  { value: "Live", label: "EIA Grid Data" },
  { value: "AI", label: "Groq Analysis" },
];

const features = [
  "Interactive world map with 48+ AI data centers",
  "Real-time EIA electricity prices per state",
  "Estimated annual electricity costs per facility",
  "Power consumption, water usage & investment data",
  "Community resistance & environmental impact reports",
  "Grid stress risk assessment by region",
  "Groq-powered AI chat for facility analysis",
  "Facility comparison mode",
  "Region & operator filters",
  "Full admin CRUD panel",
];

const DataSistPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <Link
          to="/"
          onClick={() => playClick()}
          className="flex items-center gap-3 group"
        >
          <img src={logo} alt="Aliasist" className="h-7 w-auto group-hover:drop-shadow-[0_0_6px_hsl(165_90%_42%_/_0.5)] transition-all" />
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground group-hover:text-foreground transition-colors">
            ← Back
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">Aliasist /</span>
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-electric font-semibold">DataSist</span>
          <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-electric ml-1">
            <span className="h-1.5 w-1.5 rounded-full bg-electric animate-pulse" />
            Live
          </span>
        </div>

        <a
          href={DATASIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => playHover()}
          onClick={() => playClick()}
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-electric text-background font-mono text-xs uppercase tracking-[0.12em] rounded-sm hover:bg-electric/85 transition-all"
        >
          Launch App ↗
        </a>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden grid-bg">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.08] pointer-events-none"
          style={{ backgroundImage: `url(${datasistHero})` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,_hsl(165_90%_42%_/_0.07)_0%,_transparent_70%)] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="block w-10 h-px bg-electric/50" />
              <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-electric/70">
                Aliasist Suite — Intelligence Platform
              </p>
              <span className="block w-10 h-px bg-electric/50" />
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-foreground mb-4 leading-none">
              Data<span className="text-electric">Sist</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
              AI Data Center Intelligence Platform
            </p>
            <p className="text-sm text-muted-foreground/60 mb-10 max-w-xl mx-auto leading-relaxed">
              Track 48+ AI data centers across 13 countries. Real-time power consumption,
              electricity costs, water usage, community impact, and grid stress risk —
              all in one map.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={DATASIST_URL}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => playHover()}
                onClick={() => playClick()}
                className="group relative px-8 py-3.5 bg-electric text-background font-mono text-xs uppercase tracking-[0.14em] rounded-sm overflow-hidden transition-all hover:-translate-y-0.5"
              >
                <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative">Launch DataSist ↗</span>
              </a>
              <a
                href="https://github.com/aliasist/datasist"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => playHover()}
                onClick={() => playClick()}
                className="px-8 py-3.5 border border-border text-foreground/70 font-mono text-xs uppercase tracking-[0.14em] rounded-sm hover:border-electric/50 hover:text-electric transition-all hover:-translate-y-0.5"
              >
                View on GitHub ↗
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-border/50 bg-card">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-0.5">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="text-center py-8 px-4"
            >
              <div className="text-3xl font-bold text-electric mb-1">{s.value}</div>
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="classified-divider mb-12"
          >
            <span>Feature Set // Capabilities</span>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-0.5">
            {features.map((f, i) => (
              <motion.div
                key={f}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                onMouseEnter={() => playHover()}
                className="flex items-start gap-3 px-5 py-4 bg-card border border-border hover:border-electric/30 transition-colors group"
              >
                <span className="text-electric mt-0.5 group-hover:scale-110 transition-transform">◈</span>
                <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors">{f}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stack */}
      <section className="py-16 px-6 bg-card border-t border-border/50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/50 mb-6">// built with</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["React", "Vite", "TypeScript", "Leaflet.js", "Recharts", "Cloudflare Workers", "D1 Database", "EIA API", "Groq AI", "LLaMA 3.3"].map(t => (
              <span key={t} className="px-3 py-1.5 text-xs font-mono bg-background text-foreground/50 border border-border rounded-sm hover:border-electric/40 hover:text-foreground transition-colors">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-foreground text-background text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-4">Ready to explore?</h2>
          <p className="text-background/60 font-mono text-sm mb-8">The data is live. The map is waiting.</p>
          <a
            href={DATASIST_URL}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => playHover()}
            onClick={() => playClick()}
            className="inline-flex items-center gap-2 px-10 py-4 bg-electric text-background font-mono text-xs uppercase tracking-[0.14em] rounded-sm hover:bg-electric/85 transition-all hover:-translate-y-0.5"
          >
            Launch DataSist ↗
          </a>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 bg-foreground border-t border-background/10 text-center">
        <p className="font-mono text-[10px] text-background/25 uppercase tracking-[0.15em]">
          DataSist · Part of the <Link to="/" className="hover:text-electric transition-colors">Aliasist</Link> Suite · dev@aliasist.com
        </p>
      </footer>
    </div>
  );
};

export default DataSistPage;
