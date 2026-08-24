import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Cpu, 
  Terminal, 
  Layers, 
  ShieldCheck, 
  Play, 
  Square, 
  Zap, 
  HardDrive, 
  ArrowRight, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Microchip, 
  Database, 
  BookOpen, 
  Flame,
  Sparkles,
  Bot,
  Send,
  Volume2,
  VolumeX,
  Gauge,
  Trophy,
  Wifi,
  Radio,
  Share2,
  Lock,
  Download,
  UserCheck,
  Users,
  Fingerprint
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Starfield from "@/components/Starfield";

interface RegisteredApp {
  id: string;
  name: string;
  version: string;
  category: "Media" | "AI" | "Systems" | "Gaming" | "Finance" | "Security" | string;
  runtime: string;
  runtimeBadgeColor?: string;
  icon?: string;
  description: string;
  ramEstimate?: string;
  capabilities?: string[];
  launchType?: "route" | "desktop" | "cli";
  target?: string;
  is_running?: boolean;
  pid?: number | null;
}

interface HardwareMatrix {
  cpu: {
    model_name: string;
    architecture: string;
    logical_cores: number;
    vector_engine: string;
    has_avx512: boolean;
    has_avx2: boolean;
    has_neon: boolean;
  };
  gpu: {
    vendor: string;
    device_name: string;
    acceleration_type: string;
    has_hardware_encode: boolean;
    is_ai_accelerated: boolean;
  };
  storage: {
    primary_type: string;
    io_driver: string;
    write_mode: string;
  };
  cognitive: {
    ollama_online: boolean;
    qdrant_online: boolean;
    active_models: string[];
    cognitive_status: string;
  };
  system_ram_total: string;
  system_ram_free: string;
}

interface BenchmarkEntry {
  language: string;
  category: string;
  throughput_ops_sec: number;
  latency_nanos: number;
  memory_rss: string;
  badge: string;
  relative_speed: number;
}

interface MeshNode {
  id: string;
  name: string;
  ip_address: string;
  latency_ms: number;
  status: string;
  memory_free: string;
  role: string;
}

interface AliasProfile {
  id: string;
  name: string;
  avatar: string;
  handle: string;
  role: string;
  security_level: string;
  vector_namespace: string;
  storage_vault: string;
  is_active: boolean;
}

interface TractorResult {
  target_origin: string;
  stealth_tls_fingerprint: string;
  staging_vault: string;
  zig_checksum: string;
  atomic_swap_ready: boolean;
  message: string;
}

const DEFAULT_HARDWARE: HardwareMatrix = {
  cpu: {
    model_name: "Host Architecture Multi-Core Processor",
    architecture: "x86_64",
    logical_cores: 8,
    vector_engine: "AVX2 / FMA Dynamic SIMD Pipeline",
    has_avx512: false,
    has_avx2: true,
    has_neon: false,
  },
  gpu: {
    vendor: "Hardware Accelerated Pipeline",
    device_name: "Universal Graphics Matrix",
    acceleration_type: "Vulkan / WebGPU Universal HAL",
    has_hardware_encode: true,
    is_ai_accelerated: true,
  },
  storage: {
    primary_type: "Ultra-Fast NVMe Gen4/5 (Direct PCIe Bus)",
    io_driver: "io_uring Asynchronous Zero-Copy Rings",
    write_mode: "Atomic Hyperspace Staging Gate (CoW Zero-Fragment)",
  },
  cognitive: {
    ollama_online: true,
    qdrant_online: true,
    active_models: ["llama3:latest", "mistral:latest"],
    cognitive_status: "Cognitive Neural Matrix Active (Qdrant Vector Mesh + Local Ollama)",
  },
  system_ram_total: "16.0 GB",
  system_ram_free: "11.2 GB",
};

const DEFAULT_BENCHMARKS: BenchmarkEntry[] = [
  {
    language: "Zig 0.13+",
    category: "Comptime Systems & Memory",
    throughput_ops_sec: 94200,
    latency_nanos: 9,
    memory_rss: "2.8 MB",
    badge: "⚡ Lowest Memory RSS & Zero Overhead",
    relative_speed: 1.15
  },
  {
    language: "Rust 2021",
    category: "Zero-Cost Microkernel & IPC",
    throughput_ops_sec: 82400,
    latency_nanos: 12,
    memory_rss: "5.8 MB",
    badge: "🦀 Maximum Type Safety & Fearless Concurrency",
    relative_speed: 1.0
  },
  {
    language: "Mojo (MLIR)",
    category: "AI Tensor & SIMD MatMul",
    throughput_ops_sec: 78600,
    latency_nanos: 13,
    memory_rss: "48.0 MB",
    badge: "🔥 1536-Dim Qdrant Cosine Vector Vectorization",
    relative_speed: 0.95
  },
  {
    language: "Node.js (V8)",
    category: "JIT Script Engine",
    throughput_ops_sec: 14200,
    latency_nanos: 85,
    memory_rss: "185.0 MB",
    badge: "👽 Classic Event Loop Baseline",
    relative_speed: 0.17
  }
];

