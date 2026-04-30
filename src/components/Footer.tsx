import mascot from "@/assets/mascot.svg";
import { playHover } from "@/hooks/useSound";
import { footer } from "@/content/homepage";

const Footer = () => {
  return (
    <footer className="py-8 px-6 bg-foreground border-t border-background/10">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 relative">
                {/* Mascot branding, bottom left */}
                <img
                  src={mascot}
                  alt={footer.mascotAlt}
                  className="hidden sm:block absolute -left-20 bottom-0 w-16 h-16 opacity-30 hover:opacity-60 transition-opacity duration-700 pointer-events-none select-none"
                />
        <p className="font-mono text-xs text-background/30">
          © {new Date().getFullYear()} {footer.brandName}. All rights reserved.
        </p>

        <div className="flex items-center gap-5">
          <a
            href={footer.githubHref}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => playHover()}
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-background/30 hover:text-electric transition-colors"
          >
            {footer.githubLabel}
          </a>
          <a
            href={footer.emailHref}
            onMouseEnter={() => playHover()}
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-background/30 hover:text-electric transition-colors"
          >
            {footer.emailLabel}
          </a>
        </div>

        <p className="font-mono text-[10px] text-electric/50 tracking-[0.12em] uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-electric/60 animate-pulse" />
          {footer.versionLine}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
