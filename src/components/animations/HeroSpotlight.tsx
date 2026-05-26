"use client";

import { useRef, type ReactNode, type PointerEvent } from "react";

interface HeroSpotlightProps {
  children: ReactNode;
}

export function HeroSpotlight({ children }: HeroSpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty(
      "--spotlight-x",
      `${((e.clientX - rect.left) / rect.width) * 100}%`
    );
    el.style.setProperty(
      "--spotlight-y",
      `${((e.clientY - rect.top) / rect.height) * 100}%`
    );
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      style={{ position: "relative" }}
    >
      <div className="hero-spotlight" aria-hidden="true" />
      {children}
    </div>
  );
}