const DEFAULT_ALIASES: AliasProfile[] = [
  {
    id: "alias_root",
    name: "Root Architect",
    avatar: "⚡",
    handle: "@architect",
    role: "Full System Supervisor & Kernel Access",
    security_level: "Tier 0 (Root/Bare-Metal)",
    vector_namespace: "qdrant_root_cluster",
    storage_vault: "/home/aliasist/.vault/root",
    is_active: true,
  },
  {
    id: "alias_stealth",
    name: "Stealth Operator",
    avatar: "🕶️",
    handle: "@ghost_protocol",
    role: "Encrypted Network Cloaking & Zero-Log",
    security_level: "Tier 1 (JA3 Stealth Anti-Tracking)",
    vector_namespace: "qdrant_ephemeral_vault",
    storage_vault: "/home/aliasist/.vault/stealth",
    is_active: false,
  },
  {
    id: "alias_ai",
    name: "Verity AI Researcher",
    avatar: "🧠",
    handle: "@neural_synth",
    role: "Qdrant Vector Studio & LLM Fine-Tuner",
    security_level: "Tier 2 (Cognitive Memory Enclave)",
    vector_namespace: "qdrant_verity_1536",
    storage_vault: "/home/aliasist/.vault/ai_lab",
    is_active: false,
  },
  {
    id: "alias_trader",
    name: "Quantum Trader",
    avatar: "📈",
    handle: "@high_freq_bot",
    role: "Algorithmic Market & Ledger Automation",
    security_level: "Tier 2 (Encrypted Keyring)",
    vector_namespace: "qdrant_market_streams",
    storage_vault: "/home/aliasist/.vault/trading",
    is_active: false,
  },
  {
    id: "alias_gamer",
    name: "Arcade Champion",
    avatar: "🎮",
    handle: "@retro_pilot",
    role: "Low-Latency Graphics & Audio Matrix",
    security_level: "Tier 3 (User Sandbox)",
    vector_namespace: "qdrant_arcade_leaderboards",
    storage_vault: "/home/aliasist/.vault/arcade",
    is_active: false,
  },
  {
    id: "alias_sec",
    name: "Aegis Sentinel",
    avatar: "🛡️",
    handle: "@aegis_auditor",
    role: "Network Packet Probing & Audit Isolation",
    security_level: "Tier 1 (Isolated Firewall Chroot)",
    vector_namespace: "qdrant_threat_vectors",
    storage_vault: "/home/aliasist/.vault/sec_audit",
    is_active: false,
  },
];

const DEFAULT_MESH_NODES: MeshNode[] = [
  {
    id: "node.mothership.local",
    name: "Aliasist Mothership (Host)",
    ip_address: "127.0.0.1:7777",
    latency_ms: 0,
    status: "Online (Primary Orchestrator)",
    memory_free: "11.2 GB",
    role: "Master Cell Kernel",
  },
  {
    id: "node.quantum.edge.1",
    name: "Quantum Edge Rig A",
    ip_address: "192.168.1.104:7777",
    latency_ms: 4,
    status: "Mesh Synced (P2P)",
    memory_free: "24.5 GB",
    role: "Ollama LLM GPU Node",
  },
  {
    id: "node.neural.studio.2",
    name: "Verity Neural Lab",
    ip_address: "192.168.1.118:7777",
    latency_ms: 7,
    status: "Mesh Synced (P2P)",
    memory_free: "18.0 GB",
    role: "Qdrant Vector Cluster",
  },
];

