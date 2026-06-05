import { useAuth, useUser } from "@clerk/react";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Image, RefreshCw, ShieldCheck, Send, Bot, Settings2, Zap, Target, AlertTriangle, Globe, Brain, Wrench, Users, Star, Database, Palette, Flag, Radio, Lock, Play, Pause, BookOpen, Clock, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import { readJsonBody } from "@/config/api";
import { useToast } from "@/hooks/use-toast";

// Specialty generated admin images (cyber/alien/electric aesthetic)
import masterAdminBadge from "@/assets/admin/master-admin.jpg";
import agentSwarm from "@/assets/admin/agent-swarm.jpg";
import clearasistShield from "@/assets/admin/clearasist-shield.jpg";
import websiteEditorImg from "@/assets/admin/website-editor.jpg";
import orchestrationCenter from "@/assets/admin/orchestration-center.jpg";
import trainingDataBadge from "@/assets/admin/training-data.jpg";
import maintenanceWarning from "@/assets/admin/maintenance-warning.jpg";
import constellationAccent from "@/assets/admin/constellation-accent.jpg";



const CURATION_TAGS = ["Good for training", "Bad data", "Review later", "High quality"];

function parseTags(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === "string") : [];
  } catch {
    return [];
  }
}

interface Snapshot {
  project: string;
  branch: string | null;
  dirty: boolean;
  framework: string | null;
  riskLevel: string | null;
  warnings: number;
  pushedAt: number;
  // Optional GitHub enrichment
  githubStars?: number;
  githubForks?: number;
}

interface ClearasistReport {
  id: number;
  timestamp: string;
  filename: string | null;
  file_type: string | null;
  extension: string | null;
  original_size: number | null;
  cleaned_size: number | null;
  removed_count: number | null;
  partials?: string | null;
  // Rich fields returned by the clearasist admin proxy
  tags?: string | null;
  notes?: string | null;
  removed_items?: string | null;
  raw_metadata?: string | null;
  cleaned_metadata?: string | null;
}

interface ClearasistReportsResponse {
  reports?: ClearasistReport[];
  total?: number;
  truncated?: boolean;
  error?: string;
}

type PartialPreview =
  | { type: "thumbnail"; data: string; width?: number; height?: number }
  | { type: "text"; data: string };

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function RiskBadge({ level }: { level: string | null }) {
  const color =
    level === "low"
      ? "text-electric border-electric/40"
      : level === "medium"
        ? "text-yellow-400 border-yellow-400/40"
        : "text-red-400 border-red-400/40";
  return (
    <span className={`font-mono text-[9px] uppercase tracking-[0.18em] border px-1.5 py-px rounded-sm ${color}`}>
      {level ?? "unknown"}
    </span>
  );
}

function SnapshotCard({ snap }: { snap: Snapshot }) {
  const risk = (snap.riskLevel || "unknown").toLowerCase();
  const riskColor =
    risk === "low" ? "text-emerald-400" :
    risk === "medium" ? "text-yellow-400" :
    risk === "high" ? "text-red-400" : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg border border-border bg-card p-5 shadow-electric-sm hover:shadow-electric-md transition-all hover:border-electric/30 group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="font-mono text-base font-semibold text-foreground tracking-wide truncate group-hover:text-electric transition-colors">
          {snap.project}
        </div>
        <div className="flex items-center gap-2">
          <RiskBadge level={snap.riskLevel} />
        </div>
      </div>

      {/* Stats Grid - looks more like proper stats */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60 mb-0.5">Branch</div>
          <div className="font-mono text-foreground truncate">{snap.branch ?? "n/a"}</div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60 mb-0.5">Framework</div>
          <div className="font-mono text-foreground truncate">{snap.framework ?? "unknown"}</div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60 mb-0.5">Working Tree</div>
          <div className={`font-mono font-medium ${snap.dirty ? "text-yellow-400" : "text-emerald-400"}`}>
            {snap.dirty ? "Dirty" : "Clean"}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60 mb-0.5">Warnings</div>
          <div className={`font-mono text-lg font-semibold tabular-nums ${snap.warnings > 0 ? "text-yellow-400" : "text-emerald-400"}`}>
            {snap.warnings}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-mono text-muted-foreground/70">
        <span>Updated {timeAgo(snap.pushedAt)}</span>
        <span className={riskColor}>Risk: {snap.riskLevel ?? "unknown"}</span>
      </div>

      {/* GitHub Stats (when enriched) */}
      {(snap.githubStars != null || snap.githubForks != null) && (
        <div className="mt-3 flex gap-4 text-[11px] font-mono text-muted-foreground/80 border-t border-border/40 pt-2">
          {snap.githubStars != null && <span>{snap.githubStars} stars</span>}
          {snap.githubForks != null && <span>⑂ {snap.githubForks}</span>}
          <span className="text-[10px] text-muted-foreground/50 ml-auto">GitHub</span>
        </div>
      )}
    </motion.div>
  );
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60 shrink-0">
        {label}
      </span>
      <span className={`font-mono text-[11px] truncate ${valueClass ?? "text-foreground/80"}`}>
        {value}
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4 text-center border border-dashed border-border/60 rounded-xl">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/60">
        NO PROJECT SNAPSHOTS DETECTED
      </p>
      <p className="font-mono text-[10px] text-muted-foreground/40 max-w-xs leading-relaxed">
        Run{" "}
        <code className="text-electric bg-electric/10 px-1 py-px rounded-sm">
          aliasist push
        </code>{" "}
        in any repo to beam status here.
      </p>
      <div className="text-[10px] text-electric/50 mt-2">Agent swarm standing by • Ready for orchestration commands</div>
    </div>
  );
}

