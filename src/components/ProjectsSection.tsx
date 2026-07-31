import { useState } from "react";
import { motion } from "framer-motion";
import { Download, ExternalLink, Github } from "lucide-react";
import {
  projects,
  COMING_SOON_PROJECTS,
  projectsSection,
  type ProjectCard,
} from "@/content/homepage";
import { AdUnit, AD_SLOTS } from "@/components/AdUnit";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const isExternalHref = (href: string) => /^https?:\/\//.test(href);

const cardHover = {
  y: -8,
  scale: 1.018,
  transition: { type: "spring" as const, stiffness: 260, damping: 24, mass: 0.7 },
};

const actionHover = {
  y: -2,
  scale: 1.025,
  transition: { type: "spring" as const, stiffness: 360, damping: 24, mass: 0.6 },
};

const actionTap = {
  scale: 0.985,
  transition: { type: "spring" as const, stiffness: 420, damping: 28 },
};

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
  const [demoOpen, setDemoOpen] = useState(false);
  const [downloadsOpen, setDownloadsOpen] = useState(false);
  // Archived demos open in-page since they're same-origin routes; an
  // archived project pointing off-site would still need a normal link,
  // since the target's frame headers are out of our control.
  const showsDemoModal = project.status === "Archived" && !!project.link && !isExternalHref(project.link);
  // Desktop apps like Files Abductor have no web demo to embed — no `link`
  // at all — but do have real release assets, so give them a modal listing
  // those instead of a bare row of small text links at the card's bottom.
  const showsDownloadsModal = !project.link && project.downloads.length > 0;
  return (
    <motion.article
      key={project.name}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px 0px" }}
      transition={{ duration: 0.55, delay: index * 0.1 }}
      whileHover={cardHover}
      whileTap={{ scale: 0.996 }}
      aria-labelledby={headingId}
      className={`project-card-shell group relative z-0 flex flex-col overflow-hidden rounded-sm border border-border/60 bg-card text-foreground outline-none transition-[border-color,box-shadow] duration-500 will-change-transform hover:z-10 hover:shadow-project-violet focus-within:z-10 focus-within:shadow-project-violet ${tone.border}`}
    >
      {project.banner ? (
        <div className="relative w-full sm:w-[42%] sm:max-w-md shrink-0 aspect-[16/10] sm:aspect-auto sm:min-h-[260px] border-b sm:border-b-0 sm:border-r border-border/40 overflow-hidden">
          <img
            src={project.banner}
            alt={`${project.name} preview`}
            className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/25 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-card/30 sm:to-card" />
        </div>
      ) : null}

      <div className="project-card-body relative flex flex-1 flex-col p-8 sm:p-10 lg:p-12 min-w-0">
        {/* Teal stays the action color; violet adds project-card depth. */}
        <div className={`absolute inset-0 ${tone.glow} opacity-0 transition-opacity duration-700 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100`} />
        <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${tone.edge} opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100`} />

        {/* Background icon */}
        <div className={`absolute top-8 right-8 sm:right-10 text-7xl opacity-[0.07] select-none transition-[opacity,transform] duration-700 pointer-events-none group-hover:translate-y-1 group-hover:scale-110 group-hover:opacity-[0.14] ${tone.icon}`}>
          {project.icon}
        </div>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        {/* Electric reads as "active" — anything not live is muted so the badge doesn't oversell. */}
        <span
          className={`font-mono text-[10px] uppercase tracking-[0.15em] ${
            project.status === "Live" ? "text-electric" : "text-muted-foreground/60"
          }`}
        >
          {project.status}
        </span>
      </div>

      <h3 id={headingId} className="relative z-10 mb-4 text-2xl font-bold text-foreground transition-colors duration-300 group-hover:text-white sm:text-3xl">
        {project.name}
      </h3>
      <p className="readable-copy relative z-10 mb-8 text-muted-foreground">
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

        <div className="relative z-10 mt-6 flex flex-wrap items-center gap-3">
      {showsDownloadsModal && (
          <motion.button
            type="button"
            onClick={() => setDownloadsOpen(true)}
            whileHover={actionHover}
            whileTap={actionTap}
            className="tap-target subtle-link-motion inline-flex items-center gap-2 rounded-sm bg-electric px-5 py-2.5 font-mono text-xs uppercase tracking-[0.12em] text-background outline-none transition-colors hover:bg-electric/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            <Download className="size-3.5" aria-hidden />
            <span>{project.linkLabel}</span>
          </motion.button>
      )}
      {project.link && showsDemoModal && (
          <motion.button
            type="button"
            onClick={() => setDemoOpen(true)}
            whileHover={actionHover}
            whileTap={actionTap}
            className="tap-target subtle-link-motion inline-flex items-center gap-2 rounded-sm bg-electric px-5 py-2.5 font-mono text-xs uppercase tracking-[0.12em] text-background outline-none transition-colors hover:bg-electric/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            <span>{project.linkLabel}</span>
            <ExternalLink className="size-3.5" aria-hidden />
          </motion.button>
      )}
      {project.link && !showsDemoModal && (
          <motion.a
            href={project.link}
            target={isExternalHref(project.link) ? "_blank" : undefined}
            rel={isExternalHref(project.link) ? "noopener noreferrer" : undefined}
            whileHover={actionHover}
            whileTap={actionTap}
            className="tap-target subtle-link-motion inline-flex items-center gap-2 rounded-sm bg-electric px-5 py-2.5 font-mono text-xs uppercase tracking-[0.12em] text-background outline-none transition-colors hover:bg-electric/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            <span>{project.linkLabel}</span>
            <ExternalLink className="size-3.5" aria-hidden />
          </motion.a>
      )}
          <motion.a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={actionHover}
            whileTap={actionTap}
            className="tap-target subtle-link-motion inline-flex items-center gap-2 rounded-sm border border-border/70 bg-background/25 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground outline-none transition-colors hover:border-violet/35 hover:text-electric focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            <Github className="size-3.5" aria-hidden />
            GitHub
          </motion.a>
        </div>
      </div>

      {showsDemoModal && (
        <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
          <DialogContent className="max-w-4xl w-[min(96vw,64rem)] h-[min(85vh,44rem)] flex flex-col gap-3 p-4 sm:p-5">
            <DialogHeader className="shrink-0">
              <DialogTitle className="text-base">{project.name} — Demo</DialogTitle>
              <DialogDescription>
                Archived project. Demo runs live below —{" "}
                <a
                  href={project.link ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-electric"
                >
                  open in a new tab
                </a>{" "}
                instead.
              </DialogDescription>
            </DialogHeader>
            <iframe
              src={demoOpen ? project.link ?? undefined : undefined}
              title={`${project.name} demo`}
              className="w-full flex-1 rounded-sm border border-border/60 bg-background"
              loading="lazy"
            />
          </DialogContent>
        </Dialog>
      )}

      {showsDownloadsModal && (
        <Dialog open={downloadsOpen} onOpenChange={setDownloadsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">{project.name} — Downloads</DialogTitle>
              <DialogDescription>Pick a build for your platform.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              {project.downloads.map((d) => (
                <a
                  key={d.label}
                  href={d.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-target flex items-center gap-3 rounded-sm border border-border/70 bg-background/40 px-4 py-3 font-mono text-xs uppercase tracking-[0.1em] text-foreground/85 outline-none transition-colors hover:border-electric/40 hover:text-electric focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                >
                  <Download className="size-4 shrink-0" aria-hidden />
                  {d.label}
                </a>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
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
          className="section-divider mb-16"
        >
          <span>{projectsSection.dividerLabel}</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
        >
          {projectsSection.headline}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="readable-copy mb-12 text-muted-foreground"
        >
          {projectsSection.subcopy}
        </motion.p>

        <div className="grid gap-0.5">
          {projects.map((project, i) => (
            <ProjectCard key={project.name} project={project} index={i} />
          ))}

          {/* Coming-soon slots */}
          <div className="grid sm:grid-cols-2 gap-0.5 mt-0.5">
            {COMING_SOON_PROJECTS.map((item, i) => (
              <motion.div
                key={item.codename}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={cardHover}
                whileTap={{ scale: 0.996 }}
                className="group relative flex min-h-[180px] flex-col items-start justify-between overflow-hidden border border-dashed border-violet/20 bg-card p-10 outline-none transition-[border-color,box-shadow] duration-500 hover:z-10 hover:border-violet/40 hover:shadow-project-violet"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--violet)_/_0.14)_0%,_transparent_62%)]" />
                  <div className="absolute top-0 left-0 right-0 h-px bg-violet/30" />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-electric/20" />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet/70 mb-3">
                    In progress
                  </p>
                  <p className="font-mono text-sm font-bold text-foreground/50 tracking-tight mb-2">
                    {item.codename}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground/60">
                    {item.description}
                  </p>
                </div>
                <div className="mt-6">
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
