import { corsHeaders, json } from "../_lib/clerk-auth";

type PagesContext = {
  request: Request;
  env: Env;
};

interface Env {
  /**
   * Optional site-owned GitHub token for higher public API limits.
   * For private repositories, prefer a user token or GitHub App installation token.
   */
  GITHUB_TOKEN?: string;
}

type PullRequestRef = {
  owner: string;
  repo: string;
  pullNumber: number;
};

const prUrlPattern =
  /^https?:\/\/github\.com\/([^/\s]+)\/([^/\s]+)\/pull\/(\d+)(?:[/?#].*)?$/i;

function parsePullRequestUrl(input: string): PullRequestRef | null {
  const match = input.trim().match(prUrlPattern);
  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2],
    pullNumber: Number(match[3]),
  };
}

function buildGithubApiUrl(ref: PullRequestRef, path = "") {
  return `https://api.github.com/repos/${ref.owner}/${ref.repo}/pulls/${ref.pullNumber}${path}`;
}

function getForwardedGithubToken(request: Request, env: Env) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice("Bearer ".length).trim();
  return env.GITHUB_TOKEN?.trim() || "";
}

async function fetchGithubJson<T>(url: string, token: string): Promise<{ data: T; response: Response }> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "aliasist-pr-reviewer",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, { headers });
  const text = await response.text();
  const parsed = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      typeof parsed?.message === "string"
        ? parsed.message
        : `GitHub returned ${response.status}.`;
    throw new Error(message);
  }

  return { data: parsed as T, response };
}

export const onRequestOptions = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

/**
 * POST /api/github-pr-review
 * Body: { url: "https://github.com/owner/repo/pull/123" }
 *
 * Optional:
 * - Authorization: Bearer <GitHub token> for private repos or higher user limits.
 * - GITHUB_TOKEN env var for a site-owned public API token.
 */
export const onRequestPost = async ({ request, env }: PagesContext) => {
  let payload: { url?: unknown };

  try {
    payload = (await request.json()) as { url?: unknown };
  } catch {
    return json({ error: "Expected JSON body." }, 400);
  }

  if (typeof payload.url !== "string" || !payload.url.trim()) {
    return json({ error: "Missing GitHub PR URL." }, 400);
  }

  const ref = parsePullRequestUrl(payload.url);
  if (!ref) {
    return json({ error: "Paste a full GitHub PR URL." }, 400);
  }

  const token = getForwardedGithubToken(request, env);

  try {
    const [prResult, filesResult, commitsResult] = await Promise.all([
      fetchGithubJson(buildGithubApiUrl(ref), token),
      fetchGithubJson(buildGithubApiUrl(ref, "/files?per_page=100"), token),
      fetchGithubJson(buildGithubApiUrl(ref, "/commits?per_page=100"), token),
    ]);

    return json({
      pr: prResult.data,
      files: filesResult.data,
      commits: commitsResult.data,
      rateLimit: {
        limit: prResult.response.headers.get("x-ratelimit-limit"),
        remaining: prResult.response.headers.get("x-ratelimit-remaining"),
        reset: prResult.response.headers.get("x-ratelimit-reset"),
        authenticated: Boolean(token),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const looksPrivate = /not found|bad credentials|requires authentication/i.test(message);
    return json(
      {
        error: looksPrivate
          ? "GitHub could not read that PR. If it is private, connect with a GitHub token that has repository read access."
          : message,
      },
      looksPrivate ? 401 : 502,
    );
  }
};
