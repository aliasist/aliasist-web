import { lazy, Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Check, Copy, Database, Download, Shield } from "lucide-react";

import { useLiveSignals } from "./lib/useLiveSignals";
import { createPlanetaryBrief, briefToMarkdown, type PlanetaryBrief } from "./lib/planetaryBrief";
import OSHeader, { type EcosistView } from "./components/ecosist/OSHeader";
import SignalDeck from "./components/ecosist/SignalDeck";
import CommandTerminal from "./components/ecosist/CommandTerminal";
import EarthSignals from "./components/ecosist/EarthSignals";
import CameraNetwork from "./components/ecosist/CameraNetwork";

const PlanetaryScene = lazy(() => import("./components/ecosist/PlanetaryScene"));

export default function App() {
  const [booting, setBooting] = useState(true);
  const [activeView, setActiveView] = useState<EcosistView>("core");
  const [systemAlert, setSystemAlert] = useState("Updating data sources");
  const signals = useLiveSignals();
  const brief = createPlanetaryBrief(signals);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleCommandMessage = (message: string) => {
    setSystemAlert(message);
    window.setTimeout(() => setSystemAlert("Latest data loaded"), 5000);
  };

  const downloadBrief = () => {
    const blob = new Blob([briefToMarkdown(brief)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ecosist-brief-${new Date().toISOString().slice(0, 10)}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
    handleCommandMessage("Summary downloaded");
  };

  const handleCommandAction = async (action: string) => {
    if (action === "scan") {
      const health = await signals.refresh();
      handleCommandMessage(health.ecosist ? "Data refreshed" : "Some sources are unavailable; another refresh will be attempted");
    } else if (action === "brief") {
      setActiveView("intelligence");
    } else if (action === "signals") {
      setActiveView("signals");
    } else if (action === "export") {
      downloadBrief();
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#020408] text-emerald-400 selection:bg-emerald-400/25">
      <AnimatePresence>{booting && <BootSequence />}</AnimatePresence>

      {!booting && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 flex min-h-screen flex-col gap-4 p-4 lg:h-screen lg:p-6">
          <OSHeader activeView={activeView} onViewChange={setActiveView} signals={signals} />

          <div className="grid flex-1 grid-cols-1 gap-4 lg:min-h-0 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
            <aside className="flex flex-col gap-4 lg:overflow-hidden">
              <div className="flex items-center gap-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/40">
                <Activity className="size-3" /> Current conditions
              </div>
              <SignalDeck signals={signals} />
              <SystemHealth brief={brief} apiOnline={signals.sourceHealth.ecosist} />
            </aside>

            <section className="relative min-h-[70vh] overflow-hidden rounded-xl border border-emerald-500/20 bg-black/60 shadow-2xl lg:min-h-0">
              <div className="absolute inset-0 z-0">
                <Suspense fallback={null}>
                  <PlanetaryScene active={activeView === "core"} />
                </Suspense>
              </div>

              <div className="relative z-10 h-full">
                <AnimatePresence mode="wait">
                  {activeView === "core" && (
                    <motion.div key="core" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="flex h-full flex-col items-center justify-center p-6 text-center sm:p-12">
                      <p className="text-[9px] uppercase tracking-[0.5em] text-emerald-400/45">Weather, earthquakes, and natural events</p>
                      <h2 className="mt-4 text-5xl font-black italic tracking-tighter text-white sm:text-7xl">ECOSIST</h2>
                      <p className="readable-copy mt-4 text-emerald-100/70">
                        WEATHER, GROUND, NATURAL EVENTS, AND SPACE WEATHER IN ONE LIVE PLANETARY SYSTEM.
                      </p>
                      <div className="mt-10 flex max-w-xl flex-wrap justify-center gap-3">
                        <StatusIndicator label="NWS Alerts" active={signals.sourceHealth.nws} />
                        <StatusIndicator label="USGS Seismic" active={signals.sourceHealth.usgs} />
                        <StatusIndicator label="NASA Events" active={signals.sourceHealth.nasa} />
                        <StatusIndicator label="NOAA Space" active={signals.sourceHealth.noaa} />
                      </div>
                    </motion.div>
                  )}

                  {activeView === "intelligence" && (
                    <motion.div key="intelligence" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full overflow-y-auto p-5 sm:p-8">
                      <IntelligenceView brief={brief} onExport={downloadBrief} onMessage={handleCommandMessage} />
                    </motion.div>
                  )}

                  {activeView === "signals" && (
                    <motion.div key="signals" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="h-full">
                      <EarthSignals signals={signals} />
                    </motion.div>
                  )}

                  {activeView === "cameras" && (
                    <motion.div key="cameras" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="h-full">
                      <CameraNetwork signals={signals} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            <aside className="flex flex-col gap-4 lg:overflow-hidden">
              <CommandTerminal onSystemMessage={handleCommandMessage} onCommandAction={handleCommandAction} />
              <div className="flex-1 rounded-lg border border-emerald-500/10 bg-black/40 p-4">
                <div className="mb-3 flex items-center justify-between text-[9px] uppercase tracking-widest text-emerald-400/30"><span>Latest updates</span><span>EcoSist</span></div>
                <div className="space-y-2 text-[10px] text-emerald-300/60">
                  <p className="animate-pulse text-white/80">[NOW] {systemAlert}</p>
                  <p>[NWS] {signals.alerts.length} active alerts normalized</p>
                  <p>[USGS] {signals.quakes.length} seismic events indexed</p>
                  <p>[NASA] {signals.events.length} natural events open</p>
                  <p>[NOAA] Kp {signals.kpIndex?.toFixed(1) ?? "pending"} // {signals.kpLabel}</p>
                </div>
              </div>
            </aside>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-500/10 pt-4 text-[8px] uppercase tracking-[0.3em] text-emerald-400/30">
            <span>2026 Aliasist // Ecosist</span>
            <div className="flex gap-6"><span>NWS</span><span>USGS</span><span>NASA EONET</span><span>NOAA SWPC</span></div>
          </footer>
        </motion.div>
      )}
      <div className="pointer-events-none absolute inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]" />
    </main>
  );
}

function BootSequence() {
  return (
    <motion.div exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020408]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="mb-12 size-32 rounded-full border border-emerald-400/20 shadow-[0_0_30px_rgba(52,211,153,0.1)]" />
      <h1 className="text-4xl font-black italic tracking-tighter text-white">ECOSIST</h1>
      <p className="mt-4 text-[10px] tracking-[0.5em] text-emerald-400/40">Loading environmental data</p>
      <div className="mt-12 h-px w-64 overflow-hidden bg-white/5"><motion.div initial={{ x: "-100%" }} animate={{ x: "0%" }} transition={{ duration: 1.5, ease: "easeInOut" }} className="h-full w-full bg-emerald-400" /></div>
    </motion.div>
  );
}

function StatusIndicator({ label, active }: { label: string; active: boolean }) {
  return <div className="flex items-center gap-2 rounded-full border border-emerald-500/10 bg-emerald-400/5 px-4 py-2"><div className={`size-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-red-400"} shadow-[0_0_8px_currentColor]`} /><span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400/60">{label}</span></div>;
}

function SystemHealth({ brief, apiOnline }: { brief: PlanetaryBrief; apiOnline: boolean }) {
  return (
    <div className="rounded-lg border border-emerald-500/10 bg-black/40 p-4">
      <div className="mb-4 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-emerald-400/40"><span>Data health</span><Shield className="size-3" /></div>
      <div className="space-y-3"><HealthBar label="Risk index" value={brief.riskScore} color="#ef4444" /><HealthBar label="API health" value={apiOnline ? 100 : 20} color="#34d399" /><HealthBar label="Feed coverage" value={brief.sourceCoverage} color="#22d3ee" /></div>
    </div>
  );
}

function HealthBar({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="space-y-1.5"><div className="flex justify-between text-[7px] uppercase tracking-[0.2em] text-emerald-100/30"><span>{label}</span><span>{value}%</span></div><div className="h-1 w-full overflow-hidden rounded-full bg-white/5"><motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} className="h-full" style={{ backgroundColor: color }} /></div></div>;
}

function IntelligenceView({ brief, onExport, onMessage }: { brief: PlanetaryBrief; onExport: () => void; onMessage: (message: string) => void }) {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(briefToMarkdown(brief));
    setCopied(true);
    onMessage("Summary copied");
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><h3 className="text-2xl font-black italic uppercase tracking-tight text-white">Earth and Weather Summary</h3><p className="text-[10px] uppercase tracking-[0.3em] text-emerald-400/40">Updated {new Date(brief.generatedAt).toLocaleString()}</p></div>
        <div className="flex gap-2"><button onClick={copyToClipboard} aria-label="Copy brief" className="flex size-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-black/40 text-emerald-400 transition-all hover:border-emerald-400 hover:text-white">{copied ? <Check className="size-4" /> : <Copy className="size-4" />}</button><button onClick={onExport} className="flex items-center gap-3 rounded-lg border border-emerald-400 bg-emerald-400 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-black transition-all hover:bg-white"><Download className="size-4" />Export MD</button></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><IntelStat label="Risk score" value={`${brief.riskScore}/100`} detail={brief.riskLevel} /><IntelStat label="Weather alerts" value={brief.alertCount} detail="NWS active" /><IntelStat label="Natural events" value={brief.naturalEventCount} detail="NASA EONET" /><IntelStat label="K-index" value={brief.kpIndex?.toFixed(1) ?? "—"} detail={brief.kpLabel} /></div>
      <div className="rounded-xl border border-emerald-500/10 bg-emerald-400/5 p-6 backdrop-blur-sm"><div className="mb-4 flex items-center gap-3 text-emerald-400"><Database className="size-5" /><span className="font-mono text-xs font-bold uppercase tracking-[0.3em]">What the data shows</span></div><p className="readable-copy text-emerald-100/70">{brief.summary}</p><div className="mt-8 flex flex-wrap gap-5 border-t border-emerald-500/10 pt-6 font-mono text-[8px] uppercase tracking-widest text-emerald-400/40"><span>NWS Weather</span><span>USGS Earthquakes</span><span>NASA EONET</span><span>NOAA SWPC</span></div></div>
    </div>
  );
}

function IntelStat({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return <div className="rounded-lg border border-emerald-500/10 bg-black/40 p-5"><span className="text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-400/40">{label}</span><div className="my-2 text-3xl font-black text-white">{value}</div><span className="text-[9px] uppercase tracking-widest text-emerald-400/60">{detail}</span></div>;
}
