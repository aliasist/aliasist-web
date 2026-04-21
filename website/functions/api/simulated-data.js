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

    // Oklahoma-focused defaults: clamp coordinates to Oklahoma and support county param
    const OK_BBOX = { minLat: 33.6158, maxLat: 37.0023, minLng: -103.0026, maxLng: -94.4307 };
    const okDefault = { lat: 35.4676, lng: -97.5164 }; // Oklahoma City
    const countyParam = (url.searchParams.get("county") || "").trim();
    let adjusted = false;

    // Resolve lat/lng (use provided or default to OKC)
    let resolvedLat = Number.isFinite(lat) ? lat : okDefault.lat;
    let resolvedLng = Number.isFinite(lng) ? lng : okDefault.lng;

    // Clamp to Oklahoma bounding box
    if (resolvedLat < OK_BBOX.minLat) { resolvedLat = OK_BBOX.minLat; adjusted = true; }
    if (resolvedLat > OK_BBOX.maxLat) { resolvedLat = OK_BBOX.maxLat; adjusted = true; }
    if (resolvedLng < OK_BBOX.minLng) { resolvedLng = OK_BBOX.minLng; adjusted = true; }
    if (resolvedLng > OK_BBOX.maxLng) { resolvedLng = OK_BBOX.maxLng; adjusted = true; }

    // Determine zone (state or county-specific)
    let resolvedZone = zone;
    if (countyParam) {
      const safe = countyParam.toUpperCase().replace(/[^A-Z0-9]+/g, "-");
      resolvedZone = `OK-${safe}`;
    } else {
      resolvedZone = "OK";
    }

    // Zone baseline values (carbon gCO2/kWh, renewable %, price USD/MWh) tuned for Oklahoma
    const zoneBaselines = {
      "OK": { carbon: 420, renewable: 22, price: 45 },
      "OK-OKLAHOMA-COUNTY": { carbon: 400, renewable: 24, price: 43 },
      "OK-TULSA-COUNTY": { carbon: 430, renewable: 18, price: 47 },
      "OK-PAWNEE-COUNTY": { carbon: 380, renewable: 30, price: 40 },
      "US-UNKNOWN": { carbon: 350, renewable: 30, price: 50 },
    };

    const baseline = zoneBaselines[resolvedZone] || zoneBaselines["OK"];

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
        county: countyParam || null,
        lat: resolvedLat,
        lng: resolvedLng,
        latOriginallyProvided: Number.isFinite(lat),
        lngOriginallyProvided: Number.isFinite(lng),
        adjustedToOklahoma: adjusted,
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
