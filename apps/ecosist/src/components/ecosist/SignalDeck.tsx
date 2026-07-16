import { motion } from "framer-motion";
import { Activity, CloudLightning, Flame, Radio, Wind } from "lucide-react";
import type { LiveSignals } from "../../lib/useLiveSignals";

export default function SignalDeck({ signals }: { signals: LiveSignals }) {
  const strongestStorm = signals.hurricanes.reduce<LiveSignals["hurricanes"][number] | null>(
    (current, storm) => (!current || (storm.windMph ?? 0) > (current.windMph ?? 0) ? storm : current),
    null,
  );
  return (
    <div className="flex-1 space-y-4 overflow-y-auto pr-2">
      <SignalCard icon={CloudLightning} label="NWS Alerts" value={signals.alerts.length} subValue="Active US" online={signals.sourceHealth.nws} />
      <SignalCard icon={Activity} label="Earthquakes" value={signals.quakes.length} subValue="M4.5+ / 7D" online={signals.sourceHealth.usgs} />
      <SignalCard icon={Flame} label="Natural Events" value={signals.events.length} subValue="NASA EONET" online={signals.sourceHealth.nasa} />
      <SignalCard
        icon={Wind}
        label="Active Storms"
        value={signals.hurricanes.length}
        subValue={strongestStorm ? `${strongestStorm.name} · ${strongestStorm.category ?? "—"}` : "NOAA NHC"}
        online={signals.sourceHealth.nws}
      />
      <SignalCard icon={Radio} label="K-Index" value={signals.kpIndex?.toFixed(1) ?? "—"} subValue={signals.kpLabel} online={signals.sourceHealth.noaa} />
    </div>
  );
}

function SignalCard({ icon: Icon, label, value, subValue, online }: { icon: typeof Activity; label: string; value: string | number; subValue: string; online: boolean }) {
  return (
    <div className="group rounded-lg border border-emerald-500/10 bg-black/40 p-4 transition-all hover:border-emerald-500/30">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-emerald-400/60" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-100/40">{label}</span>
        </div>
        <div className={`size-1.5 rounded-full ${online ? "bg-emerald-400" : "bg-red-400"} shadow-[0_0_4px_currentColor]`} />
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-black text-white">{value}</span>
        <span className="text-[8px] uppercase tracking-widest text-emerald-400/40">{subValue}</span>
      </div>
      <div className="mt-3 h-0.5 w-full overflow-hidden bg-white/5">
        <motion.div initial={{ x: "-100%" }} animate={{ x: "0%" }} transition={{ duration: 1 }} className="h-full w-full bg-emerald-400/20" />
      </div>
    </div>
  );
}
