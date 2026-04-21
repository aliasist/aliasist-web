export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
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
    // Query params
    const zone = url.searchParams.get("zone");
    const lat = parseFloat(url.searchParams.get("lat") || "");
    const lng = parseFloat(url.searchParams.get("lng") || "");
    const startParam = url.searchParams.get("start");
    const endParam = url.searchParams.get("end");
    const temporal = (url.searchParams.get("temporalGranularity") || "hourly").toLowerCase();
    const datacenterLoad = (url.searchParams.get("datacenterLoad") || "medium").toLowerCase();

    // Helpers
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

    // Determine zone if not provided (simple lat/lng heuristic)
    let resolvedZone = zone;
    if (!resolvedZone) {
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        resolvedZone = "US-UNKNOWN";
      } else if (lng < -110) {
        resolvedZone = "US-WRAP-CAISO";
      } else if (lng < -95) {
        resolvedZone = "US-MOUN-PEAK";
      } else if (lng < -85) {
        resolvedZone = "US-MIDW-MISO";
      } else {
        resolvedZone = "US-EAST-PJM";
      }
    }

    // Zone baseline values (carbon gCO2/kWh, renewable %, price USD/MWh)
    const zoneBaselines = {
      "US-MIDW-MISO": { carbon: 350, renewable: 25, price: 40 },
      "US-EAST-PJM": { carbon: 400, renewable: 20, price: 45 },
      "US-WRAP-CAISO": { carbon: 100, renewable: 65, price: 85 },
      "US-ERCOT": { carbon: 500, renewable: 30, price: 30 },
      "US-UNKNOWN": { carbon: 350, renewable: 30, price: 50 },
    };

    const baseline = zoneBaselines[resolvedZone] || zoneBaselines["US-UNKNOWN"];

    // Time range defaults: last 24 hours
    const now = Date.now();
    const defaultEnd = new Date(Math.floor(now / 1000) * 1000).toISOString();
    const defaultStart = new Date(now - 24 * 3600 * 1000).toISOString();
    const start = startParam || defaultStart;
    const end = endParam || defaultEnd;

    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
      return json({ error: "Invalid start/end parameters" }, 400);
    }

    const stepMs = temporal === "daily" ? 24 * 3600 * 1000 : 3600 * 1000;

    // Datacenter load multiplier
    const loadMap = { low: 0.7, medium: 1.0, high: 1.3 };
    const loadMultiplier = loadMap[datacenterLoad] || 1.0;

    // Generate series
    const points = [];
    for (let t = startDate.getTime(); t <= endDate.getTime(); t += stepMs) {
      // diurnal variation: sinusoid over day
      const hour = new Date(t).getUTCHours();
      const diurnal = Math.max(0.6, 1 + 0.25 * Math.sin(((hour / 24) * Math.PI * 2) - Math.PI / 2));

      // random noise
      const noise = (Math.random() - 0.5) * 0.1;

      // Carbon intensity varies with diurnal and renewable share
      const renewable = clamp(baseline.renewable * (0.8 + 0.4 * Math.sin(((hour / 24) * Math.PI * 2))) + (Math.random() * 3 - 1.5), 0, 100);
      const carbonIntensity = clamp(baseline.carbon * (1.1 - renewable / 100) * diurnal * (1 + noise), 20, 2000);

      // Price influenced by carbonIntensity and diurnal demand
      const price = clamp(baseline.price * (0.8 + (carbonIntensity / 400)) * diurnal * (1 + (Math.random() - 0.5) * 0.1), -100, 1000);

      // Data center impact: additional load increases carbon and price slightly
      const dcLoadImpact = 1 + (loadMultiplier - 1) * 0.12; // modest impact

      points.push({
        datetime: new Date(t).toISOString(),
        carbonIntensityGCO2eqPerKWh: Number((carbonIntensity * dcLoadImpact).toFixed(2)),
        renewablePercentage: Number(renewable.toFixed(2)),
        priceUSDPerMWh: Number(price.toFixed(2)),
        diurnalFactor: Number(diurnal.toFixed(3)),
      });
    }

    // Summary / metadata
    const latest = points[points.length - 1];
    const response = {
      simulated: true,
      zone: resolvedZone,
      requested: {
        zone: zone || null,
        lat: Number.isFinite(lat) ? lat : null,
        lng: Number.isFinite(lng) ? lng : null,
        temporalGranularity: temporal,
        datacenterLoad: datacenterLoad,
        start: start,
        end: end,
      },
      metadata: {
        baseline,
        dataCenterLoadMultiplier: loadMultiplier,
        generatedAt: new Date().toISOString(),
      },
      latest: latest || null,
      points,
    };

    return json(response);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
}
