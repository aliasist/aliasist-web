export type GithubRepositoryRef = {
  owner: string;
  repo: string;
};

export type GithubRepository = {
  html_url: string;
  full_name: string;
  name: string;
  description: string | null;
  homepage: string | null;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  topics?: string[];
  created_at: string;
  updated_at: string;
  license?: {
    spdx_id?: string | null;
    name?: string | null;
  } | null;
};

export type GithubRepositoryFile = {
  name: string;
  path: string;
  type: "file" | "dir" | string;
  html_url?: string;
};

export type GithubPackageManifest = {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

export type GithubInstallationState = {
  status: "installed" | "not_installed" | "unknown";
  installed: boolean;
  installUrl: string;
  installationId?: number;
  account?: string;
  reason?: string;
};

export type ProjectGuideAnalysis = {
  overview: string[];
  projectType: string;
  healthSignals: Array<{
    label: string;
    state: "present" | "missing" | "review";
    detail: string;
  }>;
  importantFiles: Array<{
    path: string;
    explanation: string;
    url: string;
  }>;
  recommendedNextSteps: string[];
  glossary: Array<{
    term: string;
    meaning: string;
  }>;
  contextSources: string[];
};

const repoUrlPattern =
  /^https?:\/\/github\.com\/([^/\s]+)\/([^/\s#?]+?)(?:\.git)?(?:[/?#].*)?$/i;

export function parseRepositoryUrl(input: string): GithubRepositoryRef | null {
  const match = input.trim().match(repoUrlPattern);
  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2],
  };
}

export function buildRepositoryApiUrl(ref: GithubRepositoryRef, path = "") {
  return `https://api.github.com/repos/${ref.owner}/${ref.repo}${path}`;
}

function includesFile(files: GithubRepositoryFile[], names: string[]) {
  return files.some((file) => names.includes(file.name.toLowerCase()));
}

function getProjectType(files: GithubRepositoryFile[], manifest?: GithubPackageManifest | null) {
  const deps = {
    ...(manifest?.dependencies ?? {}),
    ...(manifest?.devDependencies ?? {}),
  };

  if ("next" in deps) return "Next.js web application";
  if ("react" in deps && "vite" in deps) return "React and Vite web application";
  if ("react" in deps) return "React web application";
  if (includesFile(files, ["package.json"])) return "JavaScript or TypeScript project";
  if (includesFile(files, ["pyproject.toml", "requirements.txt", "setup.py"])) return "Python project";
  if (includesFile(files, ["cargo.toml"])) return "Rust project";
  if (includesFile(files, ["go.mod"])) return "Go project";
  return "software project";
}

function explainFile(path: string): string {
  const lower = path.toLowerCase();
  if (lower === "readme.md") return "The project introduction and setup guide.";
  if (lower === "license" || lower.startsWith("license.")) return "The rules for reusing and sharing this project.";
  if (lower === "package.json") return "The JavaScript project manifest, including scripts and dependencies.";
  if (lower === "pyproject.toml" || lower === "requirements.txt") return "Python dependencies and project setup information.";
  if (lower === "cargo.toml") return "Rust package configuration and dependencies.";
  if (lower === "go.mod") return "Go module name and dependencies.";
  if (lower === "contributing.md") return "Instructions for people who want to contribute changes.";
  if (lower === "security.md") return "Instructions for reporting security concerns.";
  if (lower === ".gitignore") return "Files Git should intentionally leave out of commits.";
  if (lower === ".github") return "GitHub automation, templates, and repository configuration.";
  if (lower === "src") return "The main application source-code folder.";
  return "An important project file or folder.";
}

export function analyzeRepository(
  repo: GithubRepository,
  files: GithubRepositoryFile[],
  githubFiles: GithubRepositoryFile[] = [],
  languages: Record<string, number> = {},
  manifest?: GithubPackageManifest | null,
): ProjectGuideAnalysis {
  const hasReadme = includesFile(files, ["readme.md", "readme"]);
  const hasLicense =
    Boolean(repo.license?.spdx_id && repo.license.spdx_id !== "NOASSERTION") ||
    files.some((file) => file.name.toLowerCase().startsWith("license"));
  const hasContributing = includesFile(files, ["contributing.md"]);
  const hasSecurity = includesFile(files, ["security.md"]);
  const hasGitignore = includesFile(files, [".gitignore"]);
  const hasWorkflows = githubFiles.some((file) => file.name.toLowerCase() === "workflows");
  const projectType = getProjectType(files, manifest);
  const languageNames = Object.keys(languages).slice(0, 5);
  const runScripts = manifest?.scripts ? Object.keys(manifest.scripts).slice(0, 6) : [];

  const overview = [
    repo.description?.trim() || `${repo.full_name} is a ${projectType.toLowerCase()}.`,
    `The default branch is ${repo.default_branch}. This is the main version people usually see first.`,
    languageNames.length
      ? `The primary languages detected by GitHub are ${languageNames.join(", ")}.`
      : "GitHub has not reported a primary programming language yet.",
  ];

  if (runScripts.length) {
    overview.push(`Available project scripts include ${runScripts.join(", ")}.`);
  }

  const healthSignals: ProjectGuideAnalysis["healthSignals"] = [
    {
      label: "Project introduction",
      state: hasReadme ? "present" : "missing",
      detail: hasReadme ? "README found." : "Add a README so visitors know what the project does.",
    },
    {
      label: "Reuse terms",
      state: hasLicense ? "present" : "missing",
      detail: hasLicense
        ? `License detected: ${repo.license?.spdx_id || "license file present"}.`
        : "No license was detected. Public code is not automatically reusable without one.",
    },
    {
      label: "Contribution guide",
      state: hasContributing ? "present" : "review",
      detail: hasContributing
        ? "Contribution instructions found."
        : "Consider adding CONTRIBUTING.md when you want other people to help.",
    },
    {
      label: "Security guidance",
      state: hasSecurity ? "present" : "review",
      detail: hasSecurity
        ? "Security reporting instructions found."
        : "Consider adding SECURITY.md before inviting outside users.",
    },
    {
      label: "GitHub automation",
      state: hasWorkflows ? "present" : "review",
      detail: hasWorkflows
        ? "GitHub Actions workflow folder found."
        : "No GitHub Actions workflow folder was detected.",
    },
  ];

  const importantNames = [
    "readme.md",
    "license",
    "license.md",
    "package.json",
    "pyproject.toml",
    "requirements.txt",
    "cargo.toml",
    "go.mod",
    "contributing.md",
    "security.md",
    ".gitignore",
    ".github",
    "src",
  ];
  const importantFiles = files
    .filter((file) => importantNames.includes(file.name.toLowerCase()))
    .slice(0, 10)
    .map((file) => ({
      path: file.path,
      explanation: explainFile(file.path),
      url: `${repo.html_url}/${file.type === "dir" ? "tree" : "blob"}/${repo.default_branch}/${file.path}`,
    }));

  const recommendedNextSteps: string[] = [];
  if (!hasReadme) recommendedNextSteps.push("Add a README with the project goal and local setup steps.");
  if (!hasLicense) recommendedNextSteps.push("Choose a license before encouraging other people to reuse the code.");
  if (!hasGitignore) recommendedNextSteps.push("Add a .gitignore file so generated files and local secrets stay out of commits.");
  if (!hasWorkflows) recommendedNextSteps.push("Add a basic GitHub Actions check that builds or tests the project.");
  if (!hasContributing) recommendedNextSteps.push("Add a short contribution guide when you are ready for collaborators.");
  if (recommendedNextSteps.length < 3) {
    recommendedNextSteps.push("Open the README and confirm the setup instructions still work on a clean machine.");
  }
  if (recommendedNextSteps.length < 3) {
    recommendedNextSteps.push("Review open issues and choose one small, clearly scoped improvement.");
  }
  if (recommendedNextSteps.length < 3) {
    recommendedNextSteps.push("Create a pull request for the next change so it can be reviewed before merging.");
  }

  return {
    overview,
    projectType,
    healthSignals,
    importantFiles,
    recommendedNextSteps: recommendedNextSteps.slice(0, 3),
    glossary: [
      {
        term: "Repository",
        meaning: "The project folder GitHub stores, including code, documentation, and change history.",
      },
      {
        term: "Branch",
        meaning: "A separate line of work where you can make changes without immediately changing the main version.",
      },
      {
        term: "Commit",
        meaning: "A saved checkpoint describing a specific set of file changes.",
      },
      {
        term: "Pull request",
        meaning: "A proposed change that can be reviewed and discussed before it is merged.",
      },
    ],
    contextSources: [
      repo.html_url,
      ...importantFiles.map((file) => file.url),
    ],
  };
}
