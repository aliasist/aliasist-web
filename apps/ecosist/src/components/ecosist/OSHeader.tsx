import { motion } from "framer-motion";
import { Activity, Camera, Globe2, Leaf, Radio } from "lucide-react";
import type { LiveSignals } from "../../lib/useLiveSignals";

export type EcosistView = "core" | "intelligence" | "signals" | "cameras";

interface OSHeaderProps {
  activeView: EcosistView;
  onViewChange: (view: EcosistView) => void;
  signals: LiveSignals;
}

export default function OSHeader({ activeView, onViewChange, signals }: OSHeaderProps) {
  const tabs: { id: EcosistView; label: string; icon: typeof Leaf }[] = [
    { id: "core", label: "Overview", icon: Leaf },
    { id: "intelligence", label: "Summary", icon: Activity },
    { id: "signals", label: "Earth Data", icon: Globe2 },
    { id: "cameras", label: "Cameras", icon: Camera },
  ];

  return (
    <header className="flex flex-col gap-4 rounded-lg border border-emerald-500/10 bg-black/40 px-4 py-4 backdrop-blur-md md:flex-row md:items-center md:justify-between md:px-6">
      <div className="flex items-center gap-4">
        <div className="flex size-10 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/5">
          <Radio className="size-5 animate-pulse text-emerald-400" />
        </div>
        <div>
          <h1 className="text-sm font-black uppercase tracking-widest text-white">Ecosist</h1>
          <p className="text-[9px] uppercase tracking-[0.2em] text-emerald-400/50">Weather and earth data</p>
        </div>
      </div>

      <nav className="flex max-w-full gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={`relative flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all sm:px-4 ${
              activeView === tab.id
                ? "bg-emerald-400/10 text-white"
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

      <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest md:gap-6">
        <div className="flex flex-col md:items-end">
          <span className="text-emerald-400/40">Data sources</span>
          <span className="font-bold text-emerald-400">{signals.status === "live" ? "Available" : signals.status}</span>
        </div>
        <div className={`size-2 rounded-full ${signals.status === "live" ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "animate-pulse bg-amber-400"}`} />
      </div>
    </header>
  );
}
