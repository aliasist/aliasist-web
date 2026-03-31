import { motion } from "framer-motion";
import { playHover, playClick, playSuccess } from "@/hooks/useSound";
import streetBanner from "@/assets/pulse-banner-street.jpg";

const links = [
  { label: "GitHub",           href: "https://github.com/aliasist",  icon: "⌥" },
  { label: "dev@aliasist.com", href: "mailto:dev@aliasist.com",       icon: "✉" },
  { label: "aliasist.com",     href: "https://www.aliasist.com",      icon: "◈" },
];

const ContactSection = () => {
  return (
    <section id="contact" className="py-28 px-6 bg-foreground text-background relative overflow-hidden">
      {/* Street banner background — very subtle */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.07] pointer-events-none"
        style={{ backgroundImage: `url(${streetBanner})` }}
      />
      {/* Overlay gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/80 via-foreground/60 to-foreground/90 pointer-events-none" />

      {/* Teal glow */}
      <div
        className="absolute -right-32 -bottom-32 w-[500px] h-[500px] rounded-full pointer-events-none opacity-[0.06]"
        style={{ background: "radial-gradient(circle, hsl(165 90% 42%), transparent 70%)" }}
      />

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
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-electric mb-6">
                <span className="w-2 h-2 bg-electric rounded-full animate-pulse" />
                Signal open
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-background mb-6 tracking-tight leading-tight">
                Make contact.
              </h2>

              <p className="text-base text-background/55 leading-relaxed mb-10 max-w-sm">
                <strong className="text-background/85 font-semibold">
                  Open to collaborations, internships, and interesting problems.
                </strong>{" "}
                Building in public, documenting the journey, always looking for
                teams working on open-source AI and security tooling.
              </p>

              <a
                href="mailto:dev@aliasist.com"
                onMouseEnter={() => playHover()}
                onClick={() => { playClick(); setTimeout(() => playSuccess(), 150); }}
                className="group relative inline-flex items-center gap-2 px-8 py-3.5 bg-electric text-background font-mono text-xs uppercase tracking-[0.14em] rounded-sm overflow-hidden transition-all hover:-translate-y-0.5 active:scale-95"
              >
                <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative">Send a message ↗</span>
              </a>

              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.15em] text-background/20">
                Responses prioritized by technical complexity & project fit
              </p>
            </div>

            {/* Right — links */}
            <div className="flex flex-col gap-px">
              {links.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  onMouseEnter={() => playHover()}
                  onClick={() => playClick()}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  whileHover={{ x: 6 }}
                  className="group flex items-center justify-between px-6 py-5 bg-background/5 border border-background/10 hover:bg-electric/10 hover:border-electric/30 transition-all font-mono text-sm text-background/60 hover:text-electric"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-electric/50 group-hover:text-electric transition-colors text-base">
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                  </div>
                  <span className="opacity-20 group-hover:opacity-100 transition-all">↗</span>
                </motion.a>
              ))}

              {/* Disclaimer */}
              <div className="mt-px border border-dashed border-background/12 p-5 bg-background/3">
                <p className="font-mono text-[11px] text-background/25 leading-relaxed">
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
