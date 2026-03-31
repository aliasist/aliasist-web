import { motion } from "framer-motion";
import { playHover, playClick } from "@/hooks/useSound";
import pulseBanner from "@/assets/pulse-banner-command.jpg";
import abduction1 from "@/assets/abduction-1.jpg";
import tikaLogo from "@/assets/tikasist-logo.png";
import { useAIImage, type AIImageType } from "@/hooks/useAIImage";

const releaseTag = "#v2.7.0";
const releaseBaseUrl = `https://github.com/aliasist/aliasistabductor/releases/download/${releaseTag}`;

const downloadLinks = {
  appImage: `${releaseBaseUrl}/${encodeURIComponent("Aliasist.Files.Abductor-2.7.0.AppImage")}`,
  snap:     `${releaseBaseUrl}/aliasist-files-abductor_2.7.0_amd64.snap`,
  windowsExe: `${releaseBaseUrl}/${encodeURIComponent("Aliasist.Files.Abductor.Setup.2.7.0.exe")}`,
};

const projects = [
  {
    name: "TikaSist",
    description:
      "TikTok keyword intelligence platform — track hashtags, creators, and topics. Run automated scans, collect matching videos with full engagement metrics (likes, comments, shares, saves), browse results in a searchable grid, and monitor scan history. Built on Cloudflare Workers + D1.",
    tech: ["Vite", "Cloudflare Workers", "D1", "TikTok", "Keyword AI"],
    github: "https://github.com/aliasist",
    downloads: [],
    status: "Live",
    icon: "👁️",
    link: "https://tikasist.pages.dev",
    linkLabel: "Open TikaSist →",
    banner: tikaLogo,
    aiType: "project-tikasist" as AIImageType,
  },
  {
    name: "SpaceSist",
    description:
      "Live space intelligence portal — NASA APOD daily images, real-time ISS tracking (5s updates), SpaceX mission control, near-Earth asteroid radar, 6,000+ exoplanet archive, and NASA image gallery. 7 live APIs. The universe, in real time.",
    tech: ["React", "Vite", "NASA APIs", "SpaceX API", "Leaflet", "Cloudflare"],
    github: "https://github.com/aliasist",
    downloads: [],
    status: "Live",
    icon: "🌌",
    link: "https://space.aliasist.com",
    linkLabel: "Open SpaceSist →",
    banner: null,
    aiType: "project-spacesist" as AIImageType,
  },
  {
    name: "PulseSist",
    description:
      "Real-time stock market intelligence platform. Live candlestick charts, portfolio tracking, AI-powered market analysis, and multi-ticker surveillance. Built for traders who think the market is being watched — because it is.",
    tech: ["React", "Vite", "Cloudflare Workers", "D1", "FMP API", "AI"],
    github: "https://github.com/aliasist/stockmarket",
    downloads: [],
    status: "Live",
    icon: "📈",
    link: "https://pulse.aliasist.com",
    linkLabel: "Open PulseSist →",
    banner: pulseBanner,
    aiType: "project-pulsesist" as AIImageType,
  },
  {
    name: "Aliasist-Files-Abductor",
    description:
      "A file organization and automation tool that abducts your messy directories and deposits them exactly where they belong. Built with a clean CLI interface and an alien theme that doesn't apologize for itself. Does the work. No questions asked.",
    tech: ["Python", "CLI", "File Automation"],
    github: `https://github.com/aliasist/aliasistabductor/releases/tag/${releaseTag}`,
    downloads: [
      { label: "AppImage", href: downloadLinks.appImage },
      { label: "Snap",     href: downloadLinks.snap },
      { label: "Windows",  href: downloadLinks.windowsExe },
    ],
    status: "Live",
    icon: "🛸",
    link: null as string | null,
    linkLabel: null as string | null,
    banner: abduction1,
    aiType: "project-generic" as AIImageType,
  },
  {
    name: "DataSist",
    description:
      "Live AI data center intelligence platform — 48 facilities tracked across 13 countries. Real-time EIA electricity prices, power consumption, water usage, investment data, community resistance, and grid stress risk. Groq AI analysis, facility comparison, region filters, and full admin CRUD panel.",
    tech: ["React", "Vite", "D1", "Groq AI", "Leaflet", "EIA API"],
    github: "https://github.com/aliasist/datasist",
    downloads: [],
    status: "Live",
    icon: "🌐",
    link: "https://datasist-frontend.pages.dev",
    linkLabel: "Open DataSist →",
    banner: null,
    aiType: "project-datasist" as AIImageType,
  },
];

