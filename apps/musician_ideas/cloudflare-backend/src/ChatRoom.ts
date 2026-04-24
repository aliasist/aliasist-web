import { DurableObject } from 'cloudflare:workers';

export class ChatRoom extends DurableObject {
  async fetch(_request: Request): Promise<Response> {
    return new Response(
      JSON.stringify({ message: 'ChatRoom Durable Object not yet implemented' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 501,
      },
    );
  }
}
