import { motion, AnimatePresence } from "framer-motion";
import { playHover, playClick, playSuccess } from "@/hooks/useSound";
import streetBanner from "@/assets/pulse-banner-street.jpg";
import { useState, useRef } from "react";

const CONTACT_API = "https://llm-chat.bchooper0730.workers.dev/api/contact";

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

type FormState = "idle" | "sending" | "success" | "error";

const ContactSection = () => {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [message, setMessage] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg]   = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formState === "sending") return;
    setFormState("sending");
    setErrorMsg("");
    playClick();
    try {
      const res = await fetch(CONTACT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Unknown error");
      setFormState("success");
      playSuccess();
      setName(""); setEmail(""); setMessage("");
    } catch (err) {
      setFormState("error");
      setErrorMsg(err instanceof Error ? err.message : "Transmission failed");
    }
  };

  const inputClass = "w-full bg-background/8 border border-background/15 text-background placeholder:text-background/25 font-mono text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-electric/50 focus:bg-electric/5 transition-all duration-200";

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
            {/* Left — contact form */}
            <div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-electric mb-6">
                <span className="w-2 h-2 bg-electric rounded-full animate-pulse" />
                Signal open
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-background mb-4 tracking-tight leading-tight">
                Make contact.
              </h2>

              <p className="text-sm text-background/50 leading-relaxed mb-8 max-w-sm">
                <strong className="text-background/75 font-semibold">
                  Open to collaborations, internships, and interesting problems.
                </strong>{" "}
                Building in public, pursuing AiSec.
              </p>

              {/* ── Contact form ── */}
              <AnimatePresence mode="wait">
                {formState === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-electric/30 bg-electric/8 px-6 py-8 rounded-sm"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-2 h-2 rounded-full bg-electric animate-pulse" />
                      <span className="font-mono text-xs uppercase tracking-[0.18em] text-electric">Transmission received</span>
                    </div>
                    <p className="font-mono text-sm text-background/60 leading-relaxed">
                      Message logged. Responses prioritized by technical complexity and project alignment.
                    </p>
                    <button
                      onClick={() => setFormState("idle")}
                      className="mt-5 font-mono text-[11px] uppercase tracking-[0.1em] text-background/35 hover:text-electric transition-colors"
                    >
                      Send another ↩
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    ref={formRef}
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col gap-3"
                  >
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        maxLength={100}
                        className={inputClass}
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        maxLength={200}
                        className={inputClass}
                      />
                    </div>
                    <textarea
                      placeholder="Message — what are you working on?"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      required
                      maxLength={5000}
                      rows={5}
                      className={`${inputClass} resize-none`}
                    />

                    {formState === "error" && (
                      <p className="font-mono text-[11px] text-red-400/80">
                        // error: {errorMsg || "transmission failed — try dev@aliasist.com"}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={formState === "sending"}
                      onMouseEnter={() => playHover()}
                      className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-electric text-background font-mono text-xs uppercase tracking-[0.14em] rounded-sm overflow-hidden transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      <span className="relative">
                        {formState === "sending" ? "// transmitting..." : "Send message ↗"}
                      </span>
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Direct links below form */}
              <div className="flex flex-col gap-px mt-5">
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
                  { n: "340+", l: "Data Centers" },
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
