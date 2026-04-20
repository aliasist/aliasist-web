import { useEffect, useState } from "react";
import {
  Show,
  SignInButton,
  useAuth,
  useUser,
  UserButton,
} from "@clerk/react";

interface Message {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  email?: string;
  content: string;
  timestamp: string;
}

export default function Chatroom() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useUser();
  const auth = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function loadMessages() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/chat-messages");
        const data = (await response.json()) as { messages?: Message[]; error?: string };

        if (!response.ok) {
          throw new Error(data.error || "Failed to load messages.");
        }

        if (!cancelled) {
          setMessages(Array.isArray(data.messages) ? data.messages : []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load messages.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadMessages();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user.isSignedIn || sending) return;

    const token = await auth.getToken();
    if (!token) {
      setError("You need an active Clerk session before posting.");
      return;
    }

    const content = input.trim();
    const message: Message = {
      id: `optimistic-${crypto.randomUUID()}`,
      userId: user.user?.id,
      displayName:
        user.user?.username ||
        user.user?.firstName ||
        user.user?.primaryEmailAddress?.emailAddress ||
        "Anonymous",
      avatarUrl: user.user?.imageUrl,
      email: user.user?.primaryEmailAddress?.emailAddress,
      content,
      timestamp: new Date().toISOString(),
    };

    setError(null);
    setSending(true);
    setInput("");
    setMessages((prev) => [...prev, message]);

    try {
      const response = await fetch("/api/chat-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName: message.displayName,
          avatarUrl: message.avatarUrl,
          email: message.email,
          content: message.content,
        }),
      });

      const data = (await response.json().catch(() => null)) as { message?: Message; error?: string } | null;

      if (response.status === 405) {
        const msg = "Chat server not deployed on this domain. Deploy functions/api/chat-messages to Cloudflare Pages and configure CLERK_SECRET_KEY, CLERK_PUBLISHABLE_KEY, and CHATROOM KV binding.";
        console.error("chat send failed:", { status: response.status, url: "/api/chat-messages" });
        setError(msg);
        throw new Error(msg);
      }

      if (!response.ok || !data?.message) {
        throw new Error(data?.error || "Failed to send message.");
      }

      setMessages((prev) =>
        prev.map((entry) => (entry.id === message.id ? data.message! : entry)),
      );
    } catch (sendError) {
      setMessages((prev) => prev.filter((entry) => entry.id !== message.id));
      setInput(content);
      setError(sendError instanceof Error ? sendError.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="relative py-24 px-4" id="chatroom">
      <div className="max-w-2xl mx-auto bg-background/80 border border-border/30 rounded-md p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Aliasist Chatroom</h2>
        <Show when="signed-in">
          <div className="flex items-center gap-3 mb-4 p-2 rounded bg-muted/20 border border-border/20">
            {user.user?.imageUrl && (
              <img src={user.user.imageUrl} alt="avatar" className="w-8 h-8 rounded-full border" />
            )}
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">{user.user?.username || user.user?.firstName || user.user?.primaryEmailAddress?.emailAddress}</span>
              <span className="text-xs text-muted-foreground">{user.user?.primaryEmailAddress?.emailAddress}</span>
            </div>
            <div className="ml-auto"><UserButton /></div>
          </div>
        </Show>
        <div className="mb-4 h-64 overflow-y-auto bg-muted/10 rounded p-3 flex flex-col gap-2">
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading messages...</p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : messages.length === 0 ? (
            <p className="text-muted-foreground text-sm">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="text-sm flex items-center gap-2">
                {msg.avatarUrl && <img src={msg.avatarUrl} alt="avatar" className="w-6 h-6 rounded-full border" />}
                <span className="font-bold text-electric">{msg.displayName}:</span> {msg.content}
              </div>
            ))
          )}
        </div>
        <Show when="signed-in">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              className="flex-1 border border-border/30 rounded px-3 py-2 bg-background text-foreground"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
            />
            <button
              type="submit"
              disabled={sending}
              className="bg-electric text-black px-4 py-2 rounded font-mono uppercase text-xs tracking-widest hover:bg-electric/90"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </Show>
        <Show when="signed-out">
          <div className="flex flex-col items-center gap-2">
            <p className="text-center text-muted-foreground">Sign in to join the chat.</p>
            <SignInButton mode="modal" />
          </div>
        </Show>
      </div>
    </section>
  );
}
