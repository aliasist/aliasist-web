import { ArrowRight, BookOpen, Github, GitPullRequest, HeartPulse, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import BackgroundRotator from "@/components/BackgroundRotator";
import Starfield from "@/components/Starfield";

const tools = [
  {
    title: "Understand a project",
    description: "Turn a public repository into a plain-language map of the project and its next steps.",
    label: "Open Project Guide",
    href: "/tools/github/project-guide",
    icon: BookOpen,
    status: "Live",
  },
  {
    title: "Improve my project",
    description: "Check documentation, community files, automation, and repository readiness.",
    label: "Repo Health",
    icon: HeartPulse,
    status: "Next",
  },
  {
    title: "Share my changes",
    description: "Prepare a clear pull request with a focused summary and a useful review checklist.",
    label: "PR Builder",
    icon: Share2,
    status: "Planned",
  },
  {
    title: "Review a pull request",
    description: "Analyze a public pull request for risk, hotspots, test hints, and reviewer-ready comments.",
    label: "Open PR Reviewer",
    href: "/tools/github-pr-reviewer",
    icon: GitPullRequest,
    status: "Advanced",
  },
] as const;

const GithubToolkit = () => (
  <div className="relative min-h-screen overflow-x-hidden">
    <BackgroundRotator />
    <Starfield />
    <main className="relative z-10 mx-auto w-full max-w-site px-4 pb-20 pt-6 sm:px-8 lg:px-12 xl:px-16">
      <header className="flex min-h-[72px] flex-wrap items-center justify-between gap-4">
        <Link
          to="/"
          className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-electric"
        >
          Aliasist
        </Link>
        <a
          href="https://github.com/aliasist"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 border border-border/60 bg-background/45 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground backdrop-blur-md transition-colors hover:border-electric/40 hover:text-electric"
        >
          <Github className="size-4" />
          GitHub
        </a>
      </header>

      <section className="max-w-4xl py-10 sm:py-16">
        <div className="section-divider mb-8">
          <span>Developer Toolkit // GitHub</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          GitHub Companion
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Start with a project you want to understand. Move into repository health, pull request
          preparation, and deeper review as your workflow grows.
        </p>
      </section>

      <section aria-labelledby="choose-tool">
        <div className="section-divider mb-6">
          <span>Choose a task</span>
        </div>
        <h2 id="choose-tool" className="sr-only">
          Choose a GitHub Companion task
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const body = (
              <>
                <div className="flex items-start justify-between gap-4">
                  <span className="flex size-11 items-center justify-center border border-electric/25 bg-electric/[0.08] text-electric">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-electric">
                    {tool.status}
                  </span>
                </div>
                <h3 className="mt-8 text-xl font-semibold text-foreground">{tool.title}</h3>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                  {tool.description}
                </p>
                <span className="mt-7 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.13em] text-electric">
                  {tool.label}
                  {"href" in tool ? <ArrowRight className="size-4" /> : null}
                </span>
              </>
            );

            return "href" in tool ? (
              <Link
                key={tool.title}
                to={tool.href}
                className="border border-border/65 bg-card/75 p-5 backdrop-blur-xl transition-colors hover:border-electric/40 hover:bg-card/90 sm:p-6"
              >
                {body}
              </Link>
            ) : (
              <article key={tool.title} className="border border-border/45 bg-card/55 p-5 opacity-75 backdrop-blur-xl sm:p-6">
                {body}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  </div>
);

export default GithubToolkit;
