import { useEffect, useState } from "react";
import { pageNavLinks } from "@/content/homepage";

const sections = [
  { label: "Home", href: "#top" },
  ...pageNavLinks,
  { label: "Contact", href: "#contact" },
] as const;

const SectionRail = () => {
  const [activeSection, setActiveSection] = useState("top");

  useEffect(() => {
    const ids = sections.map((s) => s.href.replace("#", ""));

    const update = () => {
      const midpoint = window.innerHeight * 0.5;
      let active = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= midpoint) active = id;
      }
      setActiveSection(active);
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <nav
      aria-label="Page sections"
      className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex xl:right-8"
    >
      {sections.map((section) => {
        const id = section.href.replace("#", "");
        const isActive = activeSection === id;

        return (
          <a
            key={section.href}
            href={section.href}
            aria-label={section.label}
            aria-current={isActive ? "true" : undefined}
            className="group relative flex size-5 items-center justify-center"
          >
            <span
              className={`block rounded-full border transition-all duration-300 ${
                isActive
                  ? "size-2.5 border-electric bg-electric shadow-electric-sm"
                  : "size-1.5 border-border bg-muted-foreground/30 group-hover:size-2 group-hover:border-electric/60 group-hover:bg-electric/70 group-hover:shadow-electric-xs"
              }`}
            />
            <span className="pointer-events-none absolute right-7 whitespace-nowrap rounded-sm border border-electric/25 bg-background/90 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground opacity-0 shadow-electric-xs backdrop-blur transition-opacity duration-200 group-hover:opacity-100">
              {section.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
};

export default SectionRail;
