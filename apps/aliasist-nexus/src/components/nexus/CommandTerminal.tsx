import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { LiveSignals } from '../../lib/useLiveSignals';

interface CommandTerminalProps {
  onSystemMessage?: (message: string) => void;
  onCommandAction?: (command: "brief" | "export" | "scan") => void;
  signals: Pick<LiveSignals, "status" | "sourceHealth" | "lastUpdated">;
}

const CommandTerminal = ({ onSystemMessage, onCommandAction, signals }: CommandTerminalProps) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([
    'Welcome to NEXUS Command v2.8',
    'Type "help" for a list of available commands.',
    'System status: STANDBY',
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.toLowerCase().trim();
    const newHistory = [...history, `> ${input}`];

    switch (cmd) {
      case 'help':
        newHistory.push('Available commands:', '  brief - Open live planetary brief', '  export - Download brief as Markdown', '  scan - Scan public signal feeds', '  status - System health check', '  clear - Clear terminal');
        break;
      case 'abduct':
        newHistory.push('INITIATING SIGNAL ABDUCTION...', 'Acquiring public endpoint...', 'Source secured.', 'Routing to Nexus Core.');
        onSystemMessage?.('SIGNAL ABDUCTION COMPLETE');
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#00ffcc', '#ffffff', '#72ff9c']
        });
        break;
      case 'scan':
        newHistory.push('SCANNING GLOBAL FREQUENCIES...', 'Refreshing NOAA and USGS source adapters...');
        onSystemMessage?.('PLANETARY SCAN IN PROGRESS');
        onCommandAction?.('scan');
        break;
      case 'status':
        newHistory.push(
          'CORE: STABLE',
          `SIGNAL: ${signals.status.toUpperCase()}`,
          `USGS: ${signals.sourceHealth.usgs ? 'ONLINE' : 'OFFLINE'}`,
          `NOAA: ${signals.sourceHealth.noaa ? 'ONLINE' : 'OFFLINE'}`,
          `LAST DATA: ${signals.lastUpdated ? new Date(signals.lastUpdated).toISOString() : 'UNAVAILABLE'}`,
        );
        onSystemMessage?.('SYSTEM HEALTH VERIFIED');
        break;
      case 'brief':
        newHistory.push('GENERATING PLANETARY BRIEF...', 'Seismic and solar signals correlated.', 'Open Signals workspace for the live intelligence view.');
        onSystemMessage?.('PLANETARY BRIEF READY');
        onCommandAction?.('brief');
        break;
      case 'export':
        newHistory.push('COMPILING VERIFIED SIGNALS...', 'Markdown brief generated.', 'Download transfer initiated.');
        onSystemMessage?.('PLANETARY BRIEF EXPORTED');
        onCommandAction?.('export');
        break;
      case 'clear':
        setHistory(['Terminal cleared.']);
        setInput('');
        return;
      default:
        newHistory.push(`Command not recognized: ${cmd}`, 'Try: help, scan, brief, export, status, abduct, clear');
    }

    setHistory(newHistory);
    setInput('');
  };

  return (
    <div className="flex-1 bg-black/40 border border-emerald-500/20 rounded-lg flex flex-col overflow-hidden">
      <div className="h-8 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-3 h-3" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Grand Terminal</span>
        </div>
        <div className="flex gap-1.5">
           <div className="w-2 h-2 rounded-full bg-red-500/20" />
           <div className="w-2 h-2 rounded-full bg-amber-500/20" />
           <div className="w-2 h-2 rounded-full bg-emerald-500/20" />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 p-4 font-mono text-[10px] overflow-y-auto space-y-1 custom-scrollbar">
        {history.map((line, i) => (
          <div key={i} className={line.startsWith('>') ? 'text-white font-bold' : 'text-emerald-500/80'}>
            {line}
          </div>
        ))}
      </div>

      <form onSubmit={handleCommand} className="h-10 bg-black/40 border-t border-emerald-500/20 flex items-center px-2 gap-2">
        <ChevronRight className="w-3 h-3 opacity-40" />
        <input
          aria-label="Nexus command"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ENTER COMMAND..."
          className="flex-1 bg-transparent border-none outline-none text-[10px] text-white placeholder:text-emerald-500/20 uppercase font-mono"
        />
        <button type="submit" aria-label="Run command" className="p-1.5 hover:bg-emerald-500/10 rounded transition-colors group">
          <Send className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:text-emerald-400" />
        </button>
      </form>
    </div>
  );
};

export default CommandTerminal;
