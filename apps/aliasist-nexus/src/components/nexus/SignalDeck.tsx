import { Globe, Radio, RefreshCw, Zap } from "lucide-react";
import type { useLiveSignals } from "../../lib/useLiveSignals";

export default function SignalDeck({ signals }: { signals: ReturnType<typeof useLiveSignals> }) {
  const { quakes, spaceWeather, status, lastUpdated, lastAttempted, sourceHealth, isRefreshing, refresh } = signals;

  return (
    <div className="flex h-2/3 min-h-0 flex-col gap-3 lg:gap-4">
      <article className="relative overflow-hidden rounded-lg border border-emerald-500/20 bg-black/40 p-4">
        <div className={`absolute left-0 top-0 h-full w-1 ${status === "cached" ? "bg-amber-400" : status === "degraded" ? "bg-red-400" : "bg-emerald-400"}`} />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-100/55">
            <Zap className="size-3 text-emerald-300" />Feed health
          </h2>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={isRefreshing}
            aria-label={isRefreshing ? "Refreshing signals" : "Refresh signals"}
            className="grid size-7 place-items-center rounded border border-emerald-300/15 text-emerald-300/45 transition-colors hover:border-emerald-300/40 hover:text-emerald-200 disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw className={`size-3 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
        <div className="mb-1 flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">{status.toUpperCase()}</span>
          <span className="text-[8px] uppercase text-emerald-100/40">
            {lastUpdated ? new Date(lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "CONNECTING"}
          </span>
        </div>
        <div className="mb-3 text-[8px] uppercase tracking-tight text-emerald-100/25">
          {status === "cached" ? "Last known verified signals" : status === "degraded" ? "One or more sources unavailable" : "Verified public sources"}
        </div>
        <div className="flex items-center gap-2 border-t border-white/5 pt-2">
          <SourceState label="USGS" online={sourceHealth.usgs} pending={!lastAttempted} />
          <SourceState label="NOAA" online={sourceHealth.noaa} pending={!lastAttempted} />
          {lastAttempted && <span className="ml-auto text-[7px] uppercase text-emerald-100/20">Tried {new Date(lastAttempted).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>}
        </div>
      </article>
      <SignalCard accent="cyan" icon={Radio} title="Space weather" value={spaceWeather.kpIndex?.toFixed(1) ?? "--"} unit={spaceWeather.kpLabel} detail="Planetary K-index" />

      <div className="relative flex-1 overflow-y-auto rounded-lg border border-emerald-500/20 bg-black/40 p-4 custom-scrollbar">
        <div className="absolute left-0 top-0 h-full w-1 bg-amber-400" />
        <h2 className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-100/55">
          <Globe className="size-3 text-amber-400" />Seismic feed
        </h2>
        <div className="space-y-3">
          {quakes.length === 0 && <p className="text-[9px] uppercase tracking-wider text-emerald-100/30">Awaiting USGS telemetry...</p>}
          {quakes.slice(0, 4).map((quake) => (
            <article key={quake.id} className="border-l border-white/10 py-1 pl-3">
              <div className="mb-1 flex items-center justify-between">
                <span className={`text-[10px] font-bold ${quake.magnitude > 5 ? "text-red-400" : "text-amber-300/85"}`}>M {quake.magnitude.toFixed(1)}</span>
                <span className="text-[7px] uppercase text-emerald-100/20">{new Date(quake.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <p className="truncate text-[8px] uppercase leading-tight text-white/45">{quake.place}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function SourceState({ label, online, pending }: { label: string; online: boolean; pending: boolean }) {
  const tone = pending ? "bg-white/20 text-white/35" : online ? "bg-emerald-400/10 text-emerald-300/70" : "bg-red-400/10 text-red-300/70";
  return (
    <span
      aria-label={`${label} ${pending ? "pending" : online ? "online" : "offline"}`}
      className={`flex items-center gap-1.5 rounded px-2 py-1 text-[7px] font-bold uppercase tracking-wider ${tone}`}
    >
      <i className={`size-1 rounded-full ${pending ? "bg-white/30" : online ? "bg-emerald-300" : "bg-red-300"}`} />
      {label}
    </span>
  );
}

function SignalCard({ accent, icon: Icon, title, value, unit, detail }: { accent: "emerald" | "cyan" | "amber"; icon: typeof Zap; title: string; value: string; unit: string; detail: string }) {
  const color = accent === "emerald"
    ? "bg-emerald-400 text-emerald-300"
    : accent === "cyan"
      ? "bg-cyan-400 text-cyan-300"
      : "bg-amber-400 text-amber-300";
  return (
    <article className="relative overflow-hidden rounded-lg border border-emerald-500/20 bg-black/40 p-4">
      <div className={`absolute left-0 top-0 h-full w-1 ${color.split(" ")[0]}`} />
      <h2 className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-100/55"><Icon className={`size-3 ${color.split(" ")[1]}`} />{title}</h2>
      <div className="mb-1 flex items-baseline gap-2"><span className="text-2xl font-black text-white">{value}</span><span className="text-[8px] uppercase text-emerald-100/40">{unit}</span></div>
      <div className="text-[8px] uppercase tracking-tight text-emerald-100/25">{detail}</div>
    </article>
  );
}
