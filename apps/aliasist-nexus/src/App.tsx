import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Check,
  Copy,
  Database,
  Download,
  Radio,
  Satellite,
  Share2,
  Shield,
  Sparkles,
} from "lucide-react";
import CommandTerminal from "./components/nexus/CommandTerminal";
import OSHeader, { type NexusView } from "./components/nexus/OSHeader";
import SignalDeck from "./components/nexus/SignalDeck";
import { briefToMarkdown, createPlanetaryBrief } from "./lib/planetaryBrief";
import { useLiveSignals } from "./lib/useLiveSignals";

const NexusCore = lazy(() =>
  import("./components/nexus/NexusCore").then((module) => ({ default: module.NexusCore })),
);

function App() {
  const [booting, setBooting] = useState(true);
  const [activeView, setActiveView] = useState<NexusView>("nexus");
  const [systemAlert, setSystemAlert] = useState("ALL SYSTEMS NOMINAL");
  const alertTimerRef = useRef<number | null>(null);
  const signals = useLiveSignals();
  const brief = createPlanetaryBrief(signals);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 2200);
    return () => {
      window.clearTimeout(timer);
      if (alertTimerRef.current) window.clearTimeout(alertTimerRef.current);
    };
  }, []);

  const handleCommand = (message: string) => {
    if (alertTimerRef.current) window.clearTimeout(alertTimerRef.current);
    setSystemAlert(message);
    alertTimerRef.current = window.setTimeout(() => {
      setSystemAlert("ALL SYSTEMS NOMINAL");
      alertTimerRef.current = null;
    }, 4200);
  };

  const downloadBrief = () => {
    const blob = new Blob([briefToMarkdown(brief)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `aliasist-nexus-brief-${new Date(brief.generatedAt).toISOString().slice(0, 10)}.md`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    handleCommand("PLANETARY BRIEF EXPORTED");
  };

  const handleCommandAction = async (command: "brief" | "export" | "scan") => {
    if (command === "brief") setActiveView("intelligence");
    if (command === "export") downloadBrief();
    if (command === "scan") {
      const health = await signals.refresh();
      const healthySources = Number(health.usgs) + Number(health.noaa);
      handleCommand(
        healthySources === 2
          ? "PLANETARY SCAN COMPLETE"
          : healthySources === 1
            ? "PLANETARY SCAN PARTIAL"
            : "PLANETARY SCAN FAILED // CACHE RETAINED",
      );
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#020408] font-mono text-emerald-400 selection:bg-emerald-400/25">
      <AnimatePresence>{booting && <BootSequence />}</AnimatePresence>

      {!booting && (
        <motion.div
          initial={{ opacity: 0, scale: 0.995 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1920px] flex-col gap-3 p-3 lg:h-screen lg:gap-4 lg:p-4"
        >
          <OSHeader activeView={activeView} onViewChange={setActiveView} signals={signals} />

          <section className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(210px,0.72fr)_minmax(420px,1.8fr)_minmax(280px,1fr)] lg:gap-4">
            <aside className="flex min-h-[560px] flex-col gap-3 overflow-hidden lg:min-h-0 lg:gap-4">
              <SignalDeck signals={signals} />
              <SystemPulse riskScore={brief.riskScore} />
            </aside>

            <section className={`relative overflow-hidden rounded-xl border border-emerald-500/15 bg-black/60 shadow-[inset_0_0_80px_rgba(16,185,129,0.025)] lg:min-h-0 ${activeView === "intelligence" ? "min-h-[980px] sm:min-h-[640px]" : "min-h-[560px]"}`}>
              <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.08)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25" />
              <Workspace view={activeView} signals={signals} onExport={downloadBrief} onSystemMessage={handleCommand} />
            </section>

            <aside className="flex min-h-[560px] flex-col gap-3 overflow-hidden lg:min-h-0 lg:gap-4">
              <CommandTerminal signals={signals} onSystemMessage={handleCommand} onCommandAction={(command) => void handleCommandAction(command)} />
              <SystemLog alert={systemAlert} signals={signals} />
            </aside>
          </section>

          <Footer status={signals.status} />
          <div className="scanlines pointer-events-none absolute inset-0 z-50 opacity-40" />
        </motion.div>
      )}
    </main>
  );
}

function BootSequence() {
  const stages = ["IDENTIFYING OPERATOR", "LINKING PLANETARY SIGNALS", "SYNCHRONIZING NEXUS"];
  return (
    <motion.div
      exit={{ opacity: 0, scale: 1.03, transition: { duration: 0.45 } }}
      className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#020408]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.16),transparent_38%)]" />
      <div className="relative flex w-[min(86vw,520px)] flex-col items-center text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="relative mb-10 grid size-36 place-items-center rounded-full border border-emerald-400/25"
        >
          <div className="absolute inset-3 rounded-full border border-dashed border-cyan-300/30" />
          <div className="absolute inset-8 rounded-full border border-emerald-300/40" />
          <Sparkles className="size-8 text-emerald-300 drop-shadow-[0_0_14px_#34d399]" />
        </motion.div>
        <p className="mb-3 text-[10px] tracking-[0.55em] text-emerald-300/60">ALIASIST SYSTEMS</p>
        <h1 className="text-4xl font-black italic tracking-[-0.08em] text-white sm:text-6xl">NEXUS</h1>
        <div className="mt-8 h-px w-full overflow-hidden bg-white/10">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className="h-full w-full bg-emerald-300 shadow-[0_0_16px_#34d399]"
          />
        </div>
        <motion.p
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 0.7, repeat: Infinity }}
          className="mt-4 text-[9px] tracking-[0.28em] text-emerald-300/70"
        >
          {stages[1]}
        </motion.p>
      </div>
    </motion.div>
  );
}

