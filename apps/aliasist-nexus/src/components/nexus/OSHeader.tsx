import { motion } from "framer-motion";
import { Activity, Command, Database, Layout, Terminal } from "lucide-react";
import type { LiveSignals } from "../../lib/useLiveSignals";

export type NexusView = "nexus" | "terminal" | "intelligence";

interface OSHeaderProps {
  activeView: NexusView;
  onViewChange: (view: NexusView) => void;
  signals: Pick<LiveSignals, "status" | "lastAttempted" | "isRefreshing">;
}

const navigation: Array<{ view: NexusView; label: string; icon: typeof Layout }> = [
  { view: "nexus", label: "Digital twin", icon: Layout },
  { view: "terminal", label: "Abductor", icon: Terminal },
  { view: "intelligence", label: "Signals", icon: Database },
];

export default function OSHeader({ activeView, onViewChange, signals }: OSHeaderProps) {
  const signalLabel = signals.isRefreshing ? "Refreshing" : signals.status;
  return (
    <header className="flex min-h-14 flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-500/20 bg-black/50 px-3 py-2 backdrop-blur-md sm:px-5">
      <div className="flex min-w-0 items-center gap-3 sm:gap-5">
        <div className="flex items-center gap-3 sm:border-r sm:border-emerald-500/20 sm:pr-5">
          <div className="grid size-8 shrink-0 place-items-center rounded bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.25)]">
            <Command className="size-5 text-black" />
          </div>
          <div className="hidden flex-col sm:flex">
            <span className="text-[10px] font-black uppercase leading-none tracking-widest text-white">Nexus OS</span>
            <span className="mt-1 text-[8px] uppercase leading-none text-emerald-400/55">Kernel v3.0 stable</span>
          </div>
        </div>

        <nav className="flex items-center gap-1" aria-label="Nexus workspaces">
          {navigation.map(({ view, label, icon: Icon }) => (
            <button
              key={view}
              type="button"
              onClick={() => onViewChange(view)}
              aria-pressed={activeView === view}
              aria-label={label}
              className={`relative flex items-center gap-2 rounded px-2.5 py-2 transition-colors sm:px-4 ${activeView === view ? "text-white" : "text-emerald-400/40 hover:text-emerald-300/75"}`}
            >
              <Icon className="relative z-10 size-3.5" />
              <span className="relative z-10 hidden text-[9px] font-bold uppercase tracking-widest md:inline">{label}</span>
              {activeView === view && <motion.span layoutId="nav-active" className="absolute inset-0 rounded border-b-2 border-emerald-400 bg-emerald-400/10" />}
            </button>
          ))}
        </nav>
      </div>

      <div className="hidden items-center gap-4 sm:flex">
        <div className="text-right">
          <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-300/75">Signal: <span className="text-white">{signalLabel}</span></div>
          <div className="mt-1 text-[8px] uppercase tracking-widest text-emerald-400/35">
            {signals.lastAttempted ? `Checked ${new Date(signals.lastAttempted).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : "Awaiting first sync"}
          </div>
        </div>
        <div className="grid size-9 place-items-center rounded-full border border-emerald-500/20">
          <Activity className="size-4 text-emerald-400/65" />
        </div>
      </div>
    </header>
  );
}