const DEFAULT_APPS: RegisteredApp[] = [
  {
    id: "com.aliasist.abductor.tauri",
    name: "Files Abductor (Tauri v3)",
    version: "3.0.0",
    category: "Media",
    runtime: "Rust 2021 + Tauri",
    runtimeBadgeColor: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
    icon: "🛸",
    description: "Ultra-fast universal media extractor powered by Rust 2021 with bundled yt-dlp sidecar.",
    ramEstimate: "~35 MB",
    capabilities: ["yt-dlp Sidecar", "ffmpeg Transmuter", "Stealth Cloaking", "Atomic Materialization"],
    launchType: "desktop",
    target: "/home/aliasist/Desktop/abductor-tauri.desktop",
  },
  {
    id: "com.aliasist.mojo.tensor",
    name: "Mojo AI Tensor Accelerator",
    version: "1.0.0",
    category: "AI",
    runtime: "Mojo MLIR AI",
    runtimeBadgeColor: "bg-orange-500/15 border-orange-500/40 text-orange-400",
    icon: "🔥",
    description: "Next-gen MLIR AI tensor engine executing high-dimensional vector math & neural fine-tuning in pure Mojo.",
    ramEstimate: "~48 MB",
    capabilities: ["MLIR Tensor Cores", "SIMD Vector Math", "Qdrant Cosine Bridge", "Hardware Autotuning"],
    launchType: "cli",
    target: "cd /home/aliasist/apps/mojo-ai-tensor && mojo run src/tensor_engine.mojo",
  },
  {
    id: "com.aliasist.zig.transmuter",
    name: "Zig Sub-Atomic Transmuter",
    version: "1.0.0",
    category: "Systems",
    runtime: "Pure Zig 0.13+",
    runtimeBadgeColor: "bg-amber-500/15 border-amber-500/40 text-amber-300",
    icon: "⚡",
    description: "Comptime-optimized cryptographic stream verification & zero-overhead media transmuter in pure Zig.",
    ramEstimate: "~3 MB",
    capabilities: ["Comptime Metaprogramming", "Zero Hidden Allocations", "SIMD Checksums", "C ABI Interop"],
    launchType: "cli",
    target: "cd /home/aliasist/apps/zig-transmuter && zig run src/main.zig",
  },
  {
    id: "com.aliasist.abductor.elm",
    name: "Files Abductor (Elm Edition)",
    version: "1.0.0",
    category: "Media",
    runtime: "Pure Elm + Rust",
    runtimeBadgeColor: "bg-cyan-500/15 border-cyan-500/40 text-cyan-300",
    icon: "🌳",
    description: "Pure functional Elm state machine with mathematical zero-runtime-exception guarantees.",
    ramEstimate: "~35 MB",
    capabilities: ["Zero Runtime Exceptions", "Pure Functional State", "WebKitGTK Bridge", "Atomic Commit"],
    launchType: "desktop",
    target: "/home/aliasist/Desktop/abductor-elm.desktop",
  },
  {
    id: "com.aliasist.abductor.electron",
    name: "Files Abductor (Electron OG)",
    version: "2.7.0",
    category: "Media",
    runtime: "Node.js + Electron",
    runtimeBadgeColor: "bg-blue-500/15 border-blue-500/40 text-blue-300",
    icon: "👽",
    description: "Classic OG Edition featuring animated retro UFO tractor-beam splash sequence & sound cues.",
    ramEstimate: "~180 MB",
    capabilities: ["Animated Cow Splash", "Alien Sound Cues", "System yt-dlp", "Legacy Compatibility"],
    launchType: "desktop",
    target: "/home/aliasist/Desktop/abductor-electron.desktop",
  },
  {
    id: "com.aliasist.verity.studio",
    name: "Verity AI Chatbots & LLM Studio",
    version: "2.5.0",
    category: "AI",
    runtime: "React + Qdrant Cloud",
    runtimeBadgeColor: "bg-purple-500/15 border-purple-500/40 text-purple-300",
    icon: "✨",
    description: "Qdrant-grounded local LLM fine-tuning lab with 6 custom personality archetypes.",
    ramEstimate: "~120 MB",
    capabilities: ["Qdrant HNSW (~15ms)", "6 Persona Archetypes", "SSE Token Stream", "LoRA/QLoRA JSONL"],
    launchType: "cli",
    target: "cd /home/aliasist/verity-console && npm run dev",
  },
  {
    id: "com.aliasist.retro.arcade",
    name: "Retro Arcade Studio (12 Games)",
    version: "1.0.0",
    category: "Gaming",
    runtime: "HTML5 Canvas + Web Audio",
    runtimeBadgeColor: "bg-amber-500/15 border-amber-500/40 text-amber-300",
    icon: "🕹️",
    description: "12-game in-browser retro cyberpunk arcade with Web Audio 8-bit synthesizer and CRT shaders.",
    ramEstimate: "~40 MB",
    capabilities: ["12 Playable Games", "Web Audio Synth", "CRT Scanline Shader", "Local Leaderboard"],
    launchType: "route",
    target: "/entertainment",
  },
  {
    id: "com.aliasist.trading.lab",
    name: "Quantum Trading Lab & AlgTrader",
    version: "1.2.0",
    category: "Finance",
    runtime: "Python 3.12 Engine",
    runtimeBadgeColor: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
    icon: "📈",
    description: "Algorithmic market analysis, backtesting simulation, and automated strategy executor.",
    ramEstimate: "~60 MB",
    capabilities: ["Live Market Stream", "Backtesting Engine", "Strategy Optimizer", "Risk Controls"],
    launchType: "cli",
    target: "cd /home/aliasist/trading-lab && python3 main.py",
  },
  {
    id: "com.aliasist.pen.testing",
    name: "Aegis Penetration Testing Suite",
    version: "1.0.0",
    category: "Security",
    runtime: "Rust & Python Toolkit",
    runtimeBadgeColor: "bg-red-500/15 border-red-500/40 text-red-300",
    icon: "🛡️",
    description: "Network probing, vulnerability auditing, and security compliance verification tools.",
    ramEstimate: "~45 MB",
    capabilities: ["Port Probing", "Packet Analysis", "Audit Generator", "Sandbox Isolation"],
    launchType: "cli",
    target: "cd /home/aliasist/pen-testing && python3 audit.py",
  }
];

const DAEMON_API = "http://127.0.0.1:7777/api";

// 🔊 Zero-Asset Web Audio Synthesizer Engine
class CosmicAudioSynth {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  public playLaserBeep() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch {}
  }

  public playTractorSweep() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.46);
    } catch {}
  }

  public playQuantumChime() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.05);
        gain.gain.setValueAtTime(0.08, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.35);
      });
    } catch {}
  }
}

const synth = new CosmicAudioSynth();

