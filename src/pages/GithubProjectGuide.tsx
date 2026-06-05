import { FormEvent, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleHelp,
  ExternalLink,
  Github,
  Loader2,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import BackgroundRotator from "@/components/BackgroundRotator";
import Starfield from "@/components/Starfield";
import { readJsonBody, siteEndpoints } from "@/config/api";
import { playClick, playHover } from "@/hooks/useSound";
import {
  parseRepositoryUrl,
  type GithubInstallationState,
  type GithubRepository,
  type ProjectGuideAnalysis,
} from "@/lib/github-project-guide";

type GuideResponse = {
  repo?: GithubRepository;
  guide?: ProjectGuideAnalysis;
  error?: string;
};

type GuideData = {
  repo: GithubRepository;
  guide: ProjectGuideAnalysis;
};

const sampleUrl = "https://github.com/skills/introduction-to-github";

function SignalIcon({ state }: { state: "present" | "missing" | "review" }) {
  if (state === "present") return <CheckCircle2 className="size-4 text-electric" />;
  return <AlertTriangle className="size-4 text-yellow-200" />;
}

function installLabel(installation: GithubInstallationState | null) {
  if (!installation || installation.status === "unknown") return "Public mode";
  if (installation.installed) return "App connected";
  return "Public mode";
}

const GithubProjectGuide = () => {
  const [url, setUrl] = useState(sampleUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GuideData | null>(null);
  const [installation, setInstallation] = useState<GithubInstallationState | null>(null);

  async function checkInstallation(owner: string, repo: string) {
    try {
      const response = await fetch(
        `${siteEndpoints.githubInstallStatusApi}?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`,
      );
      const result = await readJsonBody<GithubInstallationState>(response);
      setInstallation(result);
    } catch {
      setInstallation(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    playClick();
    const ref = parseRepositoryUrl(url);
    if (!ref) {
      setError("Paste a full GitHub repository URL, like https://github.com/owner/repo.");
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);
    setInstallation(null);

    try {
      const response = await fetch(siteEndpoints.githubRepoGuideApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const result = await readJsonBody<GuideResponse>(response);
      if (!response.ok) throw new Error(result?.error ?? `Project Guide returned ${response.status}.`);
      if (!result?.repo || !result.guide) throw new Error("Project Guide returned an incomplete response.");
      setData({ repo: result.repo, guide: result.guide });
      void checkInstallation(ref.owner, ref.repo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to analyze that repository.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <BackgroundRotator />
      <Starfield />
      <main className="relative z-10 mx-auto w-full max-w-site px-4 pb-20 pt-6 sm:px-8 lg:px-12 xl:px-16">
        <header className="flex min-h-[72px] flex-wrap items-center justify-between gap-4">
          <Link
            to="/tools/github"
            onMouseEnter={() => playHover()}
            className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-electric"
          >
            Aliasist // GitHub Companion
          </Link>
          <a
            href="https://github.com/aliasist"
            target="_blank"
            rel="noreferrer"
            onMouseEnter={() => playHover()}
            className="inline-flex items-center gap-2 border border-border/60 bg-background/45 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground backdrop-blur-md transition-colors hover:border-electric/40 hover:text-electric"
          >
            <Github className="size-4" />
            GitHub
          </a>
        </header>

        <section className="grid gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <div className="classified-divider mb-8">
              <span>GitHub Companion // Project Guide</span>
            </div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Understand a project
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Paste a public GitHub repository URL. Project Guide explains what is there, highlights
              useful files, and gives you a short next-step list.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border border-border/65 bg-card/80 p-4 shadow-electric-panel backdrop-blur-xl sm:p-5"
          >
            <label htmlFor="repo-url" className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Public GitHub repository URL
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                id="repo-url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://github.com/owner/repo"
                className="min-h-12 flex-1 border border-border/70 bg-background/70 px-4 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/45 focus:border-electric/60"
              />
              <button
                type="submit"
                disabled={loading}
                onMouseEnter={() => playHover()}
                className="inline-flex min-h-12 items-center justify-center gap-2 bg-electric px-5 font-mono text-xs uppercase tracking-[0.14em] text-background transition-colors hover:bg-electric/85 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                Analyze
              </button>
            </div>
            <button
              type="button"
              onClick={() => setUrl(sampleUrl)}
              className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-electric"
            >
              Load sample repository
            </button>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Public repositories work without connecting an account. GitHub App installation adds
              private repository support in the next integration step.
            </p>
          </form>
        </section>

        {error ? (
          <div className="mb-8 flex gap-3 border border-red-400/35 bg-red-500/[0.08] p-4 text-sm leading-relaxed text-red-100">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            {error}
          </div>
        ) : null}

        {data ? (
          <section className="space-y-8" aria-label="Project Guide report">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Project type", data.guide.projectType],
                ["Default branch", data.repo.default_branch],
                ["Open issues", data.repo.open_issues_count],
                ["GitHub App", installLabel(installation)],
              ].map(([label, value]) => (
                <div key={label} className="border border-border/60 bg-card/75 px-4 py-3 backdrop-blur-sm">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>

            {installation && !installation.installed ? (
              <div className="flex flex-col gap-4 border border-electric/30 bg-electric/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Public analysis is active. Install Aliasist PR Reviewer when you are ready to add
                  private repository access and GitHub-native automation.
                </p>
                <a
                  href={installation.installUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center justify-center gap-2 border border-electric/35 bg-electric/[0.08] px-4 py-2 font-mono text-xs uppercase tracking-[0.13em] text-electric transition-colors hover:bg-electric/[0.14]"
                >
                  Install GitHub App
                  <ExternalLink className="size-4" />
                </a>
              </div>
            ) : null}

            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <section className="border border-border/65 bg-card/75 p-5 backdrop-blur-xl sm:p-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="size-5 text-electric" />
                  <h2 className="text-xl font-semibold text-foreground">Project map</h2>
                </div>
                <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
                  {data.guide.overview.map((line) => <li key={line}>{line}</li>)}
                </ul>
                <div className="mt-7 border-t border-border/55 pt-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-electric">Recommended next steps</p>
                  <ol className="mt-4 space-y-3">
                    {data.guide.recommendedNextSteps.map((step, index) => (
                      <li key={step} className="flex gap-3 text-sm leading-relaxed text-foreground">
                        <span className="font-mono text-electric">{index + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </section>

              <section className="border border-border/65 bg-card/75 p-5 backdrop-blur-xl sm:p-6">
                <h2 className="text-xl font-semibold text-foreground">Repository health</h2>
                <div className="mt-5 space-y-4">
                  {data.guide.healthSignals.map((signal) => (
                    <div key={signal.label} className="flex gap-3">
                      <SignalIcon state={signal.state} />
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{signal.label}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{signal.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="border border-border/65 bg-card/75 p-5 backdrop-blur-xl sm:p-6">
              <h2 className="text-xl font-semibold text-foreground">Useful files and folders</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {data.guide.importantFiles.map((file) => (
                  <a
                    key={file.path}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-border/55 bg-background/35 p-4 transition-colors hover:border-electric/35"
                  >
                    <span className="flex items-center gap-2 font-mono text-xs text-electric">
                      {file.path}
                      <ExternalLink className="size-3.5" />
                    </span>
                    <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">{file.explanation}</span>
                  </a>
                ))}
              </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-stretch">
              <details className="border border-border/65 bg-card/75 p-5 backdrop-blur-xl sm:p-6">
                <summary className="flex cursor-pointer list-none items-center gap-3 text-sm font-semibold text-foreground">
                  <CircleHelp className="size-5 text-electric" />
                  GitHub glossary
                </summary>
                <dl className="mt-5 space-y-4">
                  {data.guide.glossary.map((entry) => (
                    <div key={entry.term}>
                      <dt className="text-sm font-semibold text-foreground">{entry.term}</dt>
                      <dd className="mt-1 text-xs leading-relaxed text-muted-foreground">{entry.meaning}</dd>
                    </div>
                  ))}
                </dl>
              </details>
              <Link
                to="/tools/github-pr-reviewer"
                onMouseEnter={() => playHover()}
                className="flex min-h-28 items-center justify-between gap-6 border border-electric/30 bg-electric/[0.08] p-5 transition-colors hover:bg-electric/[0.14] sm:p-6 lg:max-w-sm"
              >
                <span>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-electric">Advanced tool</span>
                  <span className="mt-3 block text-base font-semibold text-foreground">Review a pull request</span>
                </span>
                <ArrowRight className="size-5 shrink-0 text-electric" />
              </Link>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
};

export default GithubProjectGuide;
