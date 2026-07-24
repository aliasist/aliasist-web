import { FormEvent, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  FileCode2,
  Github,
  GitPullRequest,
  Loader2,
  Search,
  ShieldAlert,
} from "lucide-react";
import { Link } from "react-router-dom";
import BackgroundRotator from "@/components/BackgroundRotator";
import Starfield from "@/components/Starfield";
import { readJsonBody, siteEndpoints } from "@/config/api";
import {
  analyzePullRequest,
  parsePullRequestUrl,
  type GithubCommit,
  type GithubPullRequest,
  type GithubPullRequestFile,
  type ReviewAnalysis,
} from "@/lib/github-pr-reviewer";

type PullRequestData = {
  pr: GithubPullRequest;
  files: GithubPullRequestFile[];
  commits: GithubCommit[];
  analysis: ReviewAnalysis;
  rateLimit?: {
    limit: string | null;
    remaining: string | null;
    reset: string | null;
    authenticated: boolean;
  };
};

const sampleUrl = "https://github.com/cli/cli/pull/13548";

type PrReviewApiResponse = {
  pr?: GithubPullRequest;
  files?: GithubPullRequestFile[];
  commits?: GithubCommit[];
  rateLimit?: PullRequestData["rateLimit"];
  error?: string;
};

async function fetchPullRequestReview(url: string, token: string): Promise<PrReviewApiResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token.trim()) headers.Authorization = `Bearer ${token.trim()}`;

  const response = await fetch(siteEndpoints.githubPrReviewApi, {
    method: "POST",
    headers: {
      ...headers,
    },
    body: JSON.stringify({ url }),
  });

  const data = await readJsonBody<PrReviewApiResponse>(response);

  if (!response.ok) {
    throw new Error(data?.error ?? `Review API returned ${response.status}.`);
  }

  if (!data?.pr || !data.files || !data.commits) {
    throw new Error("Review API returned an incomplete response.");
  }

  return data;
}

function severityClass(severity: "high" | "medium" | "low") {
  if (severity === "high") return "border-red-400/35 bg-red-500/[0.08] text-red-100";
  if (severity === "medium") return "border-yellow-300/35 bg-yellow-300/[0.08] text-yellow-50";
  return "border-electric/25 bg-electric/[0.06] text-foreground";
}

