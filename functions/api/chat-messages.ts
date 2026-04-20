import { createClerkClient } from "@clerk/backend";

interface Env {
  CHATROOM?: KVNamespace;
  CLERK_SECRET_KEY?: string;
  CLERK_PUBLISHABLE_KEY?: string;
}

type PagesContext = {
  request: Request;
  env: Env;
};

type ChatMessage = {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  email?: string;
  content: string;
  timestamp: string;
};

type NewMessagePayload = {
  displayName?: unknown;
  avatarUrl?: unknown;
  email?: unknown;
  content?: unknown;
};

const CHATROOM_MESSAGES_KEY = "chatroom:messages";
const MAX_MESSAGES = 100;
const MAX_MESSAGE_LENGTH = 500;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Content-Type": "application/json",
};

let inMemoryMessages: ChatMessage[] = [];

export const onRequestOptions = async () =>
  new Response(null, {
    status: 204,
    headers: corsHeaders,
  });

export const onRequestGet = async ({ env }: PagesContext) => {
  const messages = await readMessages(env);
  return json({ messages }, 200);
};

export const onRequestPost = async ({ request, env }: PagesContext) => {
  const auth = await authenticateRequest(request, env);
  if (!auth.ok) {
    return json({ error: auth.error }, auth.status);
  }

  const body = (await request.json().catch(() => null)) as NewMessagePayload | null;
  const content = typeof body?.content === "string" ? body.content.trim() : "";

  if (!content) {
    return json({ error: "Message content is required." }, 400);
  }

  if (content.length > MAX_MESSAGE_LENGTH) {
    return json(
      { error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` },
      400,
    );
  }

  const message: ChatMessage = {
    id: crypto.randomUUID(),
    userId: auth.userId,
    displayName:
      typeof body?.displayName === "string" && body.displayName.trim()
        ? body.displayName.trim()
        : "Anonymous",
    avatarUrl:
      typeof body?.avatarUrl === "string" && body.avatarUrl.trim()
        ? body.avatarUrl.trim()
        : undefined,
    email:
      typeof body?.email === "string" && body.email.trim()
        ? body.email.trim()
        : undefined,
    content,
    timestamp: new Date().toISOString(),
  };

  const messages = await readMessages(env);
  const nextMessages = [...messages, message].slice(-MAX_MESSAGES);
  await writeMessages(env, nextMessages);

  return json({ message }, 201);
};

async function authenticateRequest(request: Request, env: Env) {
  const authorization = request.headers.get("Authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : null;

  if (!token) {
    return { ok: false as const, error: "Missing session token.", status: 401 };
  }

  if (!env.CLERK_SECRET_KEY) {
    return {
      ok: false as const,
      error: "CLERK_SECRET_KEY is not configured.",
      status: 500,
    };
  }

  const clerkClient = createClerkClient({
    secretKey: env.CLERK_SECRET_KEY,
    publishableKey: env.CLERK_PUBLISHABLE_KEY,
  });

  const forwardedRequest = new Request(request, {
    headers: new Headers(request.headers),
  });

  forwardedRequest.headers.set("Authorization", `Bearer ${token}`);

  const requestState = await clerkClient.authenticateRequest(forwardedRequest);
  if (!requestState.isSignedIn) {
    return { ok: false as const, error: "Unauthorized.", status: 401 };
  }

  const auth = requestState.toAuth();
  if (!auth.userId) {
    return { ok: false as const, error: "Unauthorized.", status: 401 };
  }

  return { ok: true as const, userId: auth.userId };
}

async function readMessages(env: Env): Promise<ChatMessage[]> {
  if (!env.CHATROOM) {
    return inMemoryMessages;
  }

  const stored = await env.CHATROOM.get(CHATROOM_MESSAGES_KEY, "json");
  return Array.isArray(stored) ? (stored as ChatMessage[]) : [];
}

async function writeMessages(env: Env, messages: ChatMessage[]) {
  if (!env.CHATROOM) {
    inMemoryMessages = messages;
    return;
  }

  await env.CHATROOM.put(CHATROOM_MESSAGES_KEY, JSON.stringify(messages));
}

function json(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: corsHeaders,
  });
}
