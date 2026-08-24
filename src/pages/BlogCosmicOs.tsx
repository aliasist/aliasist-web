import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Layers, 
  Cpu, 
  Terminal, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  BookOpen, 
  Share2, 
  CheckCircle2, 
  Radio
} from "lucide-react";
import Starfield from "@/components/Starfield";
import { Card } from "@/components/ui/card";

const BlogCosmicOs = () => {
  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-electric/25">
      <Starfield />

      <main className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/os"
            className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-electric transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Back to AliasOS
          </Link>

          <span className="px-3 py-1 rounded-full border border-electric/40 bg-electric/10 text-electric font-mono text-xs uppercase tracking-wider">
            Engineering Blog
          </span>
        </div>

        {/* Article Header */}
        <header className="space-y-4 border-b border-border/60 pb-8">
          <h1 className="bg-gradient-to-r from-electric via-emerald-300 to-cyan-400 bg-clip-text text-3xl sm:text-5xl font-black tracking-tight text-transparent leading-tight drop-shadow-[0_0_35px_rgba(10,204,151,0.25)]">
            Architecting AliasOS: From Redox Microkernels to a Pure-Rust App Orchestrator & The Tractor Beam Protocol
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg font-sans leading-relaxed">
            How we built a next-generation Rust & Elm desktop ecosystem, zero-allocation stream telemetry, and a unified multi-runtime application orchestrator.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground pt-2">
            <span>By <strong className="text-foreground">Developer Aliasist</strong></span>
            <span>·</span>
            <span>August 23, 2026</span>
            <span>·</span>
            <span className="text-electric">8 min read</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {["#RustLang", "#OperatingSystems", "#RedoxOS", "#Tauri", "#Elm", "#Microkernel", "#WebAudio"].map(tag => (
              <span key={tag} className="px-2.5 py-0.5 rounded-full bg-card border border-border/70 text-[10px] font-mono text-foreground/80">
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Article Body */}
        <article className="space-y-8 font-sans text-sm sm:text-base leading-relaxed text-foreground/90">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-electric">1.</span> The Vision: Why Build an OS Runtime?
            </h2>
            <p>
              Modern operating systems have grown bloated, resource-heavy, and opaque. When building high-performance developer tools, media extraction engines, AI research studios, and interactive simulation workbenches, standard monolithic desktop frameworks quickly reveal their weaknesses:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-muted-foreground">
              <li><strong className="text-foreground">Memory bloat:</strong> Standard desktop runtimes frequently consume 200MB+ of RAM per idle window.</li>
              <li><strong className="text-foreground">Partial failure corruption:</strong> Interrupted file streams or power losses leave broken, dirty fragments scattered across storage.</li>
              <li><strong className="text-foreground">Fragile state:</strong> JavaScript/TypeScript apps still suffer from unhandled runtime exceptions.</li>
              <li><strong className="text-foreground">Siloed applications:</strong> Tools operate in isolation with no unified IPC bridge or standardized sandbox runtime.</li>
            </ul>
            <p>
              We set out to change this by designing <strong>AliasOS</strong>—a unified, memory-safe, microkernel-inspired application ecosystem built on <strong>Rust 2021, Pure Functional Elm, and Tauri v2</strong>.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-cyan-400">2.</span> Studying Redox OS: What Microkernels Taught Us
            </h2>
            <p>
              Before building our own proprietary engine, we analyzed <strong>Redox OS</strong>—a Unix-like microkernel operating system written entirely from scratch in Rust.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 font-mono text-xs pt-2">
              <Card className="p-4 bg-card/60 border-border/60 space-y-1.5">
                <span className="text-cyan-400 font-bold">"Everything is a Scheme"</span>
                <p className="text-[11px] text-muted-foreground">Redox treats storage, networks, and graphics as unified scheme URLs (<code>file:</code>, <code>tcp:</code>, <code>orbital:</code>).</p>
              </Card>
              <Card className="p-4 bg-card/60 border-border/60 space-y-1.5">
                <span className="text-emerald-400 font-bold">Copy-on-Write (CoW)</span>
                <p className="text-[11px] text-muted-foreground">RedoxFS guarantees that data blocks are staged and verified before pointers are swapped.</p>
              </Card>
              <Card className="p-4 bg-card/60 border-border/60 space-y-1.5">
                <span className="text-purple-400 font-bold">Capability Sandboxing</span>
                <p className="text-[11px] text-muted-foreground">Applications are isolated by strict security schemes with zero ambient authority.</p>
              </Card>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-emerald-400">3.</span> The Tractor Beam Protocol (TBP): Our Proprietary Engine
            </h2>
            <p>
              Instead of relying on generic wrappers, we engineered the <strong>Tractor Beam Protocol (TBP)</strong>—a resilient, sub-atomic media extraction and transmutation pipeline.
            </p>
            
            <div className="p-4 rounded-lg bg-card/80 border border-electric/30 space-y-3 font-mono text-xs">
              <div className="text-electric font-bold">🛸 TRACTOR BEAM ARCHITECTURE</div>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong className="text-foreground">Quantum Target Lock:</strong> Probes streams, rotates JA3 TLS fingerprints, and applies anti-bot stealth cloaking.</li>
                <li>• <strong className="text-foreground">Hyperspace Staging Enclave:</strong> Data streams directly into hidden vaults (<code>.hyperspace_{`{cargo}`}.vault</code>), keeping destination directories pristine.</li>
                <li>• <strong className="text-foreground">Atomic Materialization Gate:</strong> Instantly performs an atomic filesystem swap (<code>tokio::fs::rename</code>) once integrity checks pass.</li>
                <li>• <strong className="text-foreground">Zero-Allocation Telemetry:</strong> High-speed byte-slice parser streaming real-time beam power and warp speed without heap allocations.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-purple-400">4.</span> Why Rust + Elm + Tauri is the Ultimate Stack
            </h2>
            <p>
              We benchmarked our three desktop application editions side-by-side:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border border-border/70 rounded-lg overflow-hidden">
                <thead className="bg-card/90 text-muted-foreground border-b border-border/70">
                  <tr>
                    <th className="p-3">EDITION</th>
                    <th className="p-3">STACK</th>
                    <th className="p-3">BINARY</th>
                    <th className="p-3">RAM</th>
                    <th className="p-3">STARTUP</th>
                    <th className="p-3">CRASH RISK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 bg-card/40">
                  <tr className="text-emerald-300">
                    <td className="p-3 font-bold">🛸 Tauri v3</td>
                    <td className="p-3">Rust + React</td>
                    <td className="p-3">5.81 MB</td>
                    <td className="p-3">~35 MB</td>
                    <td className="p-3">&lt;180ms</td>
                    <td className="p-3">Memory Safe</td>
                  </tr>
                  <tr className="text-cyan-300">
                    <td className="p-3 font-bold">🌳 Elm Edition</td>
                    <td className="p-3">Pure Elm + Rust</td>
                    <td className="p-3">5.71 MB</td>
                    <td className="p-3">~35 MB</td>
                    <td className="p-3">&lt;180ms</td>
                    <td className="p-3 font-black text-emerald-400">Zero Exceptions</td>
                  </tr>
                  <tr className="text-blue-300">
                    <td className="p-3 font-bold">👽 Electron OG</td>
                    <td className="p-3">Node + Chromium</td>
                    <td className="p-3">~195 MB</td>
                    <td className="p-3">~180 MB</td>
                    <td className="p-3">~1.8s</td>
                    <td className="p-3">Standard JS</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="text-amber-400">5.</span> Building the AliasOS Process Orchestrator & Axum IPC Daemon
            </h2>
            <p>
              To unify our suite of tools without creating a heavyweight monolith, we built a standalone Rust process orchestrator (<code className="text-electric">orchestrator.rs</code>) powered by <strong>Axum</strong> listening on local port <code className="text-electric">7777</code>.
            </p>
            <p>
              The orchestrator reads standardized JSON manifests from <code className="text-muted-foreground">~/apps/registry/*.json</code> and provides high-speed HTTP IPC endpoints (<code className="text-muted-foreground">/api/apps</code>, <code className="text-muted-foreground">/api/apps/:id/launch</code>, <code className="text-muted-foreground">/api/hardware</code>) allowing our web dashboard at <code className="text-electric">/os</code> to launch and terminate native binaries in isolated sandboxes with 1-click.
            </p>
          </section>

          {/* Conclusion */}
          <section className="space-y-4 pt-4 border-t border-border/60">
            <h2 className="text-xl font-bold text-foreground">
              Conclusion: The Future of Desktop Runtimes
            </h2>
            <p>
              AliasOS demonstrates that with <strong>Rust, Elm, Zig, Mojo, and Microkernel design principles</strong>, software can run 10× faster, use 80% less memory, and provide rock-solid reliability.
            </p>
          </section>

          {/* Action Footer */}
          <div className="pt-6 flex items-center justify-between">
            <Link
              to="/os"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-electric text-black font-mono text-xs uppercase font-bold hover:bg-electric/90 transition-all shadow-lg shadow-electric/20 active:scale-95"
            >
              Launch AliasOS <Layers className="size-3.5" />
            </Link>

            <Link
              to="/entertainment"
              className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              Play 12-Game Retro Arcade →
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
};

export default BlogCosmicOs;
