import type {
  GithubCommit,
  GithubPullRequest,
  GithubPullRequestFile,
  ReviewAnalysis,
} from "../../src/lib/github-pr-reviewer";

const GITHUB_API_VERSION = "2022-11-28";
const textEncoder = new TextEncoder();

export type GithubAppEnv = {
  GITHUB_APP_ID?: string;
  GITHUB_APP_CLIENT_ID?: string;
  GITHUB_APP_PRIVATE_KEY?: string;
  GITHUB_WEBHOOK_SECRET?: string;
};

type GithubErrorPayload = {
  message?: string;
};

function bytesToBase64(bytes: Uint8Array) {
  let value = "";
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value);
}

function base64Url(input: string | Uint8Array) {
  const value = typeof input === "string" ? btoa(input) : bytesToBase64(input);
  return value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function pemToBytes(pem: string) {
  const normalized = pem.replace(/\\n/g, "\n");
  const base64 = normalized.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function concatBytes(...arrays: Uint8Array[]) {
  const output = new Uint8Array(arrays.reduce((total, array) => total + array.length, 0));
  let offset = 0;
  for (const array of arrays) {
    output.set(array, offset);
    offset += array.length;
  }
  return output;
}

function derLength(length: number) {
  if (length < 128) return Uint8Array.of(length);
  const bytes: number[] = [];
  let remaining = length;
  while (remaining > 0) {
    bytes.unshift(remaining & 0xff);
    remaining >>= 8;
  }
  return Uint8Array.of(0x80 | bytes.length, ...bytes);
}

function der(tag: number, value: Uint8Array) {
  return concatBytes(Uint8Array.of(tag), derLength(value.length), value);
}

function wrapPkcs1AsPkcs8(pkcs1: Uint8Array) {
  const rsaEncryptionAlgorithm = Uint8Array.of(
    0x30, 0x0d,
    0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01,
    0x05, 0x00,
  );
  return der(
    0x30,
    concatBytes(
      Uint8Array.of(0x02, 0x01, 0x00),
      rsaEncryptionAlgorithm,
      der(0x04, pkcs1),
    ),
  );
}

async function importGithubPrivateKey(pem: string) {
  const bytes = pemToBytes(pem);
  const pkcs8 = pem.includes("BEGIN RSA PRIVATE KEY") ? wrapPkcs1AsPkcs8(bytes) : bytes;
  return crypto.subtle.importKey(
    "pkcs8",
    pkcs8,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

export async function createGithubAppJwt(env: GithubAppEnv) {
  const issuer = env.GITHUB_APP_CLIENT_ID?.trim() || env.GITHUB_APP_ID?.trim();
  const privateKey = env.GITHUB_APP_PRIVATE_KEY?.trim();
  if (!issuer || !privateKey) throw new Error("GitHub App credentials are not configured.");

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(JSON.stringify({ iat: now - 60, exp: now + 9 * 60, iss: issuer }));
  const unsigned = `${header}.${payload}`;
  const key = await importGithubPrivateKey(privateKey);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, textEncoder.encode(unsigned));
  return `${unsigned}.${base64Url(new Uint8Array(signature))}`;
}

async function githubJson<T>(
  url: string,
  token: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "aliasist-pr-reviewer",
      "X-GitHub-Api-Version": GITHUB_API_VERSION,
      ...init.headers,
    },
  });
  const text = await response.text();
  const payload = text ? (JSON.parse(text) as T & GithubErrorPayload) : ({} as T & GithubErrorPayload);
  if (!response.ok) {
    throw new Error(payload.message || `GitHub returned ${response.status}.`);
  }
  return payload;
}

export async function createInstallationToken(env: GithubAppEnv, installationId: number) {
  const jwt = await createGithubAppJwt(env);
  const payload = await githubJson<{ token: string }>(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    jwt,
    { method: "POST" },
  );
  return payload.token;
}

export async function fetchPullRequestForReview(
  token: string,
  owner: string,
  repo: string,
  pullNumber: number,
) {
  const base = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`;
  const [pr, files, commits] = await Promise.all([
    githubJson<GithubPullRequest>(base, token),
    githubJson<GithubPullRequestFile[]>(`${base}/files?per_page=100`, token),
    githubJson<GithubCommit[]>(`${base}/commits?per_page=100`, token),
  ]);
  return { pr, files, commits };
}

function formatFinding(finding: ReviewAnalysis["findings"][number]) {
  const files = finding.files.length ? `\n\nFiles: ${finding.files.map((file) => `\`${file}\``).join(", ")}` : "";
  return `### ${finding.severity.toUpperCase()}: ${finding.title}\n${finding.detail}${files}`;
}

export async function publishReviewCheck(input: {
  token: string;
  owner: string;
  repo: string;
  headSha: string;
  deliveryId: string;
  analysis: ReviewAnalysis;
  detailsUrl: string;
}) {
  const { token, owner, repo, headSha, deliveryId, analysis, detailsUrl } = input;
  const findings = analysis.findings.length
    ? analysis.findings.map(formatFinding).join("\n\n")
    : "No major heuristic findings. Continue with normal behavioral review.";
  const conclusion =
    analysis.riskLabel === "High" ? "action_required" : analysis.riskLabel === "Medium" ? "neutral" : "success";

  return githubJson(
    `https://api.github.com/repos/${owner}/${repo}/check-runs`,
    token,
    {
      method: "POST",
      body: JSON.stringify({
        name: "Aliasist PR Review",
        head_sha: headSha,
        status: "completed",
        conclusion,
        external_id: deliveryId,
        details_url: detailsUrl,
        output: {
          title: `${analysis.riskLabel} risk - ${analysis.riskScore}/100`,
          summary: analysis.summary.map((line) => `- ${line}`).join("\n"),
          text: `${findings}\n\n## Suggested review comments\n${analysis.suggestedComments
            .map((comment) => `- ${comment}`)
            .join("\n")}`,
        },
      }),
    },
  );
}

function hexToBytes(hex: string) {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) return null;
  return Uint8Array.from(hex.match(/.{2}/g) ?? [], (byte) => Number.parseInt(byte, 16));
}

export async function verifyGithubWebhook(
  secret: string,
  signatureHeader: string | null,
  body: string,
) {
  if (!signatureHeader?.startsWith("sha256=")) return false;
  const signature = hexToBytes(signatureHeader.slice("sha256=".length));
  if (!signature) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  return crypto.subtle.verify("HMAC", key, signature, textEncoder.encode(body));
}
