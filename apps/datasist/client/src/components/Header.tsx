import { Show, UserButton, useAuth } from "@clerk/react";
import { Map, BarChart3, Globe, Zap, Shield } from "lucide-react";
import { hasClerkKey } from "@/lib/clerk";
import { isDatasistAdmin } from "@/lib/adminAccess";
import type { ActiveView } from "../App";

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (v: ActiveView) => void;
}

const NAV_BASE: Array<{
  view: ActiveView;
  label: string;
  icon: typeof Map;
  activeColor: string;
  activeBg: string;
  activeBorder: string;
}> = [
  { view: "map", label: "Map", icon: Map, activeColor: "var(--color-green)", activeBg: "rgba(113,255,156,0.08)", activeBorder: "rgba(113,255,156,0.2)" },
  { view: "dashboard", label: "Intelligence", icon: BarChart3, activeColor: "var(--color-cyan)", activeBg: "rgba(94,246,255,0.08)", activeBorder: "rgba(94,246,255,0.2)" },
  {
    view: "admin",
    label: "Admin",
    icon: Shield,
    activeColor: "#ffb347",
    activeBg: "rgba(255,179,71,0.08)",
    activeBorder: "rgba(255,179,71,0.2)",
  },
];

function NavButtons({
  activeView,
  setActiveView,
  items,
}: {
  activeView: ActiveView;
  setActiveView: (v: ActiveView) => void;
  items: typeof NAV_BASE;
}) {
  return (
    <>
      {items.map(({ view, label, icon: Icon, activeColor, activeBg, activeBorder }) => (
        <button
          key={view}
          data-testid={`nav-${view}`}
          onClick={() => setActiveView(view)}
          className="flex items-center gap-2 px-3 py-1.5 rounded transition-all text-sm font-medium"
          style={{
            background: activeView === view ? activeBg : "transparent",
            color: activeView === view ? activeColor : "var(--color-text-muted)",
            border: activeView === view ? `1px solid ${activeBorder}` : "1px solid transparent",
            fontSize: "13px",
          }}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </>
  );
}

function HeaderNavClerk({ activeView, setActiveView }: HeaderProps) {
  const { userId } = useAuth();
  const showAdmin = isDatasistAdmin(userId ?? undefined);
  const items = showAdmin ? NAV_BASE : NAV_BASE.filter((n) => n.view !== "admin");
  return <NavButtons activeView={activeView} setActiveView={setActiveView} items={items} />;
}

export default function Header({ activeView, setActiveView }: HeaderProps) {
  const publicItems = NAV_BASE.filter((n) => n.view !== "admin");

  return (
    <header
      className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
      style={{
        background: "rgba(7, 16, 25, 0.72)",
        borderColor: "var(--color-border)",
        backdropFilter: "blur(18px)",
        height: "72px",
      }}
    >
      {/* Logo + Brand */}
      <div className="flex items-center gap-4 min-w-0">
        {/* UFO SVG Logo */}
        <svg
          width="38"
          height="38"
          viewBox="0 0 32 32"
          fill="none"
          aria-label="DataSist Logo"
          className="flex-shrink-0"
        >
          <circle cx="16" cy="16" r="15" stroke="var(--color-border-strong)" strokeWidth="1" fill="var(--color-surface-2)" />
          <ellipse cx="16" cy="18" rx="9" ry="3.5" fill="none" stroke="var(--color-green)" strokeWidth="1.5" />
          <path d="M7 18 Q10 15 16 14 Q22 15 25 18" fill="var(--color-green)" fillOpacity="0.08" />
          <circle cx="16" cy="14" r="4" fill="none" stroke="var(--color-green)" strokeWidth="1.5" />
          <circle cx="16" cy="14" r="1.5" fill="var(--color-cyan)" fillOpacity="0.7" />
          <circle cx="10" cy="18.5" r="1" fill="var(--color-cyan)" />
          <circle cx="16" cy="21" r="1" fill="var(--color-green)" />
          <circle cx="22" cy="18.5" r="1" fill="var(--color-cyan)" />
        </svg>

        <div className="flex flex-col leading-none min-w-0">
          <span
            className="font-bold tracking-widest text-glow-green"
            style={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontSize: "18px",
              color: "var(--color-green)",
              letterSpacing: "0.14em",
            }}
          >
            DataSist
          </span>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              style={{
                fontSize: "9px",
                color: "var(--color-text-muted)",
                letterSpacing: "0.18em",
                fontFamily: "'General Sans', sans-serif",
              }}
            >
              ALIASIST.COM · AI INFRASTRUCTURE INTELLIGENCE
            </span>
            <span className="datasist-tag" style={{ padding: "4px 8px", fontSize: "9px" }}>
              340+ Facilities Live
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav
        className="flex items-center gap-1.5 rounded-full px-2 py-1"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {hasClerkKey ? (
          <HeaderNavClerk activeView={activeView} setActiveView={setActiveView} />
        ) : (
          <NavButtons activeView={activeView} setActiveView={setActiveView} items={publicItems} />
        )}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div
          className="hidden lg:flex items-center gap-2 rounded-full px-3 py-1.5"
          style={{
            fontSize: "11px",
            color: "var(--color-text-muted)",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <Zap size={11} style={{ color: "var(--color-green)" }} />
          <span>Live power, water, and grid signals</span>
        </div>
        <a
          href="https://aliasist.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
          style={{ fontSize: "11px", color: "var(--color-text-muted)", letterSpacing: "0.08em" }}
        >
          <Globe size={11} />
          aliasist.com
        </a>
        {hasClerkKey ? (
          <>
            <Show when="signed-in">
              <UserButton />
            </Show>
            <Show when="signed-out">
              <a
                href="https://auth.aliasist.com/sign-in"
                className="px-2.5 py-1 rounded border transition-opacity hover:opacity-80"
                style={{
                  borderColor: "rgba(113,255,156,0.28)",
                  color: "var(--color-green)",
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                }}
              >
                SIGN IN
              </a>
            </Show>
          </>
        ) : null}
      </div>
    </header>
  );
}
