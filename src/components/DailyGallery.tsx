/**
 * DailyGallery — 24h rotating AI art gallery for aliasist.com
 * Fetches today's AI-generated image + last 7 days from the image worker.
 * Shows a countdown to the next image refresh.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WORKER_URL = "https://aliasist-image-worker.bchooper0730.workers.dev";

interface DailyEntry {
  date: string;
  prompt: string;
  type: string;
  base64: string;
  generatedAt: string;
}

interface GalleryResponse {
  gallery: DailyEntry[];
  count: number;
}

function useCountdown(): string {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
      const diff = nextMidnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3_600_000).toString().padStart(2, "0");
      const m = Math.floor((diff % 3_600_000) / 60_000).toString().padStart(2, "0");
      const s = Math.floor((diff % 60_000) / 1000).toString().padStart(2, "0");
      setTimeLeft(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
}

export default function DailyGallery() {
  const [gallery, setGallery] = useState<DailyEntry[]>([]);
  const [selected, setSelected] = useState<DailyEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const countdown = useCountdown();

  useEffect(() => {
    fetch(`${WORKER_URL}/daily/gallery`)
      .then((r) => r.json() as Promise<GalleryResponse>)
      .then((data) => {
        setGallery(data.gallery ?? []);
        if (data.gallery?.length) setSelected(data.gallery[0]);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00Z");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
  };

  const downloadImage = (entry: DailyEntry) => {
    const a = document.createElement("a");
    a.href = `data:image/png;base64,${entry.base64}`;
    a.download = `aliasist-daily-${entry.date}.png`;
    a.click();
  };

  return (
    <section className="relative py-24 px-4" id="daily-gallery">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,_hsl(165_90%_42%_/_0.03)_0%,_transparent_70%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-electric border border-electric/30 px-3 py-1.5 mb-6 bg-electric/5">
            <span className="animate-pulse">▮</span> Daily Transmission
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
            AI Art of the <span className="text-electric">Day</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            A unique AI-generated image, refreshed every 24 hours at midnight UTC.
            Each one is unique — generated once, never repeated.
          </p>
          {/* Countdown */}
          <div className="mt-6 inline-flex items-center gap-3 font-mono text-xs border border-border/40 px-5 py-2.5 bg-background/30 backdrop-blur-sm">
            <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Next image in</span>
            <span className="text-electric text-lg font-bold tracking-widest tabular-nums">{countdown}</span>
          </div>
        </motion.div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 aspect-video bg-muted/20 animate-pulse rounded-sm" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-video bg-muted/10 animate-pulse rounded-sm" />
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-16 border border-border/30 rounded-sm">
            <p className="font-mono text-sm text-muted-foreground">
              Daily image unavailable — worker is generating the first batch.
            </p>
            <p className="font-mono text-xs text-muted-foreground/50 mt-2">
              Check back in a few minutes or trigger manually via <span className="text-electric">/daily</span>
            </p>
          </div>
        )}

        {/* Gallery layout */}
        {!loading && !error && gallery.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Main featured image */}
            <AnimatePresence mode="wait">
              {selected && (
                <motion.div
                  key={selected.date}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="lg:col-span-2 border border-electric/20 rounded-sm overflow-hidden bg-background/20 group"
                >
                  <div className="relative">
                    <img
                      src={`data:image/png;base64,${selected.base64}`}
                      alt={selected.prompt}
                      className="w-full object-cover max-h-[500px]"
                    />
                    {/* Today badge */}
                    {selected.date === gallery[0]?.date && (
                      <div className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-widest bg-electric text-black px-2 py-0.5">
                        Today
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                        {formatDate(selected.date)}
                        <span className="text-electric ml-2">// {selected.type}</span>
                      </p>
                      <p className="text-sm text-foreground/70 leading-relaxed line-clamp-2">{selected.prompt}</p>
                    </div>
                    <button
                      onClick={() => downloadImage(selected)}
                      className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-electric border border-electric/30 px-3 py-1.5 hover:bg-electric/10 transition-colors rounded-sm"
                    >
                      Download
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Thumbnail strip */}
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Last {gallery.length} days
              </p>
              {gallery.map((entry, i) => (
                <motion.button
                  key={entry.date}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelected(entry)}
                  className={`relative flex items-center gap-3 p-2 rounded-sm border text-left transition-all group ${
                    selected?.date === entry.date
                      ? "border-electric/50 bg-electric/5"
                      : "border-border/30 hover:border-electric/30 bg-background/20"
                  }`}
                >
                  <img
                    src={`data:image/png;base64,${entry.base64}`}
                    alt={entry.date}
                    className="w-16 h-10 object-cover rounded-sm shrink-0"
                  />
                  <div className="overflow-hidden">
                    <p className={`font-mono text-[10px] uppercase tracking-widest ${selected?.date === entry.date ? "text-electric" : "text-muted-foreground"}`}>
                      {i === 0 ? "Today" : formatDate(entry.date)}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">{entry.type}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state (no gallery yet) */}
        {!loading && !error && gallery.length === 0 && (
          <div className="text-center py-16 border border-border/30 rounded-sm">
            <p className="font-mono text-sm text-muted-foreground">
              First daily image is being generated — check back shortly.
            </p>
          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-[10px] font-mono text-muted-foreground/30 mt-8">
          Generated by Flux-1 Schnell via Cloudflare Workers AI · Refreshes daily at 00:00 UTC
        </p>
      </div>
    </section>
  );
}
