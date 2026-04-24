import { handleRAGRequest } from './rag';
import { handleChatRequest } from './chat';

export { ChatRoom } from './ChatRoom';

export interface Env {
  AUDIO_BUCKET: R2Bucket;
  IDEAS_DB: D1Database;
  ChatRoom: DurableObjectNamespace;
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
    return new Response('Not found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;