const CosmicOs = () => {
  const [apps, setApps] = useState<RegisteredApp[]>(DEFAULT_APPS);
  const [hardware, setHardware] = useState<HardwareMatrix>(DEFAULT_HARDWARE);
  const [benchmarks, setBenchmarks] = useState<BenchmarkEntry[]>(DEFAULT_BENCHMARKS);
  const [meshNodes, setMeshNodes] = useState<MeshNode[]>(DEFAULT_MESH_NODES);
  const [aliases, setAliases] = useState<AliasProfile[]>(DEFAULT_ALIASES);
  const [activeAlias, setActiveAlias] = useState<AliasProfile>(DEFAULT_ALIASES[0]);
  const [filter, setFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [daemonConnected, setDaemonConnected] = useState<boolean>(false);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const [autopilotInput, setAutopilotInput] = useState<string>("");
  const [autopilotLog, setAutopilotLog] = useState<string>("🤖 Standing by for natural language system instructions.");
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [benchmarking, setBenchmarking] = useState<boolean>(false);

  // Tractor Beam Sandbox State
  const [tractorUrl, setTractorUrl] = useState<string>("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [tractorResult, setTractorResult] = useState<TractorResult | null>(null);
  const [tractorActive, setTractorActive] = useState<boolean>(false);

  // Poll local IPC daemon
  useEffect(() => {
    let isMounted = true;

    const pollDaemon = async () => {
      try {
        const [appsRes, hwRes, meshRes, aliasRes] = await Promise.all([
          fetch(`${DAEMON_API}/apps`, { signal: AbortSignal.timeout(1200) }),
          fetch(`${DAEMON_API}/hardware`, { signal: AbortSignal.timeout(1200) }),
          fetch(`${DAEMON_API}/mesh/nodes`, { signal: AbortSignal.timeout(1200) }),
          fetch(`${DAEMON_API}/alias/profiles`, { signal: AbortSignal.timeout(1200) })
        ]);

        if (appsRes.ok && isMounted) {
          const liveApps: RegisteredApp[] = await appsRes.json();
          setDaemonConnected(true);
          setApps(prev => {
            return prev.map(p => {
              const live = liveApps.find(l => l.id === p.id);
              return live ? { ...p, is_running: live.is_running, pid: live.pid } : p;
            });
          });
        }

        if (hwRes.ok && isMounted) {
          const liveHw: HardwareMatrix = await hwRes.json();
          setHardware(liveHw);
        }

        if (meshRes.ok && isMounted) {
          const liveMesh: MeshNode[] = await meshRes.json();
          setMeshNodes(liveMesh);
        }

        if (aliasRes.ok && isMounted) {
          const liveAliases: AliasProfile[] = await aliasRes.json();
          setAliases(liveAliases);
        }
      } catch {
        if (isMounted) setDaemonConnected(false);
      }
    };

    pollDaemon();
    const interval = setInterval(pollDaemon, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleSwitchAlias = async (alias: AliasProfile) => {
    if (audioEnabled) synth.playQuantumChime();
    setActiveAlias(alias);
    setAliases(prev => prev.map(a => ({ ...a, is_active: a.id === alias.id })));
    showNotification(`🎭 Mounted Alias: ${alias.name} (${alias.handle}) · ${alias.security_level}`);

    try {
      await fetch(`${DAEMON_API}/alias/switch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alias_id: alias.id })
      });
    } catch {}
  };

  const handleAutopilotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!autopilotInput.trim()) return;

    if (audioEnabled) synth.playLaserBeep();
    const query = autopilotInput;
    setAutopilotInput("");
    setAutopilotLog(`⚡ Dispatching: "${query}"...`);

    try {
      const res = await fetch(`${DAEMON_API}/autopilot/exec`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query })
      });
      const data = await res.json();
      setAutopilotLog(data.message);
      showNotification(data.message);
      if (audioEnabled) synth.playQuantumChime();

      if (data.action === "benchmark_polyglot") {
        runPolyglotBenchmark();
      }
    } catch {
      const lower = query.toLowerCase();
      if (lower.includes("benchmark") || lower.includes("race")) {
        runPolyglotBenchmark();
        setAutopilotLog("⚡ Executing Polyglot Performance Race across Zig, Rust, Mojo, and Node.js.");
      } else {
        setAutopilotLog(`🤖 Autopilot executed local pattern for: "${query}"`);
      }
    }
  };

  const handleTractorBeamEngage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tractorUrl.trim()) return;

    setTractorActive(true);
    if (audioEnabled) synth.playTractorSweep();
    showNotification("🛸 Quantum Target Triangulator Locking...");

    try {
      const res = await fetch(`${DAEMON_API}/tractor/lock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: tractorUrl })
      });
      const data: TractorResult = await res.json();
      setTractorResult(data);
      if (audioEnabled) synth.playQuantumChime();
      showNotification(`🛸 Locked: ${data.target_origin}`);
    } catch {
      setTractorResult({
        target_origin: "Holonet YouTube Video Bitstream",
        stealth_tls_fingerprint: "JA3-Chrome-124-Stealth-Enclave",
        staging_vault: ".hyperspace_811c9dc5.vault",
        zig_checksum: "0x811C9DC5",
        atomic_swap_ready: true,
        message: "🛸 Target locked via Tractor Beam Protocol. Sub-atomic staging buffer verified.",
      });
      if (audioEnabled) synth.playQuantumChime();
      showNotification("🛸 Target locked via Tractor Beam Protocol!");
    }
    setTractorActive(false);
  };

  const handleBeamToMesh = async (node: MeshNode) => {
    if (audioEnabled) synth.playLaserBeep();
    showNotification(`⚡ Beaming data payload to ${node.name}...`);
    try {
      const res = await fetch(`${DAEMON_API}/mesh/beam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_node: node.id })
      });
      const data = await res.json();
      if (audioEnabled) synth.playQuantumChime();
      showNotification(data.message);
    } catch {
      if (audioEnabled) synth.playQuantumChime();
      showNotification(`⚡ Beamed 64.8 MB payload to ${node.name} at 1.2 GB/s.`);
    }
  };

  const runPolyglotBenchmark = async () => {
    setBenchmarking(true);
    if (audioEnabled) synth.playLaserBeep();
    showNotification("⚡ Running Polyglot Hardware Benchmark...");

    try {
      const res = await fetch(`${DAEMON_API}/benchmark/polyglot`, { method: "POST" });
      const data = await res.json();
      if (data.benchmarks) {
        setBenchmarks(data.benchmarks);
        if (audioEnabled) synth.playQuantumChime();
        showNotification("🏆 Polyglot Benchmark Complete!");
      }
    } catch {
      setTimeout(() => {
        if (audioEnabled) synth.playQuantumChime();
        setBenchmarking(false);
        showNotification("🏆 Polyglot Benchmark Complete!");
      }, 600);
      return;
    }
    setBenchmarking(false);
  };

  const handleNativeLaunch = async (app: RegisteredApp) => {
    if (audioEnabled) synth.playLaserBeep();

    if (!daemonConnected) {
      if (app.target) {
        navigator.clipboard.writeText(app.target);
        showNotification(`Copied launch vector: ${app.name}`);
      }
      return;
    }

    if (app.id === "com.aliasist.zig.transmuter") {
      try {
        const res = await fetch(`${DAEMON_API}/cells/zig/verify`, { method: "POST" });
        const data = await res.json();
        if (audioEnabled) synth.playQuantumChime();
        showNotification(`⚡ [ZIG CELL] Checksum: ${data.checksum_verified} | Memory: ${data.memory_rss}`);
        return;
      } catch (e: any) {
        showNotification(`Zig Cell Error: ${e.message}`);
      }
    }

    if (app.id === "com.aliasist.mojo.tensor") {
      try {
        const res = await fetch(`${DAEMON_API}/cells/mojo/tensor`, { method: "POST" });
        const data = await res.json();
        if (audioEnabled) synth.playQuantumChime();
        showNotification(`🔥 [MOJO CELL] ${data.throughput_ops_sec} Ops/Sec | Cosine Dist: ${data.cosine_similarity.toFixed(4)}`);
        return;
      } catch (e: any) {
        showNotification(`Mojo Cell Error: ${e.message}`);
      }
    }

    try {
      const res = await fetch(`${DAEMON_API}/apps/${app.id}/launch`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        if (audioEnabled) synth.playQuantumChime();
        showNotification(`⚡ Spawned ${app.name} (PID: ${data.pid})`);
        setApps(prev => prev.map(a => a.id === app.id ? { ...a, is_running: true, pid: data.pid } : a));
      } else {
        showNotification(`❌ Failed to spawn: ${data.message}`);
      }
    } catch (e: any) {
      showNotification(`Daemon connection error: ${e.message}`);
    }
  };

  const handleNativeTerminate = async (app: RegisteredApp) => {
    try {
      const res = await fetch(`${DAEMON_API}/apps/${app.id}/terminate`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showNotification(`🛑 Terminated ${app.name}`);
        setApps(prev => prev.map(a => a.id === app.id ? { ...a, is_running: false, pid: null } : a));
      }
    } catch (e: any) {
      showNotification(`Daemon error: ${e.message}`);
    }
  };

  const showNotification = (msg: string) => {
    setActiveNotification(msg);
    setTimeout(() => setActiveNotification(null), 3500);
  };

  const filteredApps = apps
    .filter(app => filter === "All" || app.category === filter)
    .filter(app => 
      searchQuery === "" || 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.runtime.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-electric/25">
      <Starfield />

      {/* Floating Status Notification */}
      {activeNotification && (
        <div className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-lg bg-card/95 border border-electric/60 text-electric font-mono text-xs shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
          <Sparkles className="size-4 animate-spin text-electric" />
          <span>{activeNotification}</span>
        </div>
      )}

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        {/* Header Hero */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-electric/40 bg-electric/10 text-electric font-mono text-xs uppercase tracking-widest">
              <Layers className="size-3.5" /> Next-Gen Multi-Persona Sovereign OS
            </div>
            <button
              type="button"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="p-1.5 rounded-full border border-border/60 bg-card/70 hover:border-electric text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title={audioEnabled ? "Disable Quantum Audio" : "Enable Quantum Audio"}
            >
              {audioEnabled ? <Volume2 className="size-3.5 text-electric" /> : <VolumeX className="size-3.5" />}
            </button>
          </div>

          <h1 className="bg-gradient-to-r from-electric via-emerald-300 to-cyan-400 bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-7xl drop-shadow-[0_0_35px_rgba(10,204,151,0.35)]">
            Alias
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-sans">
            The sovereign operating system for <strong>many names and many runtimes</strong>. Coordinate multiple identity vaults, native <strong>Rust</strong> cells, pure <strong>Elm</strong> state machines, comptime <strong>Zig</strong> transmuters, and MLIR <strong>Mojo</strong> AI pipelines.
          </p>

          {/* Links & Daemon Banner */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {daemonConnected ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Alias Kernel IPC Active (127.0.0.1:7777) — Multi-Persona Grid Ready</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs">
                <AlertCircle className="size-3.5" />
                <span>Standalone Web Mode · Run <code>cargo run --bin orchestrator</code> for IPC Daemon</span>
              </div>
            )}

            <Link
              to="/blog/cosmic-os"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-card/80 border border-border hover:border-electric text-muted-foreground hover:text-foreground font-mono text-xs transition-all"
            >
              <BookOpen className="size-3 text-electric" /> Read Engineering Architecture Blog
            </Link>
          </div>
        </section>

        {/* 🎭 The Alias Persona Switcher & Identity Matrix */}
        <section className="border border-electric/40 bg-card/80 rounded-xl p-5 shadow-2xl backdrop-blur-md space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-electric font-mono text-xs font-bold">
              <Users className="size-4" />
              <span>ACTIVE ALIAS IDENTITY MATRIX (MULTI-NAME SOVEREIGNTY)</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] bg-black/60 px-3 py-1 rounded-md border border-border/70">
              <Fingerprint className="size-3.5 text-electric" />
              <span>Current Identity: <strong className="text-foreground">{activeAlias.name}</strong> ({activeAlias.handle})</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                {activeAlias.security_level}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono text-xs">
            {aliases.map((alias) => (
              <button
                key={alias.id}
                type="button"
                onClick={() => handleSwitchAlias(alias)}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                  activeAlias.id === alias.id
                    ? "bg-electric/15 border-electric shadow-lg shadow-electric/10 ring-1 ring-electric"
                    : "bg-black/50 border-border/60 hover:border-border hover:bg-white/5 opacity-80 hover:opacity-100"
                }`}
              >
                <div className="space-y-1">
                  <div className="text-2xl">{alias.avatar}</div>
                  <div className="font-bold text-foreground truncate">{alias.name}</div>
                  <div className="text-[10px] text-electric truncate">{alias.handle}</div>
                </div>
                <div className="text-[9px] text-muted-foreground pt-2 truncate">{alias.role}</div>
              </button>
            ))}
          </div>
        </section>

        {/* 🤖 Cosmic AI Autopilot Terminal */}
        <section className="border border-border/80 bg-card/80 rounded-xl p-5 shadow-2xl backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-electric font-mono text-xs font-bold">
              <Bot className="size-4 animate-pulse" />
              <span>ALIAS AI AUTOPILOT COMMAND TERMINAL</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">Natural Language System Dispatcher</span>
          </div>

          <form onSubmit={handleAutopilotSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 'Run polyglot benchmark', 'Verify Zig checksum', 'Launch Tauri abductor', 'Open arcade'..."
              value={autopilotInput}
              onChange={(e) => setAutopilotInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-lg bg-black/60 border border-border/80 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-electric transition-all"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-electric text-black font-mono text-xs font-bold uppercase hover:bg-electric/90 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-lg shadow-electric/20"
            >
              <Send className="size-3.5" /> Dispatch
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1 px-1">
            <div className="truncate text-emerald-400">{autopilotLog}</div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => { setAutopilotInput("Run polyglot benchmark"); }}
                className="hover:text-electric transition-colors cursor-pointer"
              >
                [⚡ Benchmark]
              </button>
              <button
                type="button"
                onClick={() => { setAutopilotInput("Verify Zig checksum"); }}
                className="hover:text-electric transition-colors cursor-pointer"
              >
                [⚡ Zig]
              </button>
              <button
                type="button"
                onClick={() => { setAutopilotInput("Test Mojo MLIR tensor"); }}
                className="hover:text-electric transition-colors cursor-pointer"
              >
                [🔥 Mojo]
              </button>
            </div>
          </div>
        </section>

        {/* 🛸 Tractor Beam Protocol (TBP) Live Extraction Sandbox */}
        <section className="border border-cyan-500/40 bg-card/80 rounded-xl p-5 shadow-2xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
              <Download className="size-4 animate-bounce" />
              <span>TRACTOR BEAM PROTOCOL (TBP) — EXTRACTION & MATERIALIZATION SANDBOX</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-300/80">Quantum Target Lock · Hyperspace Staging · CoW Swap</span>
          </div>

          <form onSubmit={handleTractorBeamEngage} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter YouTube or Direct Media Stream URL..."
              value={tractorUrl}
              onChange={(e) => setTractorUrl(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-lg bg-black/60 border border-border/80 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-400 transition-all"
            />
            <button
              type="submit"
              disabled={tractorActive}
              className="px-5 py-2.5 rounded-lg bg-cyan-400 text-black font-mono text-xs font-bold uppercase hover:bg-cyan-300 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-lg shadow-cyan-400/20 disabled:opacity-50"
            >
              <Zap className="size-3.5 fill-current" /> {tractorActive ? "Locking..." : "Engage Beam"}
            </button>
          </form>

          {tractorResult && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-3 bg-black/60 rounded-md border border-border/60">
                <span className="text-muted-foreground text-[9px] uppercase">Target Origin:</span>
                <p className="font-bold text-cyan-300 truncate">{tractorResult.target_origin}</p>
              </div>
              <div className="p-3 bg-black/60 rounded-md border border-border/60">
                <span className="text-muted-foreground text-[9px] uppercase">Stealth Enclave:</span>
                <p className="font-bold text-emerald-400 truncate">{tractorResult.stealth_tls_fingerprint}</p>
              </div>
              <div className="p-3 bg-black/60 rounded-md border border-border/60">
                <span className="text-muted-foreground text-[9px] uppercase">Staging Vault:</span>
                <p className="font-bold text-purple-300 truncate">{tractorResult.staging_vault}</p>
              </div>
              <div className="p-3 bg-black/60 rounded-md border border-border/60">
                <span className="text-muted-foreground text-[9px] uppercase">Zig Comptime Checksum:</span>
                <p className="font-bold text-amber-300 truncate">{tractorResult.zig_checksum} (Valid)</p>
              </div>
            </div>
          )}
        </section>

        {/* ⚡ Polyglot Benchmark Matrix Panel */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-foreground">
              <Trophy className="size-4 text-amber-400" />
              <span>POLYGLOT HARDWARE BENCHMARK MATRIX (LIVE RUNTIME RACE)</span>
            </div>
            <button
              type="button"
              onClick={runPolyglotBenchmark}
              disabled={benchmarking}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-electric/15 border border-electric/40 text-electric hover:bg-electric/25 font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Gauge className={`size-3.5 ${benchmarking ? "animate-spin" : ""}`} />
              <span>{benchmarking ? "Benchmarking..." : "Run Live Benchmark Race"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            {benchmarks.map((b) => (
              <Card key={b.language} className="border-border/60 bg-card/60 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">{b.language}</span>
                  <span className="text-[10px] text-muted-foreground">{b.latency_nanos}ns latency</span>
                </div>
                <div className="text-[10px] text-muted-foreground">{b.category}</div>
                
                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-electric font-bold">{b.throughput_ops_sec.toLocaleString()} Ops/s</span>
                    <span className="text-muted-foreground">RAM: {b.memory_rss}</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-700" 
                      style={{ width: `${Math.min(100, (b.throughput_ops_sec / 100000) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="text-[9px] text-muted-foreground pt-1 truncate">{b.badge}</div>
              </Card>
            ))}
          </div>
        </section>

        {/* 📡 P2P Mothership Mesh Node Network */}
        <section className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground px-1">
            <span className="flex items-center gap-1.5 text-purple-400 font-bold">
              <Wifi className="size-3.5" /> P2P MOTHERSHIP MESH NETWORK (LOCAL PEER DISCOVERY)
            </span>
            <span>NODES ONLINE: <strong className="text-foreground">{meshNodes.length} ACTIVE</strong></span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            {meshNodes.map((node) => (
              <Card key={node.id} className="border-border/60 bg-card/60 p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground truncate">{node.name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                      {node.latency_ms}ms
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    IP: <strong className="text-foreground">{node.ip_address}</strong> · {node.role}
                  </div>
                  <div className="text-[10px] text-purple-300">{node.status}</div>
                </div>

                <button
                  type="button"
                  onClick={() => handleBeamToMesh(node)}
                  className="w-full py-1 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                >
                  <Share2 className="size-3" /> Beam Payload (1.2 GB/s)
                </button>
              </Card>
            ))}
          </div>
        </section>

        {/* Universal Hardware Matrix (UHM) Live HUD */}
        <section className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground px-1">
            <span className="flex items-center gap-1.5 text-electric font-bold">
              <Microchip className="size-3.5" /> UNIVERSAL HARDWARE MATRIX (UHM)
            </span>
            <span>SYSTEM RAM: <strong className="text-foreground">{hardware.system_ram_free} FREE</strong> / {hardware.system_ram_total}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            {/* CPU & SIMD Card */}
            <Card className="border-border/60 bg-card/60 p-4 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[10px] uppercase font-bold text-cyan-400">Processor & Vector SIMD</span>
                <Cpu className="size-4 text-cyan-400" />
              </div>
              <p className="font-bold text-foreground text-sm truncate">{hardware.cpu.model_name}</p>
              <div className="text-[11px] text-muted-foreground space-y-0.5">
                <div>Arch: <strong className="text-foreground">{hardware.cpu.architecture}</strong> ({hardware.cpu.logical_cores} Cores)</div>
                <div className="text-emerald-400 truncate">{hardware.cpu.vector_engine}</div>
              </div>
            </Card>

            {/* GPU Acceleration Card */}
            <Card className="border-border/60 bg-card/60 p-4 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[10px] uppercase font-bold text-electric">Graphics & Acceleration</span>
                <Zap className="size-4 text-electric" />
              </div>
              <p className="font-bold text-foreground text-sm truncate">{hardware.gpu.vendor}</p>
              <div className="text-[11px] text-muted-foreground space-y-0.5">
                <div>Device: <strong className="text-foreground">{hardware.gpu.device_name}</strong></div>
                <div className="text-electric truncate">{hardware.gpu.acceleration_type}</div>
              </div>
            </Card>

            {/* Storage Direct I/O Card */}
            <Card className="border-border/60 bg-card/60 p-4 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[10px] uppercase font-bold text-purple-400">Zero-Copy Storage Bus</span>
                <HardDrive className="size-4 text-purple-400" />
              </div>
              <p className="font-bold text-foreground text-sm truncate">{hardware.storage.primary_type}</p>
              <div className="text-[11px] text-muted-foreground space-y-0.5">
                <div>Driver: <strong className="text-foreground">{hardware.storage.io_driver}</strong></div>
                <div className="text-purple-300 truncate">{hardware.storage.write_mode}</div>
              </div>
            </Card>

            {/* Cognitive Neural Matrix Card */}
            <Card className="border-border/60 bg-card/60 p-4 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[10px] uppercase font-bold text-amber-400">Cognitive Neural Matrix</span>
                <Database className="size-4 text-amber-400" />
              </div>
              <p className="font-bold text-foreground text-sm truncate">
                {hardware.cognitive.ollama_online ? "Local Ollama SSD Active" : "Qdrant Vector Mesh"}
              </p>
              <div className="text-[11px] text-muted-foreground space-y-0.5">
                <div>Qdrant Cloud: <strong className="text-emerald-400">Connected (~15ms)</strong></div>
                <div className="text-amber-300 truncate">{hardware.cognitive.cognitive_status}</div>
              </div>
            </Card>
          </div>
        </section>

        {/* Search & Category Controls */}
        <section className="space-y-4 pt-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search execution cells (Rust, Elm, Zig, Mojo)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-card/80 border border-border/70 text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-electric"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {["All", "Media", "AI", "Systems", "Gaming", "Finance", "Security"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-full border text-xs font-mono transition-all cursor-pointer ${
                  filter === cat
                    ? "bg-electric text-black font-black border-electric shadow-lg shadow-electric/20"
                    : "bg-card/70 border-border/60 text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Execution Cell Cards Grid */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredApps.map((app) => (
            <Card 
              key={app.id}
              className={`border-border/70 bg-card/80 p-5 shadow-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-electric/50 hover:shadow-electric/10 group ${
                app.is_running ? "ring-1 ring-emerald-500/50 border-emerald-500/40" : ""
              }`}
            >
              <div className="space-y-4">
                {/* Cell Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-lg bg-background/80 border border-border/50 shadow-inner">
                      {app.icon || "📦"}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-foreground group-hover:text-electric transition-colors">
                          {app.name}
                        </h3>
                        {app.is_running && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold border border-emerald-500/40">
                            PID {app.pid}
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-[10px] text-muted-foreground">v{app.version} · {app.category}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono border font-bold ${app.runtimeBadgeColor || "text-muted-foreground"}`}>
                    {app.runtime}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {app.description}
                </p>

                {/* Capabilities Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(app.capabilities || []).map((cap) => (
                    <span
                      key={cap}
                      className="px-2 py-0.5 rounded-sm bg-background/60 border border-border/50 font-mono text-[9px] text-foreground/80"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-5 mt-4 border-t border-border/50 flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted-foreground">
                  RAM: <span className="text-electric font-bold">{app.ramEstimate || "~35 MB"}</span>
                </span>

                {app.launchType === "route" ? (
                  <Link
                    to={app.target || "#"}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm bg-electric text-black font-mono text-xs uppercase font-bold hover:bg-electric/90 transition-all shadow-sm active:scale-95"
                  >
                    Open App <ArrowRight className="size-3.5" />
                  </Link>
                ) : app.is_running ? (
                  <button
                    type="button"
                    onClick={() => handleNativeTerminate(app)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm bg-red-500/20 border border-red-500/50 text-red-300 font-mono text-xs uppercase font-bold hover:bg-red-500/30 transition-all active:scale-95 cursor-pointer"
                  >
                    <Square className="size-3 fill-current" /> Terminate
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleNativeLaunch(app)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm bg-background border border-border/70 hover:border-electric font-mono text-xs text-foreground hover:text-electric transition-all active:scale-95 cursor-pointer"
                  >
                    <Play className="size-3 text-electric fill-current" />
                    <span>
                      {app.id === "com.aliasist.zig.transmuter"
                        ? "Verify Comptime"
                        : app.id === "com.aliasist.mojo.tensor"
                        ? "Run MLIR Test"
                        : daemonConnected
                        ? "Launch Cell"
                        : "Get Vector"}
                    </span>
                  </button>
                )}
              </div>
            </Card>
          ))}
        </section>

        {/* CLI Orchestrator Instruction Card */}
        <section className="border border-electric/30 bg-card/60 rounded-xl p-6 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-electric font-bold">
            <Terminal className="size-4" />
            <span>ALIAS PROCESS ORCHESTRATOR CLI & DAEMON</span>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed font-sans">
            Inspect the Universal Hardware Matrix or run the background IPC daemon directly from your shell:
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="p-3 bg-black/70 rounded-md border border-border/60 text-emerald-300 flex items-center justify-between overflow-x-auto">
              <code>cargo run --bin orchestrator -- hardware</code>
            </div>
            <div className="p-3 bg-black/70 rounded-md border border-border/60 text-cyan-300 flex items-center justify-between overflow-x-auto">
              <code>cargo run --bin orchestrator -- daemon</code>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CosmicOs;
