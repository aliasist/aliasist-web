import { useAuth } from "@clerk/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { readJsonBody } from "@/config/api";

interface Snapshot {
  project: string;
  branch: string | null;
  dirty: boolean;
  framework: string | null;
  riskLevel: string | null;
  warnings: number;
  pushedAt: number;
}

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function RiskBadge({ level }: { level: string | null }) {
  const color =
    level === "low"
      ? "text-electric border-electric/40"
      : level === "medium"
        ? "text-yellow-400 border-yellow-400/40"
        : "text-red-400 border-red-400/40";
  return (
    <span className={`font-mono text-[9px] uppercase tracking-[0.18em] border px-1.5 py-px rounded-sm ${color}`}>
      {level ?? "unknown"}
    </span>
  );
}

function SnapshotCard({ snap }: { snap: Snapshot }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-sm border border-border bg-card px-5 py-4 shadow-electric-sm hover:shadow-electric-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-mono text-sm font-semibold text-foreground tracking-wide truncate">
          {snap.project}
        </h3>
        <RiskBadge level={snap.riskLevel} />
      </div>

      <div className="space-y-1.5">
        <Row label="branch" value={snap.branch ?? "n/a"} />
        <Row
          label="dirty"
          value={snap.dirty ? "yes" : "no"}
          valueClass={snap.dirty ? "text-yellow-400" : "text-electric"}
        />
        <Row label="framework" value={snap.framework ?? "unknown"} />
        <Row
          label="warnings"
          value={String(snap.warnings)}
          valueClass={snap.warnings > 0 ? "text-yellow-400" : "text-electric"}
        />
        <Row label="last push" value={timeAgo(snap.pushedAt)} />
      </div>
    </motion.div>
  );
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60 shrink-0">
        {label}
      </span>
      <span className={`font-mono text-[11px] truncate ${valueClass ?? "text-foreground/80"}`}>
        {value}
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4 text-center">
      <span className="font-mono text-3xl">📡</span>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/60">
        No snapshots yet
      </p>
      <p className="font-mono text-[10px] text-muted-foreground/40 max-w-xs leading-relaxed">
        Run{" "}
        <code className="text-electric bg-electric/10 px-1 py-px rounded-sm">
          aliasist push
        </code>{" "}
        in any of your projects to push a status snapshot here.
      </p>
    </div>
  );
}

export default function AgentDashboard() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number | null>(null);

  const fetchStatus = async () => {
    if (!isSignedIn) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch("/api/agent-status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readJsonBody<{ snapshots?: Snapshot[]; error?: string }>(res);
      if (!res.ok) {
        const msg = data?.error ?? `HTTP ${res.status}`;
        throw new Error(msg);
      }
      setSnapshots(data?.snapshots ?? []);
      setLastFetch(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) void fetchStatus();
  }, [isLoaded, isSignedIn]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 pt-24 pb-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-electric animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric">
                Agent Dashboard
              </span>
            </div>
            <h1 className="font-mono text-2xl font-bold text-foreground tracking-wide">
              Project Status
            </h1>
            {lastFetch && (
              <p className="font-mono text-[10px] text-muted-foreground/50 mt-1">
                Updated {timeAgo(lastFetch)}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => void fetchStatus()}
            disabled={loading || !isSignedIn}
            className="font-mono text-xs uppercase tracking-[0.14em] px-4 py-2 rounded-sm border border-electric/40 text-electric hover:bg-electric/10 transition-colors disabled:opacity-40"
          >
            {loading ? "Loading…" : "↻ Refresh"}
          </button>
        </div>

        {!isLoaded ? (
          <div className="flex items-center justify-center py-20">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
              Loading session…
            </span>
          </div>
        ) : !isSignedIn ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <span className="font-mono text-3xl">🔒</span>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground/60">
              Sign in to view agent dashboard
            </p>
          </div>
        ) : error ? (
          <div className="rounded-sm border border-red-400/30 bg-red-400/5 px-5 py-4">
            <p className="font-mono text-xs text-red-400">// {error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {snapshots.length === 0 && !loading ? (
              <EmptyState />
            ) : (
              snapshots.map((snap) => (
                <SnapshotCard key={snap.project} snap={snap} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
