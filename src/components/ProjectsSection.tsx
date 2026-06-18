import { motion } from "framer-motion";
import { playHover, playClick } from "@/hooks/useSound";
import {
  projects,
  comingSoonProjects,
  projectsSection,
  type ProjectCard,
} from "@/content/homepage";
import { AdUnit, AD_SLOTS } from "@/components/AdUnit";

const toneStyles = {
  amber: {
    border: "hover:border-amber-300/35",
    glow:
      "bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--electric)_/_0.1)_0%,_transparent_58%),radial-gradient(ellipse_at_bottom_left,_hsl(42_92%_56%_/_0.13)_0%,_transparent_62%)]",
    edge: "from-electric/0 via-amber-300/45 to-electric/45",
    pill:
      "bg-[linear-gradient(135deg,_hsl(var(--electric)_/_0.08),_hsl(42_92%_56%_/_0.09))] border-amber-300/25 shadow-[inset_0_1px_0_hsl(42_92%_56%_/_0.15)]",
    meta: "border-amber-300/20 text-amber-100/65",
    icon: "text-amber-100/70",
  },
  blue: {
    border: "hover:border-sky-300/35",
    glow:
      "bg-[radial-gradient(ellipse_at_top_right,_hsl(198_92%_55%_/_0.13)_0%,_transparent_58%),radial-gradient(ellipse_at_bottom_left,_hsl(var(--violet)_/_0.11)_0%,_transparent_62%)]",
    edge: "from-sky-300/0 via-sky-300/45 to-violet/45",
    pill:
      "bg-[linear-gradient(135deg,_hsl(198_92%_55%_/_0.08),_hsl(var(--violet)_/_0.08))] border-sky-300/25 shadow-[inset_0_1px_0_hsl(198_92%_55%_/_0.14)]",
    meta: "border-sky-300/20 text-sky-100/65",
    icon: "text-sky-100/70",
  },
  cyan: {
    border: "hover:border-cyan-300/35",
    glow:
      "bg-[radial-gradient(ellipse_at_top_right,_hsl(186_95%_58%_/_0.12)_0%,_transparent_58%),radial-gradient(ellipse_at_bottom_left,_hsl(var(--electric)_/_0.12)_0%,_transparent_62%)]",
    edge: "from-cyan-300/0 via-cyan-300/45 to-electric/45",
    pill:
      "bg-[linear-gradient(135deg,_hsl(186_95%_58%_/_0.08),_hsl(var(--electric)_/_0.08))] border-cyan-300/25 shadow-[inset_0_1px_0_hsl(186_95%_58%_/_0.14)]",
    meta: "border-cyan-300/20 text-cyan-100/65",
    icon: "text-cyan-100/70",
  },
  green: {
    border: "hover:border-emerald-300/35",
    glow:
      "bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--electric)_/_0.12)_0%,_transparent_58%),radial-gradient(ellipse_at_bottom_left,_hsl(132_62%_55%_/_0.12)_0%,_transparent_62%)]",
    edge: "from-emerald-300/0 via-emerald-300/45 to-electric/45",
    pill:
      "bg-[linear-gradient(135deg,_hsl(var(--electric)_/_0.08),_hsl(132_62%_55%_/_0.08))] border-emerald-300/25 shadow-[inset_0_1px_0_hsl(132_62%_55%_/_0.14)]",
    meta: "border-emerald-300/20 text-emerald-100/65",
    icon: "text-emerald-100/70",
  },
  teal: {
    border: "hover:border-electric/40",
    glow:
      "bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--electric)_/_0.13)_0%,_transparent_58%),radial-gradient(ellipse_at_bottom_left,_hsl(var(--violet)_/_0.08)_0%,_transparent_62%)]",
    edge: "from-electric/0 via-electric/55 to-violet/35",
    pill:
      "bg-[linear-gradient(135deg,_hsl(var(--electric)_/_0.1),_hsl(var(--violet)_/_0.05))] border-electric/25 shadow-[inset_0_1px_0_hsl(var(--electric)_/_0.16)]",
    meta: "border-electric/20 text-electric/65",
    icon: "text-electric/70",
  },
  violet: {
    border: "hover:border-violet/35",
    glow:
      "bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--electric)_/_0.12)_0%,_transparent_58%),radial-gradient(ellipse_at_bottom_left,_hsl(var(--violet)_/_0.14)_0%,_transparent_62%)]",
    edge: "from-electric/0 via-violet/55 to-electric/45",
    pill:
      "bg-[linear-gradient(135deg,_hsl(var(--electric)_/_0.08),_hsl(var(--violet)_/_0.09))] border-violet/25 shadow-[inset_0_1px_0_hsl(var(--violet)_/_0.16)]",
    meta: "border-violet/20 text-violet/70",
    icon: "text-violet/70",
  },
} as const;

