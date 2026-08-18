import { useAuth } from "@clerk/react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useOpenSiteSignIn } from "@/lib/use-open-site-sign-in";

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

function toF(celsius: number): number {
  return Math.round((celsius * 9) / 5 + 32);
}

function toChartPoint(r: HistoryPoint) {
  return {
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    tempF: toF(r.temp_c),
    humidity: r.humidity,
  };
}

const Sensor = () => {
  const [latest, setLatest] = useState<LatestReading | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { isSignedIn, getToken } = useAuth();
  const openSignIn = useOpenSiteSignIn();
  const [reportSeconds, setReportSeconds] = useState("60");
  const [askSeconds, setAskSeconds] = useState("300");
  const [controlBusy, setControlBusy] = useState<string | null>(null);
  const [controlMessage, setControlMessage] = useState<string | null>(null);

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

  async function sendCommand(command: string, payload?: unknown) {
    setControlBusy(command);
    setControlMessage(null);
    try {
      const token = await getToken();
      const res = await fetch("/api/device-command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deviceId: DEVICE_ID, command, payload }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setControlMessage("Queued — the device checks in roughly every 20s.");
    } catch (err) {
      setControlMessage(err instanceof Error ? err.message : "Failed to send command");
    } finally {
      setControlBusy(null);
    }
  }

  const chartData = history.map(toChartPoint);

  return (
    <div className="relative min-h-screen bg-background">
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground text-center mb-12">
          Sensor Dashboard
        </h1>

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
                {latest ? `${toF(latest.temp_c)}°F` : "—"}
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

        <Card className="border-violet/10 bg-background/50 mb-10">
          <CardContent className="pt-6">
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
                    dataKey="tempF"
                    name="Temp °F"
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

        <Card className="border-violet/10 bg-background/50">
          <CardHeader>
            <CardTitle className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Device Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isSignedIn ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <p className="text-sm text-muted-foreground">Sign in to control the device.</p>
                <Button onClick={openSignIn}>Sign in</Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  <Button
                    disabled={controlBusy !== null}
                    onClick={() => sendCommand("ask_now")}
                  >
                    {controlBusy === "ask_now" ? "Queuing…" : "Ask AI now"}
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={controlBusy !== null}
                    onClick={() => sendCommand("refresh_now")}
                  >
                    {controlBusy === "refresh_now" ? "Queuing…" : "Refresh reading now"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground block mb-2">
                      Report interval (seconds)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min={10}
                        max={3600}
                        value={reportSeconds}
                        onChange={(e) => setReportSeconds(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        disabled={controlBusy !== null}
                        onClick={() => sendCommand("set_report_interval", { ms: Number(reportSeconds) * 1000 })}
                      >
                        Save
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground block mb-2">
                      AI check-in interval (seconds)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min={10}
                        max={3600}
                        value={askSeconds}
                        onChange={(e) => setAskSeconds(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        disabled={controlBusy !== null}
                        onClick={() => sendCommand("set_ask_interval", { ms: Number(askSeconds) * 1000 })}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </div>

                {controlMessage && (
                  <p className="font-mono text-xs text-muted-foreground">{controlMessage}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Sensor;
