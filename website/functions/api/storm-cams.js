export async function onRequest(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
      },
    });
  }

  const json = (obj, status = 200) =>
    new Response(JSON.stringify(obj), {
      status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

  // Default placeholder cameras (used if KV is empty)
  const defaultCams = [
    {
      id: "okc-downtown-1",
      name: "Oklahoma City - Downtown Cam",
      provider: "ExampleCamCo",
      embedUrl: "https://www.youtube.com/embed/5qap5aO4i9A",
      latitude: 35.4676,
      longitude: -97.5164,
      city: "Oklahoma City",
      state: "OK",
      type: "cityCam",
      attribution: "ExampleCamCo (public stream)",
    },
    {
      id: "norman-1",
      name: "Norman Roadside Cam",
      provider: "StormView",
      embedUrl: "https://www.youtube.com/embed/aqz-KE-bpKQ",
      latitude: 35.2226,
      longitude: -97.4395,
      city: "Norman",
      state: "OK",
      type: "stormCam",
      attribution: "StormView (public stream)",
    },
    {
      id: "tulsa-1",
      name: "Tulsa North Cam",
      provider: "CityCams",
      embedUrl: "https://www.youtube.com/embed/2Vv-BfVoq4g",
      latitude: 36.15398,
      longitude: -95.99277,
      city: "Tulsa",
      state: "OK",
      type: "cityCam",
      attribution: "CityCams (public stream)",
    },
  ];

  try {
    if (request.method === "GET") {
      // Try KV first
      let raw = null;
      try {
        raw = env.STORM_CAMS ? await env.STORM_CAMS.get("cams") : null;
      } catch (e) {
        raw = null;
      }
      const cams = raw ? JSON.parse(raw) : defaultCams;
      return json({ ok: true, source: raw ? "kv" : "default", count: cams.length, cameras: cams, generatedAt: new Date().toISOString() });
    }

    // Admin actions: require a bearer token matching STORM_CAMS_ADMIN_TOKEN
    const auth = request.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ")) {
      return json({ error: "Unauthorized - admin token required" }, 401);
    }
    const token = auth.slice(7);
    if (!env.STORM_CAMS_ADMIN_TOKEN || token !== env.STORM_CAMS_ADMIN_TOKEN) {
      return json({ error: "Forbidden - invalid admin token" }, 403);
    }

    if (request.method === "POST" || request.method === "PUT") {
      const body = await request.json().catch(() => null);
      if (!body || !body.name) return json({ error: "Bad request - missing camera data" }, 400);

      const raw = (env.STORM_CAMS && await env.STORM_CAMS.get("cams")) || "[]";
      let arr = [];
      try {
        arr = JSON.parse(raw);
        if (!Array.isArray(arr)) arr = [];
      } catch (e) {
        arr = [];
      }

      const cam = { ...body, id: body.id || crypto.randomUUID() };
      const idx = arr.findIndex((c) => c.id === cam.id);
      if (idx >= 0) arr[idx] = cam; else arr.push(cam);

      if (env.STORM_CAMS) {
        await env.STORM_CAMS.put("cams", JSON.stringify(arr));
      }

      return json({ ok: true, camera: cam }, 201);
    }

    if (request.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) return json({ error: "Missing id" }, 400);
      const raw = (env.STORM_CAMS && await env.STORM_CAMS.get("cams")) || "[]";
      let arr = [];
      try { arr = JSON.parse(raw); if (!Array.isArray(arr)) arr = []; } catch (e) { arr = []; }
      const filtered = arr.filter((c) => c.id !== id);
      if (env.STORM_CAMS) await env.STORM_CAMS.put("cams", JSON.stringify(filtered));
      return json({ ok: true, id });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500);
  }
}
