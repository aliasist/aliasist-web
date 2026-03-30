import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playClick, playHover, playSuccess } from "@/hooks/useSound";

// All AI calls go through the llm-chat Cloudflare Worker — no API key in the browser
const CHAT_ENDPOINT = "https://assistant.aliasist.com/api/chat";

const SYSTEM_PROMPT = `You are the Aliasist AI — the intelligent assistant embedded in aliasist.com, the developer portfolio and project hub of Blake, an AI security developer and CS student.

About Aliasist:
- Tagline: "Adversarial by Nature. Defensive by Design."
- Focus: AI security (AiSec), adversarial machine learning, open-source security tooling
- Projects: Aliasist-Files-Abductor (file automation tool), DataSist (AI data center intelligence platform), more coming
- Stack: Python, JavaScript, React, Vite, Node.js
- Contact: dev@aliasist.com | github.com/aliasist
- Blake is self-taught, now formally studying Computer Information Systems, building toward AI security specialization

Your role: Answer questions about Aliasist, Blake's work, AI security, and tech topics. Be concise, technical, and direct. Keep responses under 3 paragraphs. Use the same brand voice — professional, alien-themed but grounded. Do not hallucinate project details.`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AliasistChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: "Signal acquired. I'm the Aliasist AI. Ask me about Blake's projects, AI security, or anything in the stack.",
      }]);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    playClick();
    setInput("");

    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);

    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...next.map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      // Worker streams SSE — read the full stream and extract text
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let reply = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          // Parse SSE lines: "data: {\"response\":\"...\"}" or "data: [DONE]"
          for (const line of chunk.split("\n")) {
            if (line.startsWith("data: ") && !line.includes("[DONE]")) {
              try {
                const json = JSON.parse(line.slice(6));
                if (json.response) reply += json.response;
              } catch {}
            }
          }
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", content: reply || "// signal_lost — try again" }]);
      playSuccess();
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "// transmission_error — check your connection." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="w-80 sm:w-96 bg-card border border-border rounded-sm shadow-[0_8px_40px_hsl(165_90%_42%_/_0.15)] overflow-hidden flex flex-col"
            style={{ height: 420 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/60 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-electric animate-pulse" />
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-electric">
                  Aliasist AI
                </span>
              </div>
              <button
                onClick={() => { playClick(); setOpen(false); }}
                className="text-muted-foreground hover:text-foreground transition-colors font-mono text-xs"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 text-xs font-mono leading-relaxed rounded-sm ${
                      msg.role === "user"
                        ? "bg-electric text-background"
                        : "bg-muted text-foreground/85 border border-border"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted border border-border px-3.5 py-2.5 rounded-sm">
                    <span className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-electric"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3 bg-background/40 backdrop-blur-sm">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="// send transmission..."
                  className="flex-1 bg-muted border border-border px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/50 rounded-sm outline-none focus:border-electric/50 transition-colors"
                  disabled={loading}
                  aria-label="Chat input"
                />
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  onMouseEnter={() => playHover()}
                  className="px-3 py-2 bg-electric text-background rounded-sm font-mono text-xs disabled:opacity-40 hover:bg-electric/85 transition-colors"
                  aria-label="Send message"
                >
                  ↑
                </button>
              </div>
              <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground/30 mt-2 text-center">
                Powered by Groq · Aliasist AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <motion.button
        onClick={() => { playClick(); setOpen((o) => !o); }}
        onMouseEnter={() => playHover()}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="w-14 h-14 rounded-full bg-electric text-background flex items-center justify-center shadow-[0_0_24px_hsl(165_90%_42%_/_0.4)] hover:shadow-[0_0_36px_hsl(165_90%_42%_/_0.6)] transition-shadow"
        aria-label={open ? "Close AI chat" : "Open AI chat"}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-lg font-mono"
            >
              ✕
            </motion.span>
          ) : (
            <motion.span
              key="ufo"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-2xl leading-none"
              style={{ filter: "drop-shadow(0 0 4px rgba(0,0,0,0.3))" }}
            >
              🛸
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default AliasistChat;
