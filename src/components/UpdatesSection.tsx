import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { updatesSection, updates as FALLBACK_UPDATES, type UpdateEntry } from "@/content/homepage";
import { readJsonBody, siteEndpoints } from "@/config/api";

const UPDATES_API = siteEndpoints.updatesApi;
const PAGE_SIZE = 6;

// Both kinds are styled here even when no entry currently uses "event",
// so adding one to the updates list needs no change in this file.
type UpdateKind = "update" | "event";

const KIND_LABELS: Record<UpdateKind, string> = {
  update: "Update",
  event: "Event",
};

const KIND_COLORS: Record<UpdateKind, string> = {
  update: "hsl(var(--electric))",
  event: "hsl(var(--violet))",
};

interface UpdatesResponse {
  items: UpdateEntry[];
  nextCursor: string | null;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(new Date(iso));
}

const UpdateRow = ({ entry, index }: { entry: UpdateEntry; index: number }) => {
  const color = KIND_COLORS[entry.kind as UpdateKind];
  const content = (
    <>
      <div className="flex items-center gap-3 mb-3">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 border rounded-sm"
          style={{ color, borderColor: `${color}40` }}
        >
          {KIND_LABELS[entry.kind as UpdateKind]}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground/50">
          {formatDate(entry.date)}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-foreground/85 leading-snug mb-2">
        {entry.title}
      </h3>
      <p className="text-sm text-muted-foreground/70 leading-relaxed">
        {entry.body}
      </p>
    </>
  );

  const className =
    "group block bg-background border border-border p-6 transition-[border-color,box-shadow] duration-300 hover:border-electric/30 hover:shadow-electric-sm focus-visible:z-10 focus-visible:border-electric/45 focus-visible:shadow-electric-sm focus-visible:ring-2 focus-visible:ring-electric/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background outline-none";

  const motionProps = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
    transition: { duration: 0.3, delay: index * 0.04 },
  };

  if (entry.href && entry.href !== "#") {
    return (
      <motion.a href={entry.href} target="_blank" rel="noopener noreferrer" className={className} {...motionProps}>
        {content}
      </motion.a>
    );
  }

  return (
    <motion.div className={className} {...motionProps}>
      {content}
    </motion.div>
  );
};

const UpdatesSection = () => {
  const [entries, setEntries] = useState<UpdateEntry[]>(FALLBACK_UPDATES as unknown as UpdateEntry[]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const res = await fetch(UPDATES_API);
        const data = await readJsonBody<UpdatesResponse>(res);
        if (!res.ok || !data?.items) throw new Error("API error");
        setEntries(data.items);
      } catch {
        setEntries(FALLBACK_UPDATES as unknown as UpdateEntry[]);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
    // Refresh every 10 minutes
    const interval = setInterval(fetchUpdates, 600_000);
    return () => clearInterval(interval);
  }, []);

  const pageCount = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount - 1);
  const pageEntries = entries.slice(clampedPage * PAGE_SIZE, clampedPage * PAGE_SIZE + PAGE_SIZE);

  return (
    <section
      id="updates"
      aria-labelledby="updates-heading"
      className="relative px-4 py-28 sm:px-8 lg:px-12 xl:px-16"
    >
      <div className="mx-auto w-full max-w-site">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="section-divider mb-10"
        >
          <span>{updatesSection.dividerLabel}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <h2 id="updates-heading" className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              {updatesSection.headline}
            </h2>
            <p className="font-mono text-xs text-muted-foreground/50 mt-2 tracking-[0.1em]">
              {updatesSection.subcopy}
            </p>
          </div>

          {pageCount > 1 && (
            <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground/60">
              <button
                type="button"
                aria-label="Newer updates"
                disabled={clampedPage === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="p-2 border border-border rounded-sm transition-colors hover:border-electric/40 hover:text-electric disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>
                {clampedPage + 1} / {pageCount}
              </span>
              <button
                type="button"
                aria-label="Older updates"
                disabled={clampedPage >= pageCount - 1}
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                className="p-2 border border-border rounded-sm transition-colors hover:border-electric/40 hover:text-electric disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>

        <div className="grid gap-0.5 sm:grid-cols-2 lg:grid-cols-3" aria-busy={loading}>
          <AnimatePresence mode="popLayout">
            {pageEntries.map((entry, i) => (
              <UpdateRow key={entry.id} entry={entry} index={i} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default UpdatesSection;
