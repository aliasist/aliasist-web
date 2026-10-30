import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Layers, 
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
            Building AliasOS: What I Learned from Redox, a Rust App Launcher, and the Tractor Beam Protocol
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg font-sans leading-relaxed">
            How I'm building a set of Rust and Elm desktop apps, live download stats with zero heap allocations, and one launcher that runs them all.
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
              <span className="text-electric">1.</span> Why Build an OS Runtime?
            </h2>
            <p>
              Desktop apps have gotten heavy. I build a lot of different tools (developer tools, media downloaders, AI research tools, little simulations), and the usual desktop frameworks kept getting in the way:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-muted-foreground">
              <li><strong className="text-foreground">Memory bloat:</strong> A typical desktop app can eat 200 MB+ of RAM just sitting there idle.</li>
              <li><strong className="text-foreground">Half-finished files:</strong> If a download gets cut off or the power goes out, you're left with broken pieces all over your drive.</li>
              <li><strong className="text-foreground">Surprise crashes:</strong> JavaScript and TypeScript apps can still blow up on an error nobody caught.</li>
              <li><strong className="text-foreground">Apps on islands:</strong> Every tool runs on its own, with no shared way to talk to each other and no standard sandbox.</li>
            </ul>
            <p>
              So I started building <strong>AliasOS</strong>: memory-safe desktop apps that work together, borrowing ideas from microkernels, built on <strong>Rust 2021, Elm, and Tauri v2</strong>.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-cyan-400">2.</span> Studying Redox OS: What Microkernels Taught Me
            </h2>
            <p>
              Before building my own engine, I dug into <strong>Redox OS</strong>, a Unix-like microkernel operating system written from scratch in Rust.
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
              <span className="text-emerald-400">3.</span> The Tractor Beam Protocol (TBP): My Own Engine
            </h2>
            <p>
              Instead of wrapping someone else's tool, I wrote the <strong>Tractor Beam Protocol (TBP)</strong>, my own pipeline for pulling down media and converting it, built to hold up when things go wrong.
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
              <span className="text-purple-400">4.</span> Why Rust + Elm + Tauri
            </h2>
            <p>
              Here's how my three desktop editions stacked up side by side:
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
              <span className="text-amber-400">5.</span> The AliasOS Launcher: A Rust Orchestrator on Axum
            </h2>
            <p>
              To tie all my tools together without one giant app, I wrote a standalone Rust process orchestrator (<code className="text-electric">orchestrator.rs</code>) on <strong>Axum</strong>, listening on local port <code className="text-electric">7777</code>.
            </p>
            <p>
              It reads JSON manifests from <code className="text-muted-foreground">~/apps/registry/*.json</code> and exposes a few local HTTP endpoints (<code className="text-muted-foreground">/api/apps</code>, <code className="text-muted-foreground">/api/apps/:id/launch</code>, <code className="text-muted-foreground">/api/hardware</code>) so the dashboard at <code className="text-electric">/os</code> can launch and stop native apps, each in its own sandbox, with one click.
            </p>
          </section>

          {/* Conclusion */}
          <section className="space-y-4 pt-4 border-t border-border/60">
            <h2 className="text-xl font-bold text-foreground">
              Where It's At
            </h2>
            <p>
              AliasOS showed me how much lighter desktop apps can be with <strong>Rust, Elm, and a few ideas borrowed from microkernels</strong>. The Tauri and Elm builds above run in about 35 MB of RAM, compared to around 180 MB for the Electron one.
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