function Workspace({ view, signals, onExport, onSystemMessage }: { view: NexusView; signals: ReturnType<typeof useLiveSignals>; onExport: () => void; onSystemMessage: (message: string) => void }) {
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.24 }}
        className="absolute inset-0"
      >
        {view === "nexus" && <NexusOverview signals={signals} />}
        {view === "terminal" && <AbductorView />}
        {view === "intelligence" && <IntelligenceView signals={signals} onExport={onExport} onSystemMessage={onSystemMessage} />}
      </motion.div>
    </AnimatePresence>
  );
}

function NexusOverview({ signals }: { signals: ReturnType<typeof useLiveSignals> }) {
  return (
    <>
      <PanelTitle eyebrow="Central core" title="NEXUS // 01" />
      <Suspense fallback={
        <div className="absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative size-32">
               <div className="absolute inset-0 rounded-full border border-emerald-500/10 animate-[ping_3s_infinite]" />
               <div className="absolute inset-4 rounded-full border border-emerald-500/20 animate-[ping_2s_infinite]" />
               <div className="absolute inset-8 rounded-full border border-emerald-500/30 animate-[spin_4s_linear_infinite] border-t-transparent" />
            </div>
            <div className="text-[9px] uppercase tracking-[0.4em] text-emerald-300/40 animate-pulse">
              Initializing core...
            </div>
          </div>
        </div>
      }>
        <NexusCore active />
      </Suspense>
      <div className="absolute bottom-5 right-5 z-10 max-w-[250px] text-right">
        <p className="mb-3 text-[8px] uppercase leading-relaxed tracking-[0.2em] text-emerald-200/35">
          Live public intelligence synchronized across seismic and heliophysics networks.
        </p>
        <div className="flex justify-end gap-2">
          <StatusPill label={`${signals.quakes.length} EVENTS`} tone="emerald" />
          <StatusPill label={signals.status.toUpperCase()} tone={signals.status === "cached" ? "amber" : "cyan"} />
        </div>
      </div>
    </>
  );
}

function AbductorView() {
  const steps = [
    ["01", "Acquire signal", "Lock a verified public endpoint."],
    ["02", "Extract pattern", "Normalize the incoming telemetry."],
    ["03", "Route intelligence", "Send the signal to an Aliasist specialist."],
  ];
  return (
    <div className="relative z-10 flex h-full flex-col p-6 sm:p-8">
      <PanelTitle eyebrow="Command routing" title="ABDUCTOR // ACTIVE" inline />
      <div className="my-auto grid gap-3 xl:grid-cols-3">
        {steps.map(([number, title, description], index) => (
          <motion.article
            key={number}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="group relative overflow-hidden rounded-lg border border-emerald-400/15 bg-emerald-400/[0.035] p-5"
          >
            <span className="text-4xl font-black text-emerald-300/10">{number}</span>
            <h2 className="mt-8 text-sm font-bold uppercase tracking-[0.16em] text-white">{title}</h2>
            <p className="mt-2 text-[10px] leading-relaxed text-emerald-100/40">{description}</p>
            <div className="absolute bottom-0 left-0 h-px w-0 bg-emerald-300 transition-all duration-500 group-hover:w-full" />
          </motion.article>
        ))}
      </div>
      <p className="text-center text-[9px] uppercase tracking-[0.25em] text-emerald-300/35">
        Enter <span className="text-emerald-300">scan</span> or <span className="text-emerald-300">brief</span> in the terminal
      </p>
    </div>
  );
}

