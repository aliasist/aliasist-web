export type PullRequestRef = {
  owner: string;
  repo: string;
  pullNumber: number;
};

export type GithubUser = {
  login: string;
  avatar_url?: string;
  html_url?: string;
};

export type GithubPullRequest = {
  html_url: string;
  number: number;
  state: string;
  title: string;
  body: string | null;
  user: GithubUser | null;
  draft: boolean;
  merged: boolean;
  mergeable_state?: string;
  additions: number;
  deletions: number;
  changed_files: number;
  commits: number;
  created_at: string;
  updated_at: string;
  base: {
    ref: string;
    repo: {
      full_name: string;
      default_branch: string;
    };
  };
  head: {
    ref: string;
    repo: {
      full_name: string;
    } | null;
  };
};

export type GithubPullRequestFile = {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  raw_url?: string;
  blob_url?: string;
};

export type GithubCommit = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author?: {
      name?: string;
      date?: string;
    };
  };
  author?: GithubUser | null;
};

export type ReviewFinding = {
  title: string;
  severity: "high" | "medium" | "low";
  detail: string;
  files: string[];
};

export type ReviewAnalysis = {
  riskScore: number;
  riskLabel: "Low" | "Medium" | "High";
  summary: string[];
  findings: ReviewFinding[];
  testSignals: string[];
  suggestedComments: string[];
  hotspots: GithubPullRequestFile[];
};

const prUrlPattern =
  /^https?:\/\/github\.com\/([^/\s]+)\/([^/\s]+)\/pull\/(\d+)(?:[/?#].*)?$/i;

export function parsePullRequestUrl(input: string): PullRequestRef | null {
  const trimmed = input.trim();
  const match = trimmed.match(prUrlPattern);
  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2],
    pullNumber: Number(match[3]),
  };
}

export function buildGithubApiUrl(ref: PullRequestRef, path = "") {
  return `https://api.github.com/repos/${ref.owner}/${ref.repo}/pulls/${ref.pullNumber}${path}`;
}

