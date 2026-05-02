import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { transmissions } from "@/content/homepage";
import { readJsonBody, siteEndpoints } from "@/config/api";

const NEWS_API = siteEndpoints.newsApi;

interface Article {
  id: string;
  title: string;
  source: string;
  url: string;
  published: string;
  category: string;
  tag: string;
  color: string;
}

interface NewsResponse {
  articles: Article[];
  lastUpdated: string;
  sources: Array<{ tag: string; category: string; color: string }>;
}

const TAG_LABELS: Record<string, string> = {
  tech:    "AI & Tech",
  finance: "Finance",
  defense: "Defense",
  aisec:   "AiSec",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "just now";
}

function useTransmitOnView() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(() => {}, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

const FALLBACK_POSTS = [
  {
    id: "f1", tag: "aisec", color: "#FF5555", category: "AiSec",
    title: "AiSec, PenTesting, and a mission to fortify the future of AI.",
    source: "Aliasist", url: "#", published: new Date().toISOString(),
  },
  {
    id: "f2", tag: "tech", color: "#00C97B", category: "AI & Tech",
    title: "Building Aliasist-Files-Abductor: why I made a tool nobody asked for.",
    source: "Aliasist", url: "#", published: new Date().toISOString(),
  },
  {
    id: "f3", tag: "tech", color: "#00C97B", category: "AI & Tech",
    title: "Self-taught to CS degree: what nobody tells you about the gap.",
    source: "Aliasist", url: "#", published: new Date().toISOString(),
  },
];

const FILTERS = ["All", "AI & Tech", "Finance", "Defense", "AiSec"];

// Category-based thumbnail gradients — always render, no external dependency
const CARD_GRADIENTS: Record<string, string> = {
  tech:    "linear-gradient(135deg, hsl(165 90% 8%) 0%, hsl(165 60% 14%) 50%, hsl(165 90% 8%) 100%)",
  finance: "linear-gradient(135deg, hsl(195 90% 8%) 0%, hsl(195 60% 14%) 50%, hsl(195 90% 8%) 100%)",
  defense: "linear-gradient(135deg, hsl(30 80% 8%) 0%, hsl(30 50% 14%) 50%, hsl(30 80% 8%) 100%)",
  aisec:   "linear-gradient(135deg, hsl(0 80% 8%) 0%, hsl(0 50% 14%) 50%, hsl(0 80% 8%) 100%)",
};

// Grid pattern SVG per category
const CARD_PATTERNS: Record<string, string> = {
  tech:    "M 0 20 L 20 0 M -5 5 L 5 -5 M 15 25 L 25 15",
  finance: "M 0 0 L 20 20 M 20 0 L 0 20",
  defense: "M 10 0 L 10 20 M 0 10 L 20 10",
  aisec:   "M 0 0 L 20 20 M 0 20 L 20 0 M 10 0 L 10 20 M 0 10 L 20 10",
};

const CardThumbnail = ({ article }: { article: Article }) => {
  const bg = CARD_GRADIENTS[article.tag] ?? CARD_GRADIENTS.tech;
  const pat = CARD_PATTERNS[article.tag] ?? CARD_PATTERNS.tech;
  const svgId = `pat-${article.tag}`;

  return (
    <div className="relative w-full aspect-video overflow-hidden" style={{ background: bg }}>
      {/* Subtle animated grid pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]" aria-hidden="true">
        <defs>
          <pattern id={svgId} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d={pat} stroke={article.color} strokeWidth="0.5" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${svgId})`} />
      </svg>
      {/* Radial glow at centre */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${article.color}18 0%, transparent 70%)` }}
      />
      {/* Faint source label watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className="font-mono text-[9px] uppercase tracking-[0.35em] opacity-10 select-none"
          style={{ color: article.color }}
        >
          {article.source}
        </span>
      </div>
      {/* Bottom fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
      {/* Category tag */}
      <div className="absolute bottom-3 left-3">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 border rounded-sm backdrop-blur-sm bg-background/40"
          style={{ color: article.color, borderColor: `${article.color}40` }}
        >
          {article.tag === "aisec" ? "AiSec" : article.tag}
        </span>
      </div>
    </div>
  );
};

// Individual blog card
const BlogCard = ({ article, index }: { article: Article; index: number }) => {
  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="tap-target group bg-background border border-border hover:border-electric/30 transition-[transform,border-color,box-shadow] duration-300 hover:shadow-electric-sm relative overflow-hidden hover:-translate-y-0.5 flex flex-col"
    >
      {/* Category thumbnail — always renders */}
      <CardThumbnail article={article} />

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left"
          style={{ background: article.color }}
        />

        {/* Time */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] text-muted-foreground/50">
            {timeAgo(article.published)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-foreground/85 leading-snug mb-3 group-hover:text-foreground transition-colors duration-200 flex-1">
          {article.title}
        </h3>

        {/* Source + arrow */}
        <div className="flex items-center justify-between mt-2">
          <span className="font-mono text-[10px] text-muted-foreground/40 truncate max-w-[140px]">
            {article.source}
          </span>
          <span
            className="font-mono text-[11px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ color: article.color }}
          >
            Read ↗
          </span>
        </div>
      </div>
    </motion.a>
  );
};

const TransmissionsSection = () => {
  const sectionRef = useTransmitOnView();
  const [news, setNews] = useState<Article[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(NEWS_API);
        const data = await readJsonBody<NewsResponse>(res);
        if (!res.ok || !data?.articles) throw new Error("API error");
        setNews(data.articles);
        setLastUpdated(data.lastUpdated);
        setError(false);
      } catch {
        setError(true);
        setNews(FALLBACK_POSTS as Article[]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    // Refresh every 10 minutes
    const interval = setInterval(fetchNews, 600_000);
    return () => clearInterval(interval);
  }, []);

  const filtered = activeFilter === "All"
    ? news
    : news.filter(a =>
        a.category === activeFilter ||
        TAG_LABELS[a.tag] === activeFilter
      );

  const displayed = filtered.slice(0, 9);

  return (
    <section
      id="transmissions"
      ref={sectionRef}
      className="relative overflow-hidden px-4 py-28 sm:px-8 lg:px-12 xl:px-16"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/[0.04] to-transparent pointer-events-none" />
      <div className="mx-auto w-full max-w-site">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="classified-divider mb-10"
        >
          <span>{transmissions.dividerLabel}</span>
        </motion.div>

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              {transmissions.headline}
            </h2>
            <p className="font-mono text-xs text-muted-foreground/50 mt-2 tracking-[0.1em]">
              {loading ? (
                <span className="animate-pulse">{transmissions.scanning}</span>
              ) : error ? (
                transmissions.offline
              ) : (
                <>
                  {transmissions.liveFeedPrefix}
                  {lastUpdated ? timeAgo(lastUpdated) : transmissions.liveFeedRecent}
                </>
              )}
            </p>
          </motion.div>

          {/* Live indicator */}
          {!loading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-electric"
            >
              <span className="w-2 h-2 rounded-full bg-electric animate-pulse shadow-electric-dot" />
              Live · Auto-refresh 10m
            </motion.div>
          )}
        </div>

        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setActiveFilter(f); }}
              className={`font-mono text-[11px] uppercase tracking-[0.12em] px-3 py-1.5 border rounded-sm transition-[colors,border-color,box-shadow] duration-200 ${
                activeFilter === f
                  ? "border-electric text-electric bg-electric/10 shadow-electric-xs"
                  : "border-border text-muted-foreground hover:border-electric/40 hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </motion.div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0.5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-background border border-border p-7 animate-pulse">
                <div className="h-2 bg-border rounded w-20 mb-5" />
                <div className="h-4 bg-border rounded w-full mb-2" />
                <div className="h-4 bg-border rounded w-3/4 mb-5" />
                <div className="h-2 bg-border rounded w-16" />
              </div>
            ))}
          </div>
        )}

        {/* News grid */}
        {!loading && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0.5"
            >
              {displayed.map((article, i) => (
                <BlogCard key={article.id} article={article} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Empty state */}
        {!loading && displayed.length === 0 && (
          <div className="text-center py-16 font-mono text-xs text-muted-foreground/40 uppercase tracking-[0.15em]">
            // no transmissions in this frequency
          </div>
        )}
      </div>
    </section>
  );
};

export default TransmissionsSection;
