import type { ClerkEnv } from "../_lib/clerk-auth";
import { authenticateRequest, corsHeaders, json } from "../_lib/clerk-auth";

interface Env extends ClerkEnv {
  CHATROOM?: KVNamespace;
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

let inMemoryMessages: ChatMessage[] = [];

export const onRequestOptions = async () =>
  new Response(null, {
    status: 204,
    headers: corsHeaders,
  });

export const onRequestGet = async ({ request, env }: PagesContext) => {
  const auth = await authenticateRequest(request, env);
  if (!auth.ok) {
    return json({ error: auth.error }, auth.status);
  }
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
