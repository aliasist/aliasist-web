import { json } from "../../_lib/clerk-auth";
import { createGithubAppJwt, type GithubAppEnv } from "../../_lib/github-app";

type PagesContext = {
  request: Request;
  env: GithubAppEnv;
};

const INSTALL_URL = "https://github.com/apps/aliasist-pr-reviewer/installations/new";

function status(
  statusName: "installed" | "not_installed" | "unknown",
  extras: Record<string, unknown> = {},
) {
  return {
    status: statusName,
    installed: statusName === "installed",
    installUrl: INSTALL_URL,
    ...extras,
  };
}

export async function onRequestGet({ request, env }: PagesContext): Promise<Response> {
  const url = new URL(request.url);
  const owner = url.searchParams.get("owner")?.trim();
  const repo = url.searchParams.get("repo")?.trim();

  if (!owner || !repo) {
    return json({ error: "Repository owner and name are required." }, 400);
  }

  if (!env.GITHUB_APP_ID || !env.GITHUB_APP_PRIVATE_KEY) {
    return json(status("unknown", { reason: "GitHub App credentials are not configured." }));
  }

  try {
    const jwt = await createGithubAppJwt(env);
    const githubResponse = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/installation`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${jwt}`,
          "User-Agent": "aliasist-pr-reviewer",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    if (githubResponse.status === 404) {
      return json(status("not_installed"));
    }

    if (!githubResponse.ok) {
      return json(
        status("unknown", { reason: "GitHub installation status is temporarily unavailable." }),
      );
    }

    const installation = (await githubResponse.json()) as {
      id: number;
      account?: { login?: string };
    };

    return json(
      status("installed", {
        installationId: installation.id,
        account: installation.account?.login,
      }),
    );
  } catch (error) {
    return json(
      status("unknown", {
        reason: error instanceof Error ? error.message : "Unable to check GitHub App installation.",
      }),
    );
  }
}
