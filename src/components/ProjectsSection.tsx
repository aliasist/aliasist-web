import { motion } from "framer-motion";

const releaseTag = "#v2.7.0";
const releaseBaseUrl = `https://github.com/aliasist/aliasistabductor/releases/download/${releaseTag}`;

const appImageFile = "Aliasist.Files.Abductor-2.7.0.AppImage";
const snapFile = "aliasist-files-abductor_2.7.0_amd64.snap";
const windowsExeFile = "Aliasist.Files.Abductor.Setup.2.7.0.exe";

const downloadLinks = {
  appImage: `${releaseBaseUrl}/${encodeURIComponent(appImageFile)}`,
  snap: `${releaseBaseUrl}/${snapFile}`,
  windowsExe: `${releaseBaseUrl}/${encodeURIComponent(windowsExeFile)}`,
};

const projects = [
  {
    name: "Aliaist-Files-Abductor",
    description:
      "A file organization and automation tool that abducts your messy directories and deposits them exactly where they belong. Built with a clean CLI interface and an alien theme that doesn't apologize for itself. Does the work. No questions asked.",
    tech: ["Python", "CLI", "File Automation"],
    github: `https://github.com/aliasist/aliasistabductor/releases/tag/${releaseTag}`,
    downloads: [
      { label: "AppImage", href: downloadLinks.appImage },
      { label: "snap", href: downloadLinks.snap },
      { label: "Windows EXE", href: downloadLinks.windowsExe },
    ],
    featured: true,
    status: "Active",
    icon: "🛸",
    link: null as string | null,
    linkLabel: null as string | null,
    embed: false,
  },
  {
    name: "DataSist",
    description:
      "Live AI data center intelligence platform — 35+ facilities tracked across 13 countries. Power consumption, water usage, investment, renewable energy coverage, community resistance, and grid stress risk. Includes Groq-powered AI analysis, facility comparison mode, region filters, and a full admin CRUD panel. Part of the Aliasist app suite.",
    tech: ["React", "Vite", "SQLite", "Groq AI", "Leaflet", "Recharts"],
    github: "https://github.com/aliasist",
    downloads: [],
    featured: true,
    status: "Live",
    icon: "🌐",
    link: "/datasist",
    linkLabel: "Open DataSist →",
    embed: true,
  },
];

const ProjectsSection = () => {
  return (
    <section id="projects" className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="classified-divider mb-16">
          <span>Artifacts // Projects</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12 tracking-tight">
            Deployed tools.
          </h2>

          <div className="grid gap-0.5">
            {projects.map((project) => (
              <div
                key={project.name}
                className="relative bg-foreground text-background p-8 sm:p-12 overflow-hidden group"
              >
                {/* Background icon */}
                <div className="absolute top-8 right-10 text-6xl opacity-10 select-none">
                  {project.icon}
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-electric">
                    ● {project.status}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-background/30">
                    — Featured
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-background mb-4 font-mono tracking-tight">
                  {project.name}
                </h3>

                <p className="text-sm text-background/60 leading-relaxed mb-8 max-w-2xl">
                  {project.description}
                </p>

                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex gap-2 flex-wrap">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1 text-[11px] font-mono bg-background/10 text-background/70 border border-background/10 rounded-sm"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <a
                    href={project.github}
                    className="font-mono text-xs uppercase tracking-[0.1em] text-electric hover:text-electric/70 transition-colors flex items-center gap-1.5"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on GitHub ↗
                  </a>
                </div>

                {/* Download links (Abductor) */}
                {project.downloads.length > 0 && (
                  <div className="flex gap-3 flex-wrap mt-6">
                    {project.downloads.map((d) => (
                      <a
                        key={d.label}
                        href={d.href}
                        className="font-mono text-xs uppercase tracking-[0.1em] text-electric hover:text-electric/70 transition-colors flex items-center gap-1.5"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download {d.label} ↧
                      </a>
                    ))}
                  </div>
                )}

                {/* DataSist launch link */}
                {project.link && (
                  <div className="mt-6">
                    <a
                      href={project.link}
                      className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] bg-electric text-background px-5 py-2.5 rounded-sm hover:bg-electric/85 transition-colors"
                    >
                      {project.linkLabel}
                    </a>
                  </div>
                )}
              </div>
            ))}

            {/* Placeholder slots */}
            <div className="grid sm:grid-cols-2 gap-0.5">
              <div className="border border-dashed border-border p-10 flex flex-col items-center justify-center min-h-[160px] bg-card">
                <p className="font-mono text-xs text-muted-foreground tracking-[0.1em]">
                  // projects_are_coming_soon
                </p>
              </div>
              <div className="border border-dashed border-border p-10 flex flex-col items-center justify-center min-h-[160px] bg-card">
                <p className="font-mono text-xs text-muted-foreground tracking-[0.1em]">
                  // they_will_be_deployed_here_and_on_GitHub
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsSection;
