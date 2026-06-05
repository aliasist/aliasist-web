import { corsHeaders, json } from "../_lib/clerk-auth";
import {
  analyzeRepository,
  buildRepositoryApiUrl,
  parseRepositoryUrl,
  type GithubPackageManifest,
  type GithubRepository,
  type GithubRepositoryFile,
} from "../../src/lib/github-project-guide";

type PagesContext = {
  request: Request;
  env: Env;
};

interface Env {
  GITHUB_TOKEN?: string;
}

type GithubContentResponse = GithubRepositoryFile[] | { content?: string; encoding?: string };

function getGithubHeaders(env: Env) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "aliasist-github-companion",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (env.GITHUB_TOKEN?.trim()) headers.Authorization = `Bearer ${env.GITHUB_TOKEN.trim()}`;
  return headers;
}

async function fetchGithubJson<T>(url: string, headers: Record<string, string>): Promise<T> {
  const response = await fetch(url, { headers });
  const text = await response.text();
  const parsed = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(typeof parsed?.message === "string" ? parsed.message : `GitHub returned ${response.status}.`);
  }
  return parsed as T;
}

async function fetchOptionalGithubJson<T>(
  url: string,
  headers: Record<string, string>,
  fallback: T,
): Promise<T> {
  try {
    return await fetchGithubJson<T>(url, headers);
  } catch {
    return fallback;
  }
}

function decodeManifest(value: GithubContentResponse): GithubPackageManifest | null {
  if (Array.isArray(value) || value.encoding !== "base64" || !value.content) return null;
  try {
    const text = atob(value.content.replace(/\n/g, ""));
    return JSON.parse(text) as GithubPackageManifest;
  } catch {
    return null;
  }
}

export const onRequestOptions = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export const onRequestPost = async ({ request, env }: PagesContext) => {
  let payload: { url?: unknown };
  try {
    payload = (await request.json()) as { url?: unknown };
  } catch {
    return json({ error: "Expected JSON body." }, 400);
  }

  if (typeof payload.url !== "string" || !payload.url.trim()) {
    return json({ error: "Missing GitHub repository URL." }, 400);
  }

  const ref = parseRepositoryUrl(payload.url);
  if (!ref) return json({ error: "Paste a full GitHub repository URL." }, 400);

  const headers = getGithubHeaders(env);
  try {
    const [repo, files, githubFiles, languages, packageContent] = await Promise.all([
      fetchGithubJson<GithubRepository>(buildRepositoryApiUrl(ref), headers),
      fetchGithubJson<GithubRepositoryFile[]>(buildRepositoryApiUrl(ref, "/contents"), headers),
      fetchOptionalGithubJson<GithubRepositoryFile[]>(buildRepositoryApiUrl(ref, "/contents/.github"), headers, []),
      fetchOptionalGithubJson<Record<string, number>>(buildRepositoryApiUrl(ref, "/languages"), headers, {}),
      fetchOptionalGithubJson<GithubContentResponse>(buildRepositoryApiUrl(ref, "/contents/package.json"), headers, []),
    ]);

    const guide = analyzeRepository(repo, files, githubFiles, languages, decodeManifest(packageContent));
    return json({ repo, guide });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const looksPrivate = /not found|bad credentials|requires authentication/i.test(message);
    return json(
      {
        error: looksPrivate
          ? "GitHub could not read that repository. The first Project Guide release supports public repositories."
          : message,
      },
      looksPrivate ? 401 : 502,
    );
  }
};
