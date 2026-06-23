import { useMemo, useState } from "react";
import { Activity, CloudLightning, ExternalLink, Flame, Search } from "lucide-react";
import type { EcoAlert, EcoEvent, EcoQuake, LiveSignals } from "../../lib/useLiveSignals";

type SignalItem =
  | { kind: "alert"; id: string; title: string; detail: string; meta: string; href: null; data: EcoAlert }
  | { kind: "quake"; id: string; title: string; detail: string; meta: string; href: string | null; data: EcoQuake }
  | { kind: "event"; id: string; title: string; detail: string; meta: string; href: string | null; data: EcoEvent };

export default function EarthSignals({ signals }: { signals: LiveSignals }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | SignalItem["kind"]>("all");
  const [selected, setSelected] = useState<SignalItem | null>(null);

  const items = useMemo<SignalItem[]>(() => {
    const alerts: SignalItem[] = signals.alerts.map((alert) => ({
      kind: "alert",
      id: alert.id,
      title: alert.event,
      detail: alert.headline ?? alert.areaDesc ?? "Active National Weather Service alert",
      meta: [alert.severity, alert.areaDesc].filter(Boolean).join(" // "),
      href: null,
      data: alert,
    }));
    const quakes: SignalItem[] = signals.quakes.map((quake) => ({
      kind: "quake",
      id: quake.id,
      title: `M${quake.magnitude.toFixed(1)} Earthquake`,
      detail: quake.place ?? "Unknown location",
      meta: `${quake.depth?.toFixed(1) ?? "—"} km deep${quake.tsunami ? " // tsunami flag" : ""}`,
      href: quake.url,
      data: quake,
    }));
    const events: SignalItem[] = signals.events.map((event) => ({
      kind: "event",
      id: event.id,
      title: event.title,
      detail: event.description ?? event.category ?? "Open NASA natural event",
      meta: [event.category, event.source].filter(Boolean).join(" // "),
      href: event.link,
      data: event,
    }));
    return [...alerts, ...quakes, ...events];
  }, [signals.alerts, signals.events, signals.quakes]);

  const visible = items.filter((item) => {
    if (filter !== "all" && item.kind !== filter) return false;
    const needle = query.trim().toLowerCase();
    return !needle || `${item.title} ${item.detail} ${item.meta}`.toLowerCase().includes(needle);
  });

  return (
    <div className="flex h-full flex-col gap-5 overflow-hidden p-5 sm:p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-[0.35em] text-emerald-400/40">Federated environmental feeds</p>
          <h2 className="mt-2 text-3xl font-black italic uppercase tracking-tighter text-white">Earth Signals</h2>
        </div>
        <label className="flex min-w-0 items-center gap-3 rounded-lg border border-emerald-500/15 bg-black/50 px-3 py-2 xl:w-80">
          <Search className="size-4 text-emerald-400/50" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search alerts, places, events…" className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-emerald-400/25" />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "alert", "quake", "event"] as const).map((kind) => (
          <button key={kind} onClick={() => setFilter(kind)} className={`rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest ${filter === kind ? "border-emerald-400/50 bg-emerald-400/10 text-white" : "border-emerald-500/10 text-emerald-400/40"}`}>
            {kind === "all" ? `All ${items.length}` : `${kind}s ${items.filter((item) => item.kind === kind).length}`}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-2 overflow-y-auto pr-2">
          {visible.map((item) => (
            <button key={`${item.kind}-${item.id}`} onClick={() => setSelected(item)} className={`w-full rounded-lg border p-4 text-left transition-all ${selected?.id === item.id ? "border-emerald-400/40 bg-emerald-400/10" : "border-emerald-500/10 bg-black/40 hover:border-emerald-500/30"}`}>
              <div className="flex items-start gap-3">
                <SignalIcon kind={item.kind} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-bold uppercase tracking-wide text-white">{item.title}</div>
                  <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-emerald-100/50">{item.detail}</p>
                  <p className="mt-2 text-[8px] uppercase tracking-widest text-emerald-400/35">{item.meta || item.kind}</p>
                </div>
              </div>
            </button>
          ))}
          {!visible.length && <div className="rounded-lg border border-dashed border-emerald-500/15 p-8 text-center text-[10px] uppercase tracking-widest text-emerald-400/35">No matching signals</div>}
        </div>

        <aside className="overflow-y-auto rounded-xl border border-emerald-500/10 bg-black/55 p-5">
          {selected ? (
            <>
              <div className="flex items-center gap-3"><SignalIcon kind={selected.kind} /><span className="text-[9px] uppercase tracking-[0.25em] text-emerald-400/45">{selected.kind}</span></div>
              <h3 className="mt-5 text-lg font-black text-white">{selected.title}</h3>
              <p className="mt-3 text-xs leading-relaxed text-emerald-100/60">{selected.detail}</p>
              <p className="mt-4 border-t border-emerald-500/10 pt-4 text-[9px] uppercase tracking-wider text-emerald-400/45">{selected.meta}</p>
              {selected.href && <a href={selected.href} target="_blank" rel="noreferrer" className="mt-6 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-emerald-400 hover:text-white">Open source <ExternalLink className="size-3" /></a>}
            </>
          ) : (
            <div className="flex h-full min-h-48 items-center justify-center text-center text-[10px] uppercase tracking-widest text-emerald-400/30">Select a signal for source detail</div>
          )}
        </aside>
      </div>
    </div>
  );
}

function SignalIcon({ kind }: { kind: SignalItem["kind"] }) {
  const Icon = kind === "alert" ? CloudLightning : kind === "quake" ? Activity : Flame;
  return <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-emerald-400/15 bg-emerald-400/5"><Icon className="size-4 text-emerald-400" /></div>;
}
