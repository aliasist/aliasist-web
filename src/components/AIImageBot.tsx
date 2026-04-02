/**
 * AIImageBot — User-facing AI image generator for aliasist.com
 * Lets users type a prompt, pick a style, and generate art via the image worker.
 * Shows a gallery of recent community generations below.
 */

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const WORKER_URL = "https://aliasist-image-worker.bchooper0730.workers.dev";

const STYLES = [
  { id: "aliasist",  label: "Aliasist",   desc: "Cyberpunk teal / dark" },
  { id: "cyberpunk", label: "Cyberpunk",  desc: "Neon city / rain" },
  { id: "space",     label: "Space",      desc: "Nebula / cosmos" },
  { id: "abstract",  label: "Abstract",   desc: "Generative art" },
  { id: "minimal",   label: "Minimal",    desc: "Clean geometry" },
  { id: "retro",     label: "Retro",      desc: "Synthwave / 80s" },
  { id: "anime",     label: "Anime",      desc: "Illustrated style" },
  { id: "horror",    label: "Horror",     desc: "Dark / atmospheric" },
];

const EXAMPLE_PROMPTS = [
  "a satellite scanning a neon city at midnight",
  "an alien AI awakening in a server room",
  "circuit board dissolving into stardust",
  "a hacker silhouette in a digital rainstorm",
  "quantum entanglement visualized as glowing threads",
  "deep ocean bioluminescent surveillance drone",
];

interface GeneratedImage {
  id: string;
  base64: string;
  prompt: string;
  style: string;
  timestamp: string;
}

export default function AIImageBot() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("aliasist");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedImage | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${WORKER_URL}/user/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), style }),
      });

      if (res.status === 429) {
        setError("Rate limit reached — max 10 images per 10 minutes.");
        return;
      }
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Generation failed.");
        return;
      }

      const data = await res.json() as GeneratedImage;
      setResult(data);
      setHistory((prev) => [data, ...prev.slice(0, 11)]); // keep last 12
    } catch {
      setError("Connection failed — worker may be unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    setCharCount(e.target.value.length);
  };

  const useExample = (ex: string) => {
    setPrompt(ex);
    setCharCount(ex.length);
    textareaRef.current?.focus();
  };

  const downloadImage = (img: GeneratedImage) => {
    const a = document.createElement("a");
    a.href = `data:image/png;base64,${img.base64}`;
    a.download = `aliasist-${img.id}.png`;
    a.click();
  };

  return (
    <section className="relative py-24 px-4" id="ai-image-bot">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,_hsl(165_90%_42%_/_0.04)_0%,_transparent_70%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-electric border border-electric/30 px-3 py-1.5 mb-6 bg-electric/5">
            <span className="animate-pulse">▮</span> AI Image Generator
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
            Generate with <span className="text-electric">Flux AI</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
            Powered by Black Forest Labs Flux-1 Schnell via Cloudflare Workers AI.
            Describe anything — the AI renders it in seconds.
          </p>
        </motion.div>

        {/* Main generator card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="border border-border/60 bg-background/40 backdrop-blur-sm rounded-sm p-6 md:p-8 mb-6"
        >
          {/* Prompt input */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Describe your image
              </label>
              <span className={`font-mono text-[10px] ${charCount > 450 ? "text-red-400" : "text-muted-foreground"}`}>
                {charCount}/500
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={handlePromptChange}
              placeholder="e.g. a satellite scanning a neon city at midnight..."
              maxLength={500}
              rows={3}
              className="w-full bg-muted/20 border border-border/50 rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 font-mono resize-none focus:outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/20 transition-colors"
            />
            {/* Example prompts */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex}
                  onClick={() => useExample(ex)}
                  className="text-[10px] font-mono text-muted-foreground/60 hover:text-electric border border-border/30 hover:border-electric/30 px-2 py-0.5 rounded-sm transition-colors truncate max-w-[180px]"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Style picker */}
          <div className="mb-6">
            <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2 block">
              Style preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`flex flex-col items-start px-3 py-2.5 rounded-sm border text-left transition-all ${
                    style === s.id
                      ? "border-electric bg-electric/10 text-electric"
                      : "border-border/40 text-muted-foreground hover:border-electric/30 hover:text-foreground"
                  }`}
                >
                  <span className="text-xs font-semibold font-mono">{s.label}</span>
                  <span className="text-[10px] opacity-60 mt-0.5">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full h-11 font-mono text-sm tracking-widest uppercase bg-electric hover:bg-electric/90 text-black rounded-sm transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              "Generate Image →"
            )}
          </Button>

          {error && (
            <p className="mt-3 text-xs text-red-400 font-mono text-center">{error}</p>
          )}
        </motion.div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, scale: 0.97, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="border border-electric/30 bg-background/40 backdrop-blur-sm rounded-sm overflow-hidden mb-6"
            >
              <img
                src={`data:image/png;base64,${result.base64}`}
                alt={result.prompt}
                className="w-full object-cover max-h-[600px]"
              />
              <div className="p-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-mono text-muted-foreground mb-1">
                    <span className="text-electric">{result.style}</span> · {new Date(result.timestamp).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{result.prompt}</p>
                </div>
                <button
                  onClick={() => downloadImage(result)}
                  className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-electric border border-electric/30 px-3 py-1.5 hover:bg-electric/10 transition-colors rounded-sm"
                >
                  Download
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Session history */}
        {history.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
              Your generations this session
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {history.slice(1).map((img) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group cursor-pointer rounded-sm overflow-hidden aspect-square border border-border/40"
                  onClick={() => setResult(img)}
                >
                  <img
                    src={`data:image/png;base64,${img.base64}`}
                    alt={img.prompt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <p className="text-[9px] font-mono text-white/80 line-clamp-2">{img.prompt}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer note */}
        <p className="text-center text-[10px] font-mono text-muted-foreground/40 mt-8 leading-relaxed">
          Powered by Flux-1 Schnell via Cloudflare Workers AI · 10 images/10min limit · All generations are ephemeral
        </p>
      </div>
    </section>
  );
}
