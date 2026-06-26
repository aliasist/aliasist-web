import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { operatingSnapshot } from "@/content/homepage";
import { playClick, playHover } from "@/hooks/useSound";

const tileHover = {
  y: -6,
  scale: 1.018,
  transition: { type: "spring" as const, stiffness: 280, damping: 24, mass: 0.7 },
};

const OperatingSnapshot = () => {
  return (
    <section
      aria-labelledby="operating-snapshot-heading"
      className="relative overflow-hidden px-4 py-20 sm:px-8 lg:px-12 xl:px-16"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,_hsl(var(--background)_/_0.16),_hsl(var(--background)_/_0.72)_44%,_hsl(var(--background)_/_0.28))] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet/25 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-site">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="classified-divider mb-12"
        >
          <span>{operatingSnapshot.dividerLabel}</span>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-end">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <h2
              id="operating-snapshot-heading"
              className="max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              {operatingSnapshot.headline}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {operatingSnapshot.subcopy}
            </p>
          </motion.div>

          <div className="grid gap-px overflow-hidden rounded-sm border border-border/60 bg-border/60 sm:grid-cols-3">
            {operatingSnapshot.lanes.map((lane, index) => (
              <motion.a
                key={lane.label}
                href={lane.href}
                onMouseEnter={() => playHover()}
                onClick={() => playClick()}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                whileHover={tileHover}
                whileTap={{ scale: 0.992 }}
                className="group relative z-0 min-h-[190px] overflow-hidden bg-card/78 p-6 outline-none transition-[background-color,box-shadow] duration-500 will-change-transform hover:z-10 hover:bg-card hover:shadow-project-violet focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--violet)_/_0.13)_0%,_transparent_58%),radial-gradient(ellipse_at_bottom_left,_hsl(var(--electric)_/_0.08)_0%,_transparent_62%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus-visible:opacity-100" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-electric/0 via-violet/45 to-electric/35 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />
                <div className="flex items-start justify-between gap-4">
                  <div className="relative">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/45">
                      {lane.eyebrow}
                    </p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-electric/75">
                      {lane.label}
                    </p>
                  </div>
                  <span className="relative flex size-8 items-center justify-center rounded-sm border border-border/60 bg-background/35 text-muted-foreground/45 transition-colors group-hover:border-electric/35 group-hover:text-electric">
                    <ArrowUpRight className="size-3.5" aria-hidden />
                  </span>
                </div>
                <p className="relative mt-7 text-3xl font-bold tracking-tight text-foreground">
                  {lane.value}
                </p>
                <p className="relative mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {lane.detail}
                </p>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OperatingSnapshot;
