export async function onRequest(context) {
  const { request } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
  }

  const geojson = {
    type: "FeatureCollection",
    generatedAt: new Date().toISOString(),
    features: [
      {
        type: "Feature",
        properties: {
          id: "moore-2013",
          name: "Moore/OK Tornado 2013 (example)",
          description: "Multi-vortex EF5 event - example geometry",
          source: "simulated",
        },
        geometry: {
          type: "LineString",
          coordinates: [
            [-97.486, 35.280],
            [-97.500, 35.300],
            [-97.520, 35.320]
          ]
        }
      },
      {
        type: "Feature",
        properties: {
          id: "el-reno-2013",
          name: "El Reno 2013 (example)",
          description: "Wide tornado track sample",
          source: "simulated",
        },
        geometry: {
          type: "LineString",
          coordinates: [
            [-97.900, 35.500],
            [-97.950, 35.450],
            [-98.000, 35.400]
          ]
        }
      }
    ]
  };

  return new Response(JSON.stringify({ ok: true, source: "static-tornado-paths", geojson }), { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
}
