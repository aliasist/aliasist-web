import { useState, useRef, useEffect } from "react";
import { Terminal, ChevronRight } from "lucide-react";

interface CommandTerminalProps {
  onSystemMessage: (msg: string) => void;
  onCommandAction: (cmd: any) => void;
}

const KNOWN_COMMANDS = new Set(["help", "scan", "brief", "signals", "export", "clear"]);

/**
 * Anything that isn't a recognized single-word command is treated as a
 * natural-language question and routed to the site-wide AI chat, which
 * grounds eco questions in live planetary data (see functions/api/chat.ts +
 * services/workers-api's buildLiveContextBlock) — not just canned command
 * output. Same-origin call since /ecosist/ and /api/chat share aliasist.com.
 */
async function askEcosist(question: string): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: question }] }),
  });
  const data = (await res.json().catch(() => null)) as { response?: string; error?: string } | null;
  if (!res.ok || !data?.response) {
    throw new Error(data?.error ?? `Ask failed (${res.status})`);
  }
  return data.response;
}

export default function CommandTerminal({ onSystemMessage, onCommandAction }: CommandTerminalProps) {
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [history, setHistory] = useState<string[]>([
    "ECOSIST EARTH OS v1.0.0",
    "FEDERATED FEEDS: SECURE",
    "TYPE 'HELP' FOR COMMANDS, OR ASK A QUESTION"
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history, thinking]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || thinking) return;

    const raw = input.trim();
    const cmd = raw.toLowerCase();
    setHistory(prev => [...prev, `> ${raw}`]);
    setInput("");

    if (cmd === 'help') {
      setHistory(prev => [...prev,
        "AVAILABLE COMMANDS:",
        "  SCAN  - REFRESH ALL PLANETARY SIGNALS",
        "  BRIEF - VIEW INTELLIGENCE SUMMARY",
        "  SIGNALS - OPEN EARTH SIGNAL DECK",
        "  EXPORT - DOWNLOAD MD REPORT",
        "  CLEAR - WIPE TERMINAL HISTORY",
        "  Anything else is sent to the EcoSist AI as a question."
      ]);
    } else if (cmd === 'scan') {
      onCommandAction('scan');
      setHistory(prev => [...prev, "INITIATING PLANETARY SCAN..."]);
    } else if (cmd === 'brief') {
      onCommandAction('brief');
      setHistory(prev => [...prev, "ROUTING TO INTELLIGENCE DECK..."]);
    } else if (cmd === 'signals') {
      onCommandAction('signals');
      setHistory(prev => [...prev, "OPENING EARTH SIGNAL DECK..."]);
    } else if (cmd === 'export') {
      onCommandAction('export');
      setHistory(prev => [...prev, "GENERATING INTELLIGENCE REPORT..."]);
    } else if (cmd === 'clear') {
      setHistory([]);
    } else if (KNOWN_COMMANDS.has(cmd)) {
      setHistory(prev => [...prev, `COMMAND NOT RECOGNIZED: ${cmd}`]);
    } else {
      setThinking(true);
      setHistory(prev => [...prev, "ECOSIST AI: THINKING..."]);
      askEcosist(raw)
        .then((answer) => {
          setHistory(prev => [...prev.slice(0, -1), `ECOSIST AI: ${answer}`]);
        })
        .catch((err: Error) => {
          setHistory(prev => [...prev.slice(0, -1), `ECOSIST AI ERROR: ${err.message}`]);
        })
        .finally(() => setThinking(false));
    }
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-emerald-500/20 bg-black/60 p-4 font-mono shadow-2xl backdrop-blur-xl lg:h-2/3">
      <div className="mb-3 flex items-center gap-2 border-b border-emerald-500/10 pb-2 text-emerald-400/40">
        <Terminal className="size-3" />
        <span className="text-[9px] uppercase tracking-[0.3em]">Command Console</span>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 text-[10px] text-emerald-300/80 scrollbar-none">
        {history.map((line, i) => (
          <div key={i} className={line.startsWith('>') ? 'text-white' : ''}>{line}</div>
        ))}
      </div>

      <form onSubmit={handleCommand} className="mt-4 flex items-center gap-2 border-t border-emerald-500/10 pt-3">
        <ChevronRight className="size-3 text-emerald-400 animate-pulse" />
        <input
          autoFocus
          value={input}
          disabled={thinking}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-transparent text-[10px] text-white outline-none placeholder:text-emerald-400/20 disabled:opacity-40"
          placeholder={thinking ? "Waiting on EcoSist AI..." : "Enter command, or ask a question..."}
        />
      </form>
    </div>
  );
}