function IntelligenceView({ signals, onExport, onSystemMessage }: { signals: ReturnType<typeof useLiveSignals>; onExport: () => void; onSystemMessage: (message: string) => void }) {
  const brief = createPlanetaryBrief(signals);
  const [copied, setCopied] = useState(false);

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(briefToMarkdown(brief));
      setCopied(true);
      onSystemMessage("PLANETARY BRIEF COPIED");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      onSystemMessage("CLIPBOARD ACCESS DENIED");
    }
  };

  const shareBrief = async () => {
    const text = briefToMarkdown(brief);
    if (navigator.share) {
      try {
        await navigator.share({ title: "Aliasist Nexus Planetary Brief", text });
        onSystemMessage("PLANETARY BRIEF SHARED");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        onSystemMessage("SHARE CHANNEL UNAVAILABLE");
      }
      return;
    }
    await copyBrief();
  };

  return (
    <div className="relative z-10 h-full overflow-y-auto p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PanelTitle eyebrow="Signal intelligence" title="PLANETARY BRIEF" inline />
        <div className="flex items-center gap-2">
          <ActionButton label={copied ? "Copied" : "Copy"} icon={copied ? Check : Copy} onClick={() => void copyBrief()} />
          <ActionButton label="Share" icon={Share2} onClick={() => void shareBrief()} />
          <ActionButton label="Export" icon={Download} onClick={onExport} primary />
        </div>
      </div>
      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        <IntelCard icon={Activity} label="Seismic events" value={String(brief.eventCount || "--")} detail="Magnitude 2.5+ in the last day" />
        <IntelCard icon={Radio} label="K-index" value={brief.kpIndex?.toFixed(1) ?? "--"} detail={brief.kpLabel} />
        <IntelCard icon={Satellite} label="Solar flux" value={brief.solarFlux?.toFixed(1) ?? "--"} detail="F10.7 centimeter radio flux" />
        <IntelCard icon={AlertTriangle} label="Composite risk" value={`${brief.riskScore}/100`} detail={`${brief.riskLevel} // strongest ${brief.strongest ? `M${brief.strongest.magnitude.toFixed(1)}` : "unavailable"}`} />
      </div>
      <div className="mt-3 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.035] p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-[0.22em] text-cyan-200/50">Analyst note</span>
          <Database className="size-4 text-cyan-300/50" />
        </div>
        <p className="max-w-2xl text-xs leading-6 text-white/60">
          {brief.summary}
        </p>
        <p className="mt-4 border-t border-cyan-300/10 pt-3 text-[8px] uppercase tracking-[0.16em] text-cyan-100/30">
          Generated {new Date(brief.generatedAt).toLocaleString()} // USGS + NOAA // informational, not an emergency alert
        </p>
      </div>
    </div>
  );
}

