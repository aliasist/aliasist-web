import { motion } from "framer-motion";
import { playHover, playClick, playSuccess } from "@/hooks/useSound";

const links = [
  { label: "GitHub",      href: "https://github.com/aliasist",    icon: "⌥" },
  { label: "dev@aliasist.com", href: "mailto:dev@aliasist.com",   icon: "✉" },
  { label: "aliasist.com", href: "https://www.aliasist.com",      icon: "◈" },
];

const ContactSection = () => {
  return (
    <section id="contact" className="py-28 px-6 bg-foreground text-background relative overflow-hidden">
      {/* Background eye motif */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full opacity-[0.04]"
          style={{
            background: "radial-gradient(circle, hsl(165 90% 42%), transparent 70%)",
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="classified-divider mb-16 [&>span]:text-background/35 before:bg-background/10 after:bg-background/10">
          <span>Channel Open // Contact</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Left */}
            <div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-electric mb-6">
                <span className="w-2 h-2 bg-electric rounded-full animate-pulse" />
                Signal open
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-background mb-6 tracking-tight">
                Make contact.
              </h2>

              <p className="text-base text-background/60 leading-relaxed mb-10">
                <strong className="text-background font-semibold">
                  Open to collaborations, internships, and interesting problems.
                </strong>{" "}
                Building in public, documenting the journey, and always looking
                for teams working on open-source AI and security tooling.
              </p>

              <a
                href="mailto:dev@aliasist.com"
                onMouseEnter={() => playHover()}
                onClick={() => { playClick(); setTimeout(() => playSuccess(), 150); }}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-electric text-background font-mono text-xs uppercase tracking-[0.12em] rounded-sm hover:bg-electric/85 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                Send a message ↗
              </a>

              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.15em] text-background/25">
                Responses prioritized by technical complexity & project fit
              </p>
            </div>

            {/* Right — link cards */}
            <div className="flex flex-col gap-0.5">
              {links.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  onMouseEnter={() => playHover()}
                  onClick={() => playClick()}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="group flex items-center justify-between px-6 py-5 bg-background/5 border border-background/10 hover:bg-electric/10 hover:border-electric/25 transition-all font-mono text-sm text-background/65 hover:text-electric"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-electric/60 group-hover:text-electric transition-colors">
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                  </div>
                  <span className="opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                    ↗
                  </span>
                </motion.a>
              ))}

              {/* Disclaimer */}
              <div className="mt-0.5 border border-dashed border-background/15 p-5">
                <p className="font-mono text-[11px] text-background/30 leading-relaxed">
                  // Currently iterating on this system. Responses prioritized by
                  technical complexity and project alignment.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
