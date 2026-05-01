import { Link } from "react-router-dom";
import Starfield from "@/components/Starfield";

const NotFound = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col">
      <Starfield />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center gap-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-electric/70">
          404 // ROUTE NOT FOUND
        </div>
        <h1
          className="glitch-text text-5xl sm:text-7xl font-bold tracking-tight text-foreground select-none"
          data-text="UNKNOWN"
        >
          UNKNOWN
        </h1>
        <p className="font-mono text-sm text-muted-foreground max-w-md leading-relaxed">
          This URL is not routed on aliasist.com. Return to mission control below.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-8 py-3 bg-electric text-background font-mono text-xs uppercase tracking-[0.14em] rounded-[var(--radius)] hover:bg-electric/90 transition-colors"
        >
          Return home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