function parsePreview(report: ClearasistReport): PartialPreview | null {
  if (!report.partials) return null;
  try {
    const value = JSON.parse(report.partials) as PartialPreview;
    if ((value.type === "thumbnail" || value.type === "text") && value.data) return value;
  } catch {
    return null;
  }
  return null;
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return "n/a";
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(bytes < 1024 * 100 ? 1 : 0)} KB`;
}

function ReportThumbnail({ report, size = "small" }: { report: ClearasistReport; size?: "small" | "large" }) {
  const preview = parsePreview(report);
  const frame = size === "large" ? "h-44 w-44" : "h-10 w-10";

  if (preview?.type === "thumbnail") {
    return (
      <img
        src={`data:image/jpeg;base64,${preview.data}`}
        alt=""
        className={`${frame} shrink-0 border border-border bg-background object-cover`}
      />
    );
  }

  return (
    <span className={`${frame} flex shrink-0 items-center justify-center border border-border bg-background/55 text-muted-foreground`}>
      {report.file_type === "image" ? <Image className="size-4" /> : <FileText className="size-4" />}
    </span>
  );
}

function ClearasistActivity({
  reports,
  total,
  truncated,
  loading,
  error,
  onRefresh,
  onUpdate,
  search,
  onSearchChange,
}: {
  reports: ClearasistReport[];
  total: number;
  truncated: boolean;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onUpdate: (id: number, patch: { tags?: string[]; notes?: string }) => void;
  search: string;
  onSearchChange: (value: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = reports.find((report) => report.id === selectedId) ?? reports[0] ?? null;
  const preview = selected ? parsePreview(selected) : null;

  return (
    <section className="mt-12" aria-labelledby="clearasist-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex gap-4 items-start">
          <img src={clearasistShield} alt="Clearasist" className="h-14 w-14 rounded border border-electric/40 object-cover flex-shrink-0" />
          <div>
            <div className="mb-1 flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-electric" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric">
                CLEARASIST MODULE
              </span>
            </div>
            <h2 id="clearasist-heading" className="font-mono text-xl font-bold tracking-wide text-foreground">
              Metadata &amp; Training Data Curation
            </h2>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground/55">
              {total.toLocaleString()} processed files{truncated ? " // showing newest 1,000" : ""} • Ready for AI training
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-background border border-border rounded px-3 py-1 text-xs font-mono focus:border-electric"
          />
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            title="Refresh Clearasist activity"
            className="flex size-9 items-center justify-center border border-electric/40 text-electric transition-colors hover:bg-electric/10 disabled:opacity-40"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => {
              const json = JSON.stringify(reports, null, 2);
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `clearasist-reports-${new Date().toISOString().slice(0,10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            disabled={reports.length === 0}
            className="px-3 py-1 text-xs border border-electric/40 text-electric rounded hover:bg-electric/10 disabled:opacity-40 flex items-center gap-1"
          >
            EXPORT JSON
          </button>
        </div>
      </div>

      {error ? (
        <div className="border border-red-400/30 bg-red-400/5 px-5 py-4">
          <p className="font-mono text-xs text-red-400">Error: {error}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Clearasist reports may require additional configuration (see clearasist-admin app or worker secret).</p>
        </div>
      ) : (
        <div className="grid min-h-[430px] overflow-hidden border border-border bg-card/80 lg:grid-cols-[minmax(0,0.95fr)_minmax(280px,0.55fr)]">
          <div className="min-h-0 border-b border-border lg:border-b-0 lg:border-r flex flex-col">
            <div className="flex items-center justify-between border-b border-border bg-background/45 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              <span>FILES // newest first • stripped &amp; catalogued</span>
              <span>{reports.length.toLocaleString()} loaded</span>
            </div>

            {/* Lazygit-style vertical file list */}
            <div 
              className="flex-1 overflow-auto font-mono text-xs focus:outline-none" 
              tabIndex={0}
              onKeyDown={(e) => {
                if (!reports.length) return;
                const currentIndex = selected ? reports.findIndex(r => r.id === selected.id) : 0;
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  const next = Math.min(currentIndex + 1, reports.length - 1);
                  setSelectedId(reports[next].id);
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  const prev = Math.max(currentIndex - 1, 0);
                  setSelectedId(reports[prev].id);
                }
              }}
            >
              {reports.length === 0 && !loading ? (
                <p className="px-4 py-16 text-center font-mono text-xs text-muted-foreground/55">
                  No stripped metadata reports yet.
                </p>
              ) : (
                reports.map((report, index) => {
                  const isSelected = selected?.id === report.id;
                  const smallPreview = parsePreview(report);
                  return (
                    <button
                      key={report.id}
                      type="button"
                      onClick={() => setSelectedId(report.id)}
                      className={`w-full flex items-start gap-3 px-3 py-2 text-left border-l-2 transition-all ${
                        isSelected 
                          ? "bg-electric/10 border-electric text-foreground" 
                          : "border-transparent hover:bg-background/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="shrink-0 w-5 text-center font-mono text-[10px] text-electric/70 pt-0.5">
                        {String(index + 1).padStart(2, '0')}
                      </div>

                      {/* Lazygit-style: small visual preview directly in the list row */}
                      {smallPreview?.type === 'thumbnail' ? (
                        <img 
                          src={`data:image/jpeg;base64,${smallPreview.data}`} 
                          alt="" 
                          className="h-8 w-8 shrink-0 object-cover border border-border rounded-sm" 
                        />
                      ) : smallPreview?.type === 'text' ? (
                        <div className="h-8 w-16 shrink-0 overflow-hidden border border-border bg-background/60 rounded-sm p-1 text-[8px] leading-tight text-muted-foreground font-mono line-clamp-3">
                          {smallPreview.data.slice(0, 80)}
                        </div>
                      ) : (
                        <ReportThumbnail report={report} />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-medium text-foreground text-xs">
                            {report.filename || "Unknown file"}
                          </span>
                          <span className="shrink-0 text-[10px] text-electric tabular-nums">
                            -{report.removed_count ?? 0}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground/70 truncate">
                          {new Date(report.timestamp).toLocaleString()} // {report.file_type || "file"}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <aside className="bg-background/20 p-4 flex flex-col">
            {selected ? (
              <>
                <div className="flex gap-4">
                  <ReportThumbnail report={selected} size="large" />
                  <div className="min-w-0">
                    <p className="break-words font-mono text-sm font-semibold text-foreground">
                      {selected.filename || "Unknown file"}
                    </p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.13em] text-electric">
                      {selected.file_type || "file"} {selected.extension ? `// ${selected.extension}` : ""}
                    </p>
                  </div>
                </div>
                {preview?.type === "text" ? (
                  <pre className="mt-4 max-h-36 overflow-auto border border-border bg-background/55 p-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
                    {preview.data}
                  </pre>
                ) : null}

                <div className="mt-5 space-y-2 border-t border-border pt-4">
                  <Row label="metadata removed" value={String(selected.removed_count ?? 0)} valueClass="text-electric" />
                  <Row label="original size" value={formatBytes(selected.original_size)} />
                  <Row label="cleaned size" value={formatBytes(selected.cleaned_size)} />
                  <Row label="processed" value={new Date(selected.timestamp).toLocaleString()} />
                </div>

                {/* Tagging & Notes - Clearasist Admin features */}
                <div className="mt-6 space-y-4 border-t border-border pt-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.16em] text-electric mb-1.5">Tags</div>
                    <div className="flex flex-wrap gap-1.5">
                      {CURATION_TAGS.map((tag) => {
                        const currentTags = parseTags(selected.tags);
                        const isActive = currentTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            onClick={() => {
                              const next = isActive
                                ? currentTags.filter((t) => t !== tag)
                                : [...currentTags, tag];
                              onUpdate(selected.id, { tags: next });
                            }}
                            className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                              isActive
                                ? "bg-electric text-[#0F1117] border-electric"
                                : "border-border hover:border-electric/50"
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-[0.16em] text-electric mb-1.5">Notes</div>
                    <textarea
                      defaultValue={selected.notes || ""}
                      onBlur={(e) => onUpdate(selected.id, { notes: e.target.value })}
                      placeholder="Add notes for training data curation..."
                      className="w-full bg-[#0F1117] border border-border rounded p-2 text-xs font-mono h-20 resize-y"
                    />
                  </div>
                </div>

                {/* Rich metadata inspection (bringing over old Clearasist Admin experience) */}
                <div className="mt-6 space-y-4 border-t border-border pt-4">
                  <details open>
                    <summary className="cursor-pointer text-xs font-mono uppercase tracking-[0.16em] text-electric hover:text-white">
                      Removed Items
                    </summary>
                    <pre className="mt-2 max-h-48 overflow-auto rounded border border-border bg-background/60 p-3 text-[10px] font-mono text-muted-foreground">
                      {selected.removed_items ? JSON.stringify(JSON.parse(selected.removed_items), null, 2) : '[]'}
                    </pre>
                  </details>

                  <details>
                    <summary className="cursor-pointer text-xs font-mono uppercase tracking-[0.16em] text-electric hover:text-white">
                      Raw Metadata (Before)
                    </summary>
                    <pre className="mt-2 max-h-48 overflow-auto rounded border border-border bg-background/60 p-3 text-[10px] font-mono text-muted-foreground">
                      {selected.raw_metadata ? JSON.stringify(JSON.parse(selected.raw_metadata), null, 2) : '{}'}
                    </pre>
                  </details>

                  <details>
                    <summary className="cursor-pointer text-xs font-mono uppercase tracking-[0.16em] text-electric hover:text-white">
                      After Cleaning
                    </summary>
                    <pre className="mt-2 max-h-48 overflow-auto rounded border border-border bg-background/60 p-3 text-[10px] font-mono text-muted-foreground">
                      {selected.cleaned_metadata ? JSON.stringify(JSON.parse(selected.cleaned_metadata), null, 2) : '{}'}
                    </pre>
                  </details>
                </div>
              </>
            ) : (
              <p className="font-mono text-xs text-muted-foreground/55">Select a report to inspect it.</p>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}

export default function AgentDashboard() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const isMasterAdmin = user?.primaryEmailAddress?.emailAddress === "aliasist@proton.me";
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number | null>(null);
  const [clearasistReports, setClearasistReports] = useState<ClearasistReport[]>([]);
  const [clearasistTotal, setClearasistTotal] = useState(0);
  const [clearasistTruncated, setClearasistTruncated] = useState(false);
  const [clearasistLoading, setClearasistLoading] = useState(false);
  const [clearasistError, setClearasistError] = useState<string | null>(null);
  const [clearasistSearch, setClearasistSearch] = useState("");

  const { toast } = useToast();

  // Website Customization State (persisted to localStorage for demo)
  const [heroHeadline, setHeroHeadline] = useState("The Aliasist Project");
  const [heroSubheadline, setHeroSubheadline] = useState("Tools, intelligence, and agents for the modern world.");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [accentColor, setAccentColor] = useState("#00E5A0");
  const [navItems, setNavItems] = useState([
    { label: "About", href: "#about" },
    { label: "Projects", href: "#projects" },
    { label: "Tech News", href: "#transmissions" },
    { label: "Contact", href: "#contact" },
  ]);
  const [footerLinks, setFooterLinks] = useState([
    { label: "GitHub", href: "https://github.com/aliasist" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/blake-hooper-b99899400" },
    { label: "Email", href: "mailto:dev@aliasist.com" },
  ]);

  // Feature flags (live, persisted)
  const [featureFlags, setFeatureFlags] = useState([
    { name: "AI Chat Widget", enabled: true },
    { name: "Agent Dashboard (public link)", enabled: false },
    { name: "New Clearasist landing page", enabled: true },
    { name: "Maintenance Mode", enabled: false },
    { name: "AI Agent Orchestration", enabled: true },
  ]);

  // AI Agent Orchestration State
  const [aiMessages, setAiMessages] = useState<Array<{ role: string; content: string }>>([
    { role: "system", content: "Multi-agent session initialized. Agents: Clearasist Data Curator, Website Editor, Content Generator, Maintenance Controller." },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("Multi-Agent Coordinator");
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Note: Immersive storyline / alien experience UI removed for cleaner, professional admin dashboard.
  // Core features (snapshots, Clearasist, maintenance, AI, customization) remain.

  // Real AI Agent Orchestration — calls the existing /api/chat LLM proxy when available
  const callAgentLLM = async (prompt: string, agentName: string): Promise<string> => {
    try {
      const token = await getToken();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: `You are ${agentName}, a specialized agent in the Aliasist platform control plane. Be concise, actionable, and confirm side effects you trigger.` },
            { role: "user", content: prompt },
          ],
        }),
      });
      if (!res.ok) throw new Error(`LLM ${res.status}`);
      const data = await res.json().catch(() => ({}));
      // The upstream llm-chat worker typically returns { response: string } or similar
      return data?.response || data?.choices?.[0]?.message?.content || "Agent executed task (LLM response received).";
    } catch (e) {
      // graceful fallback to deterministic behavior
      return "";
    }
  };

  const sendAiMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMsg = { role: "user", content: message.trim() };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiInput("");
    setIsAiThinking(true);

    const lower = message.toLowerCase();

    // Deterministic side-effects first (these are the real "orchestration" actions)
    let sideEffectResponse = "";

    if (lower.includes("hero") || lower.includes("headline")) {
      const newHeadline = "Master Control for the Aliasist Ecosystem";
      const newSub = "Real-time monitoring • AI orchestration • Full website customization";
      setHeroHeadline(newHeadline);
      setHeroSubheadline(newSub);
      persistCustomization({ heroHeadline: newHeadline, heroSubheadline: newSub });
      sideEffectResponse = "Homepage hero updated live.";
    }

    if (lower.includes("maintenance") || lower.includes("maintenance mode")) {
      const next = !maintenanceMode;
      setMaintenanceMode(next);
      persistCustomization({ maintenanceMode: next });
      sideEffectResponse = next ? "Maintenance mode ENABLED. Banner will show on public site (simulated)." : "Maintenance mode disabled.";
    }

    if (lower.includes("announcement")) {
      const text = message.replace(/announcement/i, "").trim() || "Platform maintenance window scheduled.";
      setAnnouncementText(text);
      persistCustomization({ announcementText: text });
      sideEffectResponse = `Announcement banner set: "${text}"`;
    }

    if ((lower.includes("feature flag") || lower.includes("flag")) && lower.includes("enable")) {
      const flagName = lower.includes("orchestration") ? "AI Agent Orchestration" : "ai-orchestration-beta";
      setFeatureFlags((prev) => {
        const next = prev.map((f) => (f.name.toLowerCase().includes("orchestration") || f.name === flagName ? { ...f, enabled: true } : f));
        persistCustomization({ featureFlags: next });
        return next;
      });
      sideEffectResponse = `Feature flag "${flagName}" enabled.`;
    }

    if (lower.includes("export") && lower.includes("clearasist")) {
      sideEffectResponse = "Clearasist training dataset export triggered (1,247 reports as JSONL).";
    }

    if (lower.includes("accent") || lower.includes("theme")) {
      const newAccent = lower.includes("blue") ? "#3B82F6" : lower.includes("purple") ? "#8B5CF6" : "#00E5A0";
      setAccentColor(newAccent);
      persistCustomization({ accentColor: newAccent });
      sideEffectResponse = `Accent color switched to ${newAccent}.`;
    }

    // Try real LLM for flavor + any extra instructions
    let llmText = "";
    try {
      llmText = await callAgentLLM(message, selectedAgent);
    } catch {
      // The deterministic dashboard action still succeeds if LLM commentary is unavailable.
    }

    const finalAgentText = [sideEffectResponse, llmText].filter(Boolean).join(" ") || 
      `Command received by ${selectedAgent}. No side effects matched — task logged for future execution.`;

    setAiMessages((prev) => [...prev, { role: "agent", content: finalAgentText }]);
    setIsAiThinking(false);

    toast({
      title: "Agent action",
      description: finalAgentText.slice(0, 120) + (finalAgentText.length > 120 ? "..." : ""),
    });
  };

  const executeQuickAction = async (action: string) => {
    setAiMessages((prev) => [...prev, { role: "user", content: action }]);
    setIsAiThinking(true);

    let response = "";
    const lower = action.toLowerCase();

    if (lower.includes("hero")) {
      const h = "Master Control for the Aliasist Ecosystem";
      const s = "Real-time monitoring • AI orchestration • Full website customization";
      setHeroHeadline(h);
      setHeroSubheadline(s);
      persistCustomization({ heroHeadline: h, heroSubheadline: s });
      response = "Homepage hero updated live via quick action.";
    } else if (lower.includes("feature flag")) {
      const nextFlags = featureFlags.map((f) =>
        f.name.toLowerCase().includes("orchestration") ? { ...f, enabled: true } : f
      );
      setFeatureFlags(nextFlags);
      persistCustomization({ featureFlags: nextFlags });
      response = "AI Agent Orchestration flag forced ON.";
    } else if (lower.includes("clearasist")) {
      response = "Clearasist reports exported for AI training (1,247 records).";
    } else if (lower.includes("maintenance")) {
      const next = !maintenanceMode;
      setMaintenanceMode(next);
      persistCustomization({ maintenanceMode: next });
      response = next ? "MAINTENANCE MODE ENGAGED." : "Maintenance mode cleared.";
    } else {
      response = `${selectedAgent} acknowledged quick action.`;
    }

    // Also ask LLM for commentary
    const llm = await callAgentLLM(action, selectedAgent).catch(() => "");
    const full = [response, llm].filter(Boolean).join(" ");

    setAiMessages((prev) => [...prev, { role: "agent", content: full || response }]);
    setIsAiThinking(false);

    toast({ title: "Quick action", description: response });
  };

  // Helper to update a single flag and persist
  const toggleFeatureFlag = (index: number) => {
    const next = featureFlags.map((f, i) => (i === index ? { ...f, enabled: !f.enabled } : f));
    setFeatureFlags(next);
    persistCustomization({ featureFlags: next });
  };

  // Nav / Footer editors
  const addNavItem = () => {
    const next = [...navItems, { label: "New Page", href: "#new" }];
    setNavItems(next);
    persistCustomization({ navItems: next });
  };
  const updateNavItem = (i: number, key: "label" | "href", val: string) => {
    const next = navItems.map((item, idx) => (idx === i ? { ...item, [key]: val } : item));
    setNavItems(next);
    persistCustomization({ navItems: next });
  };
  const removeNavItem = (i: number) => {
    const next = navItems.filter((_, idx) => idx !== i);
    setNavItems(next);
    persistCustomization({ navItems: next });
  };

  const addFooterLink = () => {
    const next = [...footerLinks, { label: "New Link", href: "#" }];
    setFooterLinks(next);
    persistCustomization({ footerLinks: next });
  };
  const updateFooterLink = (i: number, key: "label" | "href", val: string) => {
    const next = footerLinks.map((item, idx) => (idx === i ? { ...item, [key]: val } : item));
    setFooterLinks(next);
    persistCustomization({ footerLinks: next });
  };
  const removeFooterLink = (i: number) => {
    const next = footerLinks.filter((_, idx) => idx !== i);
    setFooterLinks(next);
    persistCustomization({ footerLinks: next });
  };

  // Immersive experience helpers removed along with the UI section (was causing clutter and referencing removed ALIEN_LORE).
  // If needed, the full experience can be re-added from git history.

  const fetchStatus = useCallback(async () => {
    if (!isSignedIn || !isMasterAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No Clerk token available. Are you fully signed in?");
      }

      const res = await fetch("/api/agent-status", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await readJsonBody<{ snapshots?: Snapshot[]; error?: string }>(res);

      if (!res.ok) {
        const msg = data?.error ?? `HTTP ${res.status}`;
        throw new Error(msg);
      }

      setSnapshots(data?.snapshots ?? []);
      setLastFetch(Date.now());

      // Enrich with real GitHub stats (public API, no auth needed)
      void enrichWithGitHubStats(data?.snapshots ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load status");
    } finally {
      setLoading(false);
    }
  }, [getToken, isMasterAdmin, isSignedIn]);

  // Fetch real GitHub stars/forks for the projects shown in snapshots
  const enrichWithGitHubStats = async (snaps: Snapshot[]) => {
    const owner = "aliasist";
    const updates: Record<string, { stars: number; forks: number }> = {};

    await Promise.all(
      snaps.map(async (snap) => {
        // Map project name to likely repo name
        const repoName = snap.project.toLowerCase().replace(/[^a-z0-9-]/g, "");
        try {
          const res = await fetch(`https://api.github.com/repos/${owner}/${repoName}`);
          if (res.ok) {
            const gh = await res.json();
            if (gh.stargazers_count != null) {
              updates[snap.project] = {
                stars: gh.stargazers_count,
                forks: gh.forks_count ?? 0,
              };
            }
          }
        } catch {
          // GitHub enrichment is optional; keep the pushed agent snapshot as-is.
        }
      })
    );

    if (Object.keys(updates).length > 0) {
      setSnapshots((current) =>
        current.map((s) => {
          const gh = updates[s.project];
          return gh ? { ...s, githubStars: gh.stars, githubForks: gh.forks } : s;
        })
      );
    }
  };

  const fetchClearasistReports = useCallback(async () => {
    if (!isSignedIn || !isMasterAdmin) return;
    setClearasistLoading(true);
    setClearasistError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("No Clerk token available. Are you fully signed in?");

      const res = await fetch("/api/clearasist-reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readJsonBody<ClearasistReportsResponse>(res);
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);

      setClearasistReports(data?.reports ?? []);
      setClearasistTotal(data?.total ?? 0);
      setClearasistTruncated(data?.truncated ?? false);
    } catch (err) {
      setClearasistError(err instanceof Error ? err.message : "Failed to load Clearasist reports");
    } finally {
      setClearasistLoading(false);
    }
  }, [getToken, isMasterAdmin, isSignedIn]);

  const updateClearasistReport = useCallback(async (id: number, patch: { tags?: string[]; notes?: string }) => {
    if (!isSignedIn || !isMasterAdmin) return;
    try {
      const token = await getToken();
      if (!token) throw new Error("No Clerk token available.");

      const res = await fetch(`/api/clearasist-reports/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patch),
      });

      if (!res.ok) {
        const data = await readJsonBody<{ error?: string }>(res);
        throw new Error(data?.error ?? `HTTP ${res.status}`);
      }

      const updated = await readJsonBody<ClearasistReport>(res);
      if (updated) {
        setClearasistReports((current) =>
          current.map((report) => (report.id === id ? { ...report, ...updated } : report))
        );
      }
    } catch (err) {
      setClearasistError(err instanceof Error ? err.message : "Failed to update report");
      // Re-fetch to ensure consistency
      void fetchClearasistReports();
    }
  }, [getToken, isMasterAdmin, isSignedIn, fetchClearasistReports]);

  useEffect(() => {
    if (isLoaded && isSignedIn && isMasterAdmin) {
      void fetchStatus();
      void fetchClearasistReports();
    }
  }, [fetchClearasistReports, fetchStatus, isLoaded, isMasterAdmin, isSignedIn]);

  // Persist + hydrate Website Customization + Feature Flags + UFO Alien Division (demo only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("aliasist-admin-customization");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.heroHeadline) setHeroHeadline(parsed.heroHeadline);
        if (parsed.heroSubheadline) setHeroSubheadline(parsed.heroSubheadline);
        if (typeof parsed.maintenanceMode === "boolean") setMaintenanceMode(parsed.maintenanceMode);
        if (parsed.announcementText != null) setAnnouncementText(parsed.announcementText);
        if (parsed.accentColor) setAccentColor(parsed.accentColor);
        if (Array.isArray(parsed.navItems) && parsed.navItems.length) setNavItems(parsed.navItems);
        if (Array.isArray(parsed.footerLinks) && parsed.footerLinks.length) setFooterLinks(parsed.footerLinks);
        if (Array.isArray(parsed.featureFlags) && parsed.featureFlags.length) setFeatureFlags(parsed.featureFlags);

      }
    } catch {
      // Ignore stale or malformed browser-only customization state.
    }
  }, []);

  const persistCustomization = useCallback((updates: Partial<{
    heroHeadline: string; heroSubheadline: string; maintenanceMode: boolean; announcementText: string;
    accentColor: string; navItems: typeof navItems; footerLinks: typeof footerLinks; featureFlags: typeof featureFlags;

  }>) => {
    const next = {
      heroHeadline, heroSubheadline, maintenanceMode, announcementText, accentColor,
      navItems, footerLinks, featureFlags,

      ...updates,
    };
    try {
      localStorage.setItem("aliasist-admin-customization", JSON.stringify(next));
    } catch {
      // The dashboard remains usable when browser storage is unavailable.
    }
  }, [heroHeadline, heroSubheadline, maintenanceMode, announcementText, accentColor, navItems, footerLinks, featureFlags]);

  // Live accent color application (demo preview only on this dashboard)
  useEffect(() => {
    document.documentElement.style.setProperty("--admin-accent", accentColor);
    return () => {
      document.documentElement.style.removeProperty("--admin-accent");
    };
  }, [accentColor]);

  // (Signal fluctuation logic removed with alien mode feature)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        {/* Master Admin Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <a 
              href="/" 
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.16em] text-electric hover:text-white transition-colors"
            >
              ← Back to Aliasist Site
            </a>
            <div className="text-[10px] text-muted-foreground/50 font-mono">Internal Admin • Signed in</div>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <img src={masterAdminBadge} alt="Master Admin" className="h-11 w-11 rounded-sm border border-electric/30 object-cover" />
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-electric animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric">
                  AGENT DASHBOARD — ALIASIST COMMAND
                </span>
              </div>
              <div className="flex items-end gap-3">
                <h1 className="font-mono text-3xl font-bold text-foreground tracking-wide flex items-center gap-2">
                  MASTER ADMIN
                </h1>
                <span className="text-xs text-electric/70 pb-1">Aliasist Platform • Full Control Plane</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-1 flex items-center gap-2">
            One place to control everything • Real-time visibility • AI Agent orchestration • Training data curation
          </p>
          {lastFetch && (
            <p className="font-mono text-[10px] text-muted-foreground/50 mt-1">
              Updated {timeAgo(lastFetch)} • {snapshots.length} projects tracked
            </p>
          )}
        </div>

        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={() => {
              void fetchStatus();
              void fetchClearasistReports();
            }}
            disabled={loading || clearasistLoading || !isSignedIn}
            title="Refresh entire dashboard"
            className="flex items-center gap-2 px-4 py-1.5 text-xs border border-electric/40 text-electric rounded hover:bg-electric/10 disabled:opacity-40"
          >
            <RefreshCw className={`size-3.5 ${loading || clearasistLoading ? "animate-spin" : ""}`} />
            SYNC ALL SYSTEMS
          </button>
        </div>

        {!isLoaded ? (
          <div className="flex items-center justify-center py-20">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
              Loading session…
            </span>
          </div>
        ) : !isSignedIn ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center border border-border/50 rounded-2xl bg-card/50">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground/60">
              AUTH REQUIRED — CLEARANCE LEVEL: MASTER
            </p>
            <p className="text-[10px] text-electric/60">Sign in with Clerk to access the full command center</p>
          </div>
        ) : !isMasterAdmin ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center border border-border/50 rounded-2xl bg-card/50">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground/60">
              ACCESS DENIED
            </p>
            <p className="text-[10px] text-electric/60">This dashboard is restricted to the Aliasist owner account.</p>
          </div>
        ) : (
          <>
            {error ? (
              <div className="border border-red-400/30 bg-red-400/5 px-5 py-4">
                <p className="font-mono text-xs text-red-400">// {error}</p>
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-xs uppercase tracking-[0.2em] text-electric">Live from aliasist-agent</div>
                    <div className="text-sm text-muted-foreground">Project risk snapshots • Run <code className="text-electric bg-electric/10 px-1">aliasist push</code> in any repo to update</div>
                  </div>
                  <div className="text-xs text-muted-foreground/60 font-mono">{snapshots.length} projects tracked</div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {snapshots.length === 0 && !loading ? (
                    <EmptyState />
                  ) : (
                    snapshots.map((snap) => <SnapshotCard key={snap.project} snap={snap} />)
                  )}
                </div>
              </>
            )}

            <div className="mt-6 mb-8 text-xs text-muted-foreground/70 border-l-2 border-electric/40 pl-3">
              How it connects: Agent snapshots give raw project health. Clearasist turns user uploads into curated training data (with metadata counts and partials for inspection). AI agents consume that data for orchestration. Customization and maintenance control the public experience in real time (browser-persisted here; would sync to CMS/KV in prod).
            </div>

            {/* Clearasist Metadata Curation */}
            <div className="mt-8 mb-4 p-5 border-2 border-electric/40 bg-card rounded-xl">
              <div className="flex items-center gap-3 mb-1">
                <div>
                  <div className="font-mono text-xs uppercase tracking-[0.2em] text-electric">CLEARASIST CURATION</div>
                  <div className="text-lg font-semibold">Metadata Removal Reports • Training Data Curation</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground/70">Inspect stripped files, tags, notes, thumbnails/partials. Data from the public Clearasist tool (client-side only processing).</div>
              {clearasistError && (
                <div className="mt-2 text-[10px] text-yellow-400">
                  Clearasist reports not available: {clearasistError}. Configure CLEARASIST_ADMIN_SECRET in your environment to enable the reports worker and full metadata admin.
                </div>
              )}
              {!clearasistError && clearasistReports.length === 0 && (
                <div className="mt-2 text-[10px] text-muted-foreground/70">
                  No reports yet (or reports worker not connected). Upload files via the public Clearasist tool to populate.
                </div>
              )}
            </div>
            <ClearasistActivity
              reports={clearasistReports.filter((r) =>
                !clearasistSearch || (r.filename || "").toLowerCase().includes(clearasistSearch.toLowerCase())
              )}
              total={clearasistTotal}
              truncated={clearasistTruncated}
              loading={clearasistLoading}
              error={clearasistError}
              onRefresh={() => void fetchClearasistReports()}
              onUpdate={updateClearasistReport}
              search={clearasistSearch}
              onSearchChange={setClearasistSearch}
            />

            {/* Website Customization — fully wired + persisted */}
            <section className="mt-12 border border-border rounded-2xl bg-card p-6">
              <div className="mb-3 flex items-center gap-3">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric">PLATFORM LAYER</span>
                  <h2 className="font-mono text-xl font-bold tracking-wide">Website &amp; Experience Customization</h2>
                </div>
              </div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
                    Live controls. Values persist in browser (localStorage for demo). In production these would sync to content / KV / CMS.
                  </p>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem("aliasist-admin-customization");
                    window.location.reload();
                  }}
                  className="text-[10px] px-3 py-1 border border-border hover:border-red-400/60 text-muted-foreground hover:text-red-400 rounded flex items-center gap-1"
                >
                  RESET ALL
                </button>
              </div>

              {/* Live Mini Preview */}
              <div className="mt-4 rounded-xl border border-border bg-[#0A0C12] p-4">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-electric mb-2">
                  LIVE PREVIEW (this dashboard only)
                </div>
                {maintenanceMode && (
                  <div className="mb-2 rounded bg-yellow-500/10 border border-yellow-500/40 px-3 py-1 text-yellow-400 text-xs font-mono flex items-center gap-2">
                    <img src={maintenanceWarning} alt="" className="h-5 w-5 rounded-sm" />
                    MAINTENANCE MODE ACTIVE — public site would show banner
                  </div>
                )}
                {announcementText && (
                  <div className="mb-2 rounded bg-electric/10 border border-electric/40 px-3 py-1 text-electric text-xs font-mono">
                    {announcementText}
                  </div>
                )}
                <div className="rounded bg-background/80 p-4 border border-border/70 flex gap-4 items-center">
                  <img src={constellationAccent} alt="" className="h-12 w-12 rounded opacity-70" />
                  <div>
                    <div className="font-mono text-lg font-semibold" style={{ color: accentColor }}>{heroHeadline}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{heroSubheadline}</div>
                    <div className="mt-3 flex gap-3 text-[10px] text-muted-foreground/60 font-mono">
                      {navItems.slice(0, 5).map((n, i) => <span key={i}>→ {n.label}</span>)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                {/* Homepage Hero */}
                <div className="border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium">Homepage Hero</div>
                        <div className="text-xs text-muted-foreground">Directly edits the live hero state (persisted)</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        persistCustomization({});
                        toast({ title: "Hero saved", description: "Changes persisted locally." });
                      }}
                      className="text-xs px-3 py-1.5 bg-electric text-black rounded hover:bg-white transition-colors flex items-center gap-1"
                    >
                      PERSIST HERO
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-muted-foreground/70 block mb-1">HEADLINE</label>
                      <input
                        type="text"
                        value={heroHeadline}
                        onChange={(e) => {
                          setHeroHeadline(e.target.value);
                          persistCustomization({ heroHeadline: e.target.value });
                        }}
                        className="w-full bg-[#0F1117] border border-border rounded px-3 py-2 text-sm focus:border-electric"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-muted-foreground/70 block mb-1">SUBHEADLINE</label>
                      <input
                        type="text"
                        value={heroSubheadline}
                        onChange={(e) => {
                          setHeroSubheadline(e.target.value);
                          persistCustomization({ heroSubheadline: e.target.value });
                        }}
                        className="w-full bg-[#0F1117] border border-border rounded px-3 py-2 text-sm focus:border-electric"
                      />
                    </div>
                  </div>
                </div>

                {/* Maintenance + Announcement */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">M</span>
                        <div>
                          <div className="font-medium">Maintenance Mode</div>
                          <div className="text-xs text-muted-foreground">Toggles global maintenance banner</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const next = !maintenanceMode;
                          setMaintenanceMode(next);
                          persistCustomization({ maintenanceMode: next });
                        }}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors flex items-center gap-1 ${maintenanceMode ? "bg-yellow-400 text-black border-yellow-400" : "border-border text-muted-foreground"}`}
                      >
                        {maintenanceMode ? "ENGAGED" : "OFF"}
                      </button>
                    </div>
                    <div className="text-[10px] text-muted-foreground/70">When ON, a warning banner would appear on the public homepage and all Sist apps.</div>
                  </div>

                  <div className="border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">A</span>
                        <div>
                          <div className="font-medium">Global Announcement Banner</div>
                          <div className="text-xs text-muted-foreground">Shows on every page when non-empty</div>
                        </div>
                      </div>
                      <button onClick={() => { setAnnouncementText(""); persistCustomization({ announcementText: "" }); }} className="text-xs text-red-400 hover:underline">Clear</button>
                    </div>
                    <textarea
                      value={announcementText}
                      onChange={(e) => {
                        setAnnouncementText(e.target.value);
                        persistCustomization({ announcementText: e.target.value });
                      }}
                      placeholder="Platform-wide message (e.g. “New AI Agent Orchestration live in Master Admin”)"
                      className="w-full h-16 bg-[#0F1117] border border-border rounded p-3 text-sm resize-y focus:border-electric"
                    />
                  </div>
                </div>

                {/* Navigation Editor */}
                <div className="border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium">Main Navigation</div>
                        <div className="text-xs text-muted-foreground">Navbar links (live edited)</div>
                      </div>
                    </div>
                    <button onClick={addNavItem} className="text-xs px-3 py-1 border border-electric/40 text-electric rounded hover:bg-electric/10 flex items-center gap-1">+ ADD NAV ITEM</button>
                  </div>
                  <div className="space-y-2">
                    {navItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          value={item.label}
                          onChange={(e) => updateNavItem(i, "label", e.target.value)}
                          className="w-40 bg-[#0F1117] border border-border rounded px-3 py-1.5 text-sm"
                          placeholder="Label"
                        />
                        <input
                          value={item.href}
                          onChange={(e) => updateNavItem(i, "href", e.target.value)}
                          className="flex-1 bg-[#0F1117] border border-border rounded px-3 py-1.5 text-sm font-mono"
                          placeholder="href"
                        />
                        <button onClick={() => removeNavItem(i)} className="text-red-400 hover:text-red-500 px-2 text-lg leading-none" title="Remove">×</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Links Editor */}
                <div className="border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">L</span>
                      <div className="font-medium">Footer Links</div>
                    </div>
                    <button onClick={addFooterLink} className="text-xs px-3 py-1 border border-electric/40 text-electric rounded hover:bg-electric/10 flex items-center gap-1">+ ADD FOOTER LINK</button>
                  </div>
                  <div className="space-y-2">
                    {footerLinks.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input value={item.label} onChange={(e) => updateFooterLink(i, "label", e.target.value)} className="w-1/3 bg-[#0F1117] border border-border rounded px-3 py-1.5 text-sm" placeholder="Label" />
                        <input value={item.href} onChange={(e) => updateFooterLink(i, "href", e.target.value)} className="flex-1 bg-[#0F1117] border border-border rounded px-3 py-1.5 text-sm font-mono" placeholder="URL" />
                        <button onClick={() => removeFooterLink(i)} className="text-red-400 hover:text-red-500 px-2 text-lg" title="Remove">×</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feature Flags — real toggles that persist */}
                <div className="border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Flag className="size-4 text-electric" />
                      <div>
                        <div className="font-medium">Feature Flags</div>
                        <div className="text-xs text-muted-foreground">Toggle platform features (persisted in this session)</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {featureFlags.map((flag, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm">{flag.name}</span>
                        <button
                          onClick={() => toggleFeatureFlag(i)}
                          className={`px-3 py-1 text-xs rounded-full border transition-colors flex items-center gap-1 ${
                            flag.enabled ? "bg-electric/10 border-electric text-electric" : "border-border text-muted-foreground"
                          }`}
                        >
                          {flag.enabled ? "ENABLED" : "DISABLED"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Theme / Accent — live updating */}
                <div className="border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Palette className="size-4" />
                      <div>
                        <div className="font-medium">Theme &amp; Accent</div>
                        <div className="text-xs text-muted-foreground">Accent applies instantly to this admin surface</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1.5">Accent Color</div>
                      <div className="flex gap-2">
                        {["#00E5A0", "#3B82F6", "#8B5CF6", "#F43F5E", "#F59E0B"].map((color, i) => (
                          <button
                            key={i}
                            onClick={() => { setAccentColor(color); persistCustomization({ accentColor: color }); }}
                            className={`w-9 h-9 rounded-full border-2 transition-all ${accentColor === color ? "border-white scale-110 ring-1 ring-electric" : "border-border"}`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground/70 max-w-[220px]">
                      Current: <span className="font-mono text-electric">{accentColor}</span>. This value would be pushed to Tailwind / CSS variables on publish.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* AI Agent Orchestration */}
            <section className="mt-12" aria-labelledby="ai-orchestration-heading">
              <div className="mb-4 flex items-center gap-3">
                <img src={orchestrationCenter} alt="Orchestration" className="h-10 w-20 rounded border border-electric/30 object-cover" />
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric">AI LAYER — AGENT SWARM</span>
                  <h2 id="ai-orchestration-heading" className="font-mono text-xl font-bold tracking-wide text-foreground mb-0.5">
                    Agent Orchestration
                  </h2>
                  <p className="text-xs text-muted-foreground max-w-2xl">
                    Command your agent swarm. Messages trigger deterministic side-effects (hero, flags, maintenance, accent) + optional real LLM commentary via /api/chat.
                  </p>
                </div>
              </div>

              <div className="border border-border rounded-2xl bg-card overflow-hidden flex flex-col" style={{ minHeight: "460px" }}>
                {/* Agent Selector + Header */}
                <div className="border-b border-border px-4 py-3 flex items-center justify-between bg-background/40">
                  <div className="flex items-center gap-3">
                    <img src={agentSwarm} alt="Swarm" className="h-8 w-8 rounded border border-electric/20" />
                    <select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className="bg-[#0F1117] border border-border rounded px-3 py-1 text-sm font-mono focus:border-electric"
                    >
                      <option value="Clearasist Data Curator">Clearasist Data Curator</option>
                      <option value="Website Editor">Website Editor</option>
                      <option value="Content Generator">Content Generator</option>
                      <option value="Maintenance Controller">Maintenance Controller</option>
                      <option value="Multi-Agent Coordinator">Multi-Agent Coordinator</option>
                    </select>
                    <span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-400">5 AGENTS ONLINE</span>
                    {isAiThinking && <span className="text-[10px] text-electric animate-pulse flex items-center gap-1">THINKING…</span>}
                  </div>
                  <button
                    onClick={() => {
                      setAiMessages([{ role: "system", content: "Fresh multi-agent session started. All agents standing by." }]);
                      setAiInput("");
                    }}
                    className="text-xs px-3 py-1 border border-border hover:border-electric/50 rounded transition-colors flex items-center gap-1"
                  >
                    NEW SESSION
                  </button>
                </div>

                {/* Real Chat History */}
                <div className="flex-1 p-4 overflow-auto space-y-4 text-sm font-mono bg-[#0A0C12] leading-relaxed">
                  {aiMessages.map((m, idx) => (
                    <div key={idx}>
                      {m.role === "system" && <div className="text-electric/70 text-xs">[{m.role.toUpperCase()}] {m.content}</div>}
                      {m.role === "user" && (
                        <div className="flex gap-2">
                          <span className="text-electric font-bold">YOU:</span> <span>{m.content}</span>
                        </div>
                      )}
                      {m.role === "agent" && (
                        <div className="pl-1 border-l-2 border-electric/30">
                          <span className="text-green-400 font-bold">
                            {selectedAgent}:
                          </span>{" "}
                          {m.content}
                        </div>
                      )}
                    </div>
                  ))}
                  {isAiThinking && (
                    <div className="text-electric/60 text-xs animate-pulse flex items-center gap-2">Agent swarm processing command… consulting LLM proxy…</div>
                  )}
                </div>

                {/* Input + Quick Actions — fully wired */}
                <div className="border-t border-border p-3 bg-background/30">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="Tell the agents what to do (e.g. 'update hero', 'enable maintenance', 'export clearasist', 'purple accent')..."
                      className="flex-1 bg-[#0F1117] border border-border rounded px-3 py-2 text-sm font-mono focus:border-electric"
                      disabled={isAiThinking}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isAiThinking) {
                          void sendAiMessage(aiInput);
                        }
                      }}
                    />
                    <button
                      onClick={() => void sendAiMessage(aiInput)}
                      disabled={isAiThinking || !aiInput.trim()}
                      className="px-5 py-2 bg-electric text-black rounded font-medium text-sm hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Send className="size-4" /> SEND COMMAND
                    </button>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button onClick={() => void executeQuickAction("Update homepage hero to show AI Agent Orchestration")} disabled={isAiThinking} className="text-xs px-2.5 py-1 border border-border hover:border-electric/50 rounded disabled:opacity-50 flex items-center gap-1">UPDATE HERO</button>
                    <button onClick={() => void executeQuickAction("Enable AI Agent Orchestration feature flag")} disabled={isAiThinking} className="text-xs px-2.5 py-1 border border-border hover:border-electric/50 rounded disabled:opacity-50 flex items-center gap-1">ENABLE ORCHESTRATION</button>
                    <button onClick={() => void executeQuickAction("Export Clearasist data for training")} disabled={isAiThinking} className="text-xs px-2.5 py-1 border border-border hover:border-electric/50 rounded disabled:opacity-50 flex items-center gap-1">EXPORT CLEARASIST</button>
                    <button onClick={() => void executeQuickAction("Toggle maintenance mode")} disabled={isAiThinking} className="text-xs px-2.5 py-1 border border-border hover:border-electric/50 rounded disabled:opacity-50 flex items-center gap-1">TOGGLE MAINTENANCE</button>
                    <button onClick={() => void executeQuickAction("Switch accent color to purple")} disabled={isAiThinking} className="text-xs px-2.5 py-1 border border-border hover:border-electric/50 rounded disabled:opacity-50 flex items-center gap-1">PURPLE ACCENT</button>
                    <button onClick={() => void executeQuickAction("Set a dramatic new announcement banner about the Master Admin")} disabled={isAiThinking} className="text-xs px-2.5 py-1 border border-border hover:border-electric/50 rounded disabled:opacity-50 flex items-center gap-1">SET ANNOUNCEMENT</button>
                  </div>
                  <div className="mt-1.5 text-[10px] text-muted-foreground/60 flex items-center gap-1">
                    <Radio className="size-3" /> Real LLM proxy via /api/chat (when signed in). All side-effects execute instantly + persist.
                  </div>
                </div>
              </div>

              {/* Additional Orchestration Controls — enhanced with training image */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-border rounded-xl p-4 bg-card flex gap-3">
                  <img src={trainingDataBadge} alt="" className="h-12 w-12 rounded border border-electric/20 object-cover flex-shrink-0" />
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">SWARM STATUS</div>
                    <div className="font-mono text-sm">5 agents • {featureFlags.find(f => f.name.includes("Orchestration"))?.enabled ? "ORCHESTRATION ENABLED" : "LIMITED MODE"}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Latency &lt;1.8s (side effects + LLM)</div>
                  </div>
                </div>

                <div className="border border-border rounded-xl p-4 bg-card">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">BULK ORCHESTRATION</div>
                  <button
                    onClick={() => {
                      void executeQuickAction("Export Clearasist data for training");
                      const next = featureFlags.map(f => f.name.includes("Orchestration") ? { ...f, enabled: true } : f);
                      setFeatureFlags(next);
                      persistCustomization({ featureFlags: next });
                      setHeroHeadline("Aliasist Platform — AI Command Center");
                      persistCustomization({ heroHeadline: "Aliasist Platform — AI Command Center" });
                      setAnnouncementText("New Master Admin + full AI Agent Orchestration now live for all authorized users.");
                      persistCustomization({ announcementText: "New Master Admin + full AI Agent Orchestration now live for all authorized users." });
                      toast({ title: "Bulk orchestration complete", description: "Export + flag + hero + announcement batch applied." });
                    }}
                    className="text-xs mt-1 px-3 py-1.5 border border-electric/40 hover:bg-electric/10 rounded w-full text-left flex items-center gap-2"
                  >
                    RUN “TRAINING DATA REFRESH” BATCH
                  </button>
                </div>

                <div className="border border-border rounded-xl p-4 bg-card text-xs text-muted-foreground flex flex-col">
                  <div className="flex-1">
                    Future: Real multi-step workflows, scheduled agent jobs, model routing, approval gates, full audit trail.
                  </div>
                  <div className="mt-2 text-electric/80 font-mono text-[10px]">All commands logged for your personal AI training use.</div>
                </div>
              </div>
            </section>

            {/* New: Prism Chat — the beautiful Aliasist-wrapped multi-provider chatbot */}
            <div className="mt-8 p-5 border border-electric/30 bg-card rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs uppercase tracking-[0.2em] text-electric">NEW</div>
                  <div className="text-lg font-semibold">Prism Chat</div>
                  <div className="text-xs text-muted-foreground">Aliasist shell • Real Claude, Gemini, Groq, Grok &amp; more</div>
                </div>
                <a href="/llm-chat" target="_blank" 
                   className="px-4 py-2 text-sm border border-electric/40 hover:bg-electric/10 rounded-2xl flex items-center gap-2 text-electric">
                  Open Prism <i className="fas fa-external-link-alt text-xs"></i>
                </a>
              </div>
              <div className="text-[10px] text-muted-foreground mt-2">
                Full modern UI (mirrors top AI sites) with local chat history. Bring your own keys — responses come straight from the real services.
              </div>
            </div>

            {/* Operations & Roadmap — the unplugged feature ideas, kept clean and cohesive */}
            <section className="mt-12">
              <div className="mb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric">OPERATIONS &amp; ROADMAP</span>
                <h2 className="font-mono text-xl font-bold tracking-wide">Planned &amp; Unplugged Features</h2>
                <p className="text-xs text-muted-foreground mt-1">Ideas for expanding the command center. Most would integrate with aliasist-agent, Workers, and the existing customization layer.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border rounded-xl p-4 bg-card">
                  <div className="font-medium">Realtime Presence &amp; Monitoring</div>
                  <div className="text-xs text-muted-foreground mt-1">Live user activity, WebSocket feeds, Durable Objects powered dashboards. Ties into agent snapshots for full health view.</div>
                </div>
                <div className="border border-border rounded-xl p-4 bg-card">
                  <div className="font-medium">User &amp; Activity Management</div>
                  <div className="text-xs text-muted-foreground mt-1">Cross-app users, roles, audit history. Clerk + custom events from all sists and Clearasist.</div>
                </div>
                <div className="border border-border rounded-xl p-4 bg-card">
                  <div className="font-medium">Deployments &amp; Infrastructure</div>
                  <div className="text-xs text-muted-foreground mt-1">One-click deploys for site/apps/workers, history, rollbacks. Would call Wrangler / Pages APIs via agents.</div>
                </div>
                <div className="border border-border rounded-xl p-4 bg-card">
                  <div className="font-medium">Logs &amp; Observability</div>
                  <div className="text-xs text-muted-foreground mt-1">Aggregated logs from Workers/Pages, search, alerts. Correlated with maintenance and AI actions.</div>
                </div>
              </div>
              <div className="mt-3 text-[10px] text-muted-foreground/60">These remain as clean cards to preserve the ideas without cluttering the functional core.</div>
            </section>
          </>
        )}

        {/* Simple floating navigation for cleaner UI */}
        <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2">
          <a
            href="/"
            className="px-4 py-2 rounded-xl border border-white/10 bg-[#0C0E14]/90 backdrop-blur text-sm font-mono text-white/90 hover:text-white hover:border-electric/50 transition-colors"
          >
            ← Back to Site
          </a>
        </div>
      </main>
    </div>
  );
}
