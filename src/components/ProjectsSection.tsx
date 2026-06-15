import { motion } from "framer-motion";
import { useState } from "react";
import { playHover, playClick } from "@/hooks/useSound";
import {
  projects,
  comingSoonProjects,
  projectsSection,
  type ProjectCard,
} from "@/content/homepage";
import { AdUnit, AD_SLOTS } from "@/components/AdUnit";

import { MagicGlow } from "./MagicGlow";

// Per-card component
const ProjectCard = ({ project, index }: { project: ProjectCard; index: number }) => {
  const headingId = `project-heading-${index}`;
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.article
      key={project.name}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px 0px" }}
      transition={{ duration: 0.55, delay: index * 0.1 }}
      onMouseEnter={() => playHover()}
      aria-labelledby={headingId}
      className="project-card-shell relative flex flex-col sm:flex-row bg-card border border-border/60 hover:border-electric/40 text-foreground overflow-hidden group transition-[colors,box-shadow] duration-300 hover:shadow-electric-sm rounded-sm"
    >
      <MagicGlow className="absolute inset-0 pointer-events-none" glowOpacity={0.08} />
      {project.banner ? (
        <div className="relative w-full sm:w-[42%] sm:max-w-md shrink-0 aspect-[16/10] sm:aspect-auto sm:min-h-[260px] border-b sm:border-b-0 sm:border-r border-border/40 overflow-hidden">
          <div
            className={`project-image-skeleton absolute inset-0 transition-opacity duration-500 ${
              imageLoaded ? "opacity-0" : "opacity-100"
            }`}
            aria-hidden
          />
          <img
            src={project.banner}
            alt={`${project.name} preview`}
            className={`project-card-image absolute inset-0 size-full object-cover transition-[opacity,transform] duration-700 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            } group-hover:scale-105`}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
          {/* Shimmer sheen on hover */}
          <div className="project-card-shimmer absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/25 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-card/30 sm:to-card" />
        </div>
      ) : null}

      <div className="project-card-body relative flex flex-1 flex-col p-8 sm:p-10 lg:p-12 min-w-0">
        {/* Top edge accent line on hover */}
        <div className="absolute top-0 left-0 right-0 h-px bg-electric/0 group-hover:bg-electric/50 transition-colors duration-300" />

        {/* Background icon */}
        <div className="absolute right-8 top-8 select-none font-mono text-5xl font-semibold tracking-[-0.08em] text-electric opacity-[0.06] transition-opacity duration-500 pointer-events-none group-hover:opacity-[0.11] sm:right-10">
          {project.icon}
        </div>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-electric">
          <span className="w-1.5 h-1.5 rounded-full bg-electric animate-pulse" />
          {project.status}
        </span>
      </div>

      <h3 id={headingId} className="relative z-10 text-2xl sm:text-3xl font-bold text-foreground mb-4 font-mono tracking-tight">
        {project.name}
      </h3>
      <p className="relative z-10 mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground xl:max-w-3xl">
        {project.description}
      </p>

      <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          {project.tech.map((t) => (
            <span key={t} className="px-3 py-1 text-[11px] font-mono bg-electric/[0.08] text-electric/80 border border-electric/20 rounded-sm">
              {t}
            </span>
          ))}
        </div>
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playClick()}
          className="tap-target font-mono text-xs uppercase tracking-[0.1em] text-electric hover:text-electric/70 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-sm"
        >
          GitHub ↗
        </a>
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

      {project.link && (
        <div className="relative z-10 mt-6">
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
        </div>
      )}
      </div>
    </motion.article>
  );
};

const ProjectsSection = () => {
  return (
    <section id="projects" className="section-transition px-4 py-28 sm:px-8 lg:px-12 xl:px-16">
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
                className="relative border border-dashed border-border p-10 flex flex-col items-start justify-between min-h-[180px] bg-card group overflow-hidden hover:border-electric/30 transition-colors"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute top-0 left-0 right-0 h-px bg-electric/20" />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-electric/20" />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric/60 mb-3">
                    In development
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
                    {item.eta}
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
