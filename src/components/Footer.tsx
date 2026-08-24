import mascot from "@/assets/apple-touch-icon.png";
import bmcButton from "@/assets/bmc-button.svg";
import { footer } from "@/content/homepage";

const Footer = () => {
  return (
    <footer className="border-t border-background/10 bg-foreground px-4 py-10 shadow-footer-glow sm:px-8 sm:py-8 lg:px-12 xl:px-16">
      <div className="relative mx-auto flex w-full max-w-site flex-col items-center justify-between gap-6 sm:flex-row sm:gap-4">
        {/* Mascot branding, bottom left */}
        <img
          src={mascot}
          alt={footer.mascotAlt}
          className="hidden sm:block absolute -left-20 bottom-0 w-16 h-16 opacity-30 hover:opacity-60 transition-opacity duration-700 pointer-events-none select-none"
        />
        <p className="font-mono text-xs text-background/30 order-2 text-center sm:order-none sm:text-left">
          © Aliasist. Made with ❤️ from America
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 order-1 sm:order-none">
          <a
            href={footer.githubHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-background/30 hover:text-electric transition-colors duration-200 hover:drop-shadow-[0_0_10px_hsl(165_90%_42%_/_0.45)] rounded-sm outline-none focus-visible:text-electric focus-visible:ring-2 focus-visible:ring-white/55 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
          >
            {footer.githubLabel}
          </a>
          <a
            href={footer.emailHref}
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-background/30 hover:text-electric transition-colors duration-200 hover:drop-shadow-[0_0_10px_hsl(165_90%_42%_/_0.45)] rounded-sm outline-none focus-visible:text-electric focus-visible:ring-2 focus-visible:ring-white/55 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
          >
            {footer.emailLabel}
          </a>
          <a
            href={footer.buyMeACoffeeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-70 hover:opacity-100 transition-opacity duration-200 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-white/55 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
          >
            <img
              src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=aliasist&button_colour=40DCA5&font_colour=ffffff&font_family=Inter&outline_colour=000000&coffee_colour=FFDD00"
              alt="Buy me a coffee"
              className="h-8 w-auto"
            />
          </a>
        </div>

        <p className="font-mono text-[10px] text-electric/50 tracking-[0.12em] uppercase text-center order-3 sm:order-none sm:text-right">
          {footer.versionLine}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
