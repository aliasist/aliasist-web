import { json } from "../../_lib/clerk-auth";
import {
  createInstallationToken,
  fetchPullRequestForReview,
  publishReviewCheck,
  verifyGithubWebhook,
  type GithubAppEnv,
} from "../../_lib/github-app";
import { analyzePullRequest } from "../../../src/lib/github-pr-reviewer";

type PagesContext = {
  request: Request;
  env: GithubAppEnv;
};

type PullRequestWebhook = {
  action?: string;
  installation?: {
    id?: number;
  };
  repository?: {
    name?: string;
    owner?: {
      login?: string;
    };
  };
  pull_request?: {
    number?: number;
    html_url?: string;
    head?: {
      sha?: string;
    };
  };
};

const supportedActions = new Set(["opened", "reopened", "synchronize", "ready_for_review"]);

/**
 * POST /api/github/webhook
 * Receives GitHub App pull_request events, verifies their signatures, reviews
 * the PR using the same deterministic analyzer as the site, and creates a Check Run.
 */
export const onRequestPost = async ({ request, env }: PagesContext) => {
  const secret = env.GITHUB_WEBHOOK_SECRET?.trim();
  if (!secret) return json({ error: "GITHUB_WEBHOOK_SECRET is not configured." }, 503);

  const body = await request.text();
  const valid = await verifyGithubWebhook(
    secret,
    request.headers.get("X-Hub-Signature-256"),
    body,
  );
  if (!valid) return json({ error: "Invalid webhook signature." }, 401);

  const event = request.headers.get("X-GitHub-Event");
  const deliveryId = request.headers.get("X-GitHub-Delivery") || crypto.randomUUID();

  if (event === "ping") return json({ ok: true, event: "ping" });
  if (event !== "pull_request") return json({ ok: true, ignored: true, event });

  let payload: PullRequestWebhook;
  try {
    payload = JSON.parse(body) as PullRequestWebhook;
  } catch {
    return json({ error: "Invalid webhook JSON." }, 400);
  }

  if (!payload.action || !supportedActions.has(payload.action)) {
    return json({ ok: true, ignored: true, action: payload.action || null });
  }

  const installationId = payload.installation?.id;
  const owner = payload.repository?.owner?.login;
  const repo = payload.repository?.name;
  const pullNumber = payload.pull_request?.number;
  const headSha = payload.pull_request?.head?.sha;
  const detailsUrl = payload.pull_request?.html_url;

  if (!installationId || !owner || !repo || !pullNumber || !headSha || !detailsUrl) {
    return json({ error: "Webhook payload is missing required PR fields." }, 400);
  }

  try {
    const token = await createInstallationToken(env, installationId);
    const { pr, files, commits } = await fetchPullRequestForReview(token, owner, repo, pullNumber);
    const analysis = analyzePullRequest(pr, files, commits);
    await publishReviewCheck({
      token,
      owner,
      repo,
      headSha,
      deliveryId,
      analysis,
      detailsUrl,
    });

    return json({
      ok: true,
      reviewed: true,
      repository: `${owner}/${repo}`,
      pullNumber,
      riskLabel: analysis.riskLabel,
      riskScore: analysis.riskScore,
    });
  } catch (err) {
    return json(
      {
        error: "GitHub App review failed.",
        message: err instanceof Error ? err.message : String(err),
      },
      502,
    );
  }
};
