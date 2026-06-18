import { lazy, Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import { Shield, Database, Activity, Download, Copy, Check } from "lucide-react";

import { useLiveSignals } from "./lib/useLiveSignals";
import { createPlanetaryBrief, briefToMarkdown } from "./lib/planetaryBrief";
import OSHeader, { type NexusView } from "./components/nexus/OSHeader";
import SignalDeck from "./components/nexus/SignalDeck";
import CommandTerminal from "./components/nexus/CommandTerminal";
import PatentIntelligence from "./components/nexus/PatentIntelligence";

const NexusCore = lazy(() => import("./components/nexus/NexusCore").then(m => ({ default: m.NexusCore })));

export default function App() {
  const [booting, setBooting] = useState(true);
  const [activeView, setActiveView] = useState<NexusView>("nexus");
  const [systemAlert, setSystemAlert] = useState("ALL SYSTEMS NOMINAL");
  const signals = useLiveSignals();
  const brief = createPlanetaryBrief(signals);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleCommandMessage = (msg: string) => {
    setSystemAlert(msg);
    setTimeout(() => setSystemAlert("ALL SYSTEMS NOMINAL"), 5000);
  };

  const handleCommandAction = async (action: string) => {
    if (action === 'scan') {
      await signals.refresh();
      handleCommandMessage("SCAN COMPLETE // SIGNALS SYNCHRONIZED");
    } else if (action === 'brief') {
      setActiveView('intelligence');
    } else if (action === 'export') {
      downloadBrief();
    }
  };

  const downloadBrief = () => {
    const blob = new Blob([briefToMarkdown(brief)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexus-brief-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    handleCommandMessage("INTELLIGENCE EXPORTED TO DISK");
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#020408] font-mono text-emerald-400 selection:bg-emerald-400/25">
      <AnimatePresence>{booting && <BootSequence />}</AnimatePresence>

      {!booting && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="relative z-10 flex h-screen flex-col gap-4 p-4 lg:p-6"
        >
          <OSHeader activeView={activeView} onViewChange={setActiveView} signals={signals} />
          
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[280px_1fr_320px]">
            {/* Left Sidebar: Live Signals */}
            <aside className="flex flex-col gap-4 overflow-hidden">
              <div className="flex items-center gap-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/40">
                <Activity className="size-3" />
                Live Telemetry
              </div>
              <SignalDeck signals={signals} />
              <SystemHealth brief={brief} />
            </aside>

            {/* Main Viewport */}
            <section className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-black/60 shadow-2xl">
              <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 8] }}>
                  <Suspense fallback={null}>
                    <NexusCore active={activeView === 'nexus'} />
                    <EffectComposer>
                      <Bloom luminanceThreshold={1} intensity={1.5} levels={9} mipmapBlur />
                      <Noise opacity={0.05} />
                      <Vignette eskil={false} offset={0.1} darkness={1.1} />
                    </EffectComposer>
                  </Suspense>
                </Canvas>
              </div>

              <div className="relative z-10 h-full">
                <AnimatePresence mode="wait">
                  {activeView === 'nexus' && (
                    <motion.div 
                      key="nexus"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="flex h-full flex-col items-center justify-center p-12 text-center"
                    >
                      <h2 className="text-4xl font-black italic tracking-tighter text-white sm:text-6xl">NEXUS PRIME</h2>
                      <p className="mt-4 max-w-md text-xs leading-relaxed tracking-widest text-emerald-400/60">
                        ORCHESTRATING PLANETARY INTELLIGENCE FOR THE ALIASIST COMMUNITY.
                      </p>
                      <div className="mt-12 flex gap-4">
                        <StatusIndicator label="Seismic" active={signals.sourceHealth.usgs} />
                        <StatusIndicator label="Space Weather" active={signals.sourceHealth.noaa} />
                      </div>
                    </motion.div>
                  )}

                  {activeView === 'intelligence' && (
                    <motion.div 
                      key="intelligence"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="h-full overflow-y-auto p-8"
                    >
                      <IntelligenceView brief={brief} onExport={downloadBrief} onMessage={handleCommandMessage} />
                    </motion.div>
                  )}

                  {activeView === 'patents' && (
                    <motion.div 
                      key="patents"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      className="h-full"
                    >
                      <PatentIntelligence patents={signals.patents} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            {/* Right Sidebar: Ops & Logs */}
            <aside className="flex flex-col gap-4 overflow-hidden">
              <CommandTerminal onSystemMessage={handleCommandMessage} onCommandAction={handleCommandAction} />
              <div className="flex-1 rounded-lg border border-emerald-500/10 bg-black/40 p-4">
                <div className="mb-3 flex items-center justify-between text-[9px] uppercase tracking-widest text-emerald-400/30">
                  <span>System Log</span>
                  <span>v4.0.0</span>
                </div>
                <div className="space-y-2 text-[10px] text-emerald-300/60">
                  <p className="text-white/80 animate-pulse">[NOW] {systemAlert}</p>
                  <p>[INFO] Link stability: 99.8%</p>
                  <p>[INFO] Neural cache verified</p>
                  <p>[WARN] Solar flux anomaly detected</p>
                </div>
              </div>
            </aside>
          </div>

          <footer className="flex items-center justify-between border-t border-emerald-500/10 pt-4 text-[8px] uppercase tracking-[0.3em] text-emerald-400/30">
            <span>2026 Aliasist // Nexus Prime edition</span>
            <div className="flex gap-6">
              <span>Uptime: 99.999%</span>
              <span>Coordinates: 0.0, 0.0, 0.0</span>
            </div>
          </footer>
        </motion.div>
      )}
      <div className="pointer-events-none absolute inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]" />
    </main>
  );
}

function BootSequence() {
  return (
    <motion.div 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020408]"
    >
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="mb-12 size-32 rounded-full border border-emerald-400/20 shadow-[0_0_30px_rgba(52,211,153,0.1)]" 
      />
      <h1 className="text-4xl font-black italic tracking-tighter text-white">NEXUS</h1>
      <p className="mt-4 text-[10px] tracking-[0.6em] text-emerald-400/40">INITIALIZING PLANETARY UPLINK</p>
      <div className="mt-12 h-px w-64 overflow-hidden bg-white/5">
        <motion.div 
          initial={{ x: "-100%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="h-full w-full bg-emerald-400" 
        />
      </div>
    </motion.div>
  );
}

function StatusIndicator({ label, active }: { label: string, active: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-emerald-500/10 bg-emerald-400/5 px-4 py-2">
      <div className={`size-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-red-400'} shadow-[0_0_8px_currentColor]`} />
      <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400/60">{label}</span>
    </div>
  );
}

function SystemHealth({ brief }: { brief: any }) {
  return (
    <div className="rounded-lg border border-emerald-500/10 bg-black/40 p-4">
      <div className="mb-4 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-emerald-400/40">
        <span>System Pulse</span>
        <Shield className="size-3" />
      </div>
      <div className="space-y-3">
        <HealthBar label="Risk Index" value={brief.riskScore} color="#ef4444" />
        <HealthBar label="Link Stability" value={98} color="#34d399" />
        <HealthBar label="Cache Health" value={100} color="#22d3ee" />
      </div>
    </div>
  );
}

function HealthBar({ label, value, color }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[7px] uppercase tracking-[0.2em] text-emerald-100/30">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${value}%` }} 
          className="h-full" 
          style={{ backgroundColor: color }} 
        />
      </div>
    </div>
  );
}

function IntelligenceView({ brief, onExport, onMessage }: any) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(briefToMarkdown(brief));
    setCopied(true);
    onMessage("BRIEF COPIED TO CLIPBOARD");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-black italic tracking-tight text-white uppercase">Intelligence Brief</h3>
          <p className="text-[10px] text-emerald-400/40 uppercase tracking-[0.3em]">Generated {new Date(brief.generatedAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={copyToClipboard} className="flex size-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-black/40 text-emerald-400 hover:border-emerald-400 hover:text-white transition-all">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>
          <button onClick={onExport} className="flex items-center gap-3 rounded-lg border border-emerald-400 bg-emerald-400 px-6 py-2 text-[10px] font-black uppercase tracking-widest text-black hover:bg-white transition-all">
            <Download className="size-4" />
            Export MD
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <IntelStat label="Risk Score" value={`${brief.riskScore}/100`} detail={brief.riskLevel} />
        <IntelStat label="Flare Class" value={brief.flareClass} detail="X-Ray Peak" />
        <IntelStat label="K-Index" value={brief.kpIndex?.toFixed(1) ?? 'N/A'} detail={brief.kpLabel} />
        <IntelStat label="Seismic" value={brief.eventCount} detail="Active Events" />
      </div>

      <div className="rounded-xl border border-emerald-500/10 bg-emerald-400/5 p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-3 text-emerald-400">
          <Database className="size-5" />
          <span className="text-xs font-bold uppercase tracking-[0.3em]">Strategic Summary</span>
        </div>
        <p className="text-sm leading-relaxed text-emerald-100/70">{brief.summary}</p>
        <div className="mt-8 flex items-center gap-6 border-t border-emerald-500/10 pt-6 text-[8px] uppercase tracking-widest text-emerald-400/40">
          <span>Source: SWPC / NOAA</span>
          <span>Source: USGS / Earthquake Hazards</span>
        </div>
      </div>
    </div>
  );
}

function IntelStat({ label, value, detail }: any) {
  return (
    <div className="rounded-lg border border-emerald-500/10 bg-black/40 p-5">
      <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-400/40">{label}</span>
      <div className="my-2 text-3xl font-black text-white">{value}</div>
      <span className="text-[9px] uppercase tracking-widest text-emerald-400/60">{detail}</span>
    </div>
  );
}
