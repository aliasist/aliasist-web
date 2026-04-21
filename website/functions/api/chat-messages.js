export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
      },
    });
  }

  // Helper to return JSON with CORS
  const json = (obj, status = 200) =>
    new Response(JSON.stringify(obj), {
      status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

  try {
    if (request.method === "GET") {
      const raw = (await env.CHATROOM.get("messages")) || "[]";
      // Guarantee we return an array
      let messages = [];
      try {
        messages = JSON.parse(raw);
      } catch (e) {
        messages = [];
      }
      return json({ messages });
    }

    if (request.method === "POST") {
      const auth = request.headers.get("Authorization") || "";
      if (!auth.startsWith("Bearer ")) {
        return json({ error: "Unauthorized" }, 401);
      }

      const body = await request.json().catch(() => null);
      if (!body || !body.content) {
        return json({ error: "Bad request - missing content" }, 400);
      }

      // Optional: server-side token validation with Clerk if CLERK_SECRET_KEY is bound.
      // Do not commit secrets to the repo. Configure CLERK_SECRET_KEY in Cloudflare Pages/Workers bindings.
      let verifiedUserId = null;
      if (env.CLERK_SECRET_KEY) {
        try {
          // Clerk does not currently provide a simple token-introspect endpoint for frontend tokens.
          // If you have a server-side session token or a verification method, implement it here.
          // Leaving as no-op to avoid accidental secret leakage.
        } catch (e) {
          // verification failed — fall back to unauthenticated
        }
      }

      const message = {
        id: crypto.randomUUID(),
        userId: verifiedUserId || null,
        displayName: body.displayName || "Anonymous",
        avatarUrl: body.avatarUrl || null,
        email: body.email || null,
        content: body.content,
        timestamp: new Date().toISOString(),
      };

      const raw = (await env.CHATROOM.get("messages")) || "[]";
      let arr = [];
      try {
        arr = JSON.parse(raw);
        if (!Array.isArray(arr)) arr = [];
      } catch (e) {
        arr = [];
      }

      arr.push(message);
      // Keep only the most recent 200 messages to limit storage
      const toStore = JSON.stringify(arr.slice(-200));
      await env.CHATROOM.put("messages", toStore);

      return json({ message }, 201);
    }

    return new Response("Method Not Allowed", { status: 405 });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
}
