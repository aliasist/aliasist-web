import { motion } from "framer-motion";
import { Activity, Radio, Satellite, Zap } from "lucide-react";
import type { LiveSignals } from "../../lib/useLiveSignals";

export default function SignalDeck({ signals }: { signals: LiveSignals }) {
  const seismicCount = signals.quakes.length;
  const kp = signals.spaceWeather.kpIndex ?? 0;
  const flare = signals.spaceWeather.solarFlareClass;
  const flux = signals.spaceWeather.solarFlux ?? 0;

  return (
    <div className="flex-1 space-y-4 overflow-y-auto pr-2">
      <SignalCard 
        icon={Activity} 
        label="Seismic Events" 
        value={seismicCount} 
        subValue="24H window"
        status={signals.sourceHealth.usgs ? 'online' : 'offline'}
      />
      <SignalCard 
        icon={Radio} 
        label="K-Index" 
        value={kp.toFixed(1)} 
        subValue={signals.spaceWeather.kpLabel}
        status={signals.sourceHealth.noaa ? 'online' : 'offline'}
      />
      <SignalCard 
        icon={Zap} 
        label="Solar Flare" 
        value={flare} 
        subValue="X-Ray Flux"
        status={signals.sourceHealth.noaa ? 'online' : 'offline'}
      />
      <SignalCard 
        icon={Satellite} 
        label="Solar Flux" 
        value={flux.toFixed(1)} 
        subValue="F10.7 units"
        status={signals.sourceHealth.noaa ? 'online' : 'offline'}
      />
    </div>
  );
}

function SignalCard({ icon: Icon, label, value, subValue, status }: any) {
  return (
    <div className="group rounded-lg border border-emerald-500/10 bg-black/40 p-4 transition-all hover:border-emerald-500/30">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-emerald-400/60" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-100/40">{label}</span>
        </div>
        <div className={`size-1.5 rounded-full ${status === 'online' ? 'bg-emerald-400' : 'bg-red-400'} shadow-[0_0_4px_currentColor]`} />
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-black text-white">{value}</span>
        <span className="text-[8px] uppercase tracking-widest text-emerald-400/40">{subValue}</span>
      </div>
      <div className="mt-3 h-0.5 w-full overflow-hidden bg-white/5">
        <motion.div 
          initial={{ x: "-100%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full w-full bg-emerald-400/20" 
        />
      </div>
    </div>
  );
}