function riskClass(label: ReviewAnalysis["riskLabel"]) {
  if (label === "High") return "text-red-200 border-red-400/35 bg-red-500/[0.08]";
  if (label === "Medium") return "text-yellow-50 border-yellow-300/35 bg-yellow-300/[0.08]";
  return "text-electric border-electric/30 bg-electric/[0.08]";
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-border/60 bg-card/75 px-4 py-3 backdrop-blur-sm">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-mono text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

const GithubPrReviewer = () => {
  const [url, setUrl] = useState(sampleUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState<PullRequestData | null>(null);
  const [githubToken, setGithubToken] = useState("");
  const [showToken, setShowToken] = useState(false);

  const reviewText = useMemo(() => {
    if (!data) return "";

    const findings = data.analysis.findings.length
      ? data.analysis.findings
          .map(
            (finding) =>
              `- ${finding.severity.toUpperCase()}: ${finding.title}\n  ${finding.detail}${
                finding.files.length ? `\n  Files: ${finding.files.join(", ")}` : ""
              }`,
          )
          .join("\n")
      : "- No major heuristic findings. Still review behavior, tests, and deploy impact.";

    return `PR Review Brief: ${data.pr.title}
${data.pr.html_url}

Risk: ${data.analysis.riskLabel} (${data.analysis.riskScore}/100)

Summary:
${data.analysis.summary.map((line) => `- ${line}`).join("\n")}

Findings:
${findings}

Suggested review comments:
${data.analysis.suggestedComments.map((line) => `- ${line}`).join("\n")}`;
  }, [data]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ref = parsePullRequestUrl(url);
    if (!ref) {
      setError("Paste a full GitHub PR URL, like https://github.com/owner/repo/pull/123.");
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const result = await fetchPullRequestReview(url, githubToken);
      const pr = result.pr as GithubPullRequest;
      const files = result.files as GithubPullRequestFile[];
      const commits = result.commits as GithubCommit[];

      setData({
        pr,
        files,
        commits,
        analysis: analyzePullRequest(pr, files, commits),
        rateLimit: result.rateLimit,
      });
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Unable to analyze that PR.");
    } finally {
      setLoading(false);
    }
  }

  async function copyReview() {
    if (!reviewText) return;
    await navigator.clipboard.writeText(reviewText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <BackgroundRotator />
      <Starfield />
      <main className="relative z-10 mx-auto w-full max-w-site px-4 pb-20 pt-6 sm:px-8 lg:px-12 xl:px-16">
        <header className="flex min-h-[72px] flex-wrap items-center justify-between gap-4">
          <Link
            to="/tools/github"
            className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-electric"
          >
            Aliasist // GitHub Companion
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

        <section className="grid gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <div className="section-divider mb-8">
              <span>Developer Tool // PR Review</span>
            </div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              GitHub PR Reviewer
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Paste a public pull request URL and get a fast review brief: scope, risk signals,
              test coverage hints, hotspots, and reviewer-ready comments.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border border-border/65 bg-card/80 p-4 shadow-electric-panel backdrop-blur-xl sm:p-5"
          >
            <label
              htmlFor="pr-url"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              Public GitHub PR URL
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                id="pr-url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://github.com/owner/repo/pull/123"
                className="min-h-12 flex-1 border border-border/70 bg-background/70 px-4 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/45 focus:border-electric/60"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-12 items-center justify-center gap-2 bg-electric px-5 font-mono text-xs uppercase tracking-[0.14em] text-background transition-colors hover:bg-electric/85 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                Review
              </button>
            </div>
            <button
              type="button"
              onClick={() => setUrl(sampleUrl)}
              className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-electric"
            >
              Load sample PR
            </button>
            <div className="mt-4 border border-border/55 bg-background/35 p-3">
              <button
                type="button"
                onClick={() => setShowToken((value) => !value)}
                className="flex w-full items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.13em] text-muted-foreground transition-colors hover:text-electric"
              >
                <span>{showToken ? "Hide GitHub integration token" : "Connect GitHub token"}</span>
                <span className="text-electric">{githubToken ? "Active" : "Optional"}</span>
              </button>
              {showToken ? (
                <div className="mt-3 space-y-2">
                  <input
                    value={githubToken}
                    onChange={(event) => setGithubToken(event.target.value)}
                    type="password"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="Fine-grained token with repository read access"
                    className="min-h-11 w-full border border-border/70 bg-background/70 px-3 font-mono text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground/45 focus:border-electric/60"
                  />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Sent only to this site's review API for the current request. Use this for private repos
                    or higher GitHub rate limits until OAuth/GitHub App install is wired in.
                  </p>
                </div>
              ) : null}
            </div>
            {error ? (
              <p className="mt-4 flex items-center gap-2 border border-red-400/35 bg-red-500/[0.08] px-3 py-2 text-sm text-red-100">
                <AlertTriangle className="size-4 shrink-0" />
                {error}
              </p>
            ) : null}
          </form>
        </section>

        {data ? (
          <section className="space-y-8">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              <StatTile label="Risk" value={data.analysis.riskLabel} />
              <StatTile label="Files" value={data.pr.changed_files} />
              <StatTile label="Additions" value={data.pr.additions.toLocaleString()} />
              <StatTile label="Deletions" value={data.pr.deletions.toLocaleString()} />
              <StatTile label="Commits" value={data.pr.commits} />
            </div>

            <article className="border border-border/65 bg-card/80 p-5 shadow-electric-panel backdrop-blur-xl sm:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`border px-3 py-1 font-mono text-xs uppercase tracking-[0.14em] ${riskClass(data.analysis.riskLabel)}`}>
                      {data.analysis.riskLabel} risk · {data.analysis.riskScore}/100
                    </span>
                    <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {data.pr.state}{data.pr.draft ? " · draft" : ""}
                    </span>
                  </div>
                  <h2 className="mt-4 max-w-4xl text-2xl font-semibold text-foreground">
                    {data.pr.title}
                  </h2>
                  <p className="mt-2 font-mono text-xs text-muted-foreground">
                    {data.pr.base.repo.full_name}: {data.pr.head.ref} into {data.pr.base.ref}
                  </p>
                  {data.rateLimit ? (
                    <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground/70">
                      GitHub API: {data.rateLimit.authenticated ? "authenticated" : "public"} ·{" "}
                      {data.rateLimit.remaining ?? "?"}/{data.rateLimit.limit ?? "?"} remaining
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={data.pr.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 border border-border/70 px-4 py-2 font-mono text-xs uppercase tracking-[0.13em] text-muted-foreground transition-colors hover:border-electric/40 hover:text-electric"
                  >
                    <ExternalLink className="size-4" />
                    Open PR
                  </a>
                  <button
                    type="button"
                    onClick={copyReview}
                    className="inline-flex items-center gap-2 border border-electric/35 bg-electric/[0.08] px-4 py-2 font-mono text-xs uppercase tracking-[0.13em] text-electric transition-colors hover:bg-electric/[0.14]"
                  >
                    {copied ? <CheckCircle2 className="size-4" /> : <Clipboard className="size-4" />}
                    {copied ? "Copied" : "Copy brief"}
                  </button>
                </div>
              </div>

              <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_1fr]">
                <div>
                  <h3 className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-electric">
                    <GitPullRequest className="size-4" />
                    Summary
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                    {data.analysis.summary.map((line) => (
                      <li key={line} className="border-l border-electric/35 pl-3">{line}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-electric">
                    <ShieldAlert className="size-4" />
                    Test signals
                  </h3>
                  <ul className="mt-4 space-y-2 font-mono text-xs text-muted-foreground">
                    {data.analysis.testSignals.map((line) => (
                      <li key={line} className="border border-border/50 bg-background/35 px-3 py-2">
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>

            <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Findings
                </h2>
                <div className="grid gap-3">
                  {(data.analysis.findings.length
                    ? data.analysis.findings
                    : [
                        {
                          title: "No major heuristic findings",
                          severity: "low" as const,
                          detail:
                            "The PR still needs normal behavioral review, but the automated scan did not find large-scope, test, config, or security signals.",
                          files: [],
                        },
                      ]
                  ).map((finding) => (
                    <article key={finding.title} className={`border p-4 ${severityClass(finding.severity)}`}>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-foreground">{finding.title}</h3>
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
                          {finding.severity}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{finding.detail}</p>
                      {finding.files.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {finding.files.map((file) => (
                            <span key={file} className="border border-border/60 bg-background/45 px-2 py-1 font-mono text-[11px] text-muted-foreground">
                              {file}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Review comments
                </h2>
                <div className="space-y-3">
                  {data.analysis.suggestedComments.map((comment) => (
                    <div key={comment} className="border border-border/60 bg-card/75 p-4 text-sm leading-relaxed text-foreground">
                      {comment}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <FileCode2 className="size-4 text-electric" />
                Diff hotspots
              </h2>
              <div className="grid gap-2">
                {data.analysis.hotspots.map((file) => (
                  <a
                    key={file.filename}
                    href={file.blob_url}
                    target="_blank"
                    rel="noreferrer"
                    className="grid gap-3 border border-border/60 bg-card/75 p-4 transition-colors hover:border-electric/35 sm:grid-cols-[1fr_auto]"
                  >
                    <span className="min-w-0 break-words font-mono text-sm text-foreground">{file.filename}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      +{file.additions.toLocaleString()} / -{file.deletions.toLocaleString()} · {file.status}
                    </span>
                  </a>
                ))}
              </div>
            </section>
          </section>
        ) : (
          <section className="grid gap-3 sm:grid-cols-3">
            {[
              ["Scope", "Changed files, additions, deletions, branch target, and commit volume."],
              ["Risk", "Heuristics for tests, auth, config, data mutation, and browser injection patterns."],
              ["Output", "A copyable review brief and concrete comments you can paste into GitHub."],
            ].map(([title, body]) => (
              <article key={title} className="border border-border/60 bg-card/70 p-5 backdrop-blur-sm">
                <h2 className="font-mono text-sm uppercase tracking-[0.14em] text-electric">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default GithubPrReviewer;
