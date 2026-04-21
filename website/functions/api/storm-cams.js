export async function onRequest(context) {
  const { request } = context;
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

  const json = (obj, status = 200) =>
    new Response(JSON.stringify(obj), {
      status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

  try {
    // In a real deployment, replace this with a KV-backed dataset and proper auth.
    const cams = [
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
      {
        id: "ponca-1",
        name: "Ponca City Chaser Stream",
        provider: "ChaserNet",
        embedUrl: "https://www.youtube.com/embed/3fumBcKC6RE",
        latitude: 36.7379,
        longitude: -97.0697,
        city: "Ponca City",
        state: "OK",
        type: "chaser",
        attribution: "ChaserNet (public stream)",
      },
    ];

    const resp = {
      ok: true,
      source: "simulated-storm-cams",
      count: cams.length,
      cameras: cams,
      generatedAt: new Date().toISOString(),
      note: "Placeholder streams — replace with licensed/public feeds before production.",
    };

    return json(resp);
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500);
  }
}
