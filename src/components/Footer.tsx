import mascot from "../../images/aliasist-mascot-final.png";
import { playHover } from "@/hooks/useSound";

const Footer = () => {
  return (
    <footer className="py-8 px-6 bg-foreground border-t border-background/10">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 relative">
                {/* Mascot branding, bottom left */}
                <img
                  src={mascot}
                  alt="Aliasist Mascot UFO"
                  className="hidden sm:block absolute -left-20 bottom-0 w-16 h-16 opacity-30 hover:opacity-60 transition-opacity duration-700 pointer-events-none select-none"
                />
        <p className="font-mono text-xs text-background/30">
          © {new Date().getFullYear()} Aliasist. All rights reserved.
        </p>

        <div className="flex items-center gap-5">
          <a
            href="https://github.com/aliasist"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => playHover()}
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-background/30 hover:text-electric transition-colors"
          >
            GitHub
          </a>
          <a
            href="mailto:dev@aliasist.com"
            onMouseEnter={() => playHover()}
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-background/30 hover:text-electric transition-colors"
          >
            Email
          </a>
        </div>

        <p className="font-mono text-[10px] text-electric/50 tracking-[0.12em] uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-electric/60 animate-pulse" />
          Aliasist v1.1.0 // Signal Active
        </p>
      </div>
    </footer>
  );
};

export default Footer;
