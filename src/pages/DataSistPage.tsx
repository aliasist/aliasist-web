import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "@/assets/logo-transparent.png";
import { playClick } from "@/hooks/useSound";

const DATASIST_URL =
  "https://www.perplexity.ai/computer/a/datasist-dist-public-0ilHep44QzGPA4yskFRNOQ";

const DataSistPage = () => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Header bar */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex-none flex items-center justify-between px-6 py-3 border-b border-border bg-background/90 backdrop-blur-xl z-10"
      >
        {/* Left: back + logo */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            onClick={() => playClick()}
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.1em] text-muted-foreground hover:text-electric transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </Link>
          <span className="h-4 w-px bg-border" />
          <a href="/" className="flex items-center" onClick={() => playClick()}>
            <img
              src={logo}
              alt="Aliasist"
              className="h-6 w-auto hover:drop-shadow-[0_0_6px_hsl(165_90%_42%_/_0.5)] transition-all"
            />
          </a>
        </div>

        {/* Center: label */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-[0.1em] text-muted-foreground">
            Aliasist /
          </span>
          <span className="text-xs font-mono uppercase tracking-[0.1em] text-electric font-semibold">
            DataSist
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.08em] text-electric">
            <span className="h-1.5 w-1.5 rounded-full bg-electric animate-pulse" />
            Live
          </span>
        </div>

        {/* Right: fullscreen */}
        <a
          href={DATASIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.1em] text-muted-foreground hover:text-electric transition-colors"
        >
          Full screen
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </motion.header>

      {/* Iframe */}
      <div className="relative flex-1 overflow-hidden">
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background z-10">
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 rounded-full border-2 border-border" />
              <div className="absolute inset-0 rounded-full border-2 border-t-electric animate-spin" />
            </div>
            <p className="text-xs font-mono uppercase tracking-[0.15em] text-muted-foreground">
              Loading DataSist…
            </p>
          </div>
        )}

        <motion.iframe
          src={DATASIST_URL}
          title="DataSist — AI Data Center Intelligence"
          className="w-full h-full border-0"
          onLoad={() => setLoaded(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          allow="fullscreen"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock"
        />
      </div>
    </div>
  );
};

export default DataSistPage;
