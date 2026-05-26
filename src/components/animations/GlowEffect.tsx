"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";

interface GlowEffectProps {
  children: ReactNode;
  className?: string;
  color?: string;
  size?: number;
}

export function GlowEffect({
  children,
  className,
  color = "var(--accent)",
  size = 200,
}: GlowEffectProps) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--glow-x", `${x}px`);
    el.style.setProperty("--glow-y", `${y}px`);
    el.style.setProperty("--glow-opacity", "1");
  }

  function handleMouseLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--glow-opacity", "0");
  }

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",
        overflow: "hidden",
      } as React.CSSProperties}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: "var(--glow-opacity, 0)",
          transition: "opacity 0.3s ease",
          background: `radial-gradient(${size}px circle at var(--glow-x, 50%) var(--glow-y, 50%), color-mix(in oklch, ${color} 10%, transparent), transparent)`,
          borderRadius: "inherit",
          zIndex: 0,
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