function ActionButton({ label, icon: Icon, onClick, primary = false }: { label: string; icon: typeof Download; onClick: () => void; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded border px-3 py-2 text-[8px] font-bold uppercase tracking-[0.14em] transition-colors ${primary ? "border-emerald-300/40 bg-emerald-300 text-black hover:bg-emerald-200" : "border-emerald-300/20 bg-black/35 text-emerald-200/65 hover:border-emerald-300/45 hover:text-emerald-200"}`}
    >
      <Icon className="size-3" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function IntelCard({ icon: Icon, label, value, detail }: { icon: typeof Activity; label: string; value: string; detail: string }) {
  return (
    <article className="rounded-lg border border-emerald-400/15 bg-black/30 p-5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-100/40">{label}</span>
        <Icon className="size-4 text-emerald-300/45" />
      </div>
      <div className="mt-6 text-3xl font-black text-white">{value}</div>
      <p className="mt-2 truncate text-[9px] uppercase tracking-wider text-emerald-200/35">{detail}</p>
    </article>
  );
}

function PanelTitle({ eyebrow, title, inline = false }: { eyebrow: string; title: string; inline?: boolean }) {
  return (
    <div className={inline ? "" : "absolute left-5 top-5 z-10"}>
      <div className="mb-1 text-[9px] uppercase tracking-[0.4em] text-emerald-200/35">{eyebrow}</div>
      <h1 className="text-xl font-black italic tracking-tighter text-white sm:text-2xl">{title}</h1>
    </div>
  );
}

function StatusPill({ label, tone }: { label: string; tone: "emerald" | "cyan" | "amber" }) {
  const className = tone === "emerald"
    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
    : tone === "cyan"
      ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
      : "border-amber-400/20 bg-amber-400/10 text-amber-300";
  return <span className={`rounded border px-2 py-1 text-[8px] ${className}`}>{label}</span>;
}

function SystemPulse({ riskScore }: { riskScore: number }) {
  const pulseMetrics = [
    { label: "Neural uplink", value: 88, color: "emerald" as const },
    { label: "Source confidence", value: 95, color: "cyan" as const },
    { label: "Terrestrial data", value: 95, color: "blue" as const },
    { label: "Planetary risk", value: riskScore, color: "red" as const },
  ];
  return (
    <div className="flex-1 rounded-lg border border-emerald-500/20 bg-black/40 p-4">
      <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
        <Shield className="size-3 animate-pulse" />
        System pulse
      </div>
      <div className="space-y-4">
        {pulseMetrics.map((metric) => <PulseBar key={metric.label} {...metric} />)}
      </div>
    </div>
  );
}

function PulseBar({ label, value, color }: { label: string; value: number; color: "emerald" | "cyan" | "red" | "blue" }) {
  const colors = { emerald: "bg-emerald-400", cyan: "bg-cyan-400", red: "bg-red-400", blue: "bg-blue-400" };
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[8px] uppercase tracking-widest text-emerald-100/45"><span>{label}</span><span>{value}%</span></div>
      <div className="h-1 overflow-hidden rounded-full bg-white/5">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} className={`h-full ${colors[color]}`} />
      </div>
    </div>
  );
}

function SystemLog({ alert, signals }: { alert: string; signals: ReturnType<typeof useLiveSignals> }) {
  return (
    <div className="h-40 overflow-hidden rounded-lg border border-emerald-500/20 bg-black/40 p-4 text-[9px] lg:h-1/3">
      <div className="mb-3 flex items-center justify-between text-emerald-100/40"><span>SYSTEM_LOG</span><span>v3.0.NEXUS</span></div>
      <div className="space-y-1.5 text-emerald-300/55">
        <p>[SOURCE] NOAA: {signals.sourceHealth.noaa ? "ONLINE" : "OFFLINE"}</p>
        <p className="text-cyan-300/70">[SOURCE] USGS: {signals.sourceHealth.usgs ? "ONLINE" : "OFFLINE"}</p>
        <p>[SIGNAL] {signals.status.toUpperCase()}</p>
        <p className="text-amber-300/70">[CACHE] {signals.status === "cached" ? "SERVING LAST VERIFIED SNAPSHOT" : "READY"}</p>
        <p className="animate-pulse text-white/75">[NOW] {alert}</p>
      </div>
    </div>
  );
}

function Footer({ status }: { status: ReturnType<typeof useLiveSignals>["status"] }) {
  return (
    <footer className="flex min-h-10 flex-wrap items-center justify-between gap-3 border-t border-emerald-500/10 px-2 py-2 text-[8px] uppercase tracking-[0.18em] text-emerald-100/40 lg:px-4">
      <div className="flex flex-wrap items-center gap-5">
        <span className="flex items-center gap-2"><i className="size-1 rounded-full bg-emerald-400" />NET: ENCRYPTED</span>
        <span className="flex items-center gap-2"><i className="size-1 rounded-full bg-cyan-400" />SOURCES: NOAA + USGS</span>
        <span className="flex items-center gap-2"><i className={`size-1 rounded-full ${status === "live" ? "bg-emerald-400" : status === "cached" ? "bg-amber-400" : "bg-red-400"}`} />SIGNAL: {status}</span>
      </div>
      <span>2026 ALIASIST // OPEN INTELLIGENCE</span>
    </footer>
  );
}

export default App;
