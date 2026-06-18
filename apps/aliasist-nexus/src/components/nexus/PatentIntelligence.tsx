import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Search, Plus, Filter, BookOpen, ShieldCheck } from "lucide-react";
import type { Patent } from "../../lib/useLiveSignals";

export default function PatentIntelligence({ patents }: { patents: Patent[] }) {
  const [filter, setFilter] = useState("");
  const [selectedPatent, setSelectedPatent] = useState<Patent | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);

  const filteredPatents = patents.filter(p => 
    p.title.toLowerCase().includes(filter.toLowerCase()) || 
    p.id.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col p-6 lg:p-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">Patent Intelligence</h2>
          <p className="mt-1 text-[10px] text-emerald-400/40 uppercase tracking-[0.3em]">USPTO // Tactical Innovation Analysis</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsDrafting(!isDrafting)}
            className="flex items-center gap-2 rounded-lg border border-emerald-400 bg-emerald-400/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:bg-emerald-400 hover:text-black transition-all"
          >
            <Plus className="size-3" />
            Draft Patent
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left Column: Patent Explorer */}
        <section className="flex flex-col gap-4 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-emerald-400/30" />
            <input 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search government innovation grid..."
              className="w-full rounded-lg border border-emerald-500/10 bg-black/40 py-3 pl-10 pr-4 text-[10px] uppercase tracking-widest text-white outline-none focus:border-emerald-500/30"
            />
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-none">
            {filteredPatents.map((patent) => (
              <motion.div
                key={patent.id}
                layoutId={patent.id}
                onClick={() => setSelectedPatent(patent)}
                className={`cursor-pointer rounded-lg border p-4 transition-all ${
                  selectedPatent?.id === patent.id 
                    ? "border-emerald-400 bg-emerald-400/5 shadow-[0_0_20px_rgba(52,211,153,0.05)]" 
                    : "border-emerald-500/10 bg-black/40 hover:border-emerald-500/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-emerald-400">{patent.id}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${
                    patent.status === 'Granted' ? 'bg-emerald-400/20 text-emerald-400' : 'bg-amber-400/20 text-amber-400'
                  }`}>
                    {patent.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">{patent.title}</h3>
                <p className="mt-2 text-[9px] text-emerald-100/40 uppercase tracking-widest">{patent.assignee}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Right Column: Detailed Analysis / Drafting */}
        <aside className="relative overflow-hidden rounded-xl border border-emerald-500/10 bg-black/40 p-6">
          <AnimatePresence mode="wait">
            {isDrafting ? (
              <motion.div
                key="drafting"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
              >
                <div className="mb-6 flex items-center gap-3 text-emerald-400">
                  <Plus className="size-5" />
                  <span className="text-xs font-bold uppercase tracking-[0.3em]">Patent Drafting Module</span>
                </div>
                <div className="space-y-4 flex-1">
                  <div className="space-y-1.5">
                    <label className="text-[8px] uppercase tracking-widest text-emerald-100/30">Innovation Title</label>
                    <input className="w-full rounded border border-emerald-500/10 bg-black/60 p-3 text-[10px] text-white outline-none focus:border-emerald-400" placeholder="E.G. NEURAL-MESH TOPOLOGY..." />
                  </div>
                  <div className="space-y-1.5 flex-1 flex flex-col">
                    <label className="text-[8px] uppercase tracking-widest text-emerald-100/30">Technical Specification / Claims</label>
                    <textarea className="w-full flex-1 rounded border border-emerald-500/10 bg-black/60 p-3 text-[10px] text-white outline-none focus:border-emerald-400 resize-none" placeholder="DEFINE THE ARCHITECTURAL CLAIMS..." />
                  </div>
                  <button className="w-full rounded bg-emerald-400 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-black hover:bg-white transition-all">
                    Initialize Gov-Sumbission
                  </button>
                </div>
              </motion.div>
            ) : selectedPatent ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full overflow-y-auto"
              >
                <div className="mb-6 flex items-center gap-3 text-emerald-400">
                  <BookOpen className="size-5" />
                  <span className="text-xs font-bold uppercase tracking-[0.3em]">Analysis Deck</span>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400/40 mb-2">Technical Abstract</h4>
                    <p className="text-[11px] leading-relaxed text-emerald-100/70 italic">"{selectedPatent.abstract}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <DetailBlock label="Classification" value={selectedPatent.classification} />
                    <DetailBlock label="Filing Date" value={selectedPatent.filingDate} />
                  </div>

                  <div>
                    <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400/40 mb-2">Inventors</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPatent.inventors.map(i => (
                        <span key={i} className="rounded-full border border-emerald-500/20 bg-emerald-400/5 px-3 py-1 text-[9px] text-emerald-300">{i}</span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-4">
                    <div className="flex items-center gap-2 text-cyan-400 mb-2">
                      <ShieldCheck className="size-3" />
                      <span className="text-[8px] font-bold uppercase tracking-widest">Gov-Asset Verification</span>
                    </div>
                    <p className="text-[9px] text-cyan-100/40 uppercase">This innovation is actively monitored by government oversight grids. Unauthorized reproduction is strictly prohibited.</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <FileText className="size-12 text-emerald-400/10 mb-4" />
                <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-400/30">Select a patent to analyze innovation topology</p>
              </div>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string, value: string }) {
  return (
    <div className="rounded-lg border border-emerald-500/5 bg-black/20 p-3">
      <span className="text-[8px] uppercase tracking-widest text-emerald-100/30">{label}</span>
      <div className="mt-1 text-[10px] font-bold text-white">{value}</div>
    </div>
  );
}
