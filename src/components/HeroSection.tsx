import { motion } from "framer-motion";
import { ArrowRight, Mail, Terminal } from "lucide-react";
import { hero } from "@/content/homepage";
import { HomeGoogleAuth } from "@/components/HomeGoogleAuth";

const HeroSection = () => {
  return (
    <section
      id="top"
      className="relative flex min-h-[100dvh] min-h-screen items-center justify-center overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(hsl(var(--electric)_/_0.16)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--electric)_/_0.16)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]"
      >
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-site flex-col items-center px-4 pt-14 pb-14 text-center sm:px-8 sm:pt-16 lg:px-12 xl:px-16">
        <motion.div
          className="mb-6 w-full max-w-full overflow-hidden flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="sr-only">{hero.wordmark}</h1>
          <pre
            aria-hidden="true"
            className="font-mono select-none text-center font-black whitespace-pre leading-[1.12] sm:leading-[1.15] tracking-[-0.01em] text-electric text-[7.5px] min-[390px]:text-[9px] min-[480px]:text-[11.5px] sm:text-[14.5px] md:text-[18px] lg:text-[21px] xl:text-[23px]"
          >
{` █████╗ ██╗     ██╗ █████╗ ███████╗██╗███████╗████████╗
██╔══██╗██║     ██║██╔══██╗██╔════╝██║██╔════╝╚══██╔══╝
███████║██║     ██║███████║███████╗██║███████╗   ██║   
██╔══██║██║     ██║██╔══██║╚════██║██║╚════██║   ██║   
██║  ██║███████╗██║██║  ██║███████║██║███████║   ██║   
╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═╝╚══════╝╚═╝╚══════╝   ╚═╝`}
          </pre>
        </motion.div>

        <motion.p
          className="mb-4 text-sm text-electric/65"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.7 }}
        >
          {hero.tagline}
        </motion.p>

        <motion.p
          className="readable-copy mx-auto mb-8 border-y border-electric/25 bg-background/90 px-4 py-4 text-foreground/86 sm:px-8 sm:py-5 sm:text-lg"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          {hero.subcopy}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.6 }}
          className="hero-cta-group mt-2 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <a
            href={hero.ctaContactHref}
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-electric px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-electric/90 active:scale-95"
          >
            <span>{hero.ctaContact}</span>
            <ArrowRight className="size-3.5" aria-hidden />
          </a>
          <a
            href={hero.ctaSecondaryHref}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-border bg-card px-6 py-3 text-sm text-foreground transition-colors hover:border-electric/60 hover:text-electric active:scale-95"
          >
            <Mail className="size-3.5" aria-hidden />
            {hero.ctaSecondary}
          </a>
          <a
            href={hero.ctaOsHref}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-electric/40 bg-card px-6 py-3 font-mono text-sm text-electric transition-colors hover:border-electric hover:bg-electric/5 active:scale-95"
          >
            <Terminal className="size-3.5" aria-hidden />
            {hero.ctaOs}
          </a>
        </motion.div>

        <div className="mt-6 flex justify-center">
          <HomeGoogleAuth />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
