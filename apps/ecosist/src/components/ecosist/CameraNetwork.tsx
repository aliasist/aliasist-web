import { useMemo, useState } from "react";
import { Camera, ExternalLink, MapPin, Search } from "lucide-react";
import type { LiveSignals } from "../../lib/useLiveSignals";

export default function CameraNetwork({ signals }: { signals: LiveSignals }) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState("ALL");
  const states = useMemo(() => [...new Set(signals.cameras.map((camera) => camera.state).filter((value): value is string => Boolean(value)))].sort(), [signals.cameras]);
  const visible = signals.cameras.filter((camera) => {
    if (state !== "ALL" && camera.state !== state) return false;
    const needle = query.trim().toLowerCase();
    return !needle || `${camera.name} ${camera.location ?? ""} ${camera.roadway ?? ""}`.toLowerCase().includes(needle);
  });

  return (
    <div className="flex h-full flex-col gap-5 overflow-hidden p-5 sm:p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-[0.35em] text-emerald-400/40">Authorized public-agency feeds</p>
          <h2 className="mt-2 text-3xl font-black italic uppercase tracking-tighter text-white">Camera Network</h2>
          <p className="mt-2 text-[10px] uppercase tracking-widest text-emerald-400/45">{signals.cameraTotal} cataloged // {visible.length} shown</p>
        </div>
        <div className="flex gap-2">
          <select value={state} onChange={(event) => setState(event.target.value)} className="rounded-lg border border-emerald-500/15 bg-black/60 px-3 py-2 text-xs text-white outline-none"><option value="ALL">All states</option>{states.map((value) => <option key={value} value={value}>{value}</option>)}</select>
          <label className="flex min-w-0 items-center gap-3 rounded-lg border border-emerald-500/15 bg-black/50 px-3 py-2 xl:w-72"><Search className="size-4 text-emerald-400/50" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Roadway or location…" className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-emerald-400/25" /></label>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto pr-2 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((camera) => (
          <article key={camera.id} className="flex min-h-44 flex-col overflow-hidden rounded-xl border border-emerald-500/10 bg-black/50 transition hover:border-emerald-400/30">
            {camera.imageUrl && (
              <a href={camera.streamUrl ?? camera.imageUrl} target="_blank" rel="noreferrer" className="block">
                <img
                  src={camera.imageUrl}
                  alt={`Live view: ${camera.name}`}
                  loading="lazy"
                  className="aspect-video w-full border-b border-emerald-500/10 object-cover"
                  onError={(event) => { event.currentTarget.parentElement!.style.display = "none"; }}
                />
              </a>
            )}
            <div className="flex flex-1 flex-col p-4">
            <div className="flex items-start justify-between gap-3"><div className="flex size-9 items-center justify-center rounded-lg border border-emerald-400/15 bg-emerald-400/5"><Camera className="size-4" /></div><span className={`rounded-full px-2 py-1 text-[8px] uppercase tracking-widest ${camera.status === "enabled" || camera.status === "online" ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>{camera.status}</span></div>
            <h3 className="mt-4 line-clamp-2 text-sm font-bold text-white">{camera.name}</h3>
            <p className="mt-2 flex items-start gap-2 text-[10px] leading-relaxed text-emerald-100/50"><MapPin className="mt-0.5 size-3 shrink-0" />{camera.location ?? `${camera.latitude.toFixed(4)}, ${camera.longitude.toFixed(4)}`}</p>
            <div className="mt-auto flex items-end justify-between gap-3 pt-4"><div className="text-[8px] uppercase tracking-widest text-emerald-400/35"><div>{camera.state} // {camera.roadway ?? "roadway unknown"}</div><div className="mt-1">{camera.attribution}</div></div><a href={camera.pageUrl} target="_blank" rel="noreferrer" aria-label={`Open ${camera.name}`} className="text-emerald-400 hover:text-white"><ExternalLink className="size-4" /></a></div>
            </div>
          </article>
        ))}
        {!visible.length && <div className="col-span-full flex min-h-64 items-center justify-center rounded-xl border border-dashed border-emerald-500/15 text-center text-[10px] uppercase tracking-widest text-emerald-400/35">Camera catalog is ready; configure and ingest an authorized provider feed.</div>}
      </div>
    </div>
  );
}
