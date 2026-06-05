import { describe, expect, it } from "vitest";
import {
  analyzePullRequest,
  buildGithubApiUrl,
  parsePullRequestUrl,
  type GithubCommit,
  type GithubPullRequest,
  type GithubPullRequestFile,
} from "./github-pr-reviewer";

const basePr: GithubPullRequest = {
  html_url: "https://github.com/aliasist/example/pull/12",
  number: 12,
  state: "open",
  title: "Improve auth flow",
  body: null,
  user: { login: "aliasist" },
  draft: false,
  merged: false,
  additions: 200,
  deletions: 40,
  changed_files: 4,
  commits: 2,
  created_at: "2026-05-29T00:00:00Z",
  updated_at: "2026-05-29T00:00:00Z",
  base: {
    ref: "main",
    repo: {
      full_name: "aliasist/example",
      default_branch: "main",
    },
  },
  head: {
    ref: "feature/auth",
    repo: {
      full_name: "aliasist/example",
    },
  },
};

const commits: GithubCommit[] = [
  {
    sha: "abc",
    html_url: "https://github.com/aliasist/example/commit/abc",
    commit: {
      message: "Add auth checks",
      author: {
        name: "Blake",
        date: "2026-05-29T00:00:00Z",
      },
    },
  },
];

describe("parsePullRequestUrl", () => {
  it("parses a full GitHub pull request URL", () => {
    expect(parsePullRequestUrl("https://github.com/aliasist/example/pull/42")).toEqual({
      owner: "aliasist",
      repo: "example",
      pullNumber: 42,
    });
  });

  it("supports trailing URL noise from copied browser URLs", () => {
    expect(parsePullRequestUrl("https://github.com/aliasist/example/pull/42/files#diff")).toEqual({
      owner: "aliasist",
      repo: "example",
      pullNumber: 42,
    });
  });

  it("rejects non-PR input", () => {
    expect(parsePullRequestUrl("aliasist/example#42")).toBeNull();
  });
});

describe("buildGithubApiUrl", () => {
  it("builds pull request API URLs", () => {
    expect(
      buildGithubApiUrl({
        owner: "aliasist",
        repo: "example",
        pullNumber: 42,
      }),
    ).toBe("https://api.github.com/repos/aliasist/example/pulls/42");
  });
});

describe("analyzePullRequest", () => {
  it("flags security-sensitive PRs without tests", () => {
    const files: GithubPullRequestFile[] = [
      {
        filename: "src/auth/session.ts",
        status: "modified",
        additions: 160,
        deletions: 20,
        changes: 180,
        patch: "+ localStorage.setItem('token', token)",
      },
      {
        filename: "wrangler.toml",
        status: "modified",
        additions: 8,
        deletions: 2,
        changes: 10,
      },
    ];

    const result = analyzePullRequest(
      { ...basePr, changed_files: files.length },
      files,
      commits,
    );

    expect(result.riskLabel).not.toBe("Low");
    expect(result.findings.map((finding) => finding.title)).toContain(
      "Authentication or security-sensitive code changed",
    );
    expect(result.findings.map((finding) => finding.title)).toContain(
      "No obvious test coverage changed",
    );
  });

  it("recognizes test files as coverage signals", () => {
    const files: GithubPullRequestFile[] = [
      {
        filename: "src/lib/github-pr-reviewer.ts",
        status: "modified",
        additions: 40,
        deletions: 5,
        changes: 45,
      },
      {
        filename: "src/lib/github-pr-reviewer.test.ts",
        status: "added",
        additions: 80,
        deletions: 0,
        changes: 80,
      },
    ];

    const result = analyzePullRequest(
      { ...basePr, additions: 120, deletions: 5, changed_files: files.length },
      files,
      commits,
    );

    expect(result.testSignals).toContain("src/lib/github-pr-reviewer.test.ts");
    expect(result.findings.map((finding) => finding.title)).not.toContain(
      "No obvious test coverage changed",
    );
  });
});
