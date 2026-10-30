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

const toneStyles = {
  amber: { border: "hover:border-amber-300/35" },
  blue: { border: "hover:border-sky-300/35" },
  cyan: { border: "hover:border-cyan-300/35" },
  green: { border: "hover:border-emerald-300/35" },
  teal: { border: "hover:border-electric/40" },
  violet: { border: "hover:border-violet/35" },
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
  // Desktop apps like Files Abductor have no web demo to embed, no `link`
  // at all, but do have real release assets, so give them a modal listing
  // those instead of a bare row of small text links at the card's bottom.
  const showsDownloadsModal = !project.link && project.downloads.length > 0;
  return (
    <motion.article
      key={project.name}
      aria-labelledby={headingId}
      className={`project-card-shell group relative z-0 flex flex-col sm:flex-row overflow-hidden rounded-sm border border-border/60 bg-card text-foreground outline-none transition-colors duration-300 ${tone.border}`}
    >
      {project.banner ? (
        <div className="relative w-full sm:w-[42%] sm:max-w-md shrink-0 aspect-[16/10] sm:aspect-auto sm:min-h-[260px] border-b sm:border-b-0 sm:border-r border-border/40 overflow-hidden">
          <img
            src={project.banner}
            alt={`${project.name} preview`}
            className="absolute inset-0 size-full object-cover"
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
          />
        </div>
      ) : null}

      <div className="project-card-body relative flex flex-1 flex-col p-8 sm:p-10 lg:p-12 min-w-0">
      <div className="relative z-10 mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 id={headingId} className="text-2xl font-bold text-foreground sm:text-3xl">
          {project.name}
        </h3>
        {/* Only call out what isn't live; "Live" on every card is noise. */}
        {project.status !== "Live" && (
          <span className="text-sm text-muted-foreground">{project.status}</span>
        )}
      </div>
      <p className="readable-copy relative z-10 mb-8 text-muted-foreground">
        {project.description}
      </p>

      <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          {project.tech.map((t) => (
            <span key={t} className="rounded-sm border border-border/70 px-2.5 py-1 text-sm text-muted-foreground">
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
            className="tap-target inline-flex items-center gap-2 rounded-sm bg-electric px-5 py-2.5 text-sm font-semibold text-background outline-none transition-colors hover:bg-electric/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            <Download className="size-3.5" aria-hidden />
            <span>{project.linkLabel}</span>
          </motion.button>
      )}
      {project.link && showsDemoModal && (
          <motion.button
            type="button"
            onClick={() => setDemoOpen(true)}
            className="tap-target inline-flex items-center gap-2 rounded-sm bg-electric px-5 py-2.5 text-sm font-semibold text-background outline-none transition-colors hover:bg-electric/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
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
            className="tap-target inline-flex items-center gap-2 rounded-sm bg-electric px-5 py-2.5 text-sm font-semibold text-background outline-none transition-colors hover:bg-electric/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            <span>{project.linkLabel}</span>
            <ExternalLink className="size-3.5" aria-hidden />
          </motion.a>
      )}
          {"github" in project && project.github && (
            <motion.a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target inline-flex items-center gap-2 rounded-sm border border-border/70 bg-background/25 px-4 py-2.5 text-sm font-semibold text-muted-foreground outline-none transition-colors hover:border-violet/35 hover:text-electric focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              <Github className="size-3.5" aria-hidden />
              GitHub
            </motion.a>
          )}
        </div>
      </div>

      {showsDemoModal && (
        <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
          <DialogContent className="max-w-4xl w-[min(96vw,64rem)] h-[min(85vh,44rem)] flex flex-col gap-3 p-4 sm:p-5">
            <DialogHeader className="shrink-0">
              <DialogTitle className="text-base">{project.name} demo</DialogTitle>
              <DialogDescription>
                This one's archived, but the demo still runs below. Or{" "}
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
              <DialogTitle className="text-base">{project.name} downloads</DialogTitle>
              <DialogDescription>Grab the one for your system.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              {project.downloads.map((d) => (
                <a
                  key={d.label}
                  href={d.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-target flex items-center gap-3 rounded-sm border border-border/70 bg-background/40 px-4 py-3 text-sm font-semibold text-foreground/85 outline-none transition-colors hover:border-electric/40 hover:text-electric focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
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
            {COMING_SOON_PROJECTS.map((item) => (
              <motion.div
                key={item.codename}
                className="group relative flex min-h-[180px] flex-col items-start justify-between overflow-hidden border border-dashed border-violet/20 bg-card p-10 outline-none"
              >
                <div>
                  <p className="mb-3 text-sm text-violet/80">
                    Current focus
                  </p>
                  <p className="mb-2 font-bold text-foreground/70">
                    {item.codename}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <div className="mt-6">
                  <span className="text-sm text-muted-foreground/70">
                    New projects: on hold until {item.eta}
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
