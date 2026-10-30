import { Link } from "react-router-dom";
import Starfield from "@/components/Starfield";

const NotFound = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col">
      <Starfield />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center gap-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-electric/70">
          404 // SIGNAL LOST
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-foreground select-none">
          UNKNOWN
        </h1>
        <p className="font-mono text-sm text-muted-foreground max-w-md leading-relaxed">
          Nothing out here. This page doesn't exist, or it got abducted.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-8 py-3 bg-electric text-background font-mono text-xs uppercase tracking-[0.14em] rounded-[var(--radius)] hover:bg-electric/90 transition-colors"
        >
          Take me home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
