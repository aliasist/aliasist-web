import { describe, expect, it } from "vitest";
import {
  analyzeRepository,
  buildRepositoryApiUrl,
  parseRepositoryUrl,
  type GithubRepository,
} from "./github-project-guide";

const repo: GithubRepository = {
  html_url: "https://github.com/aliasist/example",
  full_name: "aliasist/example",
  name: "example",
  description: "A small example application.",
  homepage: null,
  default_branch: "main",
  language: "TypeScript",
  stargazers_count: 2,
  forks_count: 0,
  open_issues_count: 1,
  topics: [],
  created_at: "2026-05-01T00:00:00Z",
  updated_at: "2026-05-29T00:00:00Z",
  license: null,
};

describe("parseRepositoryUrl", () => {
  it("parses repository URLs and removes .git", () => {
    expect(parseRepositoryUrl("https://github.com/aliasist/example.git")).toEqual({
      owner: "aliasist",
      repo: "example",
    });
  });

  it("rejects non-GitHub input", () => {
    expect(parseRepositoryUrl("aliasist/example")).toBeNull();
  });
});

describe("buildRepositoryApiUrl", () => {
  it("builds repository API paths", () => {
    expect(buildRepositoryApiUrl({ owner: "aliasist", repo: "example" }, "/languages")).toBe(
      "https://api.github.com/repos/aliasist/example/languages",
    );
  });
});

describe("analyzeRepository", () => {
  it("explains a React project and recommends missing basics", () => {
    const result = analyzeRepository(
      repo,
      [
        { name: "README.md", path: "README.md", type: "file" },
        { name: "package.json", path: "package.json", type: "file" },
        { name: "src", path: "src", type: "dir" },
      ],
      [],
      { TypeScript: 900, CSS: 100 },
      { dependencies: { react: "^18.0.0" }, devDependencies: { vite: "^6.0.0" } },
    );

    expect(result.projectType).toBe("React and Vite web application");
    expect(result.recommendedNextSteps).toContain(
      "Choose a license before encouraging other people to reuse the code.",
    );
    expect(result.contextSources).toContain("https://github.com/aliasist/example");
  });
});
