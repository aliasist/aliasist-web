import { handleRAGRequest } from './rag';
import { handleChatRequest } from './chat';

export { ChatRoom } from './ChatRoom';

export interface Env {
  AUDIO_BUCKET: R2Bucket;
  IDEAS_DB: D1Database;
  ChatRoom: DurableObjectNamespace;
}

async function handleShareRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const db = env.IDEAS_DB;

  if (request.method === 'POST' && url.pathname === '/api/ideas/share') {
    const body = await request.json() as any;
    const id = body.id || crypto.randomUUID();
    const inviteCode = body.inviteCode || Math.random().toString(36).substring(2, 10);

    await db.prepare(
      `INSERT OR REPLACE INTO ideas (id, user_id, title, description, audio_base64, pitch_data, created_at, shared, invite_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`
    ).bind(
      id,
      body.userId || 'anon',
      body.title || 'Untitled Idea',
      body.description || '',
      body.audioBase64 || null,
      JSON.stringify(body.pitchData || {}),
      Date.now(),
      inviteCode
    ).run();

    return Response.json({ success: true, inviteCode, id });
  }

  if (request.method === 'GET' && url.pathname.startsWith('/api/shared/')) {
    const code = url.pathname.split('/').pop();
    const row = await db.prepare('SELECT * FROM ideas WHERE invite_code = ? AND shared = 1')
      .bind(code).first();

    if (!row) {
      return new Response('Not found or not shared', { status: 404 });
    }

    return Response.json(row);
  }

  return new Response('Share endpoint error', { status: 400 });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/rag')) {
      return handleRAGRequest(request, env);
    }
    if (url.pathname.startsWith('/api/chat')) {
      return handleChatRequest(request, env, ctx);
    }
    if (url.pathname.startsWith('/api/ideas/share') || url.pathname.startsWith('/api/shared/')) {
      return handleShareRequest(request, env);
    }
    return new Response('Not found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;
