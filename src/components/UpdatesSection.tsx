import { motion } from "framer-motion";
import { updatesSection, updates, type UpdateEntry } from "@/content/homepage";

const KIND_LABELS: Record<UpdateEntry["kind"], string> = {
  update: "Update",
  event: "Event",
};

const KIND_COLORS: Record<UpdateEntry["kind"], string> = {
  update: "hsl(var(--electric))",
  event: "hsl(var(--violet))",
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(new Date(iso));
}

const UpdateRow = ({ entry, index }: { entry: UpdateEntry; index: number }) => {
  const color = KIND_COLORS[entry.kind];
  const content = (
    <>
      <div className="flex items-center gap-3 mb-3">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 border rounded-sm"
          style={{ color, borderColor: `${color}40` }}
        >
          {KIND_LABELS[entry.kind]}
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
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.4, delay: index * 0.04 },
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
          className="mb-10"
        >
          <h2 id="updates-heading" className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            {updatesSection.headline}
          </h2>
          <p className="font-mono text-xs text-muted-foreground/50 mt-2 tracking-[0.1em]">
            {updatesSection.subcopy}
          </p>
        </motion.div>

        <div className="grid gap-0.5 sm:grid-cols-2 lg:grid-cols-3">
          {updates.map((entry, i) => (
            <UpdateRow key={entry.id} entry={entry} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpdatesSection;
