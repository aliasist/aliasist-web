import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, useClerk, useUser } from "@clerk/react";
import { readJsonBody, siteEndpoints } from "@/config/api";
import { openClerkSignIn } from "@/lib/open-clerk-sign-in";

/** Groq LLM worker vs Clerk-authenticated Pages KV room (`/api/chat-messages`). */
const USE_PAGES_CHAT_ROOM = import.meta.env.VITE_USE_PAGES_CHAT_ROOM === "true";
const LLM_CHAT_ENDPOINT = siteEndpoints.chatApi;
const ROOM_CHAT_ENDPOINT = siteEndpoints.chatMessagesApi;

type RoomMessage = {
  id: string;
  userId: string;
  displayName: string;
  content: string;
  timestamp: string;
};

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

const WELCOME_SIGNED_IN =
  "Signal acquired. I'm the Aliasist AI. Ask me about Blake's projects, AI security, or anything in the stack.";

const WELCOME_SIGNED_OUT =
  "// Secure channel — sign in to transmit. Your Clerk session will power upcoming chat history and authenticated rooms.";

const WELCOME_ROOM =
  "// Room linked — messages persist in KV when configured on Pages. Transmit when signed in.";

const AliasistChat = () => {
  const clerk = useClerk();
  const { isLoaded, isSignedIn, getToken, userId } = useAuth();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !isLoaded) return;

    if (USE_PAGES_CHAT_ROOM && isSignedIn) {
      void (async () => {
        setLoading(true);
        try {
          const token = await getToken();
          if (!token) {
            setMessages([{ role: "assistant", content: WELCOME_SIGNED_OUT }]);
            return;
          }
          const res = await fetch(ROOM_CHAT_ENDPOINT, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await readJsonBody<{ messages?: RoomMessage[] }>(res);
          const rows = Array.isArray(data?.messages) ? data.messages : [];
          const mapped: Message[] = rows.map((m) =>
            m.userId === userId
              ? { role: "user", content: m.content }
              : { role: "assistant", content: `${m.displayName}: ${m.content}` },
          );
          setMessages(
            mapped.length ? mapped : [{ role: "assistant", content: WELCOME_ROOM }],
          );
        } catch {
          setMessages([
            { role: "assistant", content: "// Could not load room — check /api/chat-messages." },
          ]);
        } finally {
          setLoading(false);
        }
      })();
      return;
    }

    setMessages([
      {
        role: "assistant",
        content: isSignedIn ? WELCOME_SIGNED_IN : WELCOME_SIGNED_OUT,
      },
    ]);
  }, [open, isLoaded, isSignedIn, getToken, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading || !isLoaded || !isSignedIn) return;
    setInput("");

    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        setMessages((prev) => [...prev, { role: "assistant", content: "// Missing session token." }]);
        return;
      }

      if (USE_PAGES_CHAT_ROOM) {
        const displayName =
          user?.username ||
          user?.fullName ||
          user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
          "Anonymous";
        const res = await fetch(ROOM_CHAT_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: text, displayName }),
        });
        const postData = await readJsonBody<{ message?: RoomMessage; error?: string }>(res);
        if (!res.ok || !postData?.message) {
          const err = postData?.error ?? `HTTP ${res.status}`;
          setMessages((prev) => [...prev, { role: "assistant", content: `// ${err}` }]);
          return;
        }

        const refresh = await fetch(ROOM_CHAT_ENDPOINT, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const roomData = await readJsonBody<{ messages?: RoomMessage[] }>(refresh);
        const rows = Array.isArray(roomData?.messages) ? roomData.messages : [];
        const mapped: Message[] = rows.map((m) =>
          m.userId === userId
            ? { role: "user", content: m.content }
            : { role: "assistant", content: `${m.displayName}: ${m.content}` },
        );
        setMessages(mapped.length ? mapped : [{ role: "assistant", content: WELCOME_ROOM }]);
        return;
      }

      const res = await fetch(LLM_CHAT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...next.map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      const data = await readJsonBody<{ response?: string; error?: string }>(res);
      const reply =
        data?.error && !data.response
          ? `// ${data.error}`
          : data?.response ?? (res.ok ? "// signal_lost — try again" : `// signal_lost — ${res.status}`);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "// transmission_error — check your connection." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-[210] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="w-[min(22rem,calc(100vw-2rem))] sm:w-96 max-h-[calc(100dvh-7rem)] bg-card border border-border rounded-sm shadow-electric-sm overflow-hidden flex flex-col"
            style={{ height: 420 }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/60 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-electric animate-pulse" />
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-electric">
                  {USE_PAGES_CHAT_ROOM ? "Aliasist Room" : "Aliasist AI"}
                </span>
                {isLoaded && !isSignedIn ? (
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground/70 border border-border/60 px-1.5 py-px rounded-sm">
                    Locked
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => { setOpen(false); }}
                className="text-muted-foreground hover:text-foreground transition-colors font-mono text-xs"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {!isLoaded ? (
                <div className="flex h-full min-h-[120px] items-center justify-center">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
                    Loading session…
                  </span>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={`${msg.role}-${i}`}
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
                </>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-border p-3 bg-background/40 backdrop-blur-sm">
              {!isLoaded ? (
                <div className="h-10 rounded-sm bg-muted/50 border border-border animate-pulse" aria-hidden />
              ) : !isSignedIn ? (
                <div className="space-y-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80 text-center leading-relaxed">
                    Sign in with Clerk to send messages. Same session as the navbar — ready for authenticated chat APIs.
                  </p>
                  <button
                    type="button"
                    className="w-full cursor-pointer py-2.5 rounded-sm bg-electric text-background font-mono text-xs uppercase tracking-[0.14em] hover:bg-electric/90 transition-[colors,box-shadow] shadow-electric-sm hover:shadow-electric-md"
                    onClick={() => {
                      openClerkSignIn(clerk);
                    }}
                  >
                    Sign in to chat
                  </button>
                </div>
              ) : (
                <>
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
                      type="button"
                      onClick={() => void send()}
                      disabled={loading || !input.trim()}
                      className="px-3 py-2 bg-electric text-background rounded-sm font-mono text-xs shadow-electric-xs disabled:opacity-40 hover:bg-electric/85 hover:shadow-electric-sm transition-[colors,box-shadow]"
                      aria-label="Send message"
                    >
                      ↑
                    </button>
                  </div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground/30 mt-2 text-center">
                    {USE_PAGES_CHAT_ROOM
                      ? "Signed in · Clerk · /api/chat-messages"
                      : "Signed in · Groq · Aliasist AI"}
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => { setOpen((o) => !o); }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="w-14 h-14 rounded-full bg-electric text-background flex items-center justify-center shadow-electric-sm hover:shadow-electric-md transition-shadow duration-300"
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
