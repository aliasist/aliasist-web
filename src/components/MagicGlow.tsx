import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MagicGlowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowColor?: string;
  glowSize?: number;
  glowOpacity?: number;
}

/**
 * MagicGlow - Adds a cursor-following spotlight effect to its children.
 * Uses CSS variables (--mouse-x, --mouse-y) for efficient updates.
 */
export const MagicGlow = ({
  children,
  className,
  glowColor = "hsl(165, 90%, 42%)",
  glowSize = 300,
  glowOpacity = 0.15,
  ...props
}: MagicGlowProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    containerRef.current.style.setProperty("--mouse-x", `${x}px`);
    containerRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn("relative overflow-hidden group/magic-glow", className)}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(${glowSize}px circle at var(--mouse-x) var(--mouse-y), ${glowColor}${Math.round(glowOpacity * 255).toString(16).padStart(2, '0')}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
};
