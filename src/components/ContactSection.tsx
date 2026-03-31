import { motion } from "framer-motion";
import { playHover, playClick, playSuccess } from "@/hooks/useSound";
import streetBanner from "@/assets/pulse-banner-street.jpg";

const GitHubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const links = [
  { label: "GitHub",           href: "https://github.com/aliasist",  Icon: GitHubIcon },
  { label: "dev@aliasist.com", href: "mailto:dev@aliasist.com",       Icon: MailIcon },
];

const suite = [
  { label: "DataSist",  sub: "AI Data Center Intel",      href: "https://datasist-frontend.pages.dev", icon: "🌐" },
  { label: "PulseSist", sub: "Stock Market Intelligence",  href: "https://pulse.aliasist.com",          icon: "📈" },
  { label: "SpaceSist", sub: "Live Space Portal",          href: "https://space.aliasist.com",           icon: "🌌" },
  { label: "TikaSist",  sub: "TikTok Keyword Intelligence", href: "https://tikasist.pages.dev",          icon: "👁️" },
];

const ContactSection = () => {
  return (
    <section id="contact" className="py-28 px-6 bg-foreground text-background relative overflow-hidden">
      {/* Street banner background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: `url(${streetBanner})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/80 via-foreground/60 to-foreground/90 pointer-events-none" />
      <div className="absolute -right-32 -bottom-32 w-[500px] h-[500px] rounded-full pointer-events-none opacity-[0.05]"
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
                Building in public, pursuing AiSec, always looking for teams
                working on open-source AI and security tooling.
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

              {/* Contact links */}
              <div className="flex flex-col gap-px mt-6">
                {links.map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    onMouseEnter={() => playHover()}
                    onClick={() => playClick()}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.08 }}
                    whileHover={{ x: 4 }}
                    className="group flex items-center justify-between px-5 py-4 bg-background/5 border border-background/10 hover:bg-electric/10 hover:border-electric/25 transition-all font-mono text-sm text-background/55 hover:text-electric"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-electric/40 group-hover:text-electric transition-colors"><link.Icon /></span>
                      <span>{link.label}</span>
                    </div>
                    <span className="opacity-20 group-hover:opacity-100 transition-all">↗</span>
                  </motion.a>
                ))}
              </div>

              <div className="mt-px border border-dashed border-background/12 p-4">
                <p className="font-mono text-[11px] text-background/25 leading-relaxed">
                  // Currently iterating on this system. Responses prioritized by
                  technical complexity and project alignment.
                </p>
              </div>
            </div>

            {/* Right — The Aliasist Suite */}
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/30 mb-5">
                // The Aliasist Suite
              </p>
              <div className="flex flex-col gap-0.5">
                {suite.map((app, i) => (
                  <motion.a
                    key={app.label}
                    href={app.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => playHover()}
                    onClick={() => playClick()}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    whileHover={{ x: 6 }}
                    className="group flex items-center justify-between px-6 py-5 bg-background/5 border border-background/10 hover:bg-electric/10 hover:border-electric/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{app.icon}</span>
                      <div>
                        <p className="font-mono text-sm font-semibold text-background/80 group-hover:text-electric transition-colors">
                          {app.label}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-background/35 mt-0.5">
                          {app.sub}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-electric/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-electric animate-pulse" />
                        Live
                      </span>
                      <span className="opacity-20 group-hover:opacity-100 group-hover:text-electric text-background transition-all font-mono">↗</span>
                    </div>
                  </motion.a>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-3 gap-0.5">
                {[
                  { n: "5", l: "Live Apps" },
                  { n: "7", l: "APIs" },
                  { n: "48+", l: "Data Centers" },
                ].map((s) => (
                  <div key={s.l} className="bg-background/5 border border-background/10 p-4 text-center">
                    <div className="text-xl font-bold text-electric">{s.n}</div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-background/30 mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