// Per-card component
const ProjectCard = ({ project, index }: { project: ProjectCard; index: number }) => {
  const headingId = `project-heading-${index}`;
  const tone = toneStyles[project.tone];
  return (
    <motion.article
      key={project.name}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px 0px" }}
      transition={{ duration: 0.55, delay: index * 0.1 }}
      onMouseEnter={() => playHover()}
      aria-labelledby={headingId}
      className={`project-card-shell relative flex flex-col sm:flex-row bg-card border border-border/60 ${tone.border} text-foreground overflow-hidden group transition-[colors,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-project-violet rounded-sm`}
    >
      {project.banner ? (
        <div className="relative w-full sm:w-[42%] sm:max-w-md shrink-0 aspect-[16/10] sm:aspect-auto sm:min-h-[260px] border-b sm:border-b-0 sm:border-r border-border/40">
          <img
            src={project.banner}
            alt={`${project.name} preview`}
            className="absolute inset-0 size-full object-cover"
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/25 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-card/30 sm:to-card" />
        </div>
      ) : null}

      <div className="project-card-body relative flex flex-1 flex-col p-8 sm:p-10 lg:p-12 min-w-0">
        {/* Teal stays the action color; violet adds project-card depth. */}
        <div className={`absolute inset-0 ${tone.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
        <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${tone.edge} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

        {/* Background icon */}
        <div className={`absolute top-8 right-8 sm:right-10 text-7xl opacity-[0.07] select-none group-hover:translate-y-1 group-hover:opacity-[0.14] transition-[opacity,transform] duration-500 pointer-events-none ${tone.icon}`}>
          {project.icon}
        </div>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-electric">
          <span className="w-1.5 h-1.5 rounded-full bg-electric animate-pulse" />
          {project.status}
        </span>
      </div>

      <h3 id={headingId} className="relative z-10 text-2xl sm:text-3xl font-bold text-foreground mb-4 font-mono tracking-tight transition-colors duration-300 group-hover:text-white">
        {project.name}
      </h3>
      <p className="relative z-10 mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground xl:max-w-3xl">
        {project.description}
      </p>

      <div className="relative z-10 mb-6 flex flex-wrap gap-2">
        {project.meta.map((item) => (
          <span
            key={item}
            className={`border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${tone.meta}`}
          >
            {item}
          </span>
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          {project.tech.map((t) => (
            <span key={t} className={`px-3 py-1 text-[11px] font-mono text-electric/85 border ${tone.pill} rounded-sm`}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {project.downloads.length > 0 && (
        <div className="relative z-10 flex gap-4 flex-wrap mt-6 pt-6 border-t border-border/40">
          {project.downloads.map((d) => (
            <a
              key={d.label}
              href={d.href}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => playHover()}
              onClick={() => playClick()}
              className="tap-target font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground hover:text-electric transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-sm"
            >
              ↧ {d.label}
            </a>
          ))}
        </div>
      )}

        <div className="relative z-10 mt-6 flex flex-wrap items-center gap-3">
      {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => playHover()}
            onClick={() => playClick()}
            className="tap-target inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] bg-electric text-background px-5 py-2.5 rounded-sm hover:bg-electric/85 transition-all hover:-translate-y-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            {project.linkLabel}
          </a>
      )}
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => playHover()}
            onClick={() => playClick()}
            className="tap-target inline-flex items-center gap-2 border border-border/70 bg-background/25 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground transition-all hover:border-violet/35 hover:text-electric hover:-translate-y-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-sm"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </motion.article>
  );
};

const ProjectsSection = () => {
  return (
    <section id="projects" className="px-4 py-28 sm:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto w-full max-w-site">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="classified-divider mb-16"
        >
          <span>{projectsSection.dividerLabel}</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          {projectsSection.headline}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mb-12 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base"
        >
          {projectsSection.subcopy}
        </motion.p>

        <div className="grid gap-0.5">
          {projects.map((project, i) => (
            <ProjectCard key={project.name} project={project} index={i} />
          ))}

          {/* Classified coming-soon slots */}
          <div className="grid sm:grid-cols-2 gap-0.5 mt-0.5">
            {comingSoonProjects.map((item, i) => (
              <motion.div
                key={item.codename}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative border border-dashed border-violet/20 p-10 flex flex-col items-start justify-between min-h-[180px] bg-card group overflow-hidden hover:border-violet/40 transition-colors"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--violet)_/_0.14)_0%,_transparent_62%)]" />
                  <div className="absolute top-0 left-0 right-0 h-px bg-violet/30" />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-electric/20" />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet/70 mb-3">
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
        <div className="mt-8">
          <AdUnit slot={AD_SLOTS.banner} format="auto" />
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
