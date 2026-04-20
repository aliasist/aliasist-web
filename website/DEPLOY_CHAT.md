Deploying the chat server function (chat-messages)

Goal
- Serve /api/chat-messages on aliasist.com as a Cloudflare Pages Function so the in-site chatroom can POST messages with Clerk authentication and persist to KV.

Required repo files
- functions/api/chat-messages.ts  (already present in this repo)

Cloudflare Pages setup (recommended)
1. Open the Pages project that serves aliasist.com (project: aliasistabductor / the Pages site used for production).
2. Ensure the repository includes the `functions/` directory at the repo root. The file `functions/api/chat-messages.ts` should live there.
3. In the Pages project settings -> Functions, confirm Functions are enabled and the `functions/` directory is recognized (Pages auto-detects /functions from repo root).

Environment & bindings (CRITICAL)
- Add the following Environment Variables in the Pages project (Production and Preview as needed):
  - CLERK_SECRET_KEY  (Clerk secret key)
  - CLERK_PUBLISHABLE_KEY  (Clerk publishable key, optional for server-side client creation)

- Add a Pages KV Namespace binding:
  - Namespace name: create a KV namespace (e.g., aliasist-chatroom)
  - Binding name: CHATROOM
  - Ensure the binding name matches the `CHATROOM` env used in `functions/api/chat-messages.ts`.

Deployment
1. Commit and push the repo (if using Git-backed Pages). The Pages build will pick up the Functions folder and deploy the function at `/api/chat-messages`.
2. After deployment, test from a browser while signed-in:
   - GET https://aliasist.com/api/chat-messages should return JSON messages.
   - POST https://aliasist.com/api/chat-messages with a valid Clerk session token (Authorization: Bearer <token>) should return 201 and the saved message.

Testing locally / quick workaround
- If you need a quick external worker fallback, the project currently falls back to https://llm-chat.bchooper0730.workers.dev for the AI chat component. That worker is independent and publicly reachable but does not use Clerk or KV.

Notes
- The handler implements CORS and responds to OPTIONS — keep these headers intact.
- If POST returns 405, the Function is not deployed on this domain (Pages likely serving static files). Deploying the `functions/` folder fixes the route.

If you'd like, I can open a small PR that adds this file and a client-side error message to surface the 405 case. Let me know to proceed.
