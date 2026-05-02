import mascot from "@/assets/aliasist-logo-brand20.svg";
import { footer } from "@/content/homepage";

const Footer = () => {
  return (
    <footer className="border-t border-background/10 bg-foreground px-4 py-8 shadow-footer-glow sm:px-8 lg:px-12 xl:px-16">
      <div className="relative mx-auto flex w-full max-w-site flex-col items-center justify-between gap-4 sm:flex-row">
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
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-background/30 hover:text-electric transition-colors duration-200 hover:drop-shadow-[0_0_10px_hsl(165_90%_42%_/_0.45)]"
          >
            {footer.githubLabel}
          </a>
          <a
            href={footer.linkedinHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-background/30 hover:text-electric transition-colors duration-200 hover:drop-shadow-[0_0_10px_hsl(165_90%_42%_/_0.45)]"
          >
            {footer.linkedinLabel}
          </a>
          <a
            href={footer.emailHref}
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-background/30 hover:text-electric transition-colors duration-200 hover:drop-shadow-[0_0_10px_hsl(165_90%_42%_/_0.45)]"
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
