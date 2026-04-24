import type { Env } from './index';

export async function handleChatRequest(
  _request: Request,
  _env: Env,
  _ctx: ExecutionContext,
): Promise<Response> {
  // TODO: Implement Durable Object-backed chat/notifications.
  return new Response(
    JSON.stringify({ message: 'Chat endpoint not yet implemented' }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 501,
    },
  );
}
