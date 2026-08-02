import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { subscribeSection } from "@/content/homepage";
import { readJsonBody, siteEndpoints } from "@/config/api";

const SUBSCRIBE_API = siteEndpoints.subscribeApi;

type FormState = "idle" | "sending" | "success" | "error";

const SubscribeSection = () => {
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formState === "sending") return;
    setFormState("sending");
    setErrorMsg("");
    try {
      const res = await fetch(SUBSCRIBE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await readJsonBody<{ ok?: boolean; error?: string }>(res);
      if (!data) throw new Error("Invalid response from server");
      if (!res.ok || !data.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setFormState("success");
      setEmail("");
    } catch (err) {
      setFormState("error");
      setErrorMsg(err instanceof Error ? err.message : "Subscription failed");
    }
  };

  const inputClass =
    "w-full bg-background/[0.14] border border-background/30 text-background placeholder:text-background/55 font-[family-name:var(--font-heading)] text-base md:text-sm font-medium leading-normal px-4 py-3 rounded-sm antialiased caret-electric shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] focus:outline-none focus-visible:border-electric focus-visible:bg-background/[0.18] focus-visible:shadow-electric-xs focus-visible:placeholder:text-background/40 focus-visible:ring-2 focus-visible:ring-electric/45 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground transition-all duration-200";

  return (
    <section
      id="subscribe"
      aria-labelledby="subscribe-heading"
      className="relative overflow-hidden bg-foreground px-4 py-24 text-background sm:px-8 lg:px-12 xl:px-16"
    >
      <div className="absolute -left-24 -top-24 w-[420px] h-[420px] rounded-full pointer-events-none opacity-[0.05]"
        style={{ background: "radial-gradient(circle, hsl(var(--violet)), transparent 70%)" }}
      />

      <div className="relative z-10 mx-auto w-full max-w-site">
        <div className="section-divider mb-10 [&>span]:text-background/35 before:bg-background/10 after:bg-background/10">
          <span>{subscribeSection.dividerLabel}</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-xl text-center"
        >
          <div className="font-mono text-xs uppercase tracking-[0.14em] text-electric mb-4">
            {subscribeSection.introLabel}
          </div>

          <h2 id="subscribe-heading" className="mb-4 text-3xl font-bold text-background sm:text-4xl">
            {subscribeSection.headline}
          </h2>

          <p className="readable-copy mb-8 text-background/60">
            <strong className="text-background/75 font-semibold">{subscribeSection.introStrong}</strong>{" "}
            {subscribeSection.introRest}
          </p>

          <AnimatePresence mode="wait">
            {formState === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-electric/30 bg-electric/8 px-6 py-8 rounded-sm shadow-electric-xs text-left sm:text-center"
              >
                <div className="mb-3">
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-electric">
                    {subscribeSection.successTitle}
                  </span>
                </div>
                <p className="font-mono text-sm text-background/60 leading-relaxed">
                  {subscribeSection.successBody}
                </p>
                <button
                  type="button"
                  onClick={() => setFormState("idle")}
                  className="mt-5 rounded-sm font-mono text-[11px] uppercase tracking-[0.1em] text-background/35 outline-none transition-colors hover:text-electric focus-visible:text-electric focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
                >
                  {subscribeSection.sendAnother}
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-3"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder={subscribeSection.placeholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    maxLength={200}
                    className={inputClass}
                  />
                  <button
                    type="submit"
                    disabled={formState === "sending"}
                    className="group relative inline-flex shrink-0 items-center justify-center gap-2 px-8 py-3.5 bg-electric text-background font-mono text-xs uppercase tracking-[0.14em] rounded-sm outline-none overflow-hidden shadow-electric-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-electric-md active:scale-95 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-electric-sm"
                  >
                    <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative">
                      {formState === "sending" ? subscribeSection.submitSending : subscribeSection.submitIdle}
                    </span>
                  </button>
                </div>

                {formState === "error" && (
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-mono text-[11px] text-red-400/80">
                      {subscribeSection.errorPrefix} {errorMsg || subscribeSection.errorFallback}
                    </p>
                    <button
                      type="button"
                      onClick={() => { setFormState("idle"); setErrorMsg(""); }}
                      className="shrink-0 font-mono text-[11px] uppercase tracking-[0.1em] text-background/40 hover:text-electric transition-colors outline-none focus-visible:text-electric"
                    >
                      Try again ↩
                    </button>
                  </div>
                )}

                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-background/30 mt-1">
                  {subscribeSection.disclaimer}
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default SubscribeSection;