function includesAny(value: string, needles: string[]) {
  const lower = value.toLowerCase();
  return needles.some((needle) => lower.includes(needle));
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function getExtension(filename: string) {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "none";
}

function hasPatchSignal(file: GithubPullRequestFile, signals: string[]) {
  return includesAny(file.patch ?? "", signals);
}

export function analyzePullRequest(
  pr: GithubPullRequest,
  files: GithubPullRequestFile[],
  commits: GithubCommit[],
): ReviewAnalysis {
  const totalChanges = pr.additions + pr.deletions;
  const changedExtensions = unique(files.map((file) => getExtension(file.filename)));
  const testFiles = files.filter((file) =>
    includesAny(file.filename, [
      ".test.",
      ".spec.",
      "__tests__",
      "/tests/",
      "/test/",
      "vitest",
      "playwright",
      "cypress",
    ]),
  );
  const configFiles = files.filter((file) =>
    includesAny(file.filename, [
      "package.json",
      "package-lock.json",
      "pnpm-lock.yaml",
      "yarn.lock",
      "vite.config",
      "next.config",
      "tsconfig",
      ".env",
      "wrangler",
      "schema",
      "migration",
      "dockerfile",
    ]),
  );
  const securityFiles = files.filter((file) =>
    includesAny(file.filename, [
      "auth",
      "login",
      "session",
      "token",
      "password",
      "secret",
      "permission",
      "policy",
      "middleware",
      "cors",
      "csrf",
      "oauth",
    ]),
  );
  const destructiveSignals = files.filter((file) =>
    hasPatchSignal(file, ["dangerouslySetInnerHTML", "eval(", "innerHTML", "localStorage", "document.cookie"]),
  );
  const dataMutationSignals = files.filter((file) =>
    hasPatchSignal(file, ["delete from", "drop table", "truncate", "update ", "insert into", "migration"]),
  );

  const findings: ReviewFinding[] = [];

  if (totalChanges > 900 || pr.changed_files > 24) {
    findings.push({
      title: "Large review surface",
      severity: totalChanges > 1800 || pr.changed_files > 40 ? "high" : "medium",
      detail:
        "This PR changes enough code that reviewers should ask for a scoped walkthrough and verify the highest-change files first.",
      files: files
        .slice()
        .sort((a, b) => b.changes - a.changes)
        .slice(0, 5)
        .map((file) => file.filename),
    });
  }

  if (testFiles.length === 0 && totalChanges > 80) {
    findings.push({
      title: "No obvious test coverage changed",
      severity: totalChanges > 350 ? "high" : "medium",
      detail:
        "The diff does not include recognizable test files. Ask how the behavior was verified and whether a focused regression test belongs in this PR.",
      files: [],
    });
  }

  if (securityFiles.length > 0) {
    findings.push({
      title: "Authentication or security-sensitive code changed",
      severity: "high",
      detail:
        "Files with auth, token, policy, or middleware naming changed. Review access control paths, failure states, and secret handling before approval.",
      files: securityFiles.slice(0, 6).map((file) => file.filename),
    });
  }

  if (configFiles.length > 0) {
    findings.push({
      title: "Runtime or dependency configuration changed",
      severity: "medium",
      detail:
        "Config, lockfile, schema, environment, or deployment files changed. Verify local build behavior and production deployment assumptions.",
      files: configFiles.slice(0, 6).map((file) => file.filename),
    });
  }

  if (destructiveSignals.length > 0) {
    findings.push({
      title: "Browser injection or client storage signal",
      severity: "medium",
      detail:
        "The patch contains DOM injection, eval, cookie, or localStorage-related patterns. Check sanitization and data exposure boundaries.",
      files: destructiveSignals.slice(0, 6).map((file) => file.filename),
    });
  }

  if (dataMutationSignals.length > 0) {
    findings.push({
      title: "Data mutation path changed",
      severity: "medium",
      detail:
        "The patch includes database mutation or migration signals. Confirm rollback behavior, idempotence, and existing-data compatibility.",
      files: dataMutationSignals.slice(0, 6).map((file) => file.filename),
    });
  }

  const commitMessages = commits.map((commit) => commit.commit.message.split("\n")[0]);
  const hasWipCommit = commitMessages.some((message) => /\b(wip|fixup|temp|debug)\b/i.test(message));
  if (hasWipCommit) {
    findings.push({
      title: "Commit history may need cleanup",
      severity: "low",
      detail:
        "One or more commit titles look temporary. Ask whether the branch should be squashed or cleaned before merge.",
      files: [],
    });
  }

  const riskScore = Math.min(
    100,
    Math.round(
      pr.changed_files * 1.6 +
        totalChanges / 35 +
        findings.filter((finding) => finding.severity === "high").length * 22 +
        findings.filter((finding) => finding.severity === "medium").length * 11 +
        configFiles.length * 1.5 +
        securityFiles.length * 4,
    ),
  );
  const riskLabel = riskScore >= 66 ? "High" : riskScore >= 34 ? "Medium" : "Low";
  const hotspots = files.slice().sort((a, b) => b.changes - a.changes).slice(0, 8);

  const summary = [
    `${pr.changed_files} files changed with ${pr.additions.toLocaleString()} additions and ${pr.deletions.toLocaleString()} deletions.`,
    `${commits.length} commits from ${pr.head.ref} into ${pr.base.ref}.`,
    `Primary file types: ${changedExtensions.slice(0, 8).join(", ")}.`,
  ];

  const testSignals =
    testFiles.length > 0
      ? testFiles.slice(0, 6).map((file) => file.filename)
      : ["No test files detected in the PR diff."];

  const suggestedComments = [
    testFiles.length === 0
      ? "Can you add or point to the regression coverage for the main behavior changed here?"
      : "Which test path gives the strongest confidence for the main behavior change?",
    securityFiles.length > 0
      ? "Can you walk through the auth and failure-state paths touched by this PR?"
      : "What production path is most likely to regress if this ships?",
    configFiles.length > 0
      ? "Do these config or dependency changes need a deploy note, migration order, or rollback step?"
      : "Is there any setup, environment, or deploy assumption reviewers should know about?",
  ];

  return {
    riskScore,
    riskLabel,
    summary,
    findings,
    testSignals,
    suggestedComments,
    hotspots,
  };
}