const comingSoon = [
  {
    codename: "PROJECT CIPHER",
    description: "// adversarial_ml_toolkit — pending clearance",
    eta: "Q3 2026",
  },
  {
    codename: "PROJECT SPECTER",
    description: "// ai_threat_modeling_suite — in development",
    eta: "Q4 2026",
  },
];

// Per-card component so each card can independently call useAIImage
const ProjectCard = ({ project, index }: { project: typeof projects[0]; index: number }) => {
  const { src: aiSrc } = useAIImage(project.aiType, { width: 1200, height: 600 });

  return (
    <motion.div
      key={project.name}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.1 }}
      onMouseEnter={() => playHover()}
      className="relative bg-foreground text-background p-8 sm:p-12 overflow-hidden group"
    >
      {/* Static fallback banner — always present at base opacity */}
      {project.banner && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: `url(${project.banner})` }}
        />
      )}

      {/* AI-generated banner — fades in over the fallback, intensifies on hover */}
      {aiSrc && (
        <motion.div
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: `url(${aiSrc})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.12 }}
          whileHover={{ opacity: 0.22 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      )}

      {/* Teal glow on hover */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(165_90%_42%_/_0.08)_0%,_transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Background icon */}
      <div className="absolute top-8 right-10 text-7xl opacity-[0.07] select-none group-hover:opacity-[0.12] transition-opacity duration-500">
        {project.icon}
      </div>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-electric">
          <span className="w-1.5 h-1.5 rounded-full bg-electric animate-pulse" />
          {project.status}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-background/25">
          — Featured
        </span>
      </div>

      <h3 className="relative z-10 text-2xl sm:text-3xl font-bold text-background mb-4 font-mono tracking-tight">
        {project.name}
      </h3>
      <p className="relative z-10 text-sm text-background/60 leading-relaxed mb-8 max-w-2xl">
        {project.description}
      </p>

      <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          {project.tech.map((t) => (
            <span key={t} className="px-3 py-1 text-[11px] font-mono bg-background/10 text-background/65 border border-background/10 rounded-sm">
              {t}
            </span>
          ))}
        </div>
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playClick()}
          className="font-mono text-xs uppercase tracking-[0.1em] text-electric hover:text-electric/70 transition-colors"
        >
          GitHub ↗
        </a>
      </div>

      {project.downloads.length > 0 && (
        <div className="relative z-10 flex gap-4 flex-wrap mt-6 pt-6 border-t border-background/10">
          {project.downloads.map((d) => (
            <a
              key={d.label}
              href={d.href}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => playHover()}
              onClick={() => playClick()}
              className="font-mono text-xs uppercase tracking-[0.1em] text-background/60 hover:text-electric transition-colors"
            >
              ↧ {d.label}
            </a>
          ))}
        </div>
      )}

      {project.link && (
        <div className="relative z-10 mt-6">
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => playHover()}
            onClick={() => playClick()}
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] bg-electric text-background px-5 py-2.5 rounded-sm hover:bg-electric/85 transition-all hover:-translate-y-0.5"
          >
            {project.linkLabel}
          </a>
        </div>
      )}
    </motion.div>
  );
};

const ProjectsSection = () => {
  return (
    <section id="projects" className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="classified-divider mb-16"
        >
          <span>Artifacts // Projects</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-foreground mb-12 tracking-tight"
        >
          Deployed tools.
        </motion.h2>

        <div className="grid gap-0.5">
          {projects.map((project, i) => (
            <ProjectCard key={project.name} project={project} index={i} />
          ))}

          {/* Classified coming-soon slots */}
          <div className="grid sm:grid-cols-2 gap-0.5 mt-0.5">
            {comingSoon.map((item, i) => (
              <motion.div
                key={item.codename}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onMouseEnter={() => playHover()}
                className="relative border border-dashed border-border p-10 flex flex-col items-start justify-between min-h-[180px] bg-card group overflow-hidden hover:border-electric/30 transition-colors"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute top-0 left-0 right-0 h-px bg-electric/20" />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-electric/20" />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric/60 mb-3">
                    ▓▓▓ CLASSIFIED ▓▓▓
                  </p>
                  <p className="font-mono text-sm font-bold text-foreground/50 tracking-tight mb-2">
                    {item.codename}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground/60">
                    {item.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-electric/40 animate-pulse" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50">
                    ETA: {item.eta}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
