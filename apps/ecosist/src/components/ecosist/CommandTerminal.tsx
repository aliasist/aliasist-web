import { useState, useRef, useEffect } from "react";
import { Terminal, ChevronRight } from "lucide-react";

interface CommandTerminalProps {
  onSystemMessage: (msg: string) => void;
  onCommandAction: (cmd: any) => void;
}

export default function CommandTerminal({ onSystemMessage, onCommandAction }: CommandTerminalProps) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([
    "ECOSIST EARTH OS v1.0.0",
    "FEDERATED FEEDS: SECURE",
    "TYPE 'HELP' FOR COMMANDS"
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.toLowerCase().trim();
    setHistory(prev => [...prev, `> ${input}`]);
    setInput("");

    if (cmd === 'help') {
      setHistory(prev => [...prev, 
        "AVAILABLE COMMANDS:",
        "  SCAN  - REFRESH ALL PLANETARY SIGNALS",
        "  BRIEF - VIEW INTELLIGENCE SUMMARY",
        "  SIGNALS - OPEN EARTH SIGNAL DECK",
        "  EXPORT - DOWNLOAD MD REPORT",
        "  CLEAR - WIPE TERMINAL HISTORY"
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
    } else {
      setHistory(prev => [...prev, `COMMAND NOT RECOGNIZED: ${cmd}`]);
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
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-transparent text-[10px] text-white outline-none placeholder:text-emerald-400/20"
          placeholder="Enter command..."
        />
      </form>
    </div>
  );
}
