import { motion } from "framer-motion";
import { Shield, Radio, Activity, Terminal, FileText } from "lucide-react";
import type { LiveSignals } from "../../lib/useLiveSignals";

export type NexusView = "nexus" | "intelligence" | "terminal" | "patents";

interface OSHeaderProps {
  activeView: NexusView;
  onViewChange: (view: NexusView) => void;
  signals: LiveSignals;
}

export default function OSHeader({ activeView, onViewChange, signals }: OSHeaderProps) {
  const tabs: { id: NexusView; label: string; icon: any }[] = [
    { id: "nexus", label: "Core", icon: Shield },
    { id: "intelligence", label: "Intelligence", icon: Activity },
    { id: "patents", label: "Patents", icon: FileText },
    { id: "terminal", label: "Ops", icon: Terminal },
  ];

  return (
    <header className="flex items-center justify-between rounded-lg border border-emerald-500/10 bg-black/40 px-6 py-4 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="flex size-10 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/5">
          <Radio className="size-5 text-emerald-400 animate-pulse" />
        </div>
        <div>
          <h1 className="text-sm font-black tracking-widest text-white uppercase">Nexus Prime</h1>
          <p className="text-[9px] text-emerald-400/50 uppercase tracking-[0.2em]">Planetary Intelligence // v4.0</p>
        </div>
      </div>

      <nav className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={`relative flex items-center gap-2 rounded-md px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeView === tab.id 
                ? "text-white bg-emerald-400/10" 
                : "text-emerald-400/40 hover:text-emerald-400/70"
            }`}
          >
            <tab.icon className="size-3" />
            {tab.label}
            {activeView === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-md border border-emerald-400/30"
                initial={false}
              />
            )}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-6 text-[9px] uppercase tracking-widest">
        <div className="flex flex-col items-end">
          <span className="text-emerald-400/40">Signal Strength</span>
          <span className="text-emerald-400 font-bold">{signals.status === 'live' ? '100%' : '65%'}</span>
        </div>
        <div className={`size-2 rounded-full ${signals.status === 'live' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 animate-pulse'}`} />
      </div>
    </header>
  );
}
