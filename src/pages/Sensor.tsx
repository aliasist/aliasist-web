import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Starfield from "@/components/Starfield";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const HUB_URL = "https://llm-chat.bchooper0730.workers.dev";
const DEVICE_ID = "ttgo-tdisplay-01";
const REFRESH_MS = 30_000;

interface LatestReading {
  device_id: string;
  temp_c: number;
  humidity: number;
  timestamp: number;
}

interface HistoryPoint {
  temp_c: number;
  humidity: number;
  timestamp: number;
}

function toChartPoint(r: HistoryPoint) {
  return {
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    tempF: Math.round((r.temp_c * 9) / 5 + 32),
    tempC: r.temp_c,
    humidity: r.humidity,
  };
}

const Sensor = () => {
  const [latest, setLatest] = useState<LatestReading | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [latestRes, historyRes] = await Promise.all([
          fetch(`${HUB_URL}/api/sensor/latest?deviceId=${DEVICE_ID}`),
          fetch(`${HUB_URL}/api/sensor/history?deviceId=${DEVICE_ID}&hours=24`),
        ]);

        if (!latestRes.ok) throw new Error(`latest: ${latestRes.status}`);
        if (!historyRes.ok) throw new Error(`history: ${historyRes.status}`);

        const latestData = (await latestRes.json()) as LatestReading;
        const historyData = (await historyRes.json()) as { readings: HistoryPoint[] };

        if (!cancelled) {
          setLatest(latestData);
          setHistory(historyData.readings);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load sensor data");
        }
      }
    }

    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const chartData = history.map(toChartPoint);
  const lastUpdated = latest ? new Date(latest.timestamp) : null;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <Starfield />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-electric/70 mb-4 text-center">
          LIVE DEVICE TELEMETRY
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground text-center mb-2">
          Sensor Dashboard
        </h1>
        <p className="font-mono text-sm text-muted-foreground text-center mb-12">
          TTGO T-Display + DHT11, reporting over WiFi every minute
        </p>

        {error && (
          <div className="font-mono text-xs text-center text-destructive mb-8">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <Card className="border-violet/10 bg-background/50">
            <CardHeader>
              <CardTitle className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Temperature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-electric">
                {latest ? `${latest.temp_c.toFixed(1)}°C` : "—"}
              </div>
            </CardContent>
          </Card>

          <Card className="border-violet/10 bg-background/50">
            <CardHeader>
              <CardTitle className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Humidity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-violet">
                {latest ? `${latest.humidity.toFixed(0)}%` : "—"}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-violet/10 bg-background/50 mb-6">
          <CardHeader>
            <CardTitle className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Last 24 Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fontFamily: "monospace" }}
                    minTickGap={40}
                  />
                  <YAxis tick={{ fontSize: 10, fontFamily: "monospace" }} width={30} />
                  <Tooltip
                    contentStyle={{
                      fontFamily: "monospace",
                      fontSize: 12,
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tempC"
                    name="Temp °C"
                    stroke="hsl(var(--electric))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    name="Humidity %"
                    stroke="hsl(var(--violet))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <p className="font-mono text-[11px] text-muted-foreground text-center">
          {lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString()}` : "Loading..."}
          {" · refreshes every 30s"}
        </p>
      </div>
    </div>
  );
};

export default Sensor;
